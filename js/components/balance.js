let balance = parseInt(localStorage.getItem('balance'), 10);
if (isNaN(balance)) balance = 1000;

// 2. Persist helper
function saveBalance() {
  localStorage.setItem('balance', balance);
}

// 3. Read current balance
function getBalance() {
  return balance;
}

// 4. Change balance by `amount` (can be positive or negative)
function changeBalance(amount) {
  const delta = Number(amount);
  if (isNaN(delta)) {
    console.error('[Money] invalid amount:', amount);
    return;
  }
  balance += delta;
  saveBalance();
  updateBalanceUI();
}

// 5. Push balance into your UI
function updateBalanceUI() {
  const navBal   = document.getElementById('navBalance');
  const modalBal = document.getElementById('modalBalance');
  if (navBal)   navBal.textContent   = balance;
  if (modalBal) modalBal.textContent = `Your balance: $${balance}`;
}

// 6. Expose API
window.Money = { getBalance, changeBalance, updateBalanceUI };