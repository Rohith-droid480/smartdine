// =============================================================================
// server/src/config/passport.ts
// Google OAuth 2.0 strategy configuration.
//
// If GOOGLE_CLIENT_ID is not set in .env, the strategy is NOT registered
// and the /google routes return 501. This prevents crashes in dev/test
// environments that don't have Google credentials configured.
// =============================================================================

import passport from 'passport';
import { Strategy as GoogleStrategy, type Profile, type VerifyCallback } from 'passport-google-oauth20';
import { env } from './env';
import { logger } from './logger';
import * as userRepo from '../repositories/user.repository';

/**
 * Initialize passport with Google OAuth strategy.
 * Call this once during app setup.
 */
export function configurePassport(): void {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    logger.warn('Google OAuth not configured — GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_CALLBACK_URL missing');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
      ): Promise<void> => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || profile.name?.givenName || 'User';

          if (!email) {
            done(new Error('No email returned from Google profile'), undefined);
            return;
          }

          // 1. Try to find user by googleId (already linked)
          let user = await userRepo.findUserByGoogleId(googleId);

          if (!user) {
            // 2. Try by email (user signed up with email/password, now logging in via Google)
            user = await userRepo.findUserByEmail(email);

            if (user) {
              // Link the Google account to the existing user and mark as verified
              user = await userRepo.updateUser(user.id, { isVerified: true });
              user = await userRepo.linkGoogleId(user.id, googleId);
            } else {
              // 3. Brand new user — create with Google data
              user = await userRepo.createUser({
                email,
                name,
                googleId,
              });
              // Mark as verified immediately — Google already verified the email
              user = await userRepo.updateUser(user.id, { isVerified: true });
            }
          }

          // Pass the Prisma User to passport's done() — it will be on req.user
          done(null, user as unknown as Express.User);
        } catch (err) {
          logger.error('Google OAuth strategy error', { error: (err as Error).message });
          done(err as Error, undefined);
        }
      },
    ),
  );

  // Passport serialize/deserialize (not used in JWT/stateless flow, but required by passport)
  passport.serializeUser((user, done) => {
    done(null, (user as unknown as { id: string }).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await userRepo.findUserById(id);
      done(null, user as unknown as Express.User);
    } catch (err) {
      done(err, null);
    }
  });

  logger.info('Google OAuth strategy configured');
}
