// A transaction is counted once globally; its payment lines allocate that total.
function escapeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function getTransactionPayments(tx) {
  if (Array.isArray(tx.payments) && tx.payments.length) return tx.payments;
  return [{ walletId: tx.walletId, amount: Number(tx.amount || 0) }];
}

function getWalletTransactionAmount(tx, walletId) {
  return getTransactionPayments(tx).reduce((sum, payment) =>
    sum + (payment.walletId === walletId ? Number(payment.amount || 0) : 0), 0);
}

function populateReportFilters() {
  const populate = (id, title, items, referenced) => {
    const select = document.getElementById(id);
    const selected = select.value;
    select.replaceChildren(new Option(title, ''));
    const options = new Map(items.map(item => [item.id, item.name]));
    referenced.filter(Boolean).forEach(id => {
      if (!options.has(id)) options.set(id, 'Đã xóa (' + id + ')');
    });
    options.forEach((name, value) => select.add(new Option(name, value)));
    select.value = options.has(selected) ? selected : '';
  };
  populate('report-category', 'Tất cả danh mục', appData.categories || [], (appData.transactions || []).map(tx => tx.category));
  populate('report-wallet', 'Tất cả ví / tài khoản', appData.cards || [], (appData.transactions || []).flatMap(tx => getTransactionPayments(tx).map(payment => payment.walletId)));
  const wallet = document.getElementById('report-wallet').value;
  document.getElementById('report-filter-summary').textContent = wallet
    ? 'Số liệu chỉ tính phần tiền thuộc ví đã chọn; giao dịch chia ví vẫn tính một lần.'
    : 'Tổng tiền, biểu đồ và danh sách cùng áp dụng các bộ lọc đã chọn.';
}

function resetReportFilters() {
  ['report-category', 'report-wallet', 'report-type'].forEach(id => { document.getElementById(id).value = ''; });
  renderReports();
}

function applyReportFilters(transactions) {
  const category = document.getElementById('report-category').value;
  const wallet = document.getElementById('report-wallet').value;
  const type = document.getElementById('report-type').value;
  return transactions.filter(tx => (!category || tx.category === category) && (!type || tx.type === type))
    .filter(tx => !wallet || getTransactionPayments(tx).some(payment => payment.walletId === wallet))
    .map(tx => wallet ? {
      ...tx, amount: getWalletTransactionAmount(tx, wallet),
      ...(getTransactionPayments(tx).length > 1 ? { reportOriginalAmount: tx.amount } : {})
    } : tx);
}

function resetSplitPayment(tx) {
  const payments = tx ? getTransactionPayments(tx) : [];
  const enabled = payments.length > 1;
  document.getElementById('tx-split-enabled').checked = enabled;
  document.getElementById('tx-payments').replaceChildren();
  setSplitVisibility(enabled);
  if (enabled) payments.forEach(payment => addPaymentRow(payment));
  updateSplitSummary();
}

function setSplitVisibility(enabled) {
  const select = document.getElementById('tx-wallet');
  document.getElementById('tx-split-panel').classList.toggle('hidden', !enabled);
  select.disabled = enabled;
  select.parentElement.classList.toggle('hidden', enabled);
  document.getElementById('tx-category-wallet').classList.toggle('split-mode', enabled);
  document.getElementById('tx-amount-label').textContent = enabled ? 'Tổng tiền giao dịch (VNĐ)' : 'Số tiền (VNĐ)';
}

function toggleSplitPayment(enabled) {
  const select = document.getElementById('tx-wallet');
  const rows = document.getElementById('tx-payments');
  setSplitVisibility(enabled);
  if (enabled && !rows.children.length) {
    addPaymentRow({ walletId: select.value, amount: '' });
    addPaymentRow();
  }
  updateSplitSummary();
}

function addPaymentRow(payment = {}) {
  const row = document.createElement('div');
  row.className = 'payment-row';
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Ví của phần tiền');
  populateWalletSelect(payment.walletId, select);
  const input = document.createElement('input');
  input.type = 'number'; input.min = '1'; input.step = '1'; input.inputMode = 'numeric';
  input.placeholder = 'Số tiền'; input.setAttribute('aria-label', 'Số tiền của ví');
  input.value = payment.amount ?? '';
  const remove = document.createElement('button');
  remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', 'Xóa phần tiền');
  remove.onclick = () => { row.remove(); updateSplitSummary(); };
  input.oninput = updateSplitSummary;
  select.onchange = updateSplitSummary;
  row.append(select, input, remove);
  document.getElementById('tx-payments').append(row);
  updateSplitSummary();
}

function readPaymentRows() {
  return Array.from(document.querySelectorAll('#tx-payments .payment-row'), row => ({
    walletId: row.querySelector('select').value,
    amount: Number(row.querySelector('input').value)
  }));
}

function updateSplitSummary() {
  const amount = Number(document.getElementById('tx-amount').value);
  const allocated = readPaymentRows().reduce((sum, payment) => sum + payment.amount, 0);
  const remainder = amount - allocated;
  const summary = document.getElementById('split-summary');
  const money = n => (Number(n) || 0).toLocaleString('vi-VN') + ' ₫';
  summary.dataset.valid = String(remainder === 0 && amount > 0);
  summary.textContent = `Đã chia ${money(allocated)} / ${money(amount)} · ` +
    (remainder === 0 ? 'Đã khớp tổng tiền' : remainder > 0 ? `Còn thiếu ${money(remainder)}` : `Đang vượt ${money(-remainder)}`);
}

function fillPaymentRemainder() {
  const rows = document.querySelectorAll('#tx-payments .payment-row');
  if (!rows.length) return;
  const payments = readPaymentRows();
  const used = payments.slice(0, -1).reduce((sum, payment) => sum + payment.amount, 0);
  rows[rows.length - 1].querySelector('input').value = Math.max(0, Number(document.getElementById('tx-amount').value) - used);
  updateSplitSummary();
}

function readValidPayments(amount) {
  const split = document.getElementById('tx-split-enabled').checked;
  const payments = split ? readPaymentRows() : [{ walletId: document.getElementById('tx-wallet').value, amount }];
  let error;
  if (split && payments.length < 2) error = 'Cần ít nhất hai ví, hoặc tắt chia tiền để dùng một ví.';
  else if (payments.some(payment => !payment.walletId || (appData.cards || []).filter(card => card.id === payment.walletId).length !== 1)) error = 'Vui lòng chọn ví hợp lệ cho từng phần tiền.';
  else if (new Set(payments.map(payment => payment.walletId)).size !== payments.length) error = 'Mỗi ví chỉ chọn một lần. Hãy gộp số tiền của cùng một ví.';
  else if (payments.some(payment => !Number.isSafeInteger(payment.amount) || payment.amount <= 0)) error = 'Số tiền của từng ví phải là số nguyên VNĐ lớn hơn 0.';
  else if (payments.reduce((sum, payment) => sum + payment.amount, 0) !== amount) error = 'Tổng các phần tiền chưa khớp số tiền giao dịch. Vui lòng kiểm tra phần còn thiếu / vượt.';
  if (error) { alert(error); return null; }
  return payments;
}

document.getElementById('tx-amount').addEventListener('input', updateSplitSummary);
