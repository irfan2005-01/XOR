export interface BrandConfig {
  name: string;
  tagline: string;
  institution: string;
  location: string;
  estYear: string;
  subheading: string;
}

export const BRAND_CONFIG: BrandConfig = {
  name: "XOR",
  tagline: "We build people who build things.",
  institution: "Lingaraj Appa Engineering College, Bidar",
  location: "LAEC Bidar, Karnataka",
  estYear: "2026",
  subheading:
    "The student-led engineering and builder club at LAEC Bidar. Claim your member pass, collaborate on weekend builds, and join campus workshops.",
};

export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: "Campus HQ", href: "/campus" },
  { label: "Team", href: "/team" },
  { label: "Community", href: "/community" },
  { label: "My ID Card", href: "/dashboard" },
  { label: "FAQ", href: "/faq" },
];

export interface HowItWorksStep {
  stepNumber: string;
  title: string;
  description: string;
}

export const howItWorksSteps: HowItWorksStep[] = [
  {
    stepNumber: "01",
    title: "Claim Digital Pass",
    description:
      "Register with your LAEC details and generate your XOR-26-XXXX member pass.",
  },
  {
    stepNumber: "02",
    title: "Join Peer Build Sprints",
    description:
      "Track upcoming workshops, hardware labs, and weekend hack sessions in the broadcast channel.",
  },
  {
    stepNumber: "03",
    title: "Build & Demo",
    description:
      "Collaborate across branches to ship working software, AI, and embedded prototypes.",
  },
];
