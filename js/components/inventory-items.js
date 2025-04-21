// js/components/inventory-items.js

/**
 * Fetches and renders inventory items from Inventory API.
 * Assumes:
 * - container with id="inventoryItems"
 * - Inventory API exposed as window.Inventory
 * - Each item has id, title, image, price
 */
async function renderInventoryItems() {
  const container = document.getElementById('inventoryItems');
  console.log('Rendering inventory items...');
  if (!container) return;

  let items;
  try {
    if (!window.Inventory) throw new Error('Inventory API not found');
    items = Inventory.getInventory();
    console.log('Loaded inventory items:', items);
  } catch (err) {
    console.error('Failed to load inventory from API:', err);
    return;
  }

  // Render items into container
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
      <button class="sell-btn" data-id="${item.id}">Sell</button>
    </div>
  `).join('');

    // Sell handler
    const sellBtn = itemEl.querySelector(".sell-btn");
    if (sellBtn) {
      sellBtn.addEventListener("click", () => {
        const id = sellBtn.dataset.id;
        Inventory.sellItem(id);
      });
    }
}

// Expose and auto-render
window.renderInventoryItems = renderInventoryItems;
document.addEventListener('DOMContentLoaded', renderInventoryItems);
