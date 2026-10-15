import type {
  Announcement,
  Faq,
  PageDoc,
  Post,
  Resource,
  SiteSettings,
} from "./types";

/**
 * Local fallback content used until Supabase is connected.
 * Facts marked as verified come from the supplied project documents
 * (school acceptance letters, Sept 2025). Everything marked
 * "[PLACEHOLDER]" must be confirmed or replaced by the owner.
 * Nothing here invents ratings, student counts, testimonials or results.
 */

export const FALLBACK_SETTINGS: SiteSettings = {
  siteName: "Study with Smriti",
  tagline: "अब कर लो तैयारी जीत की",
  googlePlayUrl: "", // set via NEXT_PUBLIC_GOOGLE_PLAY_URL or admin settings
  contactEmail: "studywithsmritioffice1@gmail.com",
  contactPhones: ["9905917516", "6200398012"],
  contactAddress:
    "3rd Floor, Rohini Complex, Opposite Hotel Apsara, Circular Road, Lalpur, Bokaro",
  socialLinks: { facebook: "", instagram: "", youtube: "", telegram: "" },
  analyticsEnabled: false,
};

export const FALLBACK_POSTS: Post[] = [
  {
    slug: "how-to-prepare-for-class-10-board-exams",
    title: "[Placeholder] How to prepare for Class 10 board exams",
    excerpt:
      "[PLACEHOLDER — owner review] A simple week-by-week revision plan for Class 10 students. Replace this sample draft with a real article.",
    content:
      '<h2>Start with a timetable</h2><p>[PLACEHOLDER] This sample article exists so the blog layout can be reviewed. Replace it with genuine study advice written by your team.</p><ul><li>Divide topics across weeks</li><li>Revise with notes and practice questions</li><li>Keep one day per week for mock tests</li></ul>',
    featuredImageUrl: null,
    featuredImageAlt: null,
    category: { name: "Study Tips", slug: "study-tips" },
    tags: [{ name: "Class 10", slug: "class-10" }, { name: "Exam Preparation", slug: "exam-preparation" }],
    publishedAt: "2026-01-10T09:00:00.000Z",
    authorName: "Study with Smriti Team",
    seoTitle: "Class 10 board exam preparation plan",
    seoDescription:
      "[PLACEHOLDER] A week-by-week Class 10 board exam preparation plan.",
    viewCount: 0,
  },
  {
    slug: "study-habits-that-actually-work",
    title: "[Placeholder] Study habits that actually work",
    excerpt:
      "[PLACEHOLDER — owner review] Small daily habits that make studying easier for Classes 8, 9 and 10 students.",
    content:
      '<h2>Short, focused sessions</h2><p>[PLACEHOLDER] Sample content for layout review. Replace with your own verified study guidance.</p><ol><li>Study in 25–30 minute blocks</li><li>Write summaries in your own words</li><li>Sleep well before a test</li></ol>',
    featuredImageUrl: null,
    featuredImageAlt: null,
    category: { name: "Study Tips", slug: "study-tips" },
    tags: [{ name: "Class 8", slug: "class-8" }, { name: "Class 9", slug: "class-9" }],
    publishedAt: "2026-01-05T09:00:00.000Z",
    authorName: "Study with Smriti Team",
    seoTitle: "Effective study habits for school students",
    seoDescription: "[PLACEHOLDER] Daily study habits for middle and high school students.",
    viewCount: 0,
  },
  {
    slug: "app-update-sample",
    title: "[Placeholder] App update notes",
    excerpt:
      "[PLACEHOLDER — owner review] Use the blog to announce new app versions and what changed.",
    content:
      '<h2>What is new</h2><p>[PLACEHOLDER] Replace this sample post with real, verified release notes from your Android app.</p>',
    featuredImageUrl: null,
    featuredImageAlt: null,
    category: { name: "App Updates", slug: "app-updates" },
    tags: [{ name: "Class 8", slug: "class-8" }],
    publishedAt: "2025-12-28T09:00:00.000Z",
    authorName: "Study with Smriti Team",
    seoTitle: "Study with Smriti app updates",
    seoDescription: "[PLACEHOLDER] Release notes for the Study with Smriti Android app.",
    viewCount: 0,
  },
];

export const FALLBACK_RESOURCES: Resource[] = [
  {
    slug: "class-10-maths-notes-sample",
    title: "[Placeholder] Class 10 Maths — chapter notes",
    description:
      "[PLACEHOLDER — owner review] Sample resource card. Upload real, syllabus-aligned notes as PDF from the admin panel.",
    content:
      "<p>[PLACEHOLDER] This sample resource exists to demonstrate the library layout, filters and detail page.</p>",
    category: { name: "Notes & Study Guides", slug: "notes-study-guides" },
    subject: "Maths",
    classLevel: "10",
    fileType: "none",
    fileUrl: null,
    publishedAt: "2026-01-08T09:00:00.000Z",
    viewCount: 0,
    seoTitle: "Class 10 Maths notes",
    seoDescription: "[PLACEHOLDER] Class 10 Maths chapter notes.",
  },
  {
    slug: "class-9-science-practice-questions-sample",
    title: "[Placeholder] Class 9 Science — practice questions",
    description:
      "[PLACEHOLDER — owner review] Sample practice-question set for the resource library.",
    content: "<p>[PLACEHOLDER] Replace with genuine practice questions and an answer key.</p>",
    category: { name: "Practice Questions", slug: "practice-questions" },
    subject: "Science",
    classLevel: "9",
    fileType: "none",
    fileUrl: null,
    publishedAt: "2026-01-03T09:00:00.000Z",
    viewCount: 0,
    seoTitle: "Class 9 Science practice questions",
    seoDescription: "[PLACEHOLDER] Class 9 Science practice questions.",
  },
  {
    slug: "class-8-sst-worksheet-sample",
    title: "[Placeholder] Class 8 SST — printable worksheet",
    description: "[PLACEHOLDER — owner review] Sample worksheet resource card.",
    content: "<p>[PLACEHOLDER] Replace with a verified worksheet PDF.</p>",
    category: { name: "Worksheets", slug: "worksheets" },
    subject: "SST",
    classLevel: "8",
    fileType: "none",
    fileUrl: null,
    publishedAt: "2025-12-30T09:00:00.000Z",
    viewCount: 0,
    seoTitle: "Class 8 SST worksheet",
    seoDescription: "[PLACEHOLDER] Printable Class 8 SST worksheet.",
  },
  {
    slug: "exam-revision-checklist-sample",
    title: "[Placeholder] Exam revision checklist",
    description: "[PLACEHOLDER — owner review] A generic revision checklist for exam season.",
    content: "<p>[PLACEHOLDER] Replace with your own revision checklist.</p>",
    category: { name: "Exam Preparation", slug: "exam-preparation" },
    subject: null,
    classLevel: "8-10",
    fileType: "none",
    fileUrl: null,
    publishedAt: "2025-12-20T09:00:00.000Z",
    viewCount: 0,
    seoTitle: "Exam revision checklist",
    seoDescription: "[PLACEHOLDER] Exam revision checklist for Classes 8–10.",
  },
];

export const FALLBACK_FAQS: Faq[] = [
  {
    id: "f1",
    question: "What is Study with Smriti?",
    answer:
      "Study with Smriti is an Android educational app that runs online live classes for Classes 8, 9 and 10 students, with content designed to follow the school syllabus. (Verified from project documents; owner to confirm wording.)",
    category: "About the app",
    sortOrder: 10,
  },
  {
    id: "f2",
    question: "Which classes and subjects are covered?",
    answer:
      "Classes 8, 9 and 10. Subjects include Maths, Science, English, Hindi, Computer, SST and one foreign language, and may vary by school. (Verified from project documents.)",
    category: "Classes",
    sortOrder: 20,
  },
  {
    id: "f3",
    question: "How do I download the app?",
    answer:
      "[PLACEHOLDER] The app is available on Google Play — add the exact listing link in Admin → Settings once it is confirmed.",
    category: "Download",
    sortOrder: 30,
  },
  {
    id: "f4",
    question: "Are the classes free?",
    answer: "[PLACEHOLDER — owner review] Confirm the current fee structure (if any) before publishing.",
    category: "Classes",
    sortOrder: 40,
  },
  {
    id: "f5",
    question: "How do I get support or report a problem?",
    answer:
      "Use the Contact page, email studywithsmritioffice1@gmail.com, or call 9905917516 / 6200398012.",
    category: "Support",
    sortOrder: 50,
  },
];

export const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "[Placeholder] Welcome to the Study with Smriti website",
    body: "This announcement area will show real app updates and notices published from the admin panel. Replace this placeholder with your first verified update.",
    type: "app_update",
    publishedAt: "2026-01-12T09:00:00.000Z",
    expiresAt: null,
  },
];

const homeSectionsHtml = {
  about:
    "<p>Study with Smriti runs online live classes for Classes 8, 9 and 10 students of government schools in Bokaro district, addressing the unavailability of subject teachers. Classes cover Maths, Science, English, Hindi, Computer, one foreign language and SST, and are designed to follow each school's syllabus.</p><p><em>Source: formal school acceptance letters dated September 2025 supplied with this project. <span>[PLACEHOLDER — owner to review this wording]</span></em></p>",
};

export const FALLBACK_PAGES: PageDoc[] = [
  {
    slug: "about",
    title: "About Study with Smriti",
    description:
      "Our mission, the students we serve and how online live classes work for Classes 8, 9 and 10.",
    content: homeSectionsHtml.about,
    seoTitle: "About Study with Smriti",
    seoDescription:
      "Study with Smriti runs syllabus-aligned online live classes for Classes 8, 9 and 10 government school students.",
  },
  {
    slug: "features",
    title: "App features",
    description:
      "What the Study with Smriti Android app offers for Classes 8, 9 and 10 learners.",
    content:
      "<h2>Online live classes</h2><p>Attend scheduled live classes for Classes 8, 9 and 10 taught in Hindi and English. <span>[PLACEHOLDER — confirm the exact in-app feature list and screenshots with the owner.]</span></p><h2>Subjects covered</h2><ul><li>Maths</li><li>Science</li><li>English</li><li>Hindi</li><li>Computer</li><li>SST (Social Science)</li><li>One foreign language</li></ul><h2>Syllabus-aligned content</h2><p>Content is designed to follow the school syllabus. <span>[PLACEHOLDER]</span></p>",
    seoTitle: "Study with Smriti app features",
    seoDescription:
      "Live classes, syllabus-aligned content and study materials for Classes 8, 9 and 10 in the Study with Smriti Android app.",
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: "How this website and the app handle your information.",
    content:
      "<p><strong>[PLACEHOLDER — this text is not legal advice and must be reviewed by the owner before publication.]</strong></p><h2>Information we collect</h2><p>This website collects only the details you voluntarily submit through the contact form (name, email, subject and message). Submitted messages are stored securely and used only to respond to you.</p><h2>Analytics</h2><p>[PLACEHOLDER] Describe any analytics you enable in Admin → Settings.</p><h2>Contact</h2><p>Questions: studywithsmritioffice1@gmail.com</p>",
    seoTitle: "Privacy Policy — Study with Smriti",
    seoDescription: "[PLACEHOLDER] Privacy policy for the Study with Smriti website.",
  },
  {
    slug: "terms-and-conditions",
    title: "Terms and Conditions",
    description: "Terms of use for this website.",
    content:
      "<p><strong>[PLACEHOLDER — not legal advice; owner review required before publication.]</strong></p><h2>Use of this website</h2><p>Content is provided for educational information. Do not misuse the site or attempt to disrupt its operation.</p><h2>Educational content</h2><p>[PLACEHOLDER] Describe the status of study materials, classes and any app terms here.</p>",
    seoTitle: "Terms and Conditions — Study with Smriti",
    seoDescription: "[PLACEHOLDER] Terms and conditions for the Study with Smriti website.",
  },
  {
    slug: "copyright",
    title: "Copyright and content ownership",
    description: "Ownership of website and educational content.",
    content:
      "<p><strong>[PLACEHOLDER — owner review required.]</strong></p><p>Unless stated otherwise, all content on this website and in the Study with Smriti app belongs to Study with Smriti. Reproduction without permission is not permitted.</p>",
    seoTitle: "Copyright — Study with Smriti",
    seoDescription: "[PLACEHOLDER] Copyright and content ownership information.",
  },
  {
    slug: "children-privacy",
    title: "Children's privacy information",
    description: "Privacy information for parents, guardians and students under 18.",
    content:
      "<p><strong>[PLACEHOLDER — this text is not legal advice and must be reviewed before publication.]</strong></p><p>Our classes are intended for school students, including children under 18. We do not knowingly collect personal data from children through this website. Parents or guardians with questions about a student's data may contact studywithsmritioffice1@gmail.com.</p>",
    seoTitle: "Children's privacy — Study with Smriti",
    seoDescription: "[PLACEHOLDER] Children's privacy information for students and parents.",
  },
];
