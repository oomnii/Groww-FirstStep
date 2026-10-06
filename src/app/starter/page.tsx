import type { Metadata } from "next";
import { Suspense } from "react";
import { StarterWizard } from "@/components/StarterWizard";

export const metadata: Metadata = {
  title: "Starter",
  description: "Enter a financial starting point, a goal, and your comfort with ups and downs.",
};

export default function StarterPage() {
  return (
    <Suspense fallback={<p className="loading">Loading your saved answers…</p>}>
      <StarterWizard />
    </Suspense>
  );
}
