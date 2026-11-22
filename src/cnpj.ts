/**
 * CNPJ helpers that need no network: the numeric CNPJ and the alphanumeric one the Receita
 * issues since July 2026 (letters in the first twelve characters; a character counts as
 * its ASCII code minus 48 in the check digits).
 */

/** Upper-cases and keeps what a CNPJ may hold: A-Z only in the first 12 places. */
export function cleanCnpj(value: string): string {
  let out = "";
  for (const c of value.toUpperCase()) {
    if (out.length >= 14) break;
    if ((c >= "0" && c <= "9") || (c >= "A" && c <= "Z" && out.length < 12)) out += c;
  }
  return out;
}

/** 00.000.000/0000-00, as far as the value goes. */
export function maskCnpj(value: string): string {
  const v = cleanCnpj(value);
  const cuts: [number, number, string][] = [
    [0, 2, ""],
    [2, 5, "."],
    [5, 8, "."],
    [8, 12, "/"],
    [12, 14, "-"],
  ];
  return cuts
    .map(([a, b, sep]) => (v.length > a ? sep + v.slice(a, b) : ""))
    .join("")
    .replace(/^[./-]/, "");
}

function checkDigit(body: string): number {
  let sum = 0;
  let weight = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += (body.charCodeAt(i) - 48) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const r = sum % 11;
  return r < 2 ? 0 : 11 - r;
}

/** Whether the check digits are right (not whether the company exists: ask the API). */
export function isValidCnpj(value: string): boolean {
  const v = cleanCnpj(value);
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(v) || /^(.)\1{13}$/.test(v)) return false;
  const d1 = checkDigit(v.slice(0, 12));
  const d2 = checkDigit(v.slice(0, 12) + d1);
  return v.slice(12) === `${d1}${d2}`;
}
