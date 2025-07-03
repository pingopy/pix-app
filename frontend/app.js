// Frontend logic for PaggPix Demo

(function () {
  const form = document.getElementById('payment-form');
  const valueInput = document.getElementById('payment-value');
  const descInput = document.getElementById('payment-description');
  const generateBtn = document.getElementById('generate-btn');

  const resultSection = document.getElementById('result-section');
  const resultValue = document.querySelector('.result-value');
  const resultDesc = document.querySelector('.result-description');
  const resultId = document.querySelector('.result-id');
  const statusBadge = document.getElementById('status-badge');
  const pixCodeTextarea = document.getElementById('pix-code');

  const copyBtn = document.getElementById('copy-btn');
  const checkStatusBtn = document.getElementById('check-status-btn');
  const newPaymentBtn = document.getElementById('new-payment-btn');

  const toastContainer = document.getElementById('toast-container');

  let currentPaymentId = null;

  // Agora só precisa da URL do backend:
  const BASE_URL = 'https://app-pix-r35l.onrender.com/api';

  /* Utilidades */
  function showToast(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
  }

  function setStatus(statusStr) {
    const status = String(statusStr).toUpperCase();
    statusBadge.textContent = status;

    // Reset classes
    statusBadge.classList.remove(
      'status--success',
      'status--error',
      'status--warning',
      'status--info'
    );

    switch (status) {
      case 'COMPLETED':
      case 'PAID':
      case 'CONCLUIDO':
        statusBadge.classList.add('status--success');
        break;
      case 'PENDING':
      case 'AGUARDANDO':
      case 'WAITING':
        statusBadge.classList.add('status--info');
        break;
      case 'EXPIRED':
        statusBadge.classList.add('status--warning');
        break;
      default:
        statusBadge.classList.add('status--error');
    }
  }

  function toggleButtonLoading(btn, isLoading) {
    if (isLoading) {
      btn.classList.add('loading');
      btn.disabled = true;
    } else {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  /* Event Handlers */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const value = parseFloat(valueInput.value.replace(',', '.'));
    if (Number.isNaN(value) || value <= 0) {
      showToast('Digite um valor válido.', 'error');
      return;
    }

    const description = descInput.value.trim() || `Pagamento de R$ ${value.toFixed(2)}`;

    toggleButtonLoading(generateBtn, true);

    try {
      const response = await fetch(`${BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value: value.toFixed(2),
          description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao gerar pagamento');
      }

      const data = await response.json();

      // Populate result UI
      resultValue.textContent = parseFloat(data.value).toFixed(2);
      resultDesc.textContent = data.description || '—';
      resultId.textContent = data.pix_id || data.id || '—';
      pixCodeTextarea.value = data.pix_code || data.code || '';
      setStatus(data.status || 'PENDING');

      currentPaymentId = data.pix_id || data.id;

      // Show result section
      resultSection.classList.remove('hidden');
      form.classList.add('hidden');
      
      showToast('Pagamento PIX gerado com sucesso!', 'success');
    } catch (err) {
      const message = err?.message || 'Erro ao gerar pagamento.';
      showToast(message, 'error');
    } finally {
      toggleButtonLoading(generateBtn, false);
    }
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pixCodeTextarea.value);
      showToast('Código PIX copiado!', 'success');
    } catch {
      // Fallback for older browsers
      pixCodeTextarea.select();
      document.execCommand('copy');
      showToast('Código PIX copiado!', 'success');
    }
  });

  checkStatusBtn.addEventListener('click', async () => {
    if (!currentPaymentId) return;
    toggleButtonLoading(checkStatusBtn, true);

    try {
      const response = await fetch(`${BASE_URL}/payments/${currentPaymentId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao consultar status');
      }
      
      const data = await response.json();
      setStatus(data.status);
      showToast('Status atualizado.', 'info');
    } catch (err) {
      const message = err?.message || 'Erro ao consultar status.';
      showToast(message, 'error');
    } finally {
      toggleButtonLoading(checkStatusBtn, false);
    }
  });

  newPaymentBtn.addEventListener('click', () => {
    // Reset form & UI
    valueInput.value = '';
    descInput.value = '';
    form.classList.remove('hidden');
    resultSection.classList.add('hidden');
    currentPaymentId = null;
    valueInput.focus();
  });

  // Focus on value input when page loads
  valueInput.focus();
})();
