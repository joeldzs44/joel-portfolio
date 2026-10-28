// Newest first. `href` is optional — add a verification link to make the row clickable.

export type Certification = {
  name: string;
  issuer: string;
  area: string;
  date: string;
  href?: string;
};

export const certifications: Certification[] = [
  {
    name: "Foundations of Data Science and Machine Learning with Python",
    issuer: "Packt",
    area: "Data science & ML",
    date: "Dec 2025",
  },
  { name: "Prompt Design in Vertex AI", issuer: "Google", area: "Prompt design", date: "Jun 2025" },
  {
    name: "Microsoft Certified: Power BI Data Analyst Associate (PL-300)",
    issuer: "Microsoft",
    area: "Analytics",
    date: "Jun 2024",
  },
  { name: "Core Data Concepts in Microsoft Azure", issuer: "Coursera", area: "Cloud data", date: "Apr 2024" },
  { name: "Python for Everybody Specialization", issuer: "Coursera", area: "Programming", date: "Jun 2021" },
];
