import type { Metadata } from "next";
import { ProgressView } from "@/components/ProgressView";

export const metadata: Metadata = {
  title: "Progress",
  description: "See which parts of the educational journey are saved in this browser.",
};

export default function ProgressPage() {
  return <ProgressView />;
}
