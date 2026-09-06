/**
 * Centralized Brand & Product Architecture Configuration
 *
 * DO NOT hardcode brand names, URLs, or product descriptors throughout the application.
 *
 * Architecture:
 * 1. Parent Company / Master Brand: Pahari Yatri (https://www.pahariyatri.com) - PROTECTED, EXTERNAL
 * 2. Traveler Application: Travel Platform by Pahari Yatri (https://app.pahariyatri.com)
 * 3. Future Products: May sit underneath Pahari Yatri (e.g. YatriStay hospitality management)
 *
 * When the traveler platform receives an independent permanent name in the future,
 * update this centralized configuration file.
 */

export const BRAND_CONFIG = {
  // Master Brand / Parent Entity (External Website)
  parentBrandName: "Pahari Yatri",
  parentBrandUrl: "https://www.pahariyatri.com",
  parentBrandCopyright: `© ${new Date().getFullYear()} Pahari Yatri. All rights reserved.`,

  // Traveler Product Details (This Web App)
  productDisplayName: "Travel Platform",
  productDescriptor: "by Pahari Yatri",
  productStage: "Early Access",
  
  // Composite Names
  fullProductName: "Travel Platform by Pahari Yatri",
  compactProductName: "Pahari Yatri Travel Platform",
  headerBrandTitle: "Travel Platform",
  headerBrandSubtitle: "by Pahari Yatri",
  
  // Brand Initials & Logo
  brandInitials: "PY",
  
  // Official Public URLs
  appUrl: "https://app.pahariyatri.com",
  
  // Customer Communications
  supportEmail: "pahariyatri@gmail.com",
  tagline: "Travel like you know someone there.",
  secondaryTagline: "Wherever you go in the mountains, know a local.",
  
  // Official Explanatory Copy
  aboutSummary: "This travel platform is built by Pahari Yatri to help travelers discover trusted local stays, transport, guides and experiences.",
  missionShort: "Empowering the local people who make the Himachal mountains feel like home.",

  // Brand-bridge trust line — ties this product back to the main Pahari Yatri
  // story library without reading as a sales pitch. See CLAUDE.md ("Main
  // Site + App Portal Operating System") in pahari-yatri-app for the rules
  // this line is written against.
  trustLine: "Built by Pahari Yatri for travellers who want local context, not package noise.",
} as const;

export type BrandConfig = typeof BRAND_CONFIG;
