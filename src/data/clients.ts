export type Client = {
  name: string
  logo: string
  url?: string
  tier: 'featured' | 'standard'
  /** Optional context shown as hover tooltip / caption */
  context?: string
}

// LICENSE NOTES:
// - ulearna.png: source https://ulearna.com (og:image asset). Nominative fair use for client identification.
// - pemprov-sulteng.svg: https://commons.wikimedia.org/wiki/File:Coat_of_arms_of_Central_Sulawesi.svg — Public domain (PD-IDGov, Indonesian state emblem). Covers both PICO Sulteng and Surat BMPR engagements.
// - pemkab-gowa.png: https://commons.wikimedia.org/wiki/File:Lambang_Kabupaten_Gowa.png — Public domain (PD-IDGov).
// - pemkab-donggala.png: https://commons.wikimedia.org/wiki/File:Lambang_Kabupaten_Donggala.png — Public domain (PD-IDGov). Covers Siap Donggala (Mekari Talenta integration).
// - pemprov-sulsel.svg: https://commons.wikimedia.org/wiki/File:Coat_of_arms_of_South_Sulawesi.svg — Public domain (PD-IDGov).
// - brantas-inti-utama.png: extracted from Patonro/Lontara app splash branding asset (cropped + trimmed via ImageMagick from app's flutter_native_splash branding.png). Nominative fair use — partner is credited on Patonro/Lontara case studies.
// - klinikgo.png: source https://klinikgo.com/logo-klinikgo.png — nominative fair use for client identification (mobile app partnership).
//
// NOTE: Dinas BMPR Sulteng deliberately omitted from the home trust strip — it
// shares the same parent-province emblem as Pemprov Sulteng so two adjacent
// badges would look duplicated. Dinas BMPR remains credited on the Surat BMPR
// case study (src/content/portfolio/surat-bmpr/) where the partnership context matters.

export const clients: Client[] = [
  {
    name: 'Ulearna Technology LTD',
    logo: 'ulearna.png',
    url: 'https://ulearna.com',
    tier: 'featured',
    context: 'Dubai, UAE — international consumer products (Reab, Carwa)',
  },
  {
    name: 'PT Brantas Inti Utama',
    logo: 'brantas-inti-utama.png',
    tier: 'featured',
    context: 'Implementation partner for regional tax digitalization (Patonro, Lontara)',
  },
  {
    name: 'Pemerintah Provinsi Sulawesi Tengah',
    logo: 'pemprov-sulteng.svg',
    tier: 'featured',
    context: 'Public information platform (PICO Sulteng) and internal correspondence (Surat BMPR)',
  },
  {
    name: 'KlinikGo',
    logo: 'klinikgo.png',
    url: 'https://klinikgo.com',
    tier: 'featured',
    context: 'Mobile app partnership for integrated electronic medical records platform',
  },
  {
    name: 'Pemerintah Kabupaten Gowa',
    logo: 'pemkab-gowa.png',
    tier: 'standard',
    context: 'Regional tax services (Patonro)',
  },
  {
    name: 'Pemerintah Kabupaten Donggala',
    logo: 'pemkab-donggala.png',
    tier: 'standard',
    context: 'HR / staff information system (Siap Donggala — Mekari Talenta integration)',
  },
  {
    name: 'Pemerintah Provinsi Sulawesi Selatan',
    logo: 'pemprov-sulsel.svg',
    tier: 'standard',
    context: 'Province-scale regional tax services (Lontara)',
  },
]
