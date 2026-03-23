import { auth } from '@clerk/nextjs/server';
import { connect } from '../mongodb/mongoose';
import User from '../models/user.model';

export async function requireAssistantUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }

  await connect();

  const dbUser = await User.findOne({ clerkId: userId }).lean();
  const role = dbUser?.isAdmin ? 'admin' : 'user';

  return {
    clerkId: userId,
    role,
    dbUser,
  };
}
