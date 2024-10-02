import NextAuth from "next-auth"
import StravaProvider from "next-auth/providers/strava"
import { env } from "process"

const handler = NextAuth({
  providers: [
    StravaProvider({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: {
        params: {
          url: `${env.NEXT_PUBLIC_OAUTH_URI || 'http://localhost:3001'}/api/auth/callback/strava`,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      return session
    },
  },
})

export { handler as GET, handler as POST }