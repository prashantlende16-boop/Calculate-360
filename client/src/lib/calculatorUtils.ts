export function formatINR(num: number): string {
  if (isNaN(num)) return "—";
  const isNeg = num < 0;
  const absNum = Math.abs(num);
  const parts = absNum.toFixed(2).split(".");
  let intPart = parts[0];
  const decPart = parts[1];

  if (intPart.length > 3) {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    intPart = formatted + "," + last3;
  }

  const result = decPart === "00" ? intPart : intPart + "." + decPart;
  return (isNeg ? "-" : "") + "\u20B9" + result;
}

export function formatNumber(num: number, decimals = 2): string {
  if (isNaN(num)) return "—";
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function parseNumber(val: string): number {
  return parseFloat(val.replace(/,/g, ""));
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function getQueryParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export function setShareLink(params: Record<string, string>): string {
  const url = new URL(window.location.href);
  url.search = "";
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

export function saveToLocalStorage(key: string, data: Record<string, string>) {
  try {
    localStorage.setItem(`calc360_${key}`, JSON.stringify(data));
  } catch {}
}

export function loadFromLocalStorage(key: string): Record<string, string> | null {
  try {
    const data = localStorage.getItem(`calc360_${key}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function getRememberPref(key: string): boolean {
  try {
    return localStorage.getItem(`calc360_remember_${key}`) === "true";
  } catch {
    return false;
  }
}

export function setRememberPref(key: string, val: boolean) {
  try {
    localStorage.setItem(`calc360_remember_${key}`, val ? "true" : "false");
    if (!val) {
      localStorage.removeItem(`calc360_${key}`);
    }
  } catch {}
}
