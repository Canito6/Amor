import { commonEs } from './es/common.es';
import { authEs } from './es/auth.es';
import { dashboardEs } from './es/dashboard.es';
import { coupleEs } from './es/couple.es';
import { funEs } from './es/fun.es';
import { galleryEs } from './es/gallery.es';

export const es = {
  ...commonEs,
  ...authEs,
  ...dashboardEs,
  ...coupleEs,
  ...funEs,
  ...galleryEs
};
