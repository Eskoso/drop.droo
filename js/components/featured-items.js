async function renderFeaturedItems() {
  const container = document.getElementById('featuredItems');
  console.log('Loading featured items...');
  if (!container) return;

  let items;
  try {
    // Fetch JSON data
    const resp = await fetch('./js/data/featured-items.json');
    if (!resp.ok) {
      console.error(`Failed to fetch featured-items.json: ${resp.status}`);
      return;
    }
    items = await resp.json();
    console.log('Parsed featured items:', items);
  } catch (err) {
    console.error('Failed to load featured items:', err);
    return;
  }

  // Expose globally so modal.js can access
  window.featuredItemsData = items;

  // Render items
  container.innerHTML = items.map(item => `
    <div class="featured-item" data-id="${item.id}">
      ${item.tag ? `<div class="featured-tag ${item.tag}">${item.tag}</div>` : ''}
      <div class="featured-title">${item.title}</div>
      <div class="featured-image">
        <img src="${item.image}" alt="${item.title}" />
      </div>
      <div class="featured-price">
        <i class="fas fa-coins"></i> ${item.price}
      </div>
    </div>
  `).join('');

  // Hover float animation
  document.querySelectorAll('.featured-item').forEach(itemEl => {
    let floatAnim;
    itemEl.addEventListener('mouseenter', () => {
      let pos = 0;
      floatAnim = setInterval(() => {
        pos += 0.1;
        itemEl.style.transform = `translateY(${Math.sin(pos) * 3}px)`;
      }, 20);
    });
    itemEl.addEventListener('mouseleave', () => {
      clearInterval(floatAnim);
      itemEl.style.transform = '';
    });
  });
}

// Expose function
window.renderFeaturedItems = renderFeaturedItems;