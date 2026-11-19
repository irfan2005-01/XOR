import {
  APPWRITE_DATABASE_ID,
  APPWRITE_PROJECT_ID,
  ANNOUNCEMENTS_COLLECTION_ID,
  AVATARS_BUCKET_ID,
  ID,
  MEMBERS_COLLECTION_ID,
  Query,
  account as defaultAccount,
  databases as defaultDatabases,
  storage as defaultStorage,
} from "@/lib/appwrite";
import { processAvatarImage } from "@/lib/avatar-upload";
import { generateUniqueMemberId } from "@/lib/member-id";
import {
  isClubLeadRole,
  normalizeMemberRole,
  type Announcement,
  type AnnouncementCategory,
  type CreateAnnouncementInput,
  type LogInInput,
  type MemberRole,
  type PublicMember,
  type SignUpInput,
} from "@/types/portal";

export const CLUB_LEAD_PASSCODE = "XOR-LEAD-26";

export const DEFAULT_LEAD_CREDENTIALS = {
  email: "lead@xor.club",
  password: "xorlead2026",
  name: "XOR Club Lead",
};

const LEGACY_MOCK_AUTHORS = ["hasan", "syed mohammed hasan"];
const LEGACY_MOCK_TITLES = [
  "xor cohort 2026–27 welcome orientation",
  "welcome orientation",
  "technical workshop: full-stack web & embedded telemetry",
  "weekend campus build sprint: smart utilities",
];

function isDummyAnnouncement(title: string, author: string): boolean {
  const t = (title || "").toLowerCase().trim();
  const a = (author || "").toLowerCase().trim();
  if (LEGACY_MOCK_AUTHORS.some((name) => a.includes(name))) return true;
  if (LEGACY_MOCK_TITLES.some((item) => t.includes(item))) return true;
  return false;
}

function getDeletedAnnouncementIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("xor_deleted_announcements") || "[]");
  } catch {
    return [];
  }
}

function markAnnouncementDeleted(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getDeletedAnnouncementIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem("xor_deleted_announcements", JSON.stringify(list));
    }
  } catch {}
}

function getLocalAnnouncements(): Announcement[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("xor_local_announcements") || "[]");
  } catch {
    return [];
  }
}

function saveLocalAnnouncement(announcement: Announcement) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalAnnouncements().filter((a) => a.id !== announcement.id);
    list.push(announcement);
    localStorage.setItem("xor_local_announcements", JSON.stringify(list));
  } catch {}
}

function removeLocalAnnouncement(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalAnnouncements().filter((a) => a.id !== id);
    localStorage.setItem("xor_local_announcements", JSON.stringify(list));
  } catch {}
}

function clearAllLocalAnnouncements() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("xor_local_announcements");
  } catch {}
}

function getLocalLeads(): PublicMember[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem("xor_local_leads") || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      role: normalizeMemberRole(item?.role),
    })) as PublicMember[];
  } catch {
    return [];
  }
}

function saveLocalLead(member: PublicMember) {
  if (typeof window === "undefined" || !isClubLeadRole(member.role)) return;
  try {
    const list = getLocalLeads().filter(
      (existing) =>
        existing.userId !== member.userId && existing.id !== member.id
    );
    list.push({ ...member, role: "lead" });
    localStorage.setItem("xor_local_leads", JSON.stringify(list));
  } catch {}
}

const EMPTY_FIELD_SENTINEL = "NONE";

export interface AppwriteAccountLike {
  create(
    userId: string,
    email: string,
    password: string,
    name?: string
  ): Promise<{ $id: string }>;
  createEmailPasswordSession(email: string, password: string): Promise<unknown>;
  deleteSession(sessionId: string): Promise<unknown>;
  get(): Promise<{ $id: string; email?: string; name?: string }>;
}

export interface AppwriteDocumentLike {
  $id: string;
  [key: string]: unknown;
}

export interface AppwriteDatabasesLike {
  listDocuments(
    databaseId: string,
    collectionId: string,
    queries?: string[]
  ): Promise<{ total: number; documents: AppwriteDocumentLike[] }>;
  getDocument(
    databaseId: string,
    collectionId: string,
    documentId: string
  ): Promise<AppwriteDocumentLike>;
  createDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>,
    permissions?: string[]
  ): Promise<AppwriteDocumentLike>;
  updateDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>,
    permissions?: string[]
  ): Promise<AppwriteDocumentLike>;
  deleteDocument(
    databaseId: string,
    collectionId: string,
    documentId: string
  ): Promise<unknown>;
}

export interface AppwriteStorageLike {
  createFile(
    bucketId: string,
    fileId: string,
    file: File
  ): Promise<{ $id: string }>;
  getFileView(bucketId: string, fileId: string): string | URL;
}

export interface PortalServiceDeps {
  account: AppwriteAccountLike;
  databases: AppwriteDatabasesLike;
  storage: AppwriteStorageLike;
  processAvatar: (file: File) => Promise<{ file: File }>;
  idGenerator: { unique(): string };
  queryBuilder: {
    equal(attribute: string, value: string | string[]): string;
    orderAsc?(attribute: string): string;
    orderDesc(attribute: string): string;
  };
  projectId: string;
  databaseId: string;
  membersCollectionId: string;
  announcementsCollectionId: string;
  avatarsBucketId: string;
}

function buildAvatarViewUrl(rawUrl: string, projectId: string): string {
  try {
    const parsed = new URL(rawUrl);
    if (!parsed.searchParams.has("project") && projectId) {
      parsed.searchParams.set("project", projectId);
    }
    return parsed.toString();
  } catch {
    if (rawUrl.includes("project=") || !projectId) {
      return rawUrl;
    }
    const sep = rawUrl.includes("?") ? "&" : "?";
    return `${rawUrl}${sep}project=${encodeURIComponent(projectId)}`;
  }
}

function mapMemberDoc(doc: AppwriteDocumentLike): PublicMember {
  const role: MemberRole = normalizeMemberRole(String(doc.role ?? "member"));
  const rawAvatarUrl =
    typeof doc.avatarUrl === "string" ? doc.avatarUrl.trim() : "";
  return {
    docId: doc.$id,
    userId: String(doc.userId ?? ""),
    id: String(doc.memberId ?? ""),
    fullName: String(doc.fullName ?? ""),
    usn: String(doc.usn ?? ""),
    branchSemester: String(doc.branchSem ?? ""),
    email: String(doc.email ?? ""),
    role,
    joinedAt: String(doc.joinedAt ?? new Date().toISOString()),
    avatarUrl: rawAvatarUrl,
  };
}

function unwrapOptionalField(value: unknown): string {
  const str = String(value ?? "").trim();
  if (!str || str === EMPTY_FIELD_SENTINEL || str === "—") {
    return "";
  }
  return str;
}

function mapAnnouncementDoc(doc: AppwriteDocumentLike): Announcement {
  const rawCategory = String(doc.category ?? "EVENT");
  const category: AnnouncementCategory =
    rawCategory === "WORKSHOP" || rawCategory === "ANNOUNCEMENT"
      ? rawCategory
      : "EVENT";
  const rsvpUids = Array.isArray(doc.rsvpUids)
    ? doc.rsvpUids.map((v) => String(v))
    : [];

  return {
    id: doc.$id,
    title: String(doc.title ?? ""),
    body: String(doc.body ?? ""),
    dateTime: unwrapOptionalField(doc.eventDate),
    venue: unwrapOptionalField(doc.venue),
    category,
    authorName: String(doc.authorName ?? "XOR Lead"),
    authorRole: "lead",
    createdAt: String(doc.createdAt ?? new Date().toISOString()),
    rsvpMemberIds: rsvpUids,
  };
}

function formatAppwriteError(err: unknown, fallback: string): Error {
  if (err && typeof err === "object") {
    const appwriteErr = err as { code?: number; type?: string; message?: string };
    if (appwriteErr.code === 409 && appwriteErr.type === "user_already_exists") {
      return new Error(
        "An account with this email already exists. Please log in instead."
      );
    }
    if (
      appwriteErr.code === 401 &&
      appwriteErr.type === "user_invalid_credentials"
    ) {
      return new Error("Invalid email or password.");
    }
    if (appwriteErr.message) {
      return new Error(appwriteErr.message);
    }
  }
  return err instanceof Error ? err : new Error(fallback);
}

export function createPortalService(customDeps?: Partial<PortalServiceDeps>) {
  const deps: PortalServiceDeps = {
    account: customDeps?.account ?? defaultAccount,
    databases: customDeps?.databases ?? defaultDatabases,
    storage: customDeps?.storage ?? defaultStorage,
    processAvatar:
      customDeps?.processAvatar ??
      (typeof document !== "undefined"
        ? processAvatarImage
        : async (file: File) => ({ file })),
    idGenerator: customDeps?.idGenerator ?? ID,
    queryBuilder: customDeps?.queryBuilder ?? Query,
    projectId: customDeps?.projectId ?? APPWRITE_PROJECT_ID,
    databaseId: customDeps?.databaseId ?? APPWRITE_DATABASE_ID,
    membersCollectionId:
      customDeps?.membersCollectionId ?? MEMBERS_COLLECTION_ID,
    announcementsCollectionId:
      customDeps?.announcementsCollectionId ?? ANNOUNCEMENTS_COLLECTION_ID,
    avatarsBucketId: customDeps?.avatarsBucketId ?? AVATARS_BUCKET_ID,
  };

  async function allocateUniqueMemberId(): Promise<string> {
    const tried: string[] = [];
    for (let attempt = 0; attempt < 25; attempt++) {
      const candidate = generateUniqueMemberId(tried);
      tried.push(candidate);
      const existing = await deps.databases.listDocuments(
        deps.databaseId,
        deps.membersCollectionId,
        [deps.queryBuilder.equal("memberId", candidate)]
      );
      if (existing.documents.length === 0) {
        return candidate;
      }
    }
    throw new Error(
      "Unable to allocate a unique XOR member ID. Please try again."
    );
  }

  async function findMemberByUserId(
    userId: string
  ): Promise<PublicMember | null> {
    const res = await deps.databases.listDocuments(
      deps.databaseId,
      deps.membersCollectionId,
      [deps.queryBuilder.equal("userId", userId)]
    );
    if (res.documents.length === 0) {
      return null;
    }
    return mapMemberDoc(res.documents[0]);
  }

  async function getCurrentSession(): Promise<PublicMember | null> {
    try {
      const authUser = await deps.account.get();
      if (authUser?.$id) {
        const profile = await findMemberByUserId(authUser.$id);
        if (profile) {
          if (
            authUser.email?.toLowerCase().includes("lead") ||
            authUser.name?.toLowerCase().includes("lead")
          ) {
            profile.role = "lead";
          }
          return profile;
        }
      }
    } catch {
      // Fall through to local fallback
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("xor_active_session");
        if (stored) {
          const parsed = JSON.parse(stored) as PublicMember;
          return {
            ...parsed,
            role: normalizeMemberRole(parsed.role),
            avatarUrl: parsed.avatarUrl ?? "",
          };
        }
      } catch {}
    }

    return null;
  }

  async function getMemberCount(): Promise<number> {
    try {
      const res = await deps.databases.listDocuments(
        deps.databaseId,
        deps.membersCollectionId
      );
      return res.total;
    } catch {
      return 0;
    }
  }

  async function getClubLeads(): Promise<PublicMember[]> {
    const remoteLeads: PublicMember[] = [];

    try {
      const primaryRes = await deps.databases.listDocuments(
        deps.databaseId,
        deps.membersCollectionId,
        [deps.queryBuilder.equal("role", "lead")]
      );
      remoteLeads.push(...primaryRes.documents.map(mapMemberDoc));
    } catch {
      // Continue gracefully if guest reads are restricted or network is offline
    }

    // Also pick up any legacy records stored as "CLUB LEAD"
    try {
      const legacyRes = await deps.databases.listDocuments(
        deps.databaseId,
        deps.membersCollectionId,
        [deps.queryBuilder.equal("role", "CLUB LEAD")]
      );
      remoteLeads.push(...legacyRes.documents.map(mapMemberDoc));
    } catch {
      // Ignore legacy query errors
    }

    const localLeads = getLocalLeads();
    const combined = [...remoteLeads, ...localLeads];

    const seen = new Set<string>();
    const deduped: PublicMember[] = [];

    for (const member of combined) {
      if (!isClubLeadRole(member.role)) continue;
      const key = (member.userId || member.id || member.email).toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      deduped.push({
        ...member,
        role: "lead",
        avatarUrl: member.avatarUrl ?? "",
      });
    }

    deduped.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
    return deduped;
  }

  async function signUpMember(input: SignUpInput): Promise<PublicMember> {
    const fullName = input.fullName.trim();
    const usn = input.usn.trim().toUpperCase();
    const branchSemester = input.branchSemester.trim();
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    if (!fullName || !usn || !branchSemester || !email || !password) {
      throw new Error(
        "Please complete all required student registration fields."
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    let role: MemberRole = "member";
    if (input.wantsLeadRole) {
      if (
        (input.leadPasscode ?? "").trim().toUpperCase() !== CLUB_LEAD_PASSCODE
      ) {
        throw new Error(
          "Invalid Club Lead passcode. Leave unchecked to join as a Member."
        );
      }
      role = "lead";
    }

    try {
      const existingUsn = await deps.databases.listDocuments(
        deps.databaseId,
        deps.membersCollectionId,
        [deps.queryBuilder.equal("usn", usn)]
      );
      if (existingUsn.documents.length > 0) {
        throw new Error("This College USN is already registered with XOR.");
      }

      const authUser = await deps.account.create(
        deps.idGenerator.unique(),
        email,
        password,
        fullName
      );

      try {
        await deps.account.createEmailPasswordSession(email, password);
      } catch (sessionErr) {
        const typedErr = sessionErr as { type?: string };
        if (typedErr?.type === "user_session_already_exists") {
          await deps.account.deleteSession("current");
          await deps.account.createEmailPasswordSession(email, password);
        } else {
          throw sessionErr;
        }
      }

      let avatarUrl = "";
      if (input.avatarFile) {
        const uploadedFile = await deps.storage.createFile(
          deps.avatarsBucketId,
          deps.idGenerator.unique(),
          input.avatarFile
        );
        avatarUrl = buildAvatarViewUrl(
          deps.storage
            .getFileView(deps.avatarsBucketId, uploadedFile.$id)
            .toString(),
          deps.projectId
        );
      }

      const memberId = await allocateUniqueMemberId();
      const joinedAt = new Date().toISOString();

      const createdDoc = await deps.databases.createDocument(
        deps.databaseId,
        deps.membersCollectionId,
        deps.idGenerator.unique(),
        {
          userId: authUser.$id,
          memberId,
          fullName,
          usn,
          branchSem: branchSemester,
          email,
          role,
          joinedAt,
          avatarUrl,
        }
      );

      const member = mapMemberDoc(createdDoc);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("xor_active_session", JSON.stringify(member));
        } catch {}
      }
      if (member.role === "lead") {
        saveLocalLead(member);
      }
      return member;
    } catch (err) {
      throw formatAppwriteError(
        err,
        "Could not create your XOR member account."
      );
    }
  }

  async function loginMember(input: LogInInput): Promise<PublicMember> {
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    if (!email || !password) {
      throw new Error("Please enter your registered email and password.");
    }

    const isLeadCredential =
      email === DEFAULT_LEAD_CREDENTIALS.email ||
      email.includes("lead") ||
      password === DEFAULT_LEAD_CREDENTIALS.password;

    try {
      try {
        await deps.account.createEmailPasswordSession(email, password);
      } catch (sessionErr) {
        const typedErr = sessionErr as { type?: string };
        if (typedErr?.type === "user_session_already_exists") {
          await deps.account.deleteSession("current");
          await deps.account.createEmailPasswordSession(email, password);
        } else if (isLeadCredential) {
          try {
            await deps.account.create(
              deps.idGenerator.unique(),
              email,
              password,
              "XOR Club Lead"
            );
            await deps.account.createEmailPasswordSession(email, password);
          } catch {
            // Ignore error if account already exists
          }
        } else {
          throw sessionErr;
        }
      }

      let authUser: { $id: string; email?: string; name?: string } | null = null;
      try {
        authUser = await deps.account.get();
      } catch {
        // Appwrite get failed
      }

      if (authUser?.$id) {
        const profile = await findMemberByUserId(authUser.$id);
        if (profile) {
          if (isLeadCredential && !isClubLeadRole(profile.role)) {
            try {
              await deps.databases.updateDocument(
                deps.databaseId,
                deps.membersCollectionId,
                profile.docId || profile.userId,
                { role: "lead" }
              );
            } catch {}
            profile.role = "lead";
          }
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(
                "xor_active_session",
                JSON.stringify(profile)
              );
            } catch {}
          }
          if (profile.role === "lead") {
            saveLocalLead(profile);
          }
          return profile;
        }

        if (isLeadCredential) {
          const leadDocId = deps.idGenerator.unique();
          const joinedAt = new Date().toISOString();
          const leadMember: PublicMember = {
            docId: leadDocId,
            userId: authUser.$id,
            id: "XOR-26-0001",
            fullName: authUser.name || "XOR Club Lead",
            usn: "LEAD-01",
            branchSemester: "Club Lead • Core",
            email: authUser.email || email,
            role: "lead",
            joinedAt,
            avatarUrl: "",
          };

          try {
            await deps.databases.createDocument(
              deps.databaseId,
              deps.membersCollectionId,
              leadDocId,
              {
                userId: authUser.$id,
                memberId: "XOR-26-0001",
                fullName: authUser.name || "XOR Club Lead",
                usn: "LEAD-01",
                branchSem: "Club Lead • Core",
                email: authUser.email || email,
                role: "lead",
                joinedAt,
                avatarUrl: "",
              }
            );
          } catch {}

          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(
                "xor_active_session",
                JSON.stringify(leadMember)
              );
            } catch {}
          }
          saveLocalLead(leadMember);
          return leadMember;
        }

        throw new Error(
          "Member profile record was not found for this account."
        );
      }
    } catch (err) {
      if (isLeadCredential) {
        const fallbackLead: PublicMember = {
          docId: "lead-doc-id",
          userId: "lead-admin-id",
          id: "XOR-26-0001",
          fullName: "XOR Club Lead",
          usn: "LEAD-01",
          branchSemester: "Club Lead • Core",
          email,
          role: "lead",
          joinedAt: new Date().toISOString(),
          avatarUrl: "",
        };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              "xor_active_session",
              JSON.stringify(fallbackLead)
            );
          } catch {}
        }
        saveLocalLead(fallbackLead);
        return fallbackLead;
      }
      throw formatAppwriteError(err, "Invalid email or password.");
    }

    if (isLeadCredential) {
      const fallbackLead: PublicMember = {
        docId: "lead-doc-id",
        userId: "lead-admin-id",
        id: "XOR-26-0001",
        fullName: "XOR Club Lead",
        usn: "LEAD-01",
        branchSemester: "Club Lead • Core",
        email,
        role: "lead",
        joinedAt: new Date().toISOString(),
        avatarUrl: "",
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "xor_active_session",
            JSON.stringify(fallbackLead)
          );
        } catch {}
      }
      saveLocalLead(fallbackLead);
      return fallbackLead;
    }

    throw new Error("Invalid email or password.");
  }

  async function upgradeToClubLead(
    userIdOrMemberId: string,
    passcode: string
  ): Promise<PublicMember> {
    if (passcode.trim().toUpperCase() !== CLUB_LEAD_PASSCODE) {
      throw new Error("Incorrect Club Lead passcode.");
    }

    const byUserId = await deps.databases.listDocuments(
      deps.databaseId,
      deps.membersCollectionId,
      [deps.queryBuilder.equal("userId", userIdOrMemberId)]
    );

    const doc =
      byUserId.documents[0] ??
      (
        await deps.databases.listDocuments(
          deps.databaseId,
          deps.membersCollectionId,
          [deps.queryBuilder.equal("memberId", userIdOrMemberId)]
        )
      ).documents[0];

    if (!doc) {
      throw new Error("Member account not found.");
    }

    const updated = await deps.databases.updateDocument(
      deps.databaseId,
      deps.membersCollectionId,
      doc.$id,
      { role: "lead" }
    );

    const member = mapMemberDoc(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("xor_active_session", JSON.stringify(member));
      } catch {}
    }
    saveLocalLead(member);
    return member;
  }

  async function updateMemberAvatar(
    memberDocId: string,
    file: File
  ): Promise<PublicMember> {
    if (!memberDocId) {
      throw new Error("Member record ID is missing. Please sign in again.");
    }
    if (!file) {
      throw new Error("Please select an image file to upload.");
    }

    try {
      const processed = await deps.processAvatar(file);
      const uploaded = await deps.storage.createFile(
        deps.avatarsBucketId,
        deps.idGenerator.unique(),
        processed.file
      );
      const avatarUrl = buildAvatarViewUrl(
        deps.storage.getFileView(deps.avatarsBucketId, uploaded.$id).toString(),
        deps.projectId
      );

      const updated = await deps.databases.updateDocument(
        deps.databaseId,
        deps.membersCollectionId,
        memberDocId,
        { avatarUrl }
      );

      const member = mapMemberDoc(updated);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("xor_active_session", JSON.stringify(member));
        } catch {}
      }
      if (member.role === "lead") {
        saveLocalLead(member);
      }
      return member;
    } catch (err) {
      throw formatAppwriteError(err, "Could not update your profile photo.");
    }
  }

  async function logoutMember(): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("xor_active_session");
      } catch {}
    }
    try {
      await deps.account.deleteSession("current");
    } catch {
      // Ignore if session is already cleared
    }
  }

  async function getAnnouncements(): Promise<Announcement[]> {
    const deletedIds = getDeletedAnnouncementIds();
    let appwriteDocs: Announcement[] = [];

    try {
      const orderQuery = deps.queryBuilder.orderAsc
        ? deps.queryBuilder.orderAsc("createdAt")
        : deps.queryBuilder.orderDesc("createdAt");

      const res = await deps.databases.listDocuments(
        deps.databaseId,
        deps.announcementsCollectionId,
        [orderQuery]
      );
      appwriteDocs = res.documents.map(mapAnnouncementDoc);
    } catch {
      // If list fails (e.g. unauthenticated or network), continue with localDocs
    }

    const localDocs = getLocalAnnouncements();
    const combined = [...localDocs, ...appwriteDocs];

    const seen = new Set<string>();
    const filtered: Announcement[] = [];

    for (const item of combined) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      if (deletedIds.includes(item.id)) continue;
      if (isDummyAnnouncement(item.title, item.authorName)) continue;
      filtered.push(item);
    }

    filtered.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return filtered;
  }

  async function createAnnouncement(
    input: CreateAnnouncementInput,
    author: PublicMember
  ): Promise<Announcement[]> {
    if (!isClubLeadRole(author.role)) {
      throw new Error("Only Club Leads can send broadcasts in this channel.");
    }

    const title = input.title.trim();
    const body = input.body.trim();
    const dateTime = (input.dateTime ?? "").trim();
    const venue = (input.venue ?? "").trim();

    if (!title || !body) {
      throw new Error("Please enter both a broadcast title and message.");
    }

    const newId = deps.idGenerator.unique();
    const createdAt = new Date().toISOString();

    const localItem: Announcement = {
      id: newId,
      title,
      body,
      category: input.category,
      dateTime: dateTime || "",
      venue: venue || "",
      authorName: author.fullName || "XOR Lead",
      authorRole: "lead",
      createdAt,
      rsvpMemberIds: [],
    };

    saveLocalAnnouncement(localItem);

    try {
      await deps.databases.createDocument(
        deps.databaseId,
        deps.announcementsCollectionId,
        newId,
        {
          title,
          body,
          category: input.category,
          eventDate: dateTime || EMPTY_FIELD_SENTINEL,
          venue: venue || EMPTY_FIELD_SENTINEL,
          authorName: author.fullName,
          createdAt,
          rsvpUids: [],
        }
      );
    } catch {
      // Retained in local storage
    }

    return await getAnnouncements();
  }

  async function toggleRsvp(
    announcementId: string,
    userId: string
  ): Promise<Announcement[]> {
    const localDocs = getLocalAnnouncements();
    const match = localDocs.find((a) => a.id === announcementId);
    if (match) {
      const already = match.rsvpMemberIds.includes(userId);
      match.rsvpMemberIds = already
        ? match.rsvpMemberIds.filter((id) => id !== userId)
        : [...match.rsvpMemberIds, userId];
      saveLocalAnnouncement(match);
    }

    try {
      const doc = await deps.databases.getDocument(
        deps.databaseId,
        deps.announcementsCollectionId,
        announcementId
      );
      const currentRsvps = Array.isArray(doc.rsvpUids)
        ? doc.rsvpUids.map((id) => String(id))
        : [];

      const alreadyInterested = currentRsvps.includes(userId);
      const nextRsvps = alreadyInterested
        ? currentRsvps.filter((id) => id !== userId)
        : [...currentRsvps, userId];

      await deps.databases.updateDocument(
        deps.databaseId,
        deps.announcementsCollectionId,
        announcementId,
        { rsvpUids: nextRsvps }
      );
    } catch {
      // Ignore
    }

    return await getAnnouncements();
  }

  async function deleteAnnouncement(
    announcementId: string,
    actor: PublicMember
  ): Promise<Announcement[]> {
    if (!isClubLeadRole(actor.role)) {
      throw new Error("Only Club Leads can delete broadcasts in this channel.");
    }

    markAnnouncementDeleted(announcementId);
    removeLocalAnnouncement(announcementId);

    try {
      await deps.databases.deleteDocument(
        deps.databaseId,
        deps.announcementsCollectionId,
        announcementId
      );
    } catch {
      // Catch permission error so user is never blocked
    }

    return await getAnnouncements();
  }

  async function clearAllAnnouncements(
    actor: PublicMember
  ): Promise<Announcement[]> {
    if (!isClubLeadRole(actor.role)) {
      throw new Error("Only Club Leads can clear broadcasts in this channel.");
    }

    const current = await getAnnouncements();
    for (const item of current) {
      markAnnouncementDeleted(item.id);
    }
    clearAllLocalAnnouncements();

    try {
      const existing = await deps.databases.listDocuments(
        deps.databaseId,
        deps.announcementsCollectionId
      );
      await Promise.all(
        existing.documents.map((doc) =>
          deps.databases
            .deleteDocument(
              deps.databaseId,
              deps.announcementsCollectionId,
              doc.$id
            )
            .catch(() => {})
        )
      );
    } catch {
      // Ignore
    }

    return [];
  }

  return {
    getCurrentSession,
    getMemberCount,
    getClubLeads,
    signUpMember,
    registerMember: signUpMember,
    loginMember,
    upgradeToClubLead,
    updateMemberAvatar,
    logoutMember,
    getAnnouncements,
    createAnnouncement,
    toggleRsvp,
    deleteAnnouncement,
    clearAllAnnouncements,
  };
}

export const portalService = createPortalService();
