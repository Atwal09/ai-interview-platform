export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
export const APP_NAME = 'InterviewAI'
export const APP_DOMAIN = 'workforme.space'

export const INTERVIEW_TYPES = [
  {
    id: 'hr',
    label: 'HR Interview',
    icon: 'FaUserTie',
    description: 'Behavioral and cultural fit questions',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'technical',
    label: 'Technical Interview',
    icon: 'FaCode',
    description: 'Coding, algorithms, and system design',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'behavioral',
    label: 'Behavioral Interview',
    icon: 'FaBrain',
    description: 'STAR method, soft skills assessment',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'domain',
    label: 'Domain Specific',
    icon: 'FaIndustry',
    description: 'Industry and role-specific questions',
    color: 'orange',
    gradient: 'from-orange-500 to-red-600',
  },
]

export const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy', color: 'emerald', description: 'Basic concepts & introductory questions' },
  { id: 'medium', label: 'Medium', color: 'yellow', description: 'Intermediate level challenges' },
  { id: 'hard', label: 'Hard', color: 'red', description: 'Advanced concepts & complex scenarios' },
]

export const DOMAINS = [
  'Software Engineering',
  'Data Science',
  'Machine Learning',
  'Product Management',
  'Marketing',
  'Finance',
  'Human Resources',
  'Sales',
  'Design (UX/UI)',
  'DevOps & Cloud',
  'Cybersecurity',
  'Business Analysis',
  'Project Management',
  'Consulting',
  'Healthcare IT',
]

export const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes', questions: 5 },
  { value: 20, label: '20 minutes', questions: 7 },
  { value: 30, label: '30 minutes', questions: 10 },
  { value: 45, label: '45 minutes', questions: 15 },
  { value: 60, label: '60 minutes', questions: 20 },
]

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Get started with AI interview practice',
    features: [
      '5 mock interviews/month',
      'Basic speech analysis',
      '1 resume analysis/month',
      'Limited question bank',
      'Email support',
    ],
    notIncluded: [
      'Advanced AI feedback',
      'Unlimited interviews',
      'Priority support',
    ],
    cta: 'Get Started Free',
    highlighted: false,
    color: 'slate',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    description: 'Everything you need to ace your interviews',
    features: [
      'Unlimited mock interviews',
      'Advanced speech analysis',
      'Unlimited resume analysis',
      'Full question bank (500+ Q)',
      'Real-time AI coaching',
      'Performance analytics',
      'Radar skill charts',
      'Priority email support',
    ],
    notIncluded: [
      'White-label solution',
      'Team management',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
    color: 'violet',
    badge: 'Most Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Team management',
      'Custom question sets',
      'Bulk user management',
      'Advanced analytics dashboard',
      'API access',
      'White-label option',
      'Dedicated account manager',
      '24/7 phone support',
      'SLA guarantee',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    highlighted: false,
    color: 'cyan',
  },
]

export const SKILL_DIMENSIONS = [
  'Communication',
  'Confidence',
  'Technical Skills',
  'Problem Solving',
  'Leadership',
  'Adaptability',
]

export const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    role: 'Software Engineer at Google',
    content: 'InterviewAI helped me practice 50+ mock interviews. The AI feedback on my speech patterns was incredibly insightful. I landed my dream job at Google!',
    rating: 5,
    gradient: 'from-violet-500 to-cyan-500',
    initials: 'SJ',
  },
  {
    name: 'Michael Chen',
    role: 'Product Manager at Meta',
    content: 'The resume ATS analyzer identified exactly what was wrong with my resume. After implementing the suggestions, my interview callback rate tripled.',
    rating: 5,
    gradient: 'from-emerald-500 to-cyan-500',
    initials: 'MC',
  },
  {
    name: 'Priya Sharma',
    role: 'Data Scientist at Amazon',
    content: 'The behavioral interview module with STAR framework guidance was game-changing. The real-time filler word detection made me so much more articulate.',
    rating: 5,
    gradient: 'from-orange-500 to-violet-500',
    initials: 'PS',
  },
]

export const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Mock Interviews',
    description: 'Practice with our AI interviewer that adapts questions based on your responses and industry.',
    gradient: 'from-violet-500/10 to-violet-500/5',
    iconBg: 'bg-violet-500/20',
  },
  {
    icon: '🎙️',
    title: 'Speech Analysis',
    description: 'Real-time analysis of pace, clarity, filler words, confidence, and emotional tone.',
    gradient: 'from-cyan-500/10 to-cyan-500/5',
    iconBg: 'bg-cyan-500/20',
  },
  {
    icon: '📄',
    title: 'Resume ATS Checker',
    description: 'Optimize your resume for ATS systems with keyword analysis and formatting suggestions.',
    gradient: 'from-emerald-500/10 to-emerald-500/5',
    iconBg: 'bg-emerald-500/20',
  },
  {
    icon: '⚡',
    title: 'Real-time Feedback',
    description: 'Get instant AI feedback after each answer with specific improvement suggestions.',
    gradient: 'from-yellow-500/10 to-yellow-500/5',
    iconBg: 'bg-yellow-500/20',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    description: 'Track your improvement over time with detailed analytics and performance charts.',
    gradient: 'from-blue-500/10 to-blue-500/5',
    iconBg: 'bg-blue-500/20',
  },
  {
    icon: '🗺️',
    title: 'Career Roadmap',
    description: 'Get personalized career guidance and skill gap analysis for your target role.',
    gradient: 'from-pink-500/10 to-pink-500/5',
    iconBg: 'bg-pink-500/20',
  },
]

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Create Your Profile',
    description: 'Sign up and tell us your target role, industry, and experience level.',
    icon: '👤',
  },
  {
    step: 2,
    title: 'Upload Your Resume',
    description: 'Get ATS analysis and tailored interview questions based on your background.',
    icon: '📄',
  },
  {
    step: 3,
    title: 'Practice Interviews',
    description: 'Do mock interviews with AI. Get real-time speech and content feedback.',
    icon: '🎯',
  },
  {
    step: 4,
    title: 'Track & Improve',
    description: 'Review detailed analytics, improve weak areas, and land your dream job.',
    icon: '🚀',
  },
]

export const STATS = [
  { value: 50000, label: 'Active Users', suffix: 'K+', prefix: '' },
  { value: 95, label: 'Success Rate', suffix: '%', prefix: '' },
  { value: 200, label: 'Partner Companies', suffix: '+', prefix: '' },
  { value: 4.9, label: 'User Rating', suffix: '★', prefix: '' },
]

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
]

export const DASHBOARD_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: 'FiGrid' },
  { label: 'Interviews', href: '/interview', icon: 'FiVideo' },
  { label: 'Resume', href: '/resume', icon: 'FiFileText' },
  { label: 'Analytics', href: '/analytics', icon: 'FiBarChart2' },
  { label: 'Profile', href: '/profile', icon: 'FiUser' },
]

export const STATUS_COLORS = {
  completed: 'emerald',
  in_progress: 'yellow',
  scheduled: 'violet',
  cancelled: 'red',
  pending: 'slate',
}

export const ROLE_OPTIONS = [
  { value: 'candidate', label: 'Job Candidate', description: 'Practice interviews and improve skills' },
  { value: 'recruiter', label: 'Recruiter', description: 'Use AI to assess candidates' },
]
