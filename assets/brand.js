/* Beloglazov Event — общий фирменный слой: логотип */
(function () {
  var D = 'M0,50a50,50 0 1,0 100,0a50,50 0 1,0 -100,0Z M9.76,50a40.24,35.68 0 1,0 80.48,0a40.24,35.68 0 1,0 -80.48,0Z M14.25,50a35.75,31.27 0 1,0 71.5,0a35.75,31.27 0 1,0 -71.5,0Z M40.48,50a9.52,9.52 0 1,0 19.04,0a9.52,9.52 0 1,0 -19.04,0Z';
  var base = (document.currentScript && document.currentScript.src || '').replace(/brand\.js.*$/, '');
  window.PB_BRAND = {
    mark: function (size) { return '<svg class="pb-mark" viewBox="0 0 100 100" width="' + (size || 28) + '" height="' + (size || 28) + '" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="' + D + '"/></svg>'; },
    lockup: function (sub) { return '<span class="pb-lock">' + this.mark(30) + '<img class="pb-word" src="' + base + 'wordmark-white.png" alt="Beloglazov Event">' + (sub ? '<small class="pb-sub">' + sub + '</small>' : '') + '</span>'; },
    base: base
  };
})();
