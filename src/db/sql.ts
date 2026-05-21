export function escapeSqlString(value: unknown): string {
  return String(value).replace(/'/g, "''");
}

export function sqlString(value: unknown): string {
  return `'${escapeSqlString(value)}'`;
}

export function sqlNumber(value: unknown): number {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 0;
  return numberValue;
}
