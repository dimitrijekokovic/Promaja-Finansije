export type TransactionType = "prihod" | "rashod";
export type Timeframe = "month" | "year";
export type Period = { year: number; month: number };
export type ClientUserSettings = {
  userId: string;
  currency: string;
  currentBalance: number;
};
