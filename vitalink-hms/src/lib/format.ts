// Currency & date utilities
export const formatCurrency = (n: number, currency = "XOF") =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " " + currency;

export const formatNumber = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n);

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export const formatDateTime = (d: string | Date) =>
  new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const calcAge = (birth: string) => {
  const b = new Date(birth);
  const ageDifMs = Date.now() - b.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const initials = (first: string, last: string) =>
  `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

export const cn = (...args: any[]) => args.filter(Boolean).join(" ");