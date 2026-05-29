export type ProjectType = 'mobile-app' | 'web-dashboard' | 'website' | 'internal-system' | 'hybrid'
export type Scale = 'mvp' | 'standard' | 'platform'
export type UserType = 'internal' | 'public' | 'mixed'
export type DesignLevel = 'template' | 'custom' | 'design-system'
export type Urgency = 'standard' | 'rush'
export type Maintenance = 'one-time' | 'ongoing'
export type FeatureKey =
  | 'auth-roles'
  | 'payments'
  | 'realtime'
  | 'offline'
  | 'push'
  | 'external-api'
  | 'admin-panel'
  | 'reporting'
  | 'multi-language'
  | 'e-sign'
  | 'file-handling'

/**
 * Base price ranges in IDR by project type.
 * Tuning rationale:
 * - mobile-app: Flutter + backend, higher due to native toolchain, Play/App Store
 * - web-dashboard: frontend + REST/GraphQL backend, no app store overhead
 * - website: marketing/company profile sites; platform end covers CMS + integrations
 * - internal-system: enterprise complexity, auth flows, data migrations
 * - hybrid: cross-platform mobile + web + backend, largest surface area
 */
export const basePriceIDR: Record<ProjectType, [low: number, high: number]> = {
  'mobile-app': [40_000_000, 90_000_000],
  'web-dashboard': [30_000_000, 75_000_000],
  website: [10_000_000, 35_000_000],
  'internal-system': [25_000_000, 70_000_000],
  hybrid: [60_000_000, 150_000_000],
}

/**
 * Scale multiplier applied to the base price range.
 * MVP: stripped to core user journey only.
 * Standard: full feature set, production-ready.
 * Platform: multi-tenant, high scalability, extensible architecture.
 */
export const scaleMultiplier: Record<Scale, number> = {
  mvp: 0.7,
  standard: 1.0,
  platform: 2.2,
}

/**
 * Feature add-on ranges in IDR, on top of scaled base.
 * These accumulate: selecting auth + payments + realtime
 * adds each independently to the total.
 */
export const featureAddOnIDR: Record<FeatureKey, [low: number, high: number]> = {
  'auth-roles': [3_000_000, 6_000_000],
  payments: [8_000_000, 15_000_000],
  realtime: [10_000_000, 20_000_000],
  offline: [6_000_000, 12_000_000],
  push: [2_000_000, 5_000_000],
  'external-api': [4_000_000, 10_000_000],
  'admin-panel': [8_000_000, 18_000_000],
  reporting: [5_000_000, 12_000_000],
  'multi-language': [2_000_000, 5_000_000],
  'e-sign': [6_000_000, 12_000_000],
  'file-handling': [3_000_000, 7_000_000],
}

/**
 * Design multiplier applied after scale.
 * template: adapts an existing component library, minimal custom work.
 * custom: full UX/UI design from wireframes.
 * design-system: tokens, component library, usage guidelines.
 */
export const designMultiplier: Record<DesignLevel, number> = {
  template: 0.9,
  custom: 1.15,
  'design-system': 1.35,
}

/**
 * Urgency multiplier.
 * Rush (< 60% of standard timeline) requires extra parallel resourcing.
 */
export const urgencyMultiplier: Record<Urgency, number> = {
  standard: 1.0,
  rush: 1.35,
}

/**
 * User-type adjustment to base × scale cost.
 * Internal-only apps have simpler auth, no public onboarding.
 * Mixed audiences require both flows.
 */
export const userTypeAdjustment: Record<UserType, number> = {
  internal: 0.95,
  public: 1.0,
  mixed: 1.1,
}

/**
 * Annual maintenance as a fraction of total project cost.
 * 18% covers: monitoring, dependency updates, minor feature work, bug fixes.
 */
export const maintenanceAnnualPct = 0.18
