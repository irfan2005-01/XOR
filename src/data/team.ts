export interface DepartmentLead {
  name: string;
  designation: string;
  institution: string;
  note: string;
  image?: string;
  initials: string;
}

export interface CoreLeadMember {
  name: string;
  role?: string;
  branchSem?: string;
  image?: string;
  initials: string;
}

export const cseHod: DepartmentLead = {
  name: "Prof. [CSE HOD Name]",
  designation: "Head of Department • Computer Science & Engineering",
  institution: "Lingaraj Appa Engineering College, Bidar",
  note: "Faculty advisor guiding student-led technical initiatives, peer workshops, and engineering innovation across the CSE department.",
  image: "/hod-cse.jpg",
  initials: "HD",
};

export const coreLeads: CoreLeadMember[] = [
  {
    name: "Syed Shoaib Akhter",
    image: "/leads/shoaib.jpg",
    initials: "SSA",
  },
  {
    name: "Syed Irfan Ahmed",
    image: "/leads/irfan.jpg",
    initials: "SIA",
  },
  {
    name: "Tauz Ul Imam",
    image: "/leads/tauz.jpg",
    initials: "TUI",
  },
];
