const content = {
  'en': () => import('./application.en.json', { assert: { type: 'json' }}).then(mod => mod.default),
  'th': () => import('./application.th.json', { assert: { type: 'json' }}).then(mod => mod.default)
};
export default content;
