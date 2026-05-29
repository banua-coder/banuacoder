export type FounderExperience = { company: string; logo: string; context: string }

// LICENSE NOTES:
// - goto-financial.png: https://commons.wikimedia.org/wiki/File:GoTo_Financial.png — Public domain (PD-IDGov / corporate brand mark).
// - reku.png: https://reku.id/next/assets/images/logo/reku.png — nominative fair use for employer identification.
// - stockbit.svg: https://stockbit.com/images/stockbit.svg — nominative fair use for employer identification.
// - ulearna.png: https://ulearna.com (og:image asset) — nominative fair use for employer identification.

export const founderExperience: FounderExperience[] = [
  { company: 'GoTo Financial', logo: 'goto-financial.png', context: 'Mobile platform engineering' },
  { company: 'Reku', logo: 'reku.png', context: 'Mobile engineering' },
  { company: 'Stockbit/Bibit', logo: 'stockbit.svg', context: 'Mobile platform' },
  { company: 'Ulearna', logo: 'ulearna.png', context: 'International product collaboration (Dubai, UAE)' },
]
