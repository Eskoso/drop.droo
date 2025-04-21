(function() {
  function setupFilter() {
    // Slider elements
    const track = document.querySelector('.price-slider-track');
    const progress = document.querySelector('.price-slider-progress');
    const minHandle = document.querySelector('.min-handle');
    const maxHandle = document.querySelector('.max-handle');
    const minInput = document.querySelector('.price-min');
    const maxInput = document.querySelector('.price-max');

    // Search and clear
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');

    // Container of items
    const featuredContainer = document.getElementById('featuredItems');

    if (!track || !progress || !minHandle || !maxHandle || !minInput || !maxInput || !searchInput || !clearBtn || !featuredContainer) {
      console.warn('Filter init: missing required elements');
      return;
    }

    const DEFAULT_MIN = 0;
    const DEFAULT_MAX = 1000;
    let minValue = parseInt(minInput.value, 10) || DEFAULT_MIN;
    let maxValue = parseInt(maxInput.value, 10) || DEFAULT_MAX;
    let searchTerm = '';

    const clamp = (val, low, high) => Math.min(Math.max(val, low), high);

    // Combined filter
    function filterItems() {
      const items = featuredContainer.querySelectorAll('.featured-item');
      items.forEach(item => {
        const priceText = item.querySelector('.featured-price').textContent;
        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
        const title = item.querySelector('.featured-title').textContent.toLowerCase();
        const priceOK = price >= minValue && price <= maxValue;
        const textOK = title.includes(searchTerm);
        item.style.display = priceOK && textOK ? '' : 'none';
      });
    }

    function updateUI() {
      const minPct = (minValue / DEFAULT_MAX) * 100;
      const maxPct = (maxValue / DEFAULT_MAX) * 100;
      minHandle.style.left = minPct + '%';
      maxHandle.style.left = maxPct + '%';
      progress.style.left = minPct + '%';
      progress.style.width = (maxPct - minPct) + '%';
      minInput.value = minValue;
      maxInput.value = maxValue;
      filterItems();
    }

    function resetFilters() {
      minValue = DEFAULT_MIN;
      maxValue = DEFAULT_MAX;
      searchTerm = '';
      searchInput.value = '';
      updateUI();
    }

    updateUI();

    // Slider drag logic
    let activeHandle = null;
    function onMove(e) {
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
      if (clientX == null) return;
      const rect = track.getBoundingClientRect();
      const pos = clamp((clientX - rect.left) / rect.width, 0, 1);
      const val = Math.round(pos * DEFAULT_MAX);
      if (activeHandle === 'min') minValue = clamp(val, DEFAULT_MIN, maxValue);
      else if (activeHandle === 'max') maxValue = clamp(val, minValue, DEFAULT_MAX);
      updateUI();
    }
    function onUp() {
      activeHandle = null;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('touchmove', onMove);
    }
    function startDrag(type, e) {
      e.preventDefault(); activeHandle = type;
      document.addEventListener('pointermove', onMove);
      document.addEventListener('touchmove', onMove);
    }
    minHandle.addEventListener('pointerdown', e => startDrag('min', e));
    maxHandle.addEventListener('pointerdown', e => startDrag('max', e));
    document.addEventListener('pointerup', onUp);
    document.addEventListener('touchend', onUp);

    // Inputs
    minInput.addEventListener('change', () => {
      minValue = clamp(parseInt(minInput.value, 10) || DEFAULT_MIN, DEFAULT_MIN, maxValue);
      updateUI();
    });
    maxInput.addEventListener('change', () => {
      maxValue = clamp(parseInt(maxInput.value, 10) || DEFAULT_MAX, minValue, DEFAULT_MAX);
      updateUI();
    });

    // Search
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      filterItems();
    });

    // Clear
    clearBtn.addEventListener('click', e => {
      e.preventDefault();
      resetFilters();
    });
  }

  // Init on DOM
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupFilter);
  else setupFilter();

  // Expose
  window.setupFilter = setupFilter;
})();