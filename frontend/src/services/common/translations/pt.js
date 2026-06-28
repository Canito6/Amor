import { commonPt } from './pt/common.pt';
import { authPt } from './pt/auth.pt';
import { dashboardPt } from './pt/dashboard.pt';
import { couplePt } from './pt/couple.pt';
import { funPt } from './pt/fun.pt';
import { galleryPt } from './pt/gallery.pt';

export const pt = {
  ...commonPt,
  ...authPt,
  ...dashboardPt,
  ...couplePt,
  ...funPt,
  ...galleryPt
};
