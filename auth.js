// auth.js
// This script handles the login logic for the SK Tech Academy portal using
// Firebase Authentication and Firestore to determine the user's role.

// Ensure that Firebase has been initialized by including firebase-config.js
// before this file in your HTML. See login.html for script order.

document.addEventListener('DOMContentLoaded', function () {
  // Set Firebase auth persistence to local so login persists across sessions
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(error) {
    console.error('Auth persistence error:', error);
  });

  // Attach login handler
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }
});

/**
 * Handles login form submission. Grabs the Register ID and password from the form,
 * constructs a synthetic email address for Firebase auth (RegisterID@sktech.in),
 * signs in using Firebase Authentication, then reads the user's role from
 * Firestore and redirects to the appropriate dashboard.
 */
function handleLogin(event) {
  event.preventDefault();
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');
  const errorEl = document.getElementById('errorMsg');
  if (!usernameEl || !passwordEl || !errorEl) return;

  const registerId = usernameEl.value.trim();
  const password = passwordEl.value;
  errorEl.textContent = '';

  if (!registerId || !password) {
    errorEl.textContent = 'Please enter your Register ID and password.';
    return;
  }

  // Construct synthetic email using Register ID. The domain (sktech.in) must
  // match the one you used when creating users in Firebase. For example,
  // a user with Register ID SK1001 will sign in with SK1001@sktech.in.
  const email = `${registerId}@sktech.in`;

  // Sign in with email and password using Firebase Authentication
  auth.signInWithEmailAndPassword(email, password)
    .then(function (userCredential) {
      // Signed in; fetch user document from Firestore to determine role
      const userId = userCredential.user.uid;
      return db.collection('users').doc(userId).get();
    })
    .then(function (doc) {
      if (!doc.exists) {
        throw new Error('No user record found. Please contact support.');
      }
      const userData = doc.data();
      const role = userData.role;
      // Persist role in localStorage so other pages can check it
      localStorage.setItem('userRole', role);
      // Redirect based on role
      if (role === 'admin') {
        window.location.href = 'admin.html';
      } else if (role === 'candidate') {
        window.location.href = 'candidate.html';
      } else {
        throw new Error('Unknown role. Access denied.');
      }
    })
    .catch(function (error) {
      // Display error message to the user
      errorEl.textContent = error.message;
      console.error('Login error:', error);
    });
}