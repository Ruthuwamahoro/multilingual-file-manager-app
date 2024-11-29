const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const path = require('path');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    },
    ns: ['common', 'file', 'auth', 'job'],
    defaultNS: 'common',
    preload: ['en', 'fr'],
    saveMissing: true,
    debug: process.env.NODE_ENV === 'development'
  });

module.exports = { i18next, middleware };