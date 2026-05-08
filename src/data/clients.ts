export type Client = { name: string; logo: string; url?: string; tier: 'featured' | 'standard' }

export const clients: Client[] = [
  { name: 'Ulearna Technology LTD', logo: 'ulearna.svg', url: 'https://ulearna.com', tier: 'featured' },
  { name: 'PICO Sulteng', logo: 'pico-sulteng.svg', tier: 'featured' },
  { name: 'Patonro', logo: 'patonro.svg', tier: 'standard' },
  { name: 'Lontara', logo: 'lontara.svg', tier: 'standard' },
]
