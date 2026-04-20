export function saveErrorMessage(code: string): string {
  const map: Record<string, string> = {
    github_auth:  'Service connection expired. Contact developer to refresh.',
    github_other: 'Could not save. Please try again or contact developer.',
    cloudinary:   'Could not move photos. Please try again.',
    validation:   'Some fields look invalid. Please check and try again.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}
