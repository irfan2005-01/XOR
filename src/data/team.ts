export interface InstitutionalLeader {
  name: string;
  eyebrow: string;
  designation: string;
  institution: string;
  note: string;
  quote?: string;
  image?: string;
  initials: string;
}

export const principalPatron: InstitutionalLeader = {
  name: "Dr. Vinita Patil",
  eyebrow: "Principal & Chief Patron",
  designation: "Principal • Lingaraj Appa Engineering College",
  institution: "Lingaraj Appa Engineering College, Bidar",
  quote:
    "Engineering education reaches its fullest potential when students bridge classroom theory with real-world prototypes. XOR represents the proactive spirit of our student builders at LAEC Bidar—collaborating, innovating, and developing real solutions.",
  note: "Institutional patron guiding XOR as an open, branch-agnostic engineering incubator for hands-on systems design, prototypes, and peer-led technical workshops.",
  image: "/principal.jpg",
  initials: "VP",
};

export const cseHod: InstitutionalLeader = {
  name: "Dr. Vivek Jalade",
  eyebrow: "Department Head • CSE",
  designation: "Head of Department • Computer Science & Engineering",
  institution: "Lingaraj Appa Engineering College, Bidar",
  note: "Faculty advisor guiding student-led technical initiatives, peer workshops, and engineering innovation across the CSE department.",
  image: "/hod-cse.jpg",
  initials: "VJ",
};

export const institutionalLeaders: InstitutionalLeader[] = [
  principalPatron,
  cseHod,
];
