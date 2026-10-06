import type { Metadata } from "next";
import { PlanView } from "@/components/PlanView";

export const metadata: Metadata = {
  title: "Your starter plan",
  description: "An educational illustration of a monthly surplus, a buffer, and fictional options.",
};

export default function PlanPage() {
  return <PlanView />;
}
