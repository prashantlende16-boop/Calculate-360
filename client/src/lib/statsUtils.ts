export function parseDataInput(raw: string): { values: number[]; errors: { index: number; token: string }[] } {
  const tokens = raw.split(/[,\s\t\n]+/).filter((t) => t.trim() !== "");
  const values: number[] = [];
  const errors: { index: number; token: string }[] = [];
  tokens.forEach((token, i) => {
    const num = Number(token);
    if (isNaN(num)) {
      errors.push({ index: i, token });
    } else {
      values.push(num);
    }
  });
  return { values, errors };
}

export function parsePairedData(raw: string): { pairs: [number, number][]; errors: { line: number; text: string }[] } {
  const lines = raw.split(/\n/).filter((l) => l.trim() !== "");
  const pairs: [number, number][] = [];
  const errors: { line: number; text: string }[] = [];
  lines.forEach((line, i) => {
    const parts = line.trim().split(/[,\s\t]+/).filter((p) => p !== "");
    if (parts.length < 2) {
      errors.push({ line: i + 1, text: line.trim() });
      return;
    }
    const x = Number(parts[0]);
    const y = Number(parts[1]);
    if (isNaN(x) || isNaN(y)) {
      errors.push({ line: i + 1, text: line.trim() });
    } else {
      pairs.push([x, y]);
    }
  });
  return { pairs, errors };
}

export function mean(data: number[]): number {
  return data.reduce((s, v) => s + v, 0) / data.length;
}

export function median(data: number[]): number {
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function mode(data: number[]): number[] {
  const freq = new Map<number, number>();
  data.forEach((v) => freq.set(v, (freq.get(v) || 0) + 1));
  const maxFreq = Math.max(...Array.from(freq.values()));
  if (maxFreq === 1) return [];
  const modes: number[] = [];
  freq.forEach((count, val) => {
    if (count === maxFreq) modes.push(val);
  });
  return modes.sort((a, b) => a - b);
}

export function variance(data: number[], population = false): number {
  const m = mean(data);
  const ss = data.reduce((s, v) => s + (v - m) ** 2, 0);
  return ss / (population ? data.length : data.length - 1);
}

export function stdDev(data: number[], population = false): number {
  return Math.sqrt(variance(data, population));
}

export function percentile(data: number[], p: number): number {
  const sorted = [...data].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function skewness(data: number[]): number {
  const n = data.length;
  if (n < 3) return NaN;
  const m = mean(data);
  const s = stdDev(data, false);
  if (s === 0) return 0;
  const sum = data.reduce((acc, v) => acc + ((v - m) / s) ** 3, 0);
  return (n / ((n - 1) * (n - 2))) * sum;
}

export function kurtosis(data: number[]): number {
  const n = data.length;
  if (n < 4) return NaN;
  const m = mean(data);
  const s = stdDev(data, false);
  if (s === 0) return 0;
  const sum = data.reduce((acc, v) => acc + ((v - m) / s) ** 4, 0);
  const k = ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum;
  const correction = (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
  return k - correction;
}

export function coefficientOfVariation(data: number[]): number {
  const m = mean(data);
  if (Math.abs(m) < 1e-10) return NaN;
  return (stdDev(data, false) / Math.abs(m)) * 100;
}

export function linearRegression(pairs: [number, number][]): {
  slope: number;
  intercept: number;
  rSquared: number;
  r: number;
  standardError: number;
} {
  const n = pairs.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const [x, y] of pairs) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const yMean = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (const [x, y] of pairs) {
    ssTot += (y - yMean) ** 2;
    ssRes += (y - (slope * x + intercept)) ** 2;
  }
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  const r = Math.sign(slope) * Math.sqrt(Math.max(0, rSquared));
  const standardError = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0;
  return { slope, intercept, rSquared, r, standardError };
}

// ===== Statistical distribution functions =====

export function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

export function normalCDF(x: number, mu = 0, sigma = 1): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
}

export function inverseNormalCDF(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  const a = [
    -3.969683028665376e1, 2.209460984245205e2,
    -2.759285104469687e2, 1.383577518672690e2,
    -3.066479806614716e1, 2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2,
    -1.556989798598866e2, 6.680131188771972e1,
    -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1,
    -2.400758277161838e0, -2.549732539343734e0,
    4.374664141464968e0, 2.938163982698783e0,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1,
    2.445134137142996e0, 3.754408661907416e0,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
           ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
           (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -((((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1));
  }
}

function lnGamma(x: number): number {
  const g = 7;
  const coeff = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  }
  x -= 1;
  let a = coeff[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) {
    a += coeff[i] / (x + i);
  }
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function betaFunction(a: number, b: number): number {
  return Math.exp(lnGamma(a) + lnGamma(b) - lnGamma(a + b));
}

function regularizedBetaIncomplete(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const maxIter = 200;
  const eps = 1e-14;

  if (x > (a + 1) / (a + b + 2)) {
    return 1 - regularizedBetaIncomplete(1 - x, b, a);
  }

  const lnPre = a * Math.log(x) + b * Math.log(1 - x) - Math.log(a) - lnGamma(a) - lnGamma(b) + lnGamma(a + b);
  const front = Math.exp(lnPre);

  let f = 1, c = 1, d = 0;
  for (let i = 0; i <= maxIter; i++) {
    let m = Math.floor(i / 2);
    let numerator: number;
    if (i === 0) {
      numerator = 1;
    } else if (i % 2 === 0) {
      numerator = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    } else {
      numerator = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    }
    d = 1 + numerator * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    c = 1 + numerator / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    const delta = c * d;
    f *= delta;
    if (Math.abs(delta - 1) < eps) break;
  }
  return front * (f - 1);
}

export function tCDF(t: number, df: number): number {
  if (df <= 0) return NaN;
  const x = df / (df + t * t);
  const ibeta = regularizedBetaIncomplete(x, df / 2, 0.5);
  const p = 0.5 * ibeta;
  return t >= 0 ? 1 - p : p;
}

export function inverseTCDF(p: number, df: number): number {
  if (p <= 0 || p >= 1 || df <= 0) return NaN;
  let lo = -1000, hi = 1000;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const cdf = tCDF(mid, df);
    if (Math.abs(cdf - p) < 1e-12) return mid;
    if (cdf < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function chiSquareCDF(x: number, df: number): number {
  if (x <= 0) return 0;
  if (df <= 0) return NaN;
  return regularizedGammaLower(df / 2, x / 2);
}

function regularizedGammaLower(a: number, x: number): number {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let sum = 1 / a;
    let term = 1 / a;
    for (let n = 1; n < 200; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-14) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - lnGamma(a));
  } else {
    let f = 1;
    let c = 1e30;
    let d = 1 / (x + 1 - a);
    f = d;
    for (let n = 1; n <= 200; n++) {
      const an = n * (a - n);
      const bn = x + 2 * n + 1 - a;
      d = bn + an * d;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = bn + an / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      const delta = d * c;
      f *= delta;
      if (Math.abs(delta - 1) < 1e-14) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - lnGamma(a)) * f;
  }
}

export function formatStat(value: number, decimals: number): string {
  if (!isFinite(value) || isNaN(value)) return "—";
  return value.toFixed(decimals);
}

export function welchTTest(
  data1: number[],
  data2: number[]
): { t: number; df: number; pValue: number; meanDiff: number; se: number } {
  const n1 = data1.length;
  const n2 = data2.length;
  const m1 = mean(data1);
  const m2 = mean(data2);
  const v1 = variance(data1, false);
  const v2 = variance(data2, false);
  const se = Math.sqrt(v1 / n1 + v2 / n2);
  const t = (m1 - m2) / se;
  const dfNum = (v1 / n1 + v2 / n2) ** 2;
  const dfDen = (v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1);
  const df = dfNum / dfDen;
  const pValue = 2 * (1 - tCDF(Math.abs(t), df));
  return { t, df, pValue, meanDiff: m1 - m2, se };
}

export function pooledTTest(
  data1: number[],
  data2: number[]
): { t: number; df: number; pValue: number; meanDiff: number; se: number } {
  const n1 = data1.length;
  const n2 = data2.length;
  const m1 = mean(data1);
  const m2 = mean(data2);
  const v1 = variance(data1, false);
  const v2 = variance(data2, false);
  const pooledVar = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
  const se = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));
  const t = (m1 - m2) / se;
  const df = n1 + n2 - 2;
  const pValue = 2 * (1 - tCDF(Math.abs(t), df));
  return { t, df, pValue, meanDiff: m1 - m2, se };
}

export function oneSampleTTest(
  data: number[],
  mu0: number,
  alternative: "two-sided" | "greater" | "less" = "two-sided"
): { t: number; df: number; pValue: number } {
  const n = data.length;
  const m = mean(data);
  const s = stdDev(data, false);
  const se = s / Math.sqrt(n);
  const t = (m - mu0) / se;
  const df = n - 1;
  let pValue: number;
  if (alternative === "two-sided") {
    pValue = 2 * (1 - tCDF(Math.abs(t), df));
  } else if (alternative === "greater") {
    pValue = 1 - tCDF(t, df);
  } else {
    pValue = tCDF(t, df);
  }
  return { t, df, pValue };
}

export function proportionCI(
  successes: number,
  n: number,
  confidence: number
): { lower: number; upper: number; pHat: number; margin: number } {
  const pHat = successes / n;
  const z = inverseNormalCDF(1 - (1 - confidence / 100) / 2);
  const margin = z * Math.sqrt((pHat * (1 - pHat)) / n);
  return { lower: pHat - margin, upper: pHat + margin, pHat, margin };
}

export function zInterval(
  dataMean: number,
  sigma: number,
  n: number,
  confidence: number
): { lower: number; upper: number; margin: number } {
  const z = inverseNormalCDF(1 - (1 - confidence / 100) / 2);
  const margin = z * (sigma / Math.sqrt(n));
  return { lower: dataMean - margin, upper: dataMean + margin, margin };
}

export function tInterval(
  dataMean: number,
  s: number,
  n: number,
  confidence: number
): { lower: number; upper: number; margin: number } {
  const tStar = inverseTCDF(1 - (1 - confidence / 100) / 2, n - 1);
  const margin = tStar * (s / Math.sqrt(n));
  return { lower: dataMean - margin, upper: dataMean + margin, margin };
}

export function cohenD(data1: number[], data2: number[]): number {
  const n1 = data1.length;
  const n2 = data2.length;
  const v1 = variance(data1, false);
  const v2 = variance(data2, false);
  const pooledSD = Math.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2));
  if (pooledSD === 0) return 0;
  return (mean(data1) - mean(data2)) / pooledSD;
}
