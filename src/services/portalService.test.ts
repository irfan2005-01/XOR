import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLUB_LEAD_PASSCODE,
  createPortalService,
  type AppwriteAccountLike,
  type AppwriteDatabasesLike,
  type AppwriteDocumentLike,
  type AppwriteStorageLike,
} from "./portalService";

function createDummyAvatarFile(name = "avatar.jpg"): File {
  return new File([new Uint8Array([255, 216, 255])], name, {
    type: "image/jpeg",
  });
}

function createMockAppwrite() {
  const authUsers: Array<{ $id: string; email: string; password: string; name: string }> = [];
  let activeAuthUserId: string | null = null;
  let seq = 0;

  const collections = new Map<string, AppwriteDocumentLike[]>([
    ["members", []],
    ["announcements", []],
  ]);

  const uploadedFiles = new Map<string, { $id: string; file: File }>();

  const idGenerator = {
    unique: () => `doc_${++seq}`,
  };

  const queryBuilder = {
    equal: (attribute: string, value: string | string[]) =>
      JSON.stringify({ op: "equal", attribute, value }),
    orderAsc: (attribute: string) =>
      JSON.stringify({ op: "orderAsc", attribute }),
    orderDesc: (attribute: string) =>
      JSON.stringify({ op: "orderDesc", attribute }),
  };

  const account: AppwriteAccountLike = {
    async create(userId, email, password, name = "") {
      if (authUsers.some((u) => u.email === email)) {
        const err = new Error("User already exists") as Error & {
          code: number;
          type: string;
        };
        err.code = 409;
        err.type = "user_already_exists";
        throw err;
      }
      const user = { $id: userId, email, password, name };
      authUsers.push(user);
      return { $id: user.$id };
    },
    async createEmailPasswordSession(email, password) {
      const match = authUsers.find((u) => u.email === email && u.password === password);
      if (!match) {
        const err = new Error("Invalid credentials") as Error & {
          code: number;
          type: string;
        };
        err.code = 401;
        err.type = "user_invalid_credentials";
        throw err;
      }
      activeAuthUserId = match.$id;
      return { userId: match.$id };
    },
    async deleteSession() {
      activeAuthUserId = null;
    },
    async get() {
      if (!activeAuthUserId) {
        const err = new Error("Unauthorized") as Error & { code: number };
        err.code = 401;
        throw err;
      }
      const match = authUsers.find((u) => u.$id === activeAuthUserId);
      if (!match) throw new Error("Missing user");
      return { $id: match.$id, email: match.email, name: match.name };
    },
  };

  const databases: AppwriteDatabasesLike = {
    async listDocuments(_databaseId, collectionId, queries = []) {
      const docs = [...(collections.get(collectionId) ?? [])];
      let filtered = docs;

      for (const q of queries) {
        const parsed = JSON.parse(q) as {
          op: string;
          attribute: string;
          value?: string | string[];
        };
        if (parsed.op === "equal") {
          filtered = filtered.filter((d) => d[parsed.attribute] === parsed.value);
        } else if (parsed.op === "orderAsc") {
          filtered.sort((a, b) =>
            String(a[parsed.attribute] ?? "").localeCompare(
              String(b[parsed.attribute] ?? "")
            )
          );
        } else if (parsed.op === "orderDesc") {
          filtered.sort((a, b) =>
            String(b[parsed.attribute] ?? "").localeCompare(
              String(a[parsed.attribute] ?? "")
            )
          );
        }
      }

      return { total: filtered.length, documents: filtered };
    },
    async getDocument(_databaseId, collectionId, documentId) {
      const doc = (collections.get(collectionId) ?? []).find((d) => d.$id === documentId);
      if (!doc) throw new Error("Document not found");
      return { ...doc };
    },
    async createDocument(_databaseId, collectionId, documentId, data) {
      const list = collections.get(collectionId) ?? [];
      const doc: AppwriteDocumentLike = { $id: documentId, ...data };
      list.push(doc);
      collections.set(collectionId, list);
      return { ...doc };
    },
    async updateDocument(_databaseId, collectionId, documentId, data) {
      const list = collections.get(collectionId) ?? [];
      const index = list.findIndex((d) => d.$id === documentId);
      if (index === -1) throw new Error("Document not found");
      const updated = { ...list[index], ...data };
      list[index] = updated;
      return { ...updated };
    },
    async deleteDocument(_databaseId, collectionId, documentId) {
      const list = collections.get(collectionId) ?? [];
      const index = list.findIndex((d) => d.$id === documentId);
      if (index === -1) throw new Error("Document not found");
      list.splice(index, 1);
      collections.set(collectionId, list);
      return { deleted: true };
    },
  };

  const storage: AppwriteStorageLike = {
    async createFile(_bucketId, fileId, file) {
      const record = { $id: fileId, file };
      uploadedFiles.set(fileId, record);
      return { $id: fileId };
    },
    getFileView(bucketId, fileId) {
      return `https://sgp.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view`;
    },
  };

  return {
    deps: {
      account,
      databases,
      storage,
      projectId: "6afd778d001cf7bb0d79",
      idGenerator,
      queryBuilder,
      databaseId: "test_db",
      membersCollectionId: "members",
      announcementsCollectionId: "announcements",
      avatarsBucketId: "avatars",
    },
    collections,
    uploadedFiles,
  };
}

describe("portalService (Appwrite-backed)", () => {
  it("requires a profile photo on sign-up, uploads to Appwrite Storage, saves avatarUrl, and restores session", async () => {
    const mock = createMockAppwrite();
    const service = createPortalService(mock.deps);

    await assert.rejects(
      service.signUpMember({
        fullName: "Missing Photo",
        usn: "3LA24CS001",
        branchSemester: "CSE • 5th Sem",
        email: "nophoto@laec.edu",
        password: "password123",
      }),
      /upload a profile photo/i
    );

    const member = await service.signUpMember({
      fullName: "Ayaan Kulkarni",
      usn: "3la24cs014",
      branchSemester: "CSE • 5th Sem",
      email: "ayaan@laec.edu",
      password: "password123",
      avatarFile: createDummyAvatarFile(),
    });

    assert.match(member.id, /^XOR-26-\d{4}$/);
    assert.equal(member.usn, "3LA24CS014");
    assert.equal(member.role, "MEMBER");
    assert.ok(member.userId);
    assert.match(member.avatarUrl ?? "", /\/storage\/buckets\/avatars\/files\/.+\/view/);
    assert.equal(mock.uploadedFiles.size, 1);
    assert.equal(await service.getMemberCount(), 1);

    const session = await service.getCurrentSession();
    assert.equal(session?.id, member.id);
    assert.equal(session?.avatarUrl, member.avatarUrl);

    await service.logoutMember();
    assert.equal(await service.getCurrentSession(), null);

    const loggedIn = await service.loginMember({
      email: "AYAAN@LAEC.EDU",
      password: "password123",
    });
    assert.equal(loggedIn.id, member.id);
    assert.match(loggedIn.avatarUrl ?? "", /\?project=6afd778d001cf7bb0d79$/);
  });

  it("updates profile photo for an existing or legacy member via updateMemberAvatar and ensures project query param", async () => {
    const mock = createMockAppwrite();
    let compressedCalled = false;
    const service = createPortalService({
      ...mock.deps,
      processAvatar: async (file) => {
        compressedCalled = true;
        return { file };
      },
    });

    // Seed a legacy member record without avatarUrl
    const legacyDoc = await mock.deps.databases.createDocument(
      "test_db",
      "members",
      "legacy_doc_1",
      {
        userId: "legacy_user_1",
        memberId: "XOR-26-1111",
        fullName: "Legacy Lead",
        usn: "3LA24CS000",
        branchSem: "CSE • 7th Sem",
        email: "lead@laec.edu",
        role: "CLUB LEAD",
        joinedAt: "2026-11-01T00:00:00.000Z",
      }
    );

    const updated = await service.updateMemberAvatar(
      legacyDoc.$id,
      createDummyAvatarFile("lead-photo.jpg")
    );

    assert.equal(compressedCalled, true);
    assert.equal(updated.docId, "legacy_doc_1");
    assert.equal(updated.role, "CLUB LEAD");
    assert.match(
      updated.avatarUrl ?? "",
      /^https:\/\/sgp\.cloud\.appwrite\.io\/v1\/storage\/buckets\/avatars\/files\/.+\/view\?project=6afd778d001cf7bb0d79$/
    );
  });

  it("rejects duplicate emails, duplicate USNs, and invalid Club Lead passcodes", async () => {
    assert.equal(CLUB_LEAD_PASSCODE, "XOR-LEAD-26");
    const mock = createMockAppwrite();
    const service = createPortalService(mock.deps);

    await service.signUpMember({
      fullName: "Neha Deshmukh",
      usn: "3LA24EC008",
      branchSemester: "ECE • 5th Sem",
      email: "neha@laec.edu",
      password: "secret990",
      avatarFile: createDummyAvatarFile(),
    });

    await assert.rejects(
      service.signUpMember({
        fullName: "Neha Duplicate",
        usn: "3LA24EC099",
        branchSemester: "ECE • 5th Sem",
        email: "neha@laec.edu",
        password: "secret990",
        avatarFile: createDummyAvatarFile(),
      }),
      /already exists/i
    );

    await assert.rejects(
      service.signUpMember({
        fullName: "USN Duplicate",
        usn: "3la24ec008",
        branchSemester: "ECE • 5th Sem",
        email: "other@laec.edu",
        password: "secret990",
        avatarFile: createDummyAvatarFile(),
      }),
      /USN is already registered/i
    );

    await assert.rejects(
      service.signUpMember({
        fullName: "Rohan Patil",
        usn: "3LA24AI012",
        branchSemester: "AI & ML • 3rd Sem",
        email: "rohan@laec.edu",
        password: "secret990",
        avatarFile: createDummyAvatarFile(),
        wantsLeadRole: true,
        leadPasscode: "WRONG",
      }),
      /passcode/i
    );
  });

  it("returns empty broadcasts with no auto-seeding, supports optional Date/Venue, chronological feed, and event interest toggles", async () => {
    const mock = createMockAppwrite();
    const service = createPortalService(mock.deps);

    const initial = await service.getAnnouncements();
    assert.deepEqual(initial, []);

    const member = await service.signUpMember({
      fullName: "Zainab Begum",
      usn: "3LA24CS055",
      branchSemester: "CSE • 5th Sem",
      email: "zainab@laec.edu",
      password: "password123",
      avatarFile: createDummyAvatarFile(),
    });

    // Regular member cannot send broadcasts
    await assert.rejects(
      service.createAnnouncement(
        {
          title: "Unauthorized Event",
          body: "Should fail",
          category: "EVENT",
        },
        member
      ),
      /Only Club Leads/i
    );

    // Upgrade to Club Lead
    const lead = await service.upgradeToClubLead(member.userId, CLUB_LEAD_PASSCODE);
    assert.equal(lead.role, "CLUB LEAD");

    // Create an Announcement without Date or Venue
    const afterFirst = await service.createAnnouncement(
      {
        title: "Welcome to XOR Channel",
        body: "Official updates and event pitches for LAEC Bidar will appear here.",
        category: "ANNOUNCEMENT",
      },
      lead
    );

    assert.equal(afterFirst.length, 1);
    assert.equal(afterFirst[0].title, "Welcome to XOR Channel");
    assert.equal(afterFirst[0].dateTime, "");
    assert.equal(afterFirst[0].venue, "");
    assert.deepEqual(afterFirst[0].rsvpMemberIds, []);

    await new Promise((resolve) => setTimeout(resolve, 2));

    // Create an Event Pitch with optional Date & Venue
    const afterSecond = await service.createAnnouncement(
      {
        title: "Campus Systems Hackathon Pitch",
        body: "React if you want us to host a 24-hour systems sprint next month.",
        dateTime: "Sat, 12 Dec 2026 · 10:00 AM",
        venue: "Main Auditorium, LAEC Bidar",
        category: "EVENT",
      },
      lead
    );

    assert.equal(afterSecond.length, 2);
    assert.equal(afterSecond[0].title, "Welcome to XOR Channel");
    assert.equal(afterSecond[1].title, "Campus Systems Hackathon Pitch");
    assert.equal(afterSecond[1].dateTime, "Sat, 12 Dec 2026 · 10:00 AM");
    assert.equal(afterSecond[1].venue, "Main Auditorium, LAEC Bidar");

    // Toggle interest reaction using student's userId
    const eventId = afterSecond[1].id;
    const afterInterested = await service.toggleRsvp(eventId, member.userId);
    const interestedEvent = afterInterested.find((a) => a.id === eventId);
    assert.deepEqual(interestedEvent?.rsvpMemberIds, [member.userId]);

    const afterUninterested = await service.toggleRsvp(eventId, member.userId);
    const uninterestedEvent = afterUninterested.find((a) => a.id === eventId);
    assert.deepEqual(uninterestedEvent?.rsvpMemberIds, []);

    // Regular member cannot delete broadcasts
    await assert.rejects(
      service.deleteAnnouncement(eventId, member),
      /Only Club Leads/i
    );

    // Club Lead can delete individual broadcasts or clear the channel
    const afterDeleteOne = await service.deleteAnnouncement(eventId, lead);
    assert.equal(afterDeleteOne.length, 1);
    assert.equal(afterDeleteOne[0].title, "Welcome to XOR Channel");

    const afterClear = await service.clearAllAnnouncements(lead);
    assert.deepEqual(afterClear, []);
  });
});
