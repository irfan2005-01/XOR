export interface BrandConfig {
  name: string;
  tagline: string;
  institution: string;
  email: string;
  whatsapp: string;
  phone: string;
  location: string;
  estYear: string;
  subheading: string;
}

export const BRAND_CONFIG: BrandConfig = {
  name: "XOR",
  tagline: "We build people who build things.",
  institution: "Lingaraj Appa Engineering College, Bidar",
  email: "Updating soon (wait for update)",
  whatsapp: "",
  phone: "Updating soon (wait for update)",
  location: "Bidar, Karnataka",
  estYear: "2025",
  subheading:
    "The student-led engineering and builder club at LAEC Bidar. Claim your member pass, collaborate on weekend builds, and join campus workshops.",
};

export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: "About", href: "/#about" },
  { label: "Team", href: "/team" },
  { label: "Community", href: "/community" },
  { label: "My ID Card", href: "/dashboard" },
];

export interface HowItWorksStep {
  stepNumber: string;
  title: string;
  description: string;
}

export const howItWorksSteps: HowItWorksStep[] = [
  {
    stepNumber: "01",
    title: "Create Account",
    description:
      "Register in seconds using your LAEC USN, branch, semester, and student email.",
  },
  {
    stepNumber: "02",
    title: "Get Virtual ID",
    description:
      "Receive your verified XOR-26-XXXX member pass ready to download as a PNG.",
  },
  {
    stepNumber: "03",
    title: "Join Community & Events",
    description:
      "Browse club announcements, hands-on workshops, and RSVP to weekend sprints.",
  },
];
