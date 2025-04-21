// inventory.js
// Manages user inventory: load, save, add, remove, and render.

(function() {
    const STORAGE_KEY = 'userInventory';
    let inventory = [];
  
    // Load inventory from localStorage
    function loadInventory() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        inventory = stored ? JSON.parse(stored) : [];
      } catch (err) {
        console.error('[Inventory] Failed to load:', err);
        inventory = [];
      }
    }
  
    // Save inventory to localStorage
    function saveInventory() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
      } catch (err) {
        console.error('[Inventory] Failed to save:', err);
      }
    }
  
    // Add a weapon/item to inventory
    function addItem(item) {
      // item should be an object with at least id, title, price, image, chance
      inventory.push(item);
      saveInventory();
      renderInventory();
    }
  
    // Remove a single item by id
    function sellItem(itemId) {
        const index = inventory.findIndex(i => i.id === itemId);
        if (index === -1) return;
        const [item] = inventory.splice(index, 1);
        saveInventory();
        renderInventory();
        // Credit user balance
        if (window.Money && typeof Money.changeBalance === 'function') {
          const price = Number(item.price) || 0;
          Money.changeBalance(price);
        }
      }
  
    // Get a copy of current inventory
    function getInventory() {
      return [...inventory];
    }
  
    // Render inventory into DOM (expects an element with id 'inventoryGrid')
    function renderInventory() {
      const grid = document.getElementById('inventoryItems');
      if (!grid) return;
      grid.innerHTML = '';
      inventory.forEach(item => {
        const card = document.createElement('div');
        card.className = 'featured-item inventory-item';
        card.innerHTML = `
        <div class="image-container">
          <img src="${item.image}" alt="${item.title}" />
        </div>
          <div class="title">${item.title}</div>
          ${item.price != null ? `<div class="price-container"><i class="fas fa-coins"></i><div class="price">$${item.price}</div></div>` : ''}
          <button class="sell-btn" data-id="${item.id}">Sell</button>
        `;
        // Attach remove handler
        card.querySelector('button').addEventListener('click', () => sellItem(item.id));
        grid.appendChild(card);
      });
    }
  
    // Expose API
    window.Inventory = {
      loadInventory,
      saveInventory,
      addItem,
      sellItem,
      getInventory,
      renderInventory
    };
  
    // Auto-init on script load
    document.addEventListener('DOMContentLoaded', () => {
      loadInventory();
      renderInventory();
    });
  })();  