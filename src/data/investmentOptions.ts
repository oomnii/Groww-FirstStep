import type { InvestmentOption } from "@/types";

export const investmentOptions: InvestmentOption[] = [
  {
    id: "stability-bucket",
    name: "Stability Bucket",
    risk: "low",
    diversified: true,
    purpose: "Educational lower-volatility example",
    description:
      "A fictional diversified category used to explore a calmer illustrative path. It is not a real product and has no promised outcome.",
    illustrates: "A calmer, spread-out example for comparing a lower-volatility path.",
    whatCouldGoWrong:
      "A calmer illustration can still fall in value for a while. This card does not say the drop will be small.",
  },
  {
    id: "balanced-basket",
    name: "Balanced Basket",
    risk: "moderate",
    diversified: true,
    purpose: "Educational medium-volatility example",
    description:
      "A fictional diversified category used to explore a middle illustrative path. It is not a real product and has no promised outcome.",
    illustrates: "A middle example that mixes steadier and bumpier ideas.",
    whatCouldGoWrong: "A middle path can still lose value. The mix does not remove that.",
  },
  {
    id: "growth-basket",
    name: "Growth Basket",
    risk: "high",
    diversified: true,
    purpose: "Educational higher-volatility example",
    description:
      "A fictional diversified category used to explore a bumpier illustrative path. It is not a real product and has no promised outcome.",
    illustrates: "A bumpier, still spread-out example, often compared with a longer horizon.",
    whatCouldGoWrong:
      "A larger drop is part of what this example is for. The illustrated value can be much smaller for a while.",
  },
  {
    id: "single-stock-demo",
    name: "Single Stock Demo",
    risk: "high",
    diversified: false,
    purpose: "Educational non-diversified example",
    description:
      "A fictional single-example category. It is not a real security, and it is here to show what a non-diversified illustration feels like.",
    illustrates: "One example instead of a mix, so a single outcome carries the illustration.",
    whatCouldGoWrong:
      "If that one example falls, this illustration has no mix to soften it.",
  },
];

export function getInvestmentOption(id: string): InvestmentOption | undefined {
  return investmentOptions.find((option) => option.id === id);
}
