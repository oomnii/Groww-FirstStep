import type { Metadata } from "next";
import { SimulateView } from "@/components/SimulateView";

export const metadata: Metadata = {
  title: "Risk in rupees",
  description: "Mathematical rupee scenarios for a fictional option. Not a market forecast.",
};

export default function SimulatePage() {
  return <SimulateView />;
}
