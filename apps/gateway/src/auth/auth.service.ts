import { createClerkClient, verifyToken } from '@clerk/backend';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserContext } from './auth.types';

@Injectable()
export class AuthService {
  //create a Clerk client instance using the provided secret and publishable keys from environment variables
  private readonly clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });

  private jwtVerifyOptions(): Record<string, any> {
    return {
      secretKey: process.env.CLERK_SECRET_KEY,
    };
  }

  async verifyAndBuildContext(token: string): Promise<UserContext> {
    try {
      const verified = await verifyToken(token, this.jwtVerifyOptions());

      const payload = verified?.payload ?? (verified as any);
      const clerkUserId = payload?.sub ?? payload?.user_id ?? payload?.userId;

      if (!clerkUserId) {
        throw new UnauthorizedException('Invalid token: missing user ID');
      }

      const role: 'admin' | 'user' = 'user';

      const emailFromToken =
        payload?.email ??
        payload?.email_address ??
        payload?.emailAddress ??
        payload?.primaryEmailAddress ??
        '';
      const nameFromToken =
        payload?.name ??
        payload?.username ??
        payload?.full_name ??
        payload?.fullName ??
        '';

      if (emailFromToken && nameFromToken) {
        return {
          clerkUserId,
          email: emailFromToken,
          name: nameFromToken,
          role,
        };
      }

      const user = await this.clerk.users.getUser(clerkUserId);
      const primaryEmail =
        user.emailAddresses.find(
          (email) => email.id === user.primaryEmailAddressId,
        )?.emailAddress ??
        user.emailAddresses[0]?.emailAddress ??
        '';

      const fullName =
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.username ||
        primaryEmail ||
        clerkUserId;

      return {
        clerkUserId,
        email: primaryEmail || emailFromToken,
        name: fullName || nameFromToken,
        role,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
