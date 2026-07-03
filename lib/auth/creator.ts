export const CREATOR_EMAIL = 'smart@gmail.com';
export const CREATOR_NAME = 'smart water level';

export function isCreatorEmail(email: string | null | undefined): boolean {
  return (email ?? '').trim().toLowerCase() === CREATOR_EMAIL;
}
