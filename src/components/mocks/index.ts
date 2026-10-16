/** slug -> recreated product UI. Frame decides which DeviceFrame variant hosts it. */
import Archipelago from './Archipelago.astro'
import Ayana from './Ayana.astro'
import BpsPerformanceMetrics from './BpsPerformanceMetrics.astro'
import BpsSeScrapper from './BpsSeScrapper.astro'
import BpsSsoSdk from './BpsSsoSdk.astro'
import Caretaker from './Caretaker.astro'
import Cektrans from './Cektrans.astro'
import Detexi from './Detexi.astro'
import FormGearBuilder from './FormGearBuilder.astro'
import FormGearEngine from './FormGearEngine.astro'
import Lontara from './Lontara.astro'
import MspPerformanceAudit from './MspPerformanceAudit.astro'
import Patonro from './Patonro.astro'
import PicoSulteng from './PicoSulteng.astro'
import SiapDonggala from './SiapDonggala.astro'
import Sikerja from './Sikerja.astro'
import StadataFlutterSdk from './StadataFlutterSdk.astro'
import SuratBmpr from './SuratBmpr.astro'

export type MockFrame = 'phone' | 'desktop' | 'terminal'
export interface MockEntry { component: any; frame: MockFrame; url?: string }

export const mocks: Record<string, MockEntry> = {
  archipelago: { component: Archipelago, frame: 'terminal', url: '~/my_app: zsh' },
  ayana: { component: Ayana, frame: 'desktop', url: 'ayana' },
  'bps-performance-metrics': { component: BpsPerformanceMetrics, frame: 'desktop', url: 'kinerja.bps' },
  'bps-se-scrapper': { component: BpsSeScrapper, frame: 'desktop', url: 'SE Merchant Scraper' },
  'bps-sso-sdk': { component: BpsSsoSdk, frame: 'terminal', url: 'bps_sso' },
  caretaker: { component: Caretaker, frame: 'phone' },
  cektrans: { component: Cektrans, frame: 'phone' },
  detexi: { component: Detexi, frame: 'phone' },
  'form-gear-builder': { component: FormGearBuilder, frame: 'desktop', url: 'formgear builder' },
  'form-gear-engine': { component: FormGearEngine, frame: 'phone' },
  lontara: { component: Lontara, frame: 'phone' },
  'msp-performance-audit': { component: MspPerformanceAudit, frame: 'phone' },
  patonro: { component: Patonro, frame: 'phone' },
  'pico-sulteng': { component: PicoSulteng, frame: 'phone' },
  'siap-donggala': { component: SiapDonggala, frame: 'phone' },
  sikerja: { component: Sikerja, frame: 'phone' },
  'stadata-flutter-sdk': { component: StadataFlutterSdk, frame: 'desktop', url: 'pub.dev/packages/stadata_flutter_sdk' },
  'surat-bmpr': { component: SuratBmpr, frame: 'phone' },
}

export const hasMock = (slug: string) => slug in mocks
