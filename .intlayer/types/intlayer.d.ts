/* eslint-disable */
import { Locales } from 'intlayer';

declare module 'intlayer' {
  interface IntlayerDictionaryTypesConnector {

  }

  type DeclaredLocales = Locales.THAI | Locales.ENGLISH | Locales.JAPANESE | Locales.KOREAN | Locales.CHINESE;
  type RequiredLocales = Locales.THAI | Locales.ENGLISH | Locales.JAPANESE | Locales.KOREAN | Locales.CHINESE;
  type ExtractedLocales = Extract<Locales, RequiredLocales>;
  type ExcludedLocales = Exclude<Locales, RequiredLocales>;
  interface IConfigLocales<Content> extends Record<ExtractedLocales, Content>, Partial<Record<ExcludedLocales, Content>> {}
}