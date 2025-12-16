import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { createDB } from "./db";

export const auth = (env: Cloudflare.Env) =>
  betterAuth({
    database: drizzleAdapter(createDB(env), {
      provider: "sqlite",
    }),
    secret: env.BETTER_AUTH_SECRET,
    socialProviders: {
      github: {
        clientId: env.AUTH_GITHUB_ID,
        clientSecret: env.AUTH_GITHUB_SECRET,
        redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/github`,
      },
      google: {
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
        redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
      },
    },
    plugins: [tanstackStartCookies()],
  });
