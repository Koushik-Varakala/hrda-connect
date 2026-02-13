import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Hardcoded admin for now (Ported from passport setup)
                const adminUsername = process.env.ADMIN_USERNAME || "admin";
                const adminPassword = process.env.ADMIN_PASSWORD || "admin";

                if (
                    credentials?.username === adminUsername &&
                    credentials?.password === adminPassword
                ) {
                    return {
                        id: "1",
                        name: "Admin User",
                        email: "admin@hrda.in",
                        isAdmin: true,
                    };
                }
                return null;
            }
        })
    ],
    // session: { strategy: "jwt" }, // v5 defaults to jwt for edge compatibility
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.isAdmin = (user as any).isAdmin;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).isAdmin = token.isAdmin;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});
