import { currentUser } from '@clerk/nextjs/server';

export async function requireAdminUser() {
  const user = await currentUser();

  if (!user || user.publicMetadata?.isAdmin !== true) {
    throw new Error('UNAUTHORIZED');
  }

  return user;
}
