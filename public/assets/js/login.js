 document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    fetch('http://localhost:5000/login', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'same-origin'
    })
    .then(response => {
      if (response.status === 200) {

          return response.json();
      } else {
          alert('Login failed');
      }
      })
      .then(data => {
          if (data.redirectUrl) {
              window.location.href = data.redirectUrl;  // Redirect to the page
          }
      })
      .catch(error => {
          alert('Login failed: ' + error.message);  // Handle error
      });
});
