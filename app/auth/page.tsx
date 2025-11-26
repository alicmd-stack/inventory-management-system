import { redirect } from "next/navigation";

/**
 * Auth page - Redirects to external authentication app (ALIC-Calendar)
 * 
 * This page is accessed when:
 * 1. Unauthenticated users try to access protected routes (via middleware redirect)
 * 2. Users manually navigate to /auth
 * 
 * It redirects to the external auth application which handles login,
 * then the external app should redirect back to this application with auth tokens.
 */
export default function AuthPage() {
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001/auth";
  
  // Redirect to external auth app
  redirect(authUrl);
}

