/**
 * Central site configuration.
 * Values marked PLACEHOLDER are replaced as soon as the owner supplies the
 * real data (via .env.local or, for content, the admin panel).
 */

export const SITE = {
  name: "Study with Smriti",
  tagline: "अब कर लो तैयारी जीत की",
  taglineEn: "Now get ready to win",
  description:
    "Study with Smriti runs online live classes for Classes 8, 9 and 10 government school students, covering Maths, Science, English, Hindi, Computer, SST and more.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  /** PLACEHOLDER: set NEXT_PUBLIC_GOOGLE_PLAY_URL in .env.local */
  playUrl: process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL || "",
  /** Verified from supplied project documents (school acceptance letters) */
  email: "studywithsmritioffice1@gmail.com",
  phones: ["9905917516", "6200398012"],
  address:
    "3rd Floor, Rohini Complex, Opposite Hotel Apsara, Circular Road, Lalpur, Bokaro",
  languages: ["en", "hi"],
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "App Features" },
  { href: "/resources", label: "Learning Resources" },
  { href: "/blog", label: "Blog" },
  { href: "/announcements", label: "Updates" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_LINKS = {
  explore: [
    { href: "/about", label: "About" },
    { href: "/features", label: "App Features" },
    { href: "/resources", label: "Learning Resources" },
    { href: "/blog", label: "Blog" },
  ],
  support: [
    { href: "/announcements", label: "Announcements" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact & Support" },
  ],
  legal: [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-and-conditions", label: "Terms & Conditions" },
    { href: "/copyright", label: "Copyright" },
    { href: "/children-privacy", label: "Children's Privacy" },
  ],
} as const;
