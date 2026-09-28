"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BRAND_CONFIG } from "@/config/brandConfig";
import styles from "./PublicFooter.module.css";

export default function PublicFooter() {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang || "en";
  const p = (path: string) => `/${lang}${path}`;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.main}>
          <div className={styles.brand}>
            <Link href={p("")} className={styles.brandName}>{BRAND_CONFIG.productDisplayName}</Link>
            <a href={BRAND_CONFIG.parentBrandUrl} target="_blank" rel="noopener noreferrer">
              {BRAND_CONFIG.productDescriptor} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <nav className={styles.navigation} aria-label="Footer navigation">
            <Link href={p("/explore")}>Book directly</Link>
            <Link href={p("/builder")}>Plan a trip</Link>
            <Link href={p("/vendor/onboarding")}>Become a partner</Link>
            <Link href={p("/auth/login")}>Partner sign in</Link>
          </nav>
        </div>
        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} {BRAND_CONFIG.parentBrandName}</p>
          <nav className={styles.utilities} aria-label="Support and legal">
            <a href={`mailto:${BRAND_CONFIG.supportEmail}`}>Contact support</a>
            <Link href={p("/about")}>About</Link>
            <Link href={p("/privacy-policy")}>Privacy</Link>
            <Link href={p("/terms-conditions")}>Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
