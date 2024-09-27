document.addEventListener('DOMContentLoaded', () => {
    // Login form validation
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            let valid = true;

            // Username validation
            if (username.length < 3) {
                document.getElementById('username-error').textContent = 'Username must be at least 3 characters';
                valid = false;
            } else {
                document.getElementById('username-error').textContent = '';
            }

            // Password validation
            if (password.length < 6) {
                document.getElementById('password-error').textContent = 'Password must be at least 6 characters';
                valid = false;
            } else {
                document.getElementById('password-error').textContent = '';
            }

            if (!valid) {
                e.preventDefault(); 
            }
        });
    }

    // Register form validation
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            let valid = true;

            // Username length validation
            if (username.length < 3) {
                document.getElementById('username-error').textContent = 'Username must be at least 3 characters';
                valid = false;
            } else {
                document.getElementById('username-error').textContent = '';
            }

            // Passwords matching validation
            if (password !== confirmPassword) {
                document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
                valid = false;
            } else {
                document.getElementById('confirm-password-error').textContent = '';
            }

            // Password length validation
            if (password.length < 6) {
                document.getElementById('password-error').textContent = 'Password must be at least 6 characters';
                valid = false;
            } else {
                document.getElementById('password-error').textContent = '';
            }

            if (!valid) {
                e.preventDefault(); 
            }
        });
    }
});
