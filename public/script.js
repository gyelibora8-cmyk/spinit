const API_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

// Render App
function renderApp() {
  const app = document.getElementById('app');
  
  if (!authToken) {
    renderAuthPage();
  } else {
    renderDashboard();
  }
}

// Auth Page
function renderAuthPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header>
      <div class="container">
        <nav>
          <div class="logo">SPINIT</div>
        </nav>
      </div>
    </header>
    <div class="container">
      <div style="max-width: 400px; margin: 50px auto;">
        <div class="card">
          <h2>Login / Register</h2>
          <div id="auth-tabs" style="margin: 20px 0;">
            <button onclick="switchTab('login')" class="btn btn-primary" style="margin-right: 10px;">Login</button>
            <button onclick="switchTab('register')" class="btn btn-secondary">Register</button>
          </div>
          <form id="auth-form" onsubmit="handleAuth(event)">
            <div id="login-form">
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="email" required>
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" id="password" required>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
            </div>
            <div id="register-form" style="display: none;">
              <div class="form-group">
                <label>Username</label>
                <input type="text" id="username" required>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="email" required>
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" id="password" required>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
            </div>
          </form>
          <div id="auth-message" style="margin-top: 15px;"></div>
        </div>
      </div>
    </div>
  `;
}

// Dashboard Page
function renderDashboard() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header>
      <div class="container">
        <nav>
          <div class="logo">SPINIT</div>
          <ul class="nav-links">
            <li><a href="#" onclick="showSection('games')">Games</a></li>
            <li><a href="#" onclick="showSection('pricing')">Get Code</a></li>
            <li><a href="#" onclick="showSection('profile')">Profile</a></li>
            <li><a href="#" onclick="logout()" class="btn btn-primary">Logout</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <div class="container">
      <div id="games" class="section">
        <h1>Available Games</h1>
        <div class="games-grid" id="games-list"></div>
      </div>
      <div id="pricing" class="section" style="display: none;">
        <h1>Get Access Code</h1>
        <div class="pricing-grid" id="pricing-list"></div>
      </div>
      <div id="profile" class="section" style="display: none;">
        <h1>My Profile</h1>
        <div id="profile-content"></div>
      </div>
    </div>
    <div id="code-modal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Enter Access Code</h2>
          <span class="close" onclick="closeCodeModal()">&times;</span>
        </div>
        <form onsubmit="verifyCode(event)">
          <div class="form-group">
            <label>Access Code</label>
            <input type="text" id="access-code" placeholder="Enter your access code" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Play Game</button>
        </form>
      </div>
    </div>
  `;
  
  loadGames();
  loadPricingPlans();
  loadProfile();
}

function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  if (tab === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  }
}

async function handleAuth(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const username = document.getElementById('username')?.value;
  const messageDiv = document.getElementById('auth-message');
  
  try {
    const endpoint = username ? '/auth/register' : '/auth/login';
    const body = username ? { email, password, username } : { email, password };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(currentUser));
      renderApp();
    } else {
      messageDiv.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
    }
  } catch (err) {
    messageDiv.innerHTML = `<div class="alert alert-error">Error: ${err.message}</div>`;
  }
}

async function loadGames() {
  try {
    const response = await fetch(`${API_URL}/games`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const games = await response.json();
    
    const gamesList = document.getElementById('games-list');
    gamesList.innerHTML = games.map(game => `
      <div class="game-card">
        <div class="game-card-image">${game.name}</div>
        <div class="game-card-content">
          <h3>${game.name}</h3>
          <p>${game.description || 'Play this game'}</p>
          <button class="btn btn-primary" onclick="openCodeModal('${game._id}')">Try</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading games:', err);
  }
}

function loadPricingPlans() {
  const pricingList = document.getElementById('pricing-list');
  const plans = [
    {
      tier: '3-hours',
      price: '$25',
      duration: '3 Hours',
      features: ['Access for 3 hours', 'One game play']
    },
    {
      tier: '6-hours',
      price: '$50',
      duration: '6 Hours',
      features: ['Access for 6 hours', 'One game play', 'Live Chat Support']
    },
    {
      tier: '24-hours',
      price: '$110',
      duration: '24 Hours',
      features: ['Access for 24 hours', 'One game play', 'Live Chat Support', 'Game Analysis']
    }
  ];
  
  pricingList.innerHTML = plans.map(plan => `
    <div class="pricing-card">
      <h3>${plan.duration}</h3>
      <div class="price">${plan.price}</div>
      <ul class="pricing-features">
        ${plan.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <button class="btn btn-primary" onclick="initiatePayment('${plan.tier}')" style="width: 100%;">Buy Now</button>
    </div>
  `).join('');
}

async function initiatePayment(tier) {
  try {
    const response = await fetch(`${API_URL}/payment/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ tier })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Redirect to Paystack
      window.location.href = data.authorization_url;
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    alert('Payment error: ' + err.message);
  }
}

function openCodeModal(gameId) {
  document.getElementById('code-modal').classList.add('show');
  document.getElementById('code-modal').dataset.gameId = gameId;
}

function closeCodeModal() {
  document.getElementById('code-modal').classList.remove('show');
}

async function verifyCode(event) {
  event.preventDefault();
  const code = document.getElementById('access-code').value;
  const gameId = document.getElementById('code-modal').dataset.gameId;
  
  try {
    const response = await fetch(`${API_URL}/codes/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ code, gameId })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Code verified! Starting game...');
      closeCodeModal();
      // Redirect to game
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function loadProfile() {
  try {
    const response = await fetch(`${API_URL}/user/dashboard`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const data = await response.json();
    const profileContent = document.getElementById('profile-content');
    
    profileContent.innerHTML = `
      <div class="card">
        <h3>Active Codes</h3>
        ${data.activeCodes.length > 0 ? `
          <ul>
            ${data.activeCodes.map(code => `
              <li>${code.code} - Expires: ${new Date(code.expiresAt).toLocaleString()}</li>
            `).join('')}
          </ul>
        ` : '<p>No active codes</p>'}
      </div>
      <div class="card">
        <h3>Game History</h3>
        ${data.gameHistory.length > 0 ? `
          <ul>
            ${data.gameHistory.map(session => `
              <li>${session.gameId.name} - ${new Date(session.playedAt).toLocaleString()}</li>
            `).join('')}
          </ul>
        ` : '<p>No game history</p>'}
      </div>
    `;
  } catch (err) {
    console.error('Error loading profile:', err);
  }
}

function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(section).style.display = 'block';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  authToken = null;
  currentUser = null;
  renderApp();
}

// Initialize
renderApp();
