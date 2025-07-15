// Funções utilitárias para o token JWT
function setToken(token) { localStorage.setItem('token', token); }
function getToken() { return localStorage.getItem('token'); }
function clearToken() { localStorage.removeItem('token'); }
function redirectIfNotLogged() {
  if (!getToken() && window.location.pathname.endsWith('dashboard.html')) {
    window.location.href = 'login.html';
  }
}

// Login
if (document.getElementById('login-form')) {
  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        window.location.href = 'dashboard.html';
      } else {
        document.getElementById('login-error').textContent = data.error || 'Erro ao logar.';
      }
    } catch {
      document.getElementById('login-error').textContent = 'Erro de conexão.';
    }
  };
}

// Cadastro
if (document.getElementById('register-form')) {
  document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const password2 = document.getElementById('register-password2').value;
    const cnpj = document.getElementById('register-cnpj').value;
    const api_token = document.getElementById('register-token').value;
    if (password !== password2) {
      document.getElementById('register-error').textContent = 'Senhas não coincidem.';
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, api_token, cnpj })
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = 'login.html';
      } else {
        document.getElementById('register-error').textContent = data.error || 'Erro ao cadastrar.';
      }
    } catch {
      document.getElementById('register-error').textContent = 'Erro de conexão.';
    }
  };
}

// Dashboard (PIX)
if (document.getElementById('payment-form')) {
  redirectIfNotLogged();

  // Logout
  document.getElementById('logout-btn').onclick = () => {
    clearToken();
    window.location.href = 'login.html';
  };

  // Gerar PIX
  document.getElementById('payment-form').onsubmit = async (e) => {
    e.preventDefault();
    const value = parseFloat(document.getElementById('payment-value').value).toFixed(2);
    const description = document.getElementById('payment-description').value;
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ENVIO CORRETO DO TOKEN JWT:
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ value, description })
      });
      const data = await res.json();
      if (res.ok) {
        document.getElementById('result-section').classList.remove('hidden');
        document.querySelector('.result-value').textContent = data.value;
        document.querySelector('.result-description').textContent = data.description || '—';
        document.querySelector('.result-id').textContent = data.pix_id;
        document.getElementById('pix-code').value = data.pix_code;
      } else {
        alert(data.error || 'Erro ao gerar PIX');
      }
    } catch {
      alert('Erro de conexão.');
    }
  };

  // Copiar código PIX
  document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(document.getElementById('pix-code').value);
    document.getElementById('copy-btn').textContent = 'Copiado!';
    setTimeout(() => document.getElementById('copy-btn').textContent = 'Copiar', 1500);
  };

  // Novo pagamento
  document.getElementById('new-payment-btn').onclick = () => {
    document.getElementById('result-section').classList.add('hidden');
    document.getElementById('payment-form').reset();
  };

  // Histórico
  async function loadHistory() {
    try {
      const res = await fetch('/api/payments/history', {
        headers: {
          // ENVIO CORRETO DO TOKEN JWT:
          'Authorization': `Bearer ${getToken()}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        data.forEach(item => {
          const li = document.createElement('li');
          li.textContent = `[${item.created_at}] R$ ${item.value} - ${item.status}`;
          list.appendChild(li);
        });
      }
    } catch {
      // Silencia erro de histórico
    }
  }
  loadHistory();
}
