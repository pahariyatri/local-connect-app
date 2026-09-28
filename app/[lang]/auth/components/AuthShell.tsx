"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "../../components/atoms/Icon";
import { BRAND_CONFIG } from "@/config/brandConfig";
import styles from "./AuthShell.module.css";

type AuthShellProps = {
  lang: string;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthShell({ lang, eyebrow, title, subtitle, onBack, children, footer }: AuthShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href={`/${lang}`} className={styles.brand}>
          <span className={styles.logo}>{BRAND_CONFIG.brandInitials}</span>
          <span><strong>{BRAND_CONFIG.productDisplayName}</strong><small>{BRAND_CONFIG.productDescriptor}</small></span>
        </Link>
        <Link href={`/${lang}`} className={styles.close} aria-label="Close sign in and return home"><Icon name="close" className="w-5 h-5" /></Link>
      </header>
      <main className={styles.main}>
        <div className={styles.backRow}>
          {onBack && <button onClick={onBack} type="button"><Icon name="arrow-left" className="w-4 h-4" />Back</button>}
        </div>
        <div className={styles.card}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          {title && <h1>{title}</h1>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <div className={styles.form}>{children}</div>
          {footer && <div className={styles.extra}>{footer}</div>}
        </div>
        <p className={styles.help}>Need help? <a href={`mailto:${BRAND_CONFIG.supportEmail}`}>Contact support</a></p>
      </main>
      <footer className={styles.footer}>
        <Link href={`/${lang}/privacy-policy`}>Privacy</Link>
        <Link href={`/${lang}/terms-conditions`}>Terms</Link>
        <span>© {new Date().getFullYear()} {BRAND_CONFIG.parentBrandName}</span>
      </footer>
    </div>
  );
}
