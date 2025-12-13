import { toNum0, toPct0, toPct1 } from "panther";

export function formatValue(
  value: number,
  includePercent?: boolean,
  total?: number
): string {
  const numStr = toNum0(value);
  if (includePercent && total !== undefined && total > 0) {
    const pct = toPct0(value / total);
    return `${numStr} (${pct})`;
  }
  return numStr;
}

export function formatComparison(
  baselineValue: number,
  scenarioValue: number,
  formatter: (v: number) => string = toNum0
): string {
  const baseStr = formatter(baselineValue);
  const scenStr = formatter(scenarioValue);

  if (Math.abs(baselineValue - scenarioValue) < 0.0001) {
    return `${scenStr} (no change)`;
  }

  const delta = scenarioValue - baselineValue;
  const deltaStr = formatter(Math.abs(delta));
  const sign = delta > 0 ? "+" : "-";

  let pctChange = "";
  if (baselineValue !== 0) {
    const pct = ((scenarioValue - baselineValue) / baselineValue) * 100;
    const pctAbs = Math.abs(pct);
    if (pctAbs >= 0.5) {
      pctChange = ` (${sign}${pctAbs.toFixed(0)}%)`;
    }
  }

  return `${scenStr} [${sign}${deltaStr}${pctChange}]`;
}

export function formatPercentageComparison(
  baselinePct: number,
  scenarioPct: number
): string {
  const baseStr = toPct1(baselinePct);
  const scenStr = toPct1(scenarioPct);

  if (Math.abs(baselinePct - scenarioPct) < 0.0001) {
    return `${scenStr} (no change)`;
  }

  const delta = scenarioPct - baselinePct;
  const sign = delta > 0 ? "+" : "-";
  const pp = Math.abs(delta * 100);

  return `${scenStr} [${sign}${pp.toFixed(1)}pp]`;
}

export function indent(level: number, text: string): string {
  return "  ".repeat(level) + text;
}

export function sectionHeader(title: string, char: string = "="): string {
  const line = char.repeat(title.length + 4);
  return `\n${line}\n  ${title.toUpperCase()}\n${line}`;
}

export function rightAlign(text: string, width: number): string {
  return text.padStart(width);
}

export function leftAlign(text: string, width: number): string {
  return text.padEnd(width);
}

export function formatDualValue(
  pct: number,
  n: number,
  includeChange?: { baselinePct: number; baselineN: number }
): string {
  const pctStr = toPct1(pct);
  const nStr = toNum0(n);

  if (!includeChange) {
    return `${pctStr} (${nStr})`;
  }

  const pctChange =
    Math.abs(pct - includeChange.baselinePct) < 0.0001
      ? "no change"
      : formatPercentageComparison(includeChange.baselinePct, pct);

  const nChange =
    Math.abs(n - includeChange.baselineN) < 0.01
      ? ""
      : ` / n: ${formatComparison(includeChange.baselineN, n)}`;

  return `${pctStr} (${nStr}) [${pctChange}${nChange}]`;
}

export function formatTreeBranch(
  isLast: boolean,
  level: number,
  hasChildren: boolean
): string {
  if (level === 0) return "";

  const prefix = "  ".repeat(level - 1);
  const branch = isLast ? "└─→ " : "├─→ ";

  return prefix + branch;
}
