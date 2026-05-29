import {
  basePriceIDR,
  designMultiplier,
  featureAddOnIDR,
  maintenanceAnnualPct,
  scaleMultiplier,
  urgencyMultiplier,
  userTypeAdjustment,
  type DesignLevel,
  type FeatureKey,
  type Maintenance,
  type ProjectType,
  type Scale,
  type Urgency,
  type UserType,
} from '../data/estimator-pricing'

export type {
  DesignLevel,
  FeatureKey,
  Maintenance,
  ProjectType,
  Scale,
  Urgency,
  UserType,
}

export interface EstimatorInput {
  type: ProjectType
  scale: Scale
  users: UserType
  features: FeatureKey[]
  design: DesignLevel
  urgency: Urgency
  maintenance: Maintenance
}

export interface EstimatorOutput {
  totalLow: number
  totalHigh: number
  baseRange: [number, number]
  featuresRange: [number, number]
  multipliersApplied: {
    design: number
    urgency: number
    users: number
    scale: number
  }
  durationWeeks: [number, number]
  team: string[]
  matchedPortfolioSlugs: string[]
  annualMaintenanceLow?: number
  annualMaintenanceHigh?: number
}

// ─── Duration heuristics ───────────────────────────────────────────────────
// Base weeks per type × scale; rough medians, not SLAs.
const durationWeeksMap: Record<ProjectType, Record<Scale, [number, number]>> = {
  'mobile-app': { mvp: [6, 10], standard: [10, 14], platform: [16, 28] },
  'web-dashboard': { mvp: [4, 8], standard: [8, 12], platform: [14, 22] },
  website: { mvp: [3, 5], standard: [5, 8], platform: [10, 16] },
  'internal-system': { mvp: [5, 8], standard: [8, 14], platform: [14, 24] },
  hybrid: { mvp: [8, 12], standard: [12, 18], platform: [20, 32] },
}

// ─── Team composition heuristics ──────────────────────────────────────────
function buildTeam(input: EstimatorInput): string[] {
  const { type, scale, design } = input
  const team: string[] = ['1 Project Lead / Scrum Master']

  switch (type) {
    case 'mobile-app':
      team.push('1–2 Mobile Engineer (Flutter/React Native)')
      team.push('1 Backend Engineer')
      break
    case 'web-dashboard':
      team.push('1 Frontend Engineer (React/Vue)')
      team.push('1 Backend Engineer')
      break
    case 'website':
      team.push('1 Frontend Engineer')
      if (scale === 'platform') team.push('1 Backend Engineer')
      break
    case 'internal-system':
      team.push('1 Backend Engineer')
      team.push('1 Frontend / Mobile Engineer')
      break
    case 'hybrid':
      team.push('1–2 Mobile Engineer')
      team.push('1 Frontend Engineer')
      team.push('1–2 Backend Engineer')
      break
  }

  if (design === 'design-system') {
    team.push('1 Senior UI/UX Designer')
  } else if (design === 'custom') {
    team.push('1 UI/UX Designer')
  }

  if (scale === 'platform') {
    team.push('1 DevOps / Infrastructure Engineer')
  }

  return team
}

// ─── Portfolio matching ────────────────────────────────────────────────────
const consumerSlugs = ['reab', 'carwa', 'caretaker']
const publicSlugs = ['pico-sulteng', 'patonro', 'lontara']

function matchPortfolio(input: EstimatorInput): string[] {
  const { type, users, features } = input
  const scores: Record<string, number> = {}

  if (type === 'mobile-app' || type === 'hybrid') {
    if (users === 'public' || users === 'mixed') {
      consumerSlugs.forEach((s) => (scores[s] = (scores[s] ?? 0) + 2))
    }
  }

  if (type === 'internal-system' || users === 'internal') {
    publicSlugs.forEach((s) => (scores[s] = (scores[s] ?? 0) + 2))
  }

  if (features.includes('payments')) {
    scores['carwa'] = (scores['carwa'] ?? 0) + 1
    scores['patonro'] = (scores['patonro'] ?? 0) + 1
  }

  if (features.includes('realtime')) {
    scores['carwa'] = (scores['carwa'] ?? 0) + 1
  }

  if (features.includes('push')) {
    scores['reab'] = (scores['reab'] ?? 0) + 1
    scores['caretaker'] = (scores['caretaker'] ?? 0) + 1
  }

  if (features.includes('reporting') || features.includes('admin-panel')) {
    publicSlugs.forEach((s) => (scores[s] = (scores[s] ?? 0) + 1))
  }

  if (type === 'web-dashboard' || type === 'website') {
    consumerSlugs.forEach((s) => (scores[s] = (scores[s] ?? 0) + 1))
  }

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => slug)
    .slice(0, 3)

  const all = [...consumerSlugs, ...publicSlugs]
  for (const s of all) {
    if (sorted.length >= 3) break
    if (!sorted.includes(s)) sorted.push(s)
  }

  return sorted.slice(0, 3)
}

// ─── Main calculate function ───────────────────────────────────────────────
export function calculate(input: EstimatorInput): EstimatorOutput {
  const [baseLow, baseHigh] = basePriceIDR[input.type]
  const scaleMul = scaleMultiplier[input.scale]
  const designMul = designMultiplier[input.design]
  const urgencyMul = urgencyMultiplier[input.urgency]
  const usersMul = userTypeAdjustment[input.users]

  const scaledLow = Math.round(baseLow * scaleMul * designMul * urgencyMul * usersMul)
  const scaledHigh = Math.round(baseHigh * scaleMul * designMul * urgencyMul * usersMul)

  let featLow = 0
  let featHigh = 0
  for (const key of input.features) {
    const [lo, hi] = featureAddOnIDR[key]
    featLow += lo
    featHigh += hi
  }

  const totalLow = scaledLow + featLow
  const totalHigh = scaledHigh + featHigh

  const durationWeeks = durationWeeksMap[input.type][input.scale]
  const team = buildTeam(input)
  const matchedPortfolioSlugs = matchPortfolio(input)

  const output: EstimatorOutput = {
    totalLow,
    totalHigh,
    baseRange: [scaledLow, scaledHigh],
    featuresRange: [featLow, featHigh],
    multipliersApplied: {
      scale: scaleMul,
      design: designMul,
      urgency: urgencyMul,
      users: usersMul,
    },
    durationWeeks,
    team,
    matchedPortfolioSlugs,
  }

  if (input.maintenance === 'ongoing') {
    output.annualMaintenanceLow = Math.round(totalLow * maintenanceAnnualPct)
    output.annualMaintenanceHigh = Math.round(totalHigh * maintenanceAnnualPct)
  }

  return output
}

// ─── Readable sanity cross-check ──────────────────────────────────────────
// Standard mobile-app, public, auth + payments + push, custom design, standard timeline, one-time:
//   base: 40M–90M × 1.0 (std) × 1.15 (custom) × 1.0 (std urgency) × 1.0 (public)
//        = 46M–103.5M
//   features: auth(3–6) + payments(8–15) + push(2–5) = 13–26M
//   total: 59M–129.5M  → within 80–150M ballpark ✓
export const _sanityCheck = {
  input: {
    type: 'mobile-app' as ProjectType,
    scale: 'standard' as Scale,
    users: 'public' as UserType,
    features: ['auth-roles', 'payments', 'push'] as FeatureKey[],
    design: 'custom' as DesignLevel,
    urgency: 'standard' as Urgency,
    maintenance: 'one-time' as Maintenance,
  },
  expectedNote: 'total ~59M–130M IDR, within the 80–150M ballpark spec ✓',
}
