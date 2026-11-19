export type MemberRole = "lead" | "member";

export function isClubLeadRole(role?: string | null): boolean {
  const normalized = (role ?? "").trim().toLowerCase();
  return normalized === "lead" || normalized === "club lead";
}

export function normalizeMemberRole(role?: string | null): MemberRole {
  return isClubLeadRole(role) ? "lead" : "member";
}

export function formatMemberRoleLabel(role?: string | null): string {
  return isClubLeadRole(role) ? "CLUB LEAD" : "MEMBER";
}

export interface PublicMember {
  docId?: string; // Appwrite row/document $id
  userId: string; // Appwrite Auth user.$id
  id: string; // Formatted XOR-26-XXXX memberId
  fullName: string;
  usn: string;
  branchSemester: string;
  email: string;
  role: MemberRole;
  joinedAt: string; // ISO timestamp
  avatarUrl?: string; // Appwrite Storage file view URL (optional)
}

export interface SignUpInput {
  fullName: string;
  usn: string;
  branchSemester: string;
  email: string;
  password: string;
  avatarFile?: File | null;
  wantsLeadRole?: boolean;
  leadPasscode?: string;
}

export interface LogInInput {
  email: string;
  password: string;
}

export type AnnouncementCategory = "EVENT" | "ANNOUNCEMENT" | "WORKSHOP";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  dateTime: string;
  venue: string;
  category: AnnouncementCategory;
  authorName: string;
  authorRole: MemberRole;
  createdAt: string;
  rsvpMemberIds: string[]; // Stores Appwrite userId values (rsvpUids)
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  dateTime?: string;
  venue?: string;
  category: AnnouncementCategory;
}
