import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyUserJwt } from "@/lib/user-security"

export async function getAuthenticatedUser() {
   const token = (await cookies()).get("auth_token")?.value //kalo gapunya aku ini matiin/jadiin komen
   if (!token) return null // kalo gapunya aku ini matiin/jadiin komen

   const payload = verifyUserJwt(token) // kalo gapunya aku ini matiin/jadiin komen
   if (!payload) return null // kalo gapunya aku ini matiin/jadiin komen

   const userId = Number(payload.sub) // kalo gapunya aku ini matiin/jadiin komen
   if (!Number.isSafeInteger(userId) || userId < 1) return null // kalo gapunya aku ini matiin/jadiin komen

  const user = await prisma.user.findFirst({
     where: { id: userId }, // kalo gapunya aku ini matiin/jadiin komen
    select: { id: true, fullname: true, email: true, role: true, token: true },
  })
   if (!user || user.token !== token) return null // kalo gapunya aku ini matiin/jadiin komen

  const { token: _token, ...authenticatedUser } = user!
  return authenticatedUser
}
