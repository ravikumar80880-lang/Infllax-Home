// ═══════════════════════════════════════════════
// INFLLAX — Site Constants & Data
// File: src/lib/constants.ts
// ═══════════════════════════════════════════════

// ── NAV LINKS ──
export const NAV_LINKS = [
  { label: 'What We Do',   href: '#services'  },
  { label: 'Who We Serve', href: '#audience'  },
  { label: 'Why Infllax',  href: '#why'       },
  { label: 'How It Works', href: '#how'       },
  { label: 'Contact',      href: '#contact'   },
] as const

// ── TICKER ITEMS ──
export const TICKER_ITEMS = [
  'Theater Advertising Network',
  'OTT Streaming Platform',
  'Film Distribution',
  'Creator Monetization',
  'Digital Cinema Management',
  'Content Distribution',
  'Pan-India Reach',
  'Regional Language Content',
  'Investor-First Model',
  'Anti-Piracy Infrastructure',
] as const

// ── TRUST NUMBERS ──
export const TRUST_STATS = [
  {
    value:    5000,
    suffix:   '+',
    label:    'Theaters in our\nnational network',
    color:    '#ff6b1a',
    animated: true,
  },
  {
    value:    8,
    suffix:   '',
    label:    'Revenue tiers for\nevery creator level',
    color:    '#00c2a8',
    animated: true,
  },
  {
    display:  '4',
    label:    'Business verticals\nunder one roof',
    color:    '#a78bfa',
    animated: false,
  },
  {
    display:  'Pan-India',
    label:    'Distribution — national\nand regional coverage',
    color:    '#4ade80',
    animated: false,
  },
] as const

// ── SERVICES ──
export const SERVICES = [
  {
    id:      '01',
    tag:     'Advertising',
    icon:    '🎬',
    title:   'Digital Cinema Advertising Network',
    desc:    'Run targeted ad campaigns across thousands of theater screens — from local brands to national advertisers. Our centralized platform gives you real-time scheduling, proof-of-play reporting, and transparent revenue sharing with theater owners. No middlemen. Full control.',
    tags:    ['Campaign Dashboard', 'Real-Time Reports', 'Theater Network', 'CPM / CPC Billing', 'Local + National'],
    color:   '#ff6b1a',
    href:    '#contact',
  },
  {
    id:      '02',
    tag:     'Streaming',
    icon:    '▶️',
    title:   'OTT Streaming Platform',
    desc:    'A full-featured streaming platform with subscription, ad-supported, and pay-per-view models. Built for regional India alongside metro audiences — with dedicated sections for Bhojpuri, Marathi, Haryanvi, Bengali, Tamil, Telugu, and more. AI-powered recommendations. Anti-piracy protection at every layer.',
    tags:    ['Subscription Plans', 'Pay-Per-View', 'Regional Content', 'AI Recommendations', 'Anti-Piracy DRM'],
    color:   '#00c2a8',
    href:    '#contact',
  },
  {
    id:      '03',
    tag:     'Distribution',
    icon:    '🗺️',
    title:   'National Content Distribution',
    desc:    'End-to-end pan-India distribution for films, web series, TV content, and short-form video. Whether you are a production house, independent filmmaker, or regional studio — Infllax gives your content access to a national network of theaters and digital platforms.',
    tags:    ['Film Distribution', 'Pan-India Network', 'Regional Studios', 'TV Channels', 'Web Series'],
    color:   '#a78bfa',
    href:    '#contact',
  },
  {
    id:      '04',
    tag:     'Creator Platform',
    icon:    '🎙️',
    title:   'Creator & Studio Monetization',
    desc:    'Upload your content, track your earnings in real time, and get paid — transparently and on time. Infllax supports creators at every level — from first-time filmmakers in district towns to established production houses. You keep control of your content. We handle the monetization.',
    tags:    ['Creator Dashboard', 'Earnings Tracking', 'Automated Payouts', 'Content Ownership', 'Analytics'],
    color:   '#4ade80',
    href:    '#contact',
  },
] as const

// ── AUDIENCE ──
export const AUDIENCE_CARDS = [
  {
    emoji:  '📢',
    tag:    'For Advertisers & Brands',
    title:  'Reach Audiences Where They Actually Watch',
    desc:   'Whether you are a local business or a national brand — Infllax gives you one dashboard to run campaigns across thousands of theater screens and a growing OTT audience base, with full measurement and transparent billing.',
    color:  '#ff6b1a',
    points: [
      'Centralized campaign management across all screens',
      'Precise geographic targeting — city, state, or national',
      'Real-time impression tracking and proof of play',
      'Flexible budgets — daily caps, total caps, CPC or CPM',
      'No agency required — direct self-serve access',
    ],
  },
  {
    emoji:  '📈',
    tag:    'For Investors & Producers',
    title:  'Capital Protection Before Profit Sharing',
    desc:   'Infllax\'s investor framework ensures that capital invested in original content is prioritized for recovery before any profit sharing begins. Full transparency on every rupee — tracked to the platform level.',
    color:  '#00c2a8',
    points: [
      'Structured capital recovery — investment protected first',
      'Transparent earnings reports — real-time access',
      'Lifetime profit share after full recovery',
      'Content backed by pan-India distribution network',
      'Legal-grade documentation and audit trail',
    ],
  },
  {
    emoji:  '🎨',
    tag:    'For Creators & Studios',
    title:  'Your Content. Your Rights. Our Platform.',
    desc:   'Infllax is not a rights-buying platform. You retain ownership of your content. We provide the infrastructure — streaming, distribution, monetization, and a direct-to-audience connection — from the smallest creator to the biggest studio.',
    color:  '#a78bfa',
    points: [
      'Full content ownership — you decide what stays and goes',
      'Earn from subscriptions, ads, and pay-per-view',
      'Dedicated creator dashboard with live analytics',
      'Automated monthly payouts — direct to bank',
      'Regional language support — district to national scale',
    ],
  },
] as const

// ── WHY INFLLAX ──
export const WHY_POINTS = [
  {
    icon:  '🔍',
    title: 'Full Transparency',
    desc:  'Every rupee earned on the platform is tracked, logged, and reported. Advertisers see impressions. Creators see earnings. Investors see recovery status. No guesswork. No delays.',
  },
  {
    icon:  '🏗️',
    title: 'Distribution First',
    desc:  'We built the network before the content — theater relationships, digital infrastructure, CDN delivery, and pan-India sales teams. Your content lands in a ready market.',
  },
  {
    icon:  '🇮🇳',
    title: 'Regional India Champion',
    desc:  'Dedicated infrastructure for Bhojpuri, Haryanvi, Marathi, Bengali, Chattisgarhi — serving a 25+ crore population market largely ignored by metro-first platforms.',
  },
  {
    icon:  '🔒',
    title: 'Enterprise-Grade Security',
    desc:  'Multi-layer anti-piracy — DRM encryption, dynamic watermarking, encrypted streams, and automated takedown systems. Your content is protected at every delivery point.',
  },
  {
    icon:  '⚙️',
    title: 'Technology-Driven Governance',
    desc:  'Rules are enforced at the system level — not manually. Payouts, scheduling, content delivery, and reporting are all automated. Human error removed from every critical process.',
  },
  {
    icon:  '📡',
    title: 'One Integrated Ecosystem',
    desc:  'Theater advertising, OTT streaming, film distribution, and creator monetization — all on one platform, under one dashboard. Your campaign runs everywhere simultaneously.',
  },
] as const

// ── HOW IT WORKS STEPS ──
export const HOW_STEPS = [
  {
    num:   '01',
    title: 'Register & Onboard',
    desc:  'Sign up as an advertiser, creator, theater owner, or investor. Our team verifies your profile and sets up your dedicated portal — usually within 48 hours.',
    color: '#ff6b1a',
    filled: true,
  },
  {
    num:   '02',
    title: 'Set Up Campaign or Content',
    desc:  'Upload your ad or content. Select your target geography, audience, and format. Set your budget or content tier. Everything is controlled from one dashboard.',
    color: '#ff6b1a',
    filled: false,
  },
  {
    num:   '03',
    title: 'Go Live — Pan India',
    desc:  'Your ad plays in theaters or your content streams to subscribers across India. Real-time delivery via our CDN network. Full proof-of-delivery reporting instantly.',
    color: '#00c2a8',
    filled: false,
  },
  {
    num:   '04',
    title: 'Track, Earn & Scale',
    desc:  'Watch your impressions, views, and earnings in real time. Payouts are processed automatically. Scale your campaign or content reach with one click.',
    color: '#00c2a8',
    filled: true,
  },
] as const

// ── TECH STACK ── (exactly from PDF)
export const TECH_STACK = [
  { label: 'Next.js',          role: 'Frontend Framework'    },
  { label: 'Tailwind CSS',     role: 'CSS Framework'         },
  { label: 'Node.js + Express',role: 'Core Backend API'      },
  { label: 'Java Spring Boot', role: 'Enterprise Engine'     },
  { label: 'Python',           role: 'AI / ML Layer'         },
  { label: 'MySQL',            role: 'Primary Database'      },
  { label: 'Cassandra',        role: 'Scale Database'        },
  { label: 'Amazon Neptune',   role: 'Graph DB'              },
  { label: 'Apache Kafka',     role: 'Event Streaming'       },
  { label: 'AWS EC2 + S3',     role: 'Cloud Infrastructure'  },
  { label: 'CloudFront CDN',   role: 'Content Delivery'      },
  { label: 'Docker + K8s',     role: 'DevOps / Auto-scaling' },
  { label: 'React Native',     role: 'Android + iOS App'     },
  { label: 'Electron.js',      role: 'Theater Client App'    },
  { label: 'Widevine DRM',     role: 'Content Security'      },
  { label: 'Razorpay',         role: 'India Payments'        },
  { label: 'Stripe',           role: 'Global Payments'       },
  { label: 'RxJS',             role: 'Real-time Streams'     },
  { label: 'JWT + RBAC',       role: 'Auth & Access Control' },
] as const

// ── CONTACT FORM OPTIONS ──
export const PARTNER_TYPES = [
  { value: 'advertiser', label: 'Advertiser / Brand'          },
  { value: 'creator',    label: 'Content Creator / Filmmaker' },
  { value: 'studio',     label: 'Production House / Studio'   },
  { value: 'theater',    label: 'Theater Owner'               },
  { value: 'investor',   label: 'Investor / Producer'         },
  { value: 'other',      label: 'Other'                       },
] as const

// ── FOOTER LINKS ──
export const FOOTER_LINKS = {
  platform: [
    { label: 'Theater Advertising', href: '#services' },
    { label: 'OTT Streaming',       href: '#services' },
    { label: 'Content Distribution',href: '#services' },
    { label: 'Creator Monetization',href: '#services' },
  ],
  company: [
    { label: 'About Infllax', href: '#' },
    { label: 'Our Team',      href: '#' },
    { label: 'Careers',       href: '#' },
    { label: 'Press & Media', href: '#' },
  ],
  partners: [
    { label: 'Advertise With Us', href: '#contact' },
    { label: 'List Your Theater', href: '#contact' },
    { label: 'Creator Signup',    href: '#contact' },
    { label: 'Investor Relations',href: '#contact' },
  ],
} as const
