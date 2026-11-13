import silkHalterIvory from '../assets/images/product_silk_halter_ivory_1794559137881.jpg';
import slipDressChampagne from '../assets/images/product_slip_dress_champagne_1794559137048.jpg';
import linenBlazerSand from '../assets/images/product_linen_blazer_sand_1794559137347.jpg';
import wideTrousersEcru from '../assets/images/product_wide_trousers_ecru_1794559137812.jpg';
import eveningDressEspresso from '../assets/images/product_evening_dress_espresso_1794559138413.jpg';
import cashmereKnitNoir from '../assets/images/product_cashmere_knit_noir_1794559139448.jpg';
import editorialAtelierParis from '../assets/images/editorial_atelier_paris_1794559139237.jpg';
import editorialCollectionDrapery from '../assets/images/editorial_collection_drapery_1794559139632.jpg';
import type { MediaKey } from '../types/commerce.ts';

export const HERO_VIDEO_SRC = '/assets/aistudio/Oceane_HERO_VIDEO_da0cc501.mp4';
export const MONOGRAM_LOGO_SRC = '/assets/aistudio/Logo_monogramme_MF_Maison_Ferya_e9419a00.png';

export const MEDIA_ASSETS: Record<MediaKey, string> = {
  silk_halter_ivory: silkHalterIvory,
  slip_dress_champagne: slipDressChampagne,
  linen_blazer_sand: linenBlazerSand,
  wide_trousers_ecru: wideTrousersEcru,
  evening_dress_espresso: eveningDressEspresso,
  cashmere_knit_noir: cashmereKnitNoir,
  editorial_atelier_paris: editorialAtelierParis,
  editorial_collection_drapery: editorialCollectionDrapery,
};

export function getMediaSrc(key: MediaKey): string {
  return MEDIA_ASSETS[key] ?? silkHalterIvory;
}
