const content = {
  'en': () => import('./modern_ui.en.json', { assert: { type: 'json' }}).then(mod => mod.default),
  'th': () => import('./modern_ui.th.json', { assert: { type: 'json' }}).then(mod => mod.default)
};
export default content;
