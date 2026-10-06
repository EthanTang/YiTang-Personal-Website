/* Traffic counts run only on the public site's configured hostname. */
(() => {
  const settings = document.currentScript?.dataset;
  if (!settings || location.hostname !== settings.siteHost || /^\/admin(?:\/|$)/.test(location.pathname)) return;
  const code = settings.goatcounterCode;
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(code || '')) return;
  window.goatcounter = {
    // Combine Netlify's pretty URLs with their .html equivalents; omit queries.
    path: () => location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/$/, '') || '/',
  };
  const counter = document.createElement('script');
  counter.src = 'https://gc.zgo.at/count.js';
  counter.async = true;
  counter.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
  document.head.appendChild(counter);
})();
