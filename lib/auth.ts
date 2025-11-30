import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Define UserRole locally to avoid Prisma client generation issues
type UserRole = "PERSONAL" | "COMPANY";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      companyName?: string | null;
      onboardingComplete: boolean;
    };
  }

  interface User {
    role: UserRole;
    companyName?: string | null;
    onboardingComplete: boolean;
  }
}

// Extend JWT type inline (NextAuth v5 compatible)
interface ExtendedJWT {
  id?: string;
  role?: UserRole;
  companyName?: string | null;
  onboardingComplete?: boolean;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Note: Adapter is not needed when using JWT strategy with Credentials provider
  // If you add OAuth providers later, you can add: adapter: PrismaAdapter(prisma) as any
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Return user with custom fields - explicitly typed to avoid adapter type conflicts
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          companyName: user.companyName,
          onboardingComplete: user.onboardingComplete,
        } as {
          id: string;
          email: string;
          name: string | null;
          image: string | null;
          role: UserRole;
          companyName: string | null;
          onboardingComplete: boolean;
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const extToken = token as ExtendedJWT & typeof token;
      
      if (user) {
        extToken.id = user.id;
        extToken.role = user.role;
        extToken.companyName = user.companyName;
        extToken.onboardingComplete = user.onboardingComplete;
      }

      // Handle session updates (e.g., after onboarding)
      if (trigger === "update" && session) {
        extToken.onboardingComplete = session.onboardingComplete;
        if (session.role) extToken.role = session.role;
        if (session.companyName) extToken.companyName = session.companyName;
      }

      return extToken;
    },
    async session({ session, token }) {
      const extToken = token as ExtendedJWT;
      
      if (extToken) {
        session.user.id = extToken.id ?? "";
        session.user.role = extToken.role ?? "PERSONAL";
        session.user.companyName = extToken.companyName ?? null;
        session.user.onboardingComplete = extToken.onboardingComplete ?? false;
      }
      return session;
    },
  },
  // Note: User creation (including budget summary) is handled in /api/auth/register
});

