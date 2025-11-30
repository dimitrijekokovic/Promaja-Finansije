import { Currency } from "lucide-react"

export const Currencies = [
  { value: "EUR", label: "€ Euro",        locale: "de-DE" },
  { value: "RSD", label: "RSD Dinar",     locale: "sr-RS" },
] as const;

export type Currency = (typeof Currencies)[number];
