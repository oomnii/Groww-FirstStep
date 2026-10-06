import type { UserPersona } from "@/types";

export const personas: UserPersona[] = [
  {
    id: "student",
    code: "Persona A",
    name: "Student",
    age: 21,
    monthlyIncome: 8000,
    essentialExpenses: 5500,
    liquidSavings: 3000,
    investmentExperience: "none",
    summary: "A small monthly income, with essential costs taking most of it.",
  },
  {
    id: "intern",
    code: "Persona B",
    name: "Intern",
    age: 22,
    monthlyIncome: 20000,
    essentialExpenses: 12000,
    liquidSavings: 15000,
    investmentExperience: "beginner",
    summary: "A first work stipend, with some savings already set aside.",
  },
  {
    id: "first-job",
    code: "Persona C",
    name: "First-job employee",
    age: 23,
    monthlyIncome: 35000,
    essentialExpenses: 20000,
    liquidSavings: 40000,
    investmentExperience: "beginner",
    summary: "A new salary and a modest savings balance.",
  },
  {
    id: "higher-income",
    code: "Persona D",
    name: "Higher-income beginner",
    age: 25,
    monthlyIncome: 60000,
    essentialExpenses: 30000,
    liquidSavings: 100000,
    investmentExperience: "beginner",
    summary: "A higher salary, and still new to investing.",
  },
];

export function getPersona(id: string): UserPersona | undefined {
  return personas.find((persona) => persona.id === id);
}

export function experienceLabel(experience: UserPersona["investmentExperience"]): string {
  if (experience === "none") return "No investing experience";
  return "Beginner";
}
