const api = require('saavnapi');
console.log('Keys:', Object.keys(api));

if (api.default) {
  console.log('Default keys:', Object.keys(api.default));
  if (typeof api.default === 'function') {
    const instance = new api.default();
    console.log('Instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
  }
}
