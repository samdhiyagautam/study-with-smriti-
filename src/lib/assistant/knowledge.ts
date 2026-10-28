/**
 * Assistant knowledge base — curated strictly from verified project facts
 * (project documents + site constants). Topics may link to real pages only.
 * Anything unverified (fees, fixed schedules, student numbers) must answer
 * honestly that it is not published and point to the contact channels.
 */

export interface AssistantSource {
  label: string;
  href: string;
}

export interface AssistantTopic {
  id: string;
  /** English + Hindi + Hinglish keywords, matched against the question text. */
  keywords: string[];
  title: string;
  answer: string;
  sources?: AssistantSource[];
}

export const ASSISTANT_TOPICS: AssistantTopic[] = [
  {
    id: "about",
    keywords: ["what is", "kya hai", "kya h", "about", "study with smriti", "app ke bare", "app ke baare", "introduction", "parichay", "who are you", "kaun ho"],
    title: "About Study with Smriti",
    answer:
      "Study with Smriti runs online live classes for Classes 8, 9 and 10 government school students, along with study materials in the Learning Resources library. Content is designed to follow your school syllabus, and support is available in Hindi and English.",
    sources: [
      { label: "About page", href: "/about" },
      { label: "App features", href: "/features" },
    ],
  },
  {
    id: "classes",
    keywords: ["class", "classes", "8", "9", "10", "class 8", "nauvi", "aathvi", "dasvi", "8th", "9th", "10th", "konse class", "kaun si class", "ke liye"],
    title: "Which classes are covered",
    answer:
      "Live classes are for Classes 8, 9 and 10. The exact batch and timing for your school is shared through the app and the Updates page.",
    sources: [{ label: "See all details", href: "/about" }],
  },
  {
    id: "subjects",
    keywords: ["subject", "subjects", "kya padhate", "kya padhaya", "maths", "science", "english", "hindi", "computer", "sst", "vishay", "foreign language", "kaun se vishay"],
    title: "Subjects taught",
    answer:
      "Subjects include Maths, Science, English, Hindi, Computer, Social Science (SST) and one foreign language — designed to follow your school syllabus.",
    sources: [{ label: "All features", href: "/features" }],
  },
  {
    id: "download",
    keywords: ["download", "install", "play store", "google play", "app kaise", "app download", "kaha milega", "kahan milega", "link", "playstore", "install kaise"],
    title: "Downloading the app",
    answer:
      "The app runs on Android phones and is downloaded from Google Play. The Play Store link is being finalized — the moment it is live it will appear at the top of the home page and on the About page. Please check back shortly, or contact the team meanwhile.",
    sources: [
      { label: "Home page", href: "/" },
      { label: "Contact & support", href: "/contact" },
    ],
  },
  {
    id: "how-to-join",
    keywords: ["kaise join", "how to join", "join kaise", "shuru kaise", "start kaise", "how it works", "kaise kaam", "process", "onboarding", "kaise lagu"],
    title: "How to start learning",
    answer:
      "Three simple steps: (1) get the Study with Smriti app from Google Play, (2) join your scheduled online live classes for your class and subject, and (3) revise with notes and worksheets from the Learning Resources library on this site.",
    sources: [
      { label: "How it works", href: "/#how-heading" },
      { label: "Learning resources", href: "/resources" },
    ],
  },
  {
    id: "resources",
    keywords: ["resource", "resources", "notes", "worksheet", "material", "padhai material", "study material", "pdf", "kahan hai", "kaha hai", "library", "practice", "revision"],
    title: "Study materials & notes",
    answer:
      "Notes, worksheets and practice material live in the Learning Resources library. You can filter by class and subject, and open any published item as a page on this site.",
    sources: [{ label: "Open resource library", href: "/resources" }],
  },
  {
    id: "blog",
    keywords: ["blog", "article", "articles", "tips", "study tips", "advice", "guides", "lekhan", "post"],
    title: "Study tips & articles",
    answer:
      "The blog publishes study advice and articles — exam preparation tips, study habits and programme updates.",
    sources: [{ label: "Read the blog", href: "/blog" }],
  },
  {
    id: "announcements",
    keywords: ["announcement", "update", "news", "notification", "ghoshna", "new update", "latest", "notice"],
    title: "Announcements & updates",
    answer:
      "New announcements about classes, materials and the programme are published on the Updates page — check there for the latest news.",
    sources: [{ label: "See updates", href: "/announcements" }],
  },
  {
    id: "contact",
    keywords: ["contact", "email", "phone", "number", "call", "message", "support", "baat", "sampark", "help", "madad", "shikayat", "problem"],
    title: "Contacting the team",
    answer:
      "You can message the team from the contact page (we reply by email), call +91 9905917516 or +91 6200398012, or email studywithsmritioffice1@gmail.com.",
    sources: [{ label: "Contact & support", href: "/contact" }],
  },
  {
    id: "office",
    keywords: ["office", "centre", "address", "visit", "kaha par", "kahan par", "map", "location", "direc", "bokaro", "lalpur", "milne", "khidki"],
    title: "Offline centre & address",
    answer:
      "You can meet the team in person at the office: 3rd Floor, Rohini Complex, Opposite Hotel Apsara, Circular Road, Lalpur. The contact page has a map and a Get Directions button — please call ahead to fix a visit time.",
    sources: [{ label: "Open map & address", href: "/contact" }],
  },
  {
    id: "fees",
    keywords: ["fees", "fee", "paise", "price", "cost", "charge", "kitna", "free", "paiement", "payment", "kitne paise"],
    title: "Fees & charges",
    answer:
      "Fee details are not published on this website. Please contact the team directly and they will explain everything for your class.",
    sources: [{ label: "Contact & support", href: "/contact" }],
  },
  {
    id: "timings",
    keywords: ["time", "timing", "schedule", "kab", "kis time", "when", "slot", "kab se", "kab tak"],
    title: "Class schedule & timings",
    answer:
      "The exact class schedule is not published on this site. Announcements and the app carry current schedules — or ask the team directly.",
    sources: [
      { label: "Check announcements", href: "/announcements" },
      { label: "Contact & support", href: "/contact" },
    ],
  },
  {
    id: "support-trouble",
    keywords: ["not working", "trouble", "error", "bug", "problem", "dikkat", "crash", "login nahi", "open nahi", "nahi khul", "issue", "galti"],
    title: "Something not working",
    answer:
      "First check the FAQ — common app and download questions are answered there. If it still does not work, send a message from the contact page describing the problem and the team will help.",
    sources: [
      { label: "FAQ", href: "/faq" },
      { label: "Send a message", href: "/contact" },
    ],
  },
  {
    id: "privacy",
    keywords: ["privacy", "data", "safe", "surakshit", "children", "personal", "information", "security", "hack"],
    title: "Privacy & safety",
    answer:
      "Student privacy is taken seriously — the site has a Privacy Policy and a dedicated Children's Privacy policy explaining what data is handled and why.",
    sources: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Children's privacy", href: "/children-privacy" },
    ],
  },
  {
    id: "language",
    keywords: ["hindi", "language", "bhasha", "english", "medium", "kis bhasha", "hinglish"],
    title: "Languages",
    answer:
      "Classes and materials are made for government school students in Bokaro — content is provided in Hindi and English.",
    sources: [{ label: "About page", href: "/about" }],
  },
];

export const ASSISTANT_FALLBACK = {
  title: "I don't have a verified answer for that.",
  answer:
    "I only answer questions about the Study with Smriti app, classes and materials — and I never guess. For anything else, message the team directly and they will reply by email.",
};
