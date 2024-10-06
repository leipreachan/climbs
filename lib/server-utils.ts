import { cookies } from 'next/headers'

export function getSession() {
  const sessionCookie = cookies().get('session')
  if (sessionCookie) {
    return JSON.parse(sessionCookie.value)
  }
  return null
}