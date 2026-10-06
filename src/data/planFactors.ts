export const planChangeFactors = [
  {
    id: "income",
    title: "Income changes",
    body: "A higher or lower monthly income changes the surplus this prototype calculates. The split is redrawn from that new surplus.",
  },
  {
    id: "expenses",
    title: "Expenses change",
    body: "Higher essential expenses can shrink the surplus and the months of coverage. Lower expenses can do the opposite.",
  },
  {
    id: "goal-date",
    title: "Goal date changes",
    body: "A nearer date puts more of the optional slice toward a goal reserve. A later date leaves more of that slice as exploration.",
  },
  {
    id: "savings",
    title: "Savings increase or decrease",
    body: "Savings change how many months of essential expenses are covered, which changes whether the illustration is buffer-first, mixed, or more open to exploration.",
  },
  {
    id: "comfort",
    title: "Risk comfort changes",
    body: "Lower comfort moves more of the optional slice toward a goal reserve. Higher comfort moves a little of it toward exploration. Moderate comfort leaves the horizon split as it is.",
  },
] as const;
