/**
 * Single source of truth — every fact below comes from the CV.
 * Do not add companies, dates, metrics or links that aren't verified.
 */

export const PROFILE = {
  name: 'NISARG PANCHAL',
  role: 'FRONTEND DEVELOPER',
  email: 'nisargpanchal2006@gmail.com',
  phone: '+91 8141356802',
  phoneDisplay: '+91 81413 56802',
  github: 'https://github.com/Nisarg226',
  githubUser: 'Nisarg226'
}

export const TECH = ['HTML', 'CSS', 'JAVASCRIPT', 'REACT']

export const MARQUEE_ITEMS = [
  'FRONTEND DEVELOPMENT',
  'CREATIVE DEVELOPMENT',
  'UI / UX',
  'REACT',
  'JAVASCRIPT',
  'INTERACTIVE EXPERIENCES'
]

export const ROUTES = [
  { label: 'HOME', to: '/' },
  { label: 'WORK', to: '/work' },
  { label: 'ABOUT', to: '/about' },
  { label: 'EXPERIENCE', to: '/experience' },
  { label: 'CERTIFICATIONS', to: '/certifications' },
  { label: 'CONTACT', to: '/contact' }
]

export const PROJECTS = [
  {
    id: 'maa-furniture',
    slug: 'maa-furniture',
    index: '01',
    title: 'MAA FURNITURE',
    initials: 'MF',
    tech: ['HTML', 'CSS', 'JAVASCRIPT'],
    variant: 'furniture',
    summary:
      'Responsive furniture website showcasing products and services with an intuitive interface and enhanced user experience.',
    caseSections: [
      {
        label: 'Overview',
        body: "A responsive website for Maa Furniture, built to showcase the brand's products and services with an intuitive interface and an enhanced user experience."
      },
      {
        label: 'Technology',
        body: 'Built with HTML, CSS and JavaScript — no frameworks, just the fundamentals used carefully.'
      },
      {
        label: 'Interface',
        body: 'Products and services are presented through a clear, intuitive UI, tuned so that browsing feels smooth and purposeful.'
      },
      {
        label: 'Responsive Design',
        body: 'The layout is responsive by design, holding its composition and readability across screen sizes.'
      }
    ]
  },
  {
    id: 'web-website',
    slug: 'web-website',
    index: '02',
    title: 'WEB WEBSITE',
    initials: 'WW',
    tech: ['HTML', 'CSS', 'JAVASCRIPT'],
    variant: 'web',
    summary: 'Modern responsive website with a clean UI and smooth user experience.',
    caseSections: [
      {
        label: 'Overview',
        body: 'A modern responsive website with a clean UI and a smooth user experience throughout.'
      },
      {
        label: 'Technology',
        body: 'Built with HTML, CSS and JavaScript — no frameworks, just the fundamentals used carefully.'
      },
      {
        label: 'Interface',
        body: 'A clean, modern interface kept deliberately simple so the experience stays smooth and focused.'
      },
      {
        label: 'Responsive Design',
        body: 'The layout is responsive by design, holding its composition and readability across screen sizes.'
      }
    ]
  }
]

export const EXPERIENCE = [
  {
    company: 'TechGlobe Solutions',
    duration: '1.5 Month Internship',
    focus: 'HTML',
    points: [
      'Assisted in developing responsive UI components using HTML.',
      'Worked on improving website performance and accessibility.',
      'Collaborated with a team to fix bugs and optimize code.'
    ]
  },
  {
    company: '5D WEB Infotech',
    duration: '1 Month Internship',
    focus: 'CSS · JavaScript',
    points: [
      'Developed reusable components using HTML, CSS and JavaScript.',
      'Implemented responsive designs for cross-device compatibility.',
      'Gained experience working with APIs and fetching data dynamically.'
    ]
  },
  {
    company: 'Sahajanand Digital',
    duration: '1 Month Internship',
    focus: 'React.js',
    points: [
      'Contributed to a real-world frontend project using React.js.',
      'Worked with Git and GitHub.',
      'Learned coding best practices.',
      'Improved debugging skills.'
    ]
  }
]

/** Skill constellation — node positions are percentages of the field. */
export const SKILL_NODES = [
  { id: 'figma', label: 'Figma', x: 10, y: 22 },
  { id: 'html', label: 'HTML', x: 22, y: 38 },
  { id: 'css', label: 'CSS', x: 36, y: 20 },
  { id: 'js', label: 'JavaScript', x: 48, y: 42 },
  { id: 'react', label: 'React.js', x: 66, y: 26 },
  { id: 'api', label: 'APIs', x: 60, y: 58 },
  { id: 'git', label: 'Git / GitHub', x: 84, y: 42 },
  { id: 'responsive', label: 'Responsive Design', x: 40, y: 66 },
  { id: 'debug', label: 'Debugging', x: 24, y: 70 },
  { id: 'a11y', label: 'Accessibility', x: 10, y: 58 }
]

export const SKILL_EDGES = [
  ['figma', 'html'],
  ['figma', 'css'],
  ['html', 'css'],
  ['html', 'a11y'],
  ['css', 'responsive'],
  ['css', 'js'],
  ['js', 'react'],
  ['js', 'api'],
  ['js', 'debug'],
  ['react', 'api'],
  ['react', 'git'],
  ['react', 'responsive'],
  ['react', 'debug'],
  ['responsive', 'a11y']
]

/** Capabilities groups (per CV skills + strengths — no levels, no percentages). */
export const CAPABILITIES = [
  {
    id: 'frontend',
    label: 'Frontend',
    items: ['HTML', 'CSS', 'JavaScript', 'React.js']
  },
  {
    id: 'design',
    label: 'Design',
    items: ['Figma']
  },
  {
    id: 'workflow',
    label: 'Workflow',
    items: ['Git', 'GitHub', 'Debugging', 'Teamwork', 'Project Management']
  },
  {
    id: 'web',
    label: 'Web',
    items: ['Responsive Design', 'APIs', 'Accessibility', 'Performance']
  }
]

/** Strengths supported by the CV profile — used on the About page. */
export const APPROACH = [
  'Responsive UI',
  'User Experience',
  'Problem Solving',
  'Debugging',
  'Performance',
  'Accessibility',
  'APIs',
  'Git / GitHub',
  'Teamwork'
]

export const CERTIFICATIONS = [
  {
    index: '01',
    title: "AWS APAC's Solutions Architecture",
    issuer: 'AWS — FORAGE'
  },
  {
    index: '02',
    title: 'Introduction to Artificial Intelligence (AI)',
    issuer: 'MONARK UNIVERSITY'
  }
]

export const EDUCATION = [
  {
    period: '2011 — 2021',
    school: 'Samanya Vidhayalay Higher Sec',
    detail: '10th / SSC — 60%'
  },
  {
    period: '2022 — 2023',
    school: 'Monark University',
    detail: 'Diploma in Information Technology'
  }
]

export const LANGUAGES = [
  { native: 'ગુજરાતી', name: 'Gujarati' },
  { native: 'हिन्दी', name: 'Hindi' },
  { native: 'English', name: 'English' }
]

export const AVAILABILITY = ['FRONTEND DEVELOPMENT', 'WEB DESIGN', 'CREATIVE WEB EXPERIENCES']
