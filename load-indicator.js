// Hide loading indicator when page is fully loaded
window.addEventListener('load', function() {
  var loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.classList.add('hidden');
  }
});
