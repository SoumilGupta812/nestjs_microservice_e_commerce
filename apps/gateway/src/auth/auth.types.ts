export type UserContext = {
  clerkUserId: string;

  email: string;
  name: string;
  role: 'admin' | 'user';
};
