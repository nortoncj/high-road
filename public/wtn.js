/*! WebTech Ninjas site stats. No cookies, nothing personal stored. Under 1 KB gzipped.
 * <script defer src="https://webtechninjas.com/wtn.js" data-site="SITE_KEY"></script>
 * Visit any page with ?wtn_ignore=1 to stop counting your own browser (?wtn_ignore=0 to undo).
 */
(function () {
  var s = document.currentScript;
  var key = s && s.getAttribute("data-site");
  if (!key || navigator.webdriver) return;

  try {
    var q0 = location.search;
    if (/[?&]wtn_ignore=1/.test(q0)) localStorage.setItem("wtn_ignore", "1");
    if (/[?&]wtn_ignore=0/.test(q0)) localStorage.removeItem("wtn_ignore");
    if (localStorage.getItem("wtn_ignore")) return;
  } catch (e) {}

  var url = s.src.replace(/\/wtn\.js(\?.*)?$/, "/api/e");
  var last = null;

  function send(t, extra) {
    var d = { k: key, t: t, p: location.pathname, h: location.hostname };
    for (var i in extra) d[i] = extra[i];
    var body = JSON.stringify(d);
    // A string body goes as text/plain: no CORS preflight, and it survives the page unloading.
    if (navigator.sendBeacon && navigator.sendBeacon(url, body)) return;
    try {
      fetch(url, { method: "POST", body: body, keepalive: true, mode: "no-cors" });
    } catch (e) {}
  }

  function view(first) {
    if (location.pathname === last) return;
    last = location.pathname;
    var extra = {};
    if (first) {
      var q = location.search;
      var m = /[?&]utm_source=([^&#]*)/.exec(q);
      extra.r = document.referrer || "";
      extra.u = m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : /[?&]gclid=/.test(q) ? "google_ads" : /[?&]fbclid=/.test(q) ? "facebook" : "";
    }
    send("view", extra);
  }

  view(true);

  // Sites built with Next.js or React change pages without reloading.
  var push = history.pushState;
  history.pushState = function () {
    push.apply(this, arguments);
    view(false);
  };
  addEventListener("popstate", function () {
    view(false);
  });

  // Tap to call. Capture phase so it fires even if the site stops the click.
  document.addEventListener(
    "click",
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
      if (a) send("call", { n: a.getAttribute("href").slice(4) });
    },
    true
  );

  // Form fills. Search boxes don't count. Browser validation errors never get here.
  document.addEventListener(
    "submit",
    function (e) {
      var f = e.target;
      if (!f || f.getAttribute("role") === "search" || f.querySelector('input[type="search"], input[name="s"]')) return;
      send("form", { f: f.getAttribute("id") || f.getAttribute("name") || "" });
    },
    true
  );
})();
