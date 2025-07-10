const content = {
  'en': () => Promise.resolve(require('./modern_ui.en.json.cjs')),
  'th': () => Promise.resolve(require('./modern_ui.th.json.cjs'))
};
module.exports = content;
