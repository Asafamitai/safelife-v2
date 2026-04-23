/**
 * Seed data for the parent-side "Money" page: balances, recent
 * transactions, and upcoming bills. Swapped in later for a real
 * aggregator (Plaid / bank MCP).
 *
 * Transactions tagged `flag: "unusual"` are what SafeLife AI surfaces
 * at the top of the page ("AI noticed"). In the real product this
 * comes from a baseline-learning model; here we mark them by hand so
 * the demo reads cleanly.
 */

export type AccountKind = "checking" | "savings" | "credit";

export interface Account {
  id: string;
  name: string;
  institution: string;
  kind: AccountKind;
  icon: string;
  /** Cents → easier to format without float drift. */
  balanceCents: number;
  /** For credit accounts: credit limit in cents. */
  limitCents?: number;
  /** For credit accounts: due date label (e.g. "Wed"). */
  dueLabel?: string;
  /** Short positive signal ("Healthy this week"), shown as a chip. */
  okNote?: string;
  /** Is this card active (default true). Freeze-card Phase 2 will flip it. */
  active?: boolean;
}

export interface Txn {
  id: string;
  merchant: string;
  amountCents: number; // negative = spend, positive = incoming
  dateLabel: string; // "Today", "Sun", "Mon"
  categoryIcon: string;
  accountId: string;
  flag?: "unusual" | "recurring" | "paid";
  /** One-liner that the AI shows next to a flag. */
  flagNote?: string;
}

export interface Bill {
  id: string;
  biller: string;
  icon: string;
  amountCents: number;
  dueLabel: string; // "Wed", "Fri", "Apr 28"
  autoPay: boolean;
}

export const ACCOUNTS: Account[] = [
  {
    id: "chk",
    name: "Checking",
    institution: "Bank of America",
    kind: "checking",
    icon: "🏦",
    balanceCents: 482_317,
    okNote: "Healthy this week",
  },
  {
    id: "sav",
    name: "Savings",
    institution: "Bank of America",
    kind: "savings",
    icon: "💰",
    balanceCents: 1_240_500,
  },
  {
    id: "cc",
    name: "Credit card",
    institution: "Chase Sapphire",
    kind: "credit",
    icon: "💳",
    balanceCents: 31_250,
    limitCents: 1_000_000,
    dueLabel: "Wed",
    active: true,
  },
  {
    id: "cc-visa",
    name: "Credit card",
    institution: "Visa Signature · BoA",
    kind: "credit",
    icon: "💳",
    balanceCents: 128_430,
    limitCents: 800_000,
    dueLabel: "in 12 days",
    active: true,
  },
  {
    id: "cc-amex",
    name: "Credit card",
    institution: "Amex Gold",
    kind: "credit",
    icon: "💳",
    balanceCents: 20_488,
    limitCents: 1_500_000,
    dueLabel: "in 26 days",
    active: true,
  },
];

export const TRANSACTIONS: Txn[] = [
  {
    id: "t-1",
    merchant: "Amazon",
    amountCents: -34_000,
    dateLabel: "Sun",
    categoryIcon: "📦",
    accountId: "cc",
    flag: "unusual",
    flagNote: "4× your typical weekly spend. Review to approve or dispute.",
  },
  {
    id: "t-2",
    merchant: "CVS Pharmacy",
    amountCents: -1_840,
    dateLabel: "Mon",
    categoryIcon: "💊",
    accountId: "chk",
  },
  {
    id: "t-3",
    merchant: "Trader Joe's",
    amountCents: -4_622,
    dateLabel: "Mon",
    categoryIcon: "🛒",
    accountId: "chk",
    flag: "recurring",
  },
  {
    id: "t-4",
    merchant: "Uber Eats — Luigi's Pizza",
    amountCents: -2_690,
    dateLabel: "Sat",
    categoryIcon: "🍕",
    accountId: "cc",
    flag: "recurring",
  },
  {
    id: "t-5",
    merchant: "Con Edison",
    amountCents: -12_750,
    dateLabel: "Fri",
    categoryIcon: "💡",
    accountId: "chk",
    flag: "paid",
  },
  {
    id: "t-6",
    merchant: "Direct deposit · Social Security",
    amountCents: 185_000,
    dateLabel: "Fri",
    categoryIcon: "💵",
    accountId: "chk",
  },
];

export const BILLS: Bill[] = [
  {
    id: "b-1",
    biller: "Con Edison (Electric)",
    icon: "💡",
    amountCents: 12_750,
    dueLabel: "Wed",
    autoPay: false,
  },
  {
    id: "b-2",
    biller: "Verizon Internet",
    icon: "🛜",
    amountCents: 8_999,
    dueLabel: "Fri",
    autoPay: false,
  },
  {
    id: "b-3",
    biller: "Spectrum TV",
    icon: "📺",
    amountCents: 7_499,
    dueLabel: "Apr 28",
    autoPay: true,
  },
];

/** "1234.56" → "$1,234.56", handling negatives and cents. */
export function formatDollars(cents: number): string {
  const neg = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100).toLocaleString("en-US");
  const frac = (abs % 100).toString().padStart(2, "0");
  return `${neg ? "-" : ""}$${whole}.${frac}`;
}
