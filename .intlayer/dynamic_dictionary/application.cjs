const content = {
  'en': () => Promise.resolve(require('./application.en.json.cjs')),
  'th': () => Promise.resolve(require('./application.th.json.cjs'))
};
module.exports = content;
