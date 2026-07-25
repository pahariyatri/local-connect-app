import type { Metadata } from 'next';

/**
 * Auth section layout: every page under /{lang}/auth/* is private and must
 * never be indexed. Pages themselves are Client Components, so the robots
 * directive lives here in the section layout (Server Component).
 */
export const metadata: Metadata = {
  title: 'Sign in — Pahari Yatri',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
