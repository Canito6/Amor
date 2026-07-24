import { pt } from './translations/pt';
import { en } from './translations/en';
import { es } from './translations/es';

const rawTranslations = { pt, en, es };

export const translations = new Proxy(rawTranslations, {
  get: (target, prop) => {
    if (prop in target && target[prop]) {
      return target[prop];
    }
    return target.pt;
  }
});
