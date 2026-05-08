export type Client = {
  name: string
  logo: string
  url?: string
  tier: 'featured' | 'standard'
  /** Optional context shown as hover tooltip / caption */
  context?: string
}

export const clients: Client[] = [
  {
    name: 'Ulearna Technology LTD',
    logo: 'ulearna.svg',
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
    logo: 'pemkab-gowa.svg',
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
