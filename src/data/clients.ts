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
// - pemprov-sulteng.svg: https://commons.wikimedia.org/wiki/File:Coat_of_arms_of_Central_Sulawesi.svg — Public domain (PD-IDGov, Indonesian state emblem).
// - dinas-bmpr-sulteng.svg: copy of pemprov-sulteng.svg (no distinct emblem; dinas uses parent province emblem).
// - pemkab-gowa.png: https://commons.wikimedia.org/wiki/File:Lambang_Kabupaten_Gowa.png — Public domain (PD-IDGov).
// - pemprov-sulsel.svg: https://commons.wikimedia.org/wiki/File:Coat_of_arms_of_South_Sulawesi.svg — Public domain (PD-IDGov).
// - brantas-inti-utama.svg: not sourced — text fallback retained.

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
    logo: 'brantas-inti-utama.svg',
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
    name: 'Dinas Bina Marga dan Penataan Ruang Provinsi Sulawesi Tengah',
    logo: 'dinas-bmpr-sulteng.svg',
    tier: 'standard',
    context: 'Mobile letter-disposition system (Surat BMPR)',
  },
  {
    name: 'Pemerintah Kabupaten Gowa',
    logo: 'pemkab-gowa.png',
    tier: 'standard',
    context: 'Regional tax services (Patonro)',
  },
  {
    name: 'Pemerintah Provinsi Sulawesi Selatan',
    logo: 'pemprov-sulsel.svg',
    tier: 'standard',
    context: 'Province-scale regional tax services (Lontara)',
  },
]
