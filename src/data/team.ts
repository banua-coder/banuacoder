export type TeamLinks = {
  linkedin?: string
  github?: string
  twitter?: string
  facebook?: string
  medium?: string
  instagram?: string
}

export type TeamMember = {
  name: string
  role: string
  /** Path relative to src/assets/team/ — leave undefined for placeholder */
  photo?: string
  links: TeamLinks
  /** 'founder' surfaces the member with extra weight on /about */
  highlight?: 'founder' | 'lead'
  /** Capability tags shown under the role */
  expertise: string[]
  /** Short bio shown on hover or in detail view */
  bio?: string
}

export const team: TeamMember[] = [
  {
    name: 'Fajrian Aidil Pratama',
    role: 'Founder & Director',
    highlight: 'founder',
    expertise: ['Mobile Engineering', 'Platform', 'Product', 'Performance'],
    links: {
      linkedin: 'https://linkedin.com/in/ryanaidilp',
      twitter: 'https://twitter.com/ryanaidilp_',
      facebook: 'https://facebook.com/ryanaidilp',
    },
    bio: 'Software engineer with experience across mobile, platform, and digital product development. Background spans GoTo Financial, Reku, Stockbit/Bibit, public-sector systems, and international product collaboration.',
  },
  {
    name: 'Aryafianto',
    role: 'UI/UX Designer',
    expertise: ['Product Design', 'Interaction', 'Design Systems'],
    links: {
      linkedin: 'https://linkedin.com/in/aryafianto-520475a1',
      facebook: 'https://facebook.com/arya.fianto91',
    },
  },
  {
    name: 'Muh. Zhen',
    role: 'Graphic Designer & Illustrator',
    expertise: ['Brand Identity', '3D / Illustration', 'Social Media Graphics'],
    links: {
      linkedin: 'https://linkedin.com/in/muhzhen',
      facebook: 'https://facebook.com/Mzhen00',
    },
  },
  {
    name: 'Arsadi',
    role: 'Frontend Engineer',
    expertise: ['Web Frontend', 'Implementation'],
    links: {
      linkedin: 'https://linkedin.com/in/arsadi',
    },
  },
]
