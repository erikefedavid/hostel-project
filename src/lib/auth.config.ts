import { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [], // Configured in main auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.gender = (user as any).gender;
        token.level = (user as any).level;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).gender = token.gender;
        (session.user as any).level = token.level;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Strip any trailing dots from domains to prevent DNS/SSL issues
      const cleanBaseUrl = baseUrl.endsWith(".") ? baseUrl.slice(0, -1) : baseUrl;
      let cleanUrl = url.endsWith(".") ? url.slice(0, -1) : url;

      if (cleanUrl.startsWith("/")) {
        return `${cleanBaseUrl}${cleanUrl}`;
      }

      try {
        const u = new URL(cleanUrl);
        if (u.host.endsWith(".")) {
          u.host = u.host.slice(0, -1);
          cleanUrl = u.toString();
        }
      } catch (e) {
        return cleanBaseUrl;
      }

      return cleanUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecretlcu-hams-key-12345",
};
