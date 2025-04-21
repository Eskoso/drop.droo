(function() {
    // Weighted random helper based on chance (%) for each item
    function getRandomByChance(arr) {
        const weights = arr.map(item => parseFloat(item.chance));
        const total = weights.reduce((sum, w) => sum + w, 0);
        let r = Math.random() * total;
        for (let i = 0; i < arr.length; i++) {
          if (r < weights[i]) return arr[i];
          r -= weights[i];
        }
        return arr[0];
      }

      // Visa item‑modal med titel, bild och pris
function showItemModal(item) {
  const modal = document.getElementById('itemModal');
  document.getElementById('itemModalImage').src   = item.image;
  document.getElementById('itemModalImage').alt   = item.title;
  document.getElementById('itemModalTitle').textContent = item.title;
  document.getElementById('itemModalPrice').textContent = `Price: $${item.price}`;

  const sellBtn = document.getElementById('itemModalSell');
  sellBtn.onclick = () => {
    Inventory.sellItem(item.id);
    modal.classList.add('hidden');
  };

  document.getElementById('itemModalKeep').onclick = () => {
    modal.classList.add('hidden');
  };

  document.getElementById('itemModalPlayAgain').onclick = () => {
    modal.classList.add('hidden');
    openModal(_lastCaseId);
  };

  // Stäng‑knapp
  document.getElementById('itemModalClose').onclick = () => {
    modal.classList.add('hidden');
  };

  modal.classList.remove('hidden');
}

  
    // Generate a weighted array of fillers based on item.chance (in %)  // Generate a weighted array of fillers based on item.chance (in %)
  function generateFillers(contents, totalCount) {
    const bases = contents.map(item => {
      const proportion = (parseFloat(item.chance) / 100) * totalCount;
      return {
        item,
        base: Math.floor(proportion),
        frac: proportion - Math.floor(proportion)
      };
    });
    let sumBase = bases.reduce((sum, b) => sum + b.base, 0);
    let remainder = totalCount - sumBase;
    bases.sort((a, b) => b.frac - a.frac);
    for (let i = 0; i < remainder; i++) {
      if (bases[i]) {
        bases[i].base++;
      }
    }
    
    let arr = [];
    bases.forEach(b => {
      for (let i = 0; i < b.base; i++) arr.push(b.item);
    });
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

    let caseContents = {};

  
    // Load case-contents.json
    async function loadCaseContents() {
      try {
        const resp = await fetch("./js/data/case-contents.json");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        caseContents = await resp.json();
        console.log("Loaded case contents:", caseContents);
      } catch (err) {
        console.error("Failed to load case contents:", err);
      }
    }
  
    const modalOverlay = document.getElementById("caseModal");
    const modalContent = document.getElementById("caseModalContent");
  
    function closeModal() {
      modalOverlay.style.display = "none";
    }

    let balance = Money.getBalance();
    let _lastCaseId = null;
  
    function openModal(caseId) {
      _lastCaseId = caseId;
      const caseData = (window.featuredItemsData || []).find(c => c.id == caseId) || {};
      const contents = caseContents[caseId] || [];
  
      const itemsHtml = contents.map(item => `
        <div class="featured-item" data-id="${item.id}">
          ${item.tag ? `<div class="featured-tag ${item.tag}">${item.tag}</div>` : ''}
          <div class="featured-image">
            <img src="${item.image}" alt="${item.title}" />
          </div>
          <div class="featured-title">${item.title}</div>
        </div>
      `).join('');
  
      modalContent.innerHTML = `
        <button id="modalClose" class="modal-close">&times;</button>
        <h2 class="modal-title">${caseData.title || 'Case Details'}</h2>
        <div class="modal-balance"><span id="balance">Balance: $${balance}</span></div>
        <div id="spinArea" class="spin-container">
          <div class="center-marker"></div>
          <div id="spinTrack" class="spin-track"></div>
        </div>
        <img src="${caseData.image}" alt="${caseData.title}" class="case-image">
        <button id="unlockBtn" class="unlock-box-btn">
          <div class="featured-price"><i class="fas fa-coins"></i> ${caseData.price}</div>
          <span class="unlock-text">Unlock Case</span>
        </button>
        <div class="featured-items">
          <div class="featured-container">
            ${itemsHtml}
          </div>
        </div>
      `;
  
      // Floating animation
      modalContent.querySelectorAll('.featured-item').forEach(itemEl => {
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
  
      Money.updateBalanceUI();
      modalContent.querySelector('#modalClose').addEventListener('click', closeModal);
  
      modalContent.querySelector('#unlockBtn').addEventListener('click', () => {
        if (!contents.length) return alert('Nothing to open here!');
        const cost = Number(caseData.price);
        if (Money.getBalance() < cost) return alert(`Need $${cost}, have $${Money.getBalance()}`);
        Money.changeBalance(-cost);
        
        document.querySelector('#balance').textContent = `Balance: $${Money.getBalance()}`;

        // Disable unlock button
        document.querySelector('#unlockBtn').style.opacity = `0.5`;
        document.querySelector('#unlockBtn').style.pointerEvents = `none`;

        // disable close button
        document.querySelector('#modalClose').style.opacity = `0.5`;
        document.querySelector('#modalClose').style.pointerEvents = `none`;
  
        const spinArea  = modalContent.querySelector('#spinArea');
        const spinTrack = modalContent.querySelector('#spinTrack');
        const caseImage = modalContent.querySelector('.case-image');
        spinArea.classList.remove('hidden');
        spinArea.style.visibility = "visible";
        spinArea.style.opacity = "100";
        caseImage.style.display = 'none';  
        // Final item by chance
        const finalItem = getRandomByChance(contents);
        // Fillers weighted by chance
        const BEFORE_COUNT = 30;
        const fillers = generateFillers(contents, BEFORE_COUNT);
        const after   = generateFillers(contents, 5);
        const itemsArr = [...fillers, finalItem, ...after];
  
        // Render track
        spinTrack.innerHTML = itemsArr.map(it => `
          <div class="spin-item">
            <img src="${it.image}" alt="${it.title}" />
          </div>
        `).join('');
  
        // Reset and spin
        spinTrack.style.transition = 'none';
        spinTrack.style.transform  = 'translateX(0)';
        void spinTrack.offsetWidth;
        const first = spinTrack.querySelector('.spin-item');
        const cs    = getComputedStyle(first);
        const itemW = first.offsetWidth + parseFloat(cs.marginLeft) + parseFloat(cs.marginRight);
        const centerX = spinArea.clientWidth/2 - first.offsetWidth/2;
        const baseX   = fillers.length * itemW - centerX;
        const PIXEL_SHIFT = 20;
        const randomShift = (Math.random()*2-1)*PIXEL_SHIFT;
        const translateX = baseX + randomShift;
        spinTrack.style.transition = 'transform 5s ease-in-out';
        spinTrack.style.transform  = `translateX(-${translateX}px)`;
  
        spinTrack.addEventListener('transitionend', function handler() {
            spinTrack.removeEventListener('transitionend', handler);
            // 1) Lägg i inventory
            Inventory.addItem(finalItem);
            // 2) Stäng gamla case‑modal
            closeModal();
            // 3) Öppna din nya item‑modal
            showItemModal(finalItem);
          });
      });
  
      modalOverlay.style.display = 'flex';
    }
  
    function initModal() {
      const container = document.getElementById('featuredItems');
      if (!container) return;
      container.addEventListener('click', e => {
        const card = e.target.closest('.featured-item');
        if (card && card.dataset.id) openModal(card.dataset.id);
      });
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', async () => {
        await loadCaseContents();
        initModal();
      });
    } else {
      loadCaseContents().then(initModal);
    }
  })();
  