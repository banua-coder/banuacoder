/** Portfolio slug -> case-study videos (files in public/work/portfolio/<slug>/, compressed, lazy, no autoplay). */
interface L { id: string; en: string }
export interface PortfolioVideo { src: string; poster: string; ratio: '9 / 16' | '16 / 9'; title: L; kind: L }

const v = (slug: string, file: string, ratio: PortfolioVideo['ratio'], title: L, kind: L): PortfolioVideo => ({
  src: `/work/portfolio/${slug}/${file}.mp4`, poster: `/work/portfolio/${slug}/${file}.webp`, ratio, title, kind,
})

export const portfolioVideos: Record<string, PortfolioVideo[]> = {
  ayana: [v('ayana', 'promo', '16 / 9', { id: 'Video promo Ayana', en: 'Ayana promo film' }, { id: 'Promo produk · 16:9 · 2 mnt 58 dtk', en: 'Product promo · 16:9 · 2 min 58 s' })],
  cektrans: [v('cektrans', 'launch', '16 / 9', { id: 'Video peluncuran cektrans', en: 'cektrans launch film' }, { id: 'Peluncuran produk · 16:9 · 61 dtk', en: 'Product launch · 16:9 · 61 s' })],
  lumbung: [v('lumbung', 'promo', '9 / 16', { id: 'Video promo Lumbung', en: 'Lumbung promo film' }, { id: 'Promo produk · 9:16 · 72 dtk', en: 'Product promo · 9:16 · 72 s' })],
  lontara: [v('lontara', 'promo', '9 / 16', { id: 'Video promo Lontara', en: 'Lontara promo film' }, { id: 'Promo produk · 9:16 · 71 dtk', en: 'Product promo · 9:16 · 71 s' })],
  patonro: [v('patonro', 'promo', '9 / 16', { id: 'Video promo Patonro', en: 'Patonro promo film' }, { id: 'Promo produk · 9:16 · 71 dtk', en: 'Product promo · 9:16 · 71 s' })],
  'surat-bmpr': [v('surat-bmpr', 'promo', '9 / 16', { id: 'Video promo Surat BMPR', en: 'Surat BMPR promo film' }, { id: 'Promo produk · 9:16 · 64 dtk', en: 'Product promo · 9:16 · 64 s' })],
  caretaker: [v('caretaker', 'promo', '9 / 16', { id: 'Video promo Caretaker', en: 'Caretaker promo film' }, { id: 'Promo produk · 9:16 · 63 dtk', en: 'Product promo · 9:16 · 63 s' })],
  'pico-sulteng': [v('pico-sulteng', 'promo', '9 / 16', { id: 'Video promo PICO Sulteng', en: 'PICO Sulteng promo film' }, { id: 'Promo produk · 9:16 · 76 dtk', en: 'Product promo · 9:16 · 76 s' })],
  'siap-donggala': [v('siap-donggala', 'promo', '9 / 16', { id: 'Video promo SiAP Donggala', en: 'SiAP Donggala promo film' }, { id: 'Promo produk · 9:16 · 1 mnt 41 dtk', en: 'Product promo · 9:16 · 1 min 41 s' })],
  // The case-study body already embeds 5 before/after clips; this is the separate 9:16 explainer (not one of them).
  'msp-performance-audit': [v('msp-performance-audit', 'case-study', '9 / 16', { id: 'Audit performa Flutter, ringkasan video', en: 'Flutter performance audit, video summary' }, { id: 'Studi kasus · 9:16 · 88 dtk', en: 'Case study · 9:16 · 88 s' })],
}

export const hasVideo = (slug: string) => slug in portfolioVideos
