export function normalizePhone(input: string): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return '+91' + digits;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return '+' + digits;
  }
  return null;
}
