import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Generate a random ID for mock users
const generateId = () => Math.random().toString(36).substr(2, 9);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from local storage on load
  useEffect(() => {
    const savedUser = localStorage.getItem('serene_mock_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Seed default doctor account if not present
    const existingUsersStr = localStorage.getItem('serene_mock_db_users') || '[]';
    const users = JSON.parse(existingUsersStr);
    if (!users.find(u => u.email === 'doctor@nexus.ai')) {
      users.push({
        uid: 'doctor-default-001',
        email: 'doctor@nexus.ai',
        password: 'Doctor@123',
        displayName: 'Dr. Rahul Mehta',
        role: 'doctor',
        specialty: 'General Physician',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('serene_mock_db_users', JSON.stringify(users));
    }

    setLoading(false);
  }, []);

  // Helper to save user
  const saveUserAndLogin = (userObj) => {
    localStorage.setItem('serene_mock_user', JSON.stringify(userObj));
    setCurrentUser(userObj);
    return userObj;
  };

  // Sign Up with Email
  async function signup(email, password, name) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    
    // Check if user already exists in our mock "database" (just keeping it simple for the demo)
    const existingUsersStr = localStorage.getItem('serene_mock_db_users') || '[]';
    const users = JSON.parse(existingUsersStr);
    
    if (users.find(u => u.email === email)) {
      throw new Error("Email already in use");
    }

    const newUser = {
      uid: generateId(),
      email,
      password, // Store password for mock login/reset
      displayName: name,
      role: 'patient',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('serene_mock_db_users', JSON.stringify(users));
    
    return saveUserAndLogin(newUser);
  }

  // Login with Email
  async function login(email, password) {
    await new Promise(r => setTimeout(r, 800));
    
    const existingUsersStr = localStorage.getItem('serene_mock_db_users') || '[]';
    const users = JSON.parse(existingUsersStr);
    
    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) { // Check password
      throw new Error("Invalid email or password");
    }
    return saveUserAndLogin(user);
  }

  // Google Login
  async function loginWithGoogle() {
    await new Promise(r => setTimeout(r, 800));
    return saveUserAndLogin({
      uid: generateId(),
      email: 'demo.google@example.com',
      displayName: 'Google User',
    });
  }

  // Apple Login
  async function loginWithApple() {
    await new Promise(r => setTimeout(r, 800));
    return saveUserAndLogin({
      uid: generateId(),
      email: 'demo.apple@example.com',
      displayName: 'Apple User',
    });
  }

  // Logout
  async function logout() {
    await new Promise(r => setTimeout(r, 300));
    localStorage.removeItem('serene_mock_user');
    setCurrentUser(null);
  }

  // Reset Password — stores token in DB, returns {resetToken, email}
  async function resetPassword(email) {
    await new Promise(r => setTimeout(r, 900));
    const existingUsersStr = localStorage.getItem('serene_mock_db_users') || '[]';
    const users = JSON.parse(existingUsersStr);
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
      throw new Error("No account found with that email address.");
    }
    const resetToken = generateId();
    users[userIndex].resetToken = resetToken;
    localStorage.setItem('serene_mock_db_users', JSON.stringify(users));
    // In a real app this token would be emailed. For mock, we return it directly.
    return { resetToken, email };
  }

  // Update Password via reset token (email, resetToken, newPassword)
  async function updateUserPassword(email, resetToken, newPassword) {
    await new Promise(r => setTimeout(r, 800));
    const existingUsersStr = localStorage.getItem('serene_mock_db_users') || '[]';
    let users = JSON.parse(existingUsersStr);
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) throw new Error("User not found.");
    if (users[userIndex].resetToken !== resetToken) throw new Error("Invalid or expired reset code.");
    users[userIndex].password = newPassword;
    delete users[userIndex].resetToken;
    localStorage.setItem('serene_mock_db_users', JSON.stringify(users));
  }

  // Update User Profile (e.g., display name, email)
  async function updateUserProfile(profileUpdates) {
    await new Promise(r => setTimeout(r, 800)); // Simulate network delay

    if (!currentUser) {
      throw new Error("No user is currently logged in.");
    }

    const existingUsersStr = localStorage.getItem('serene_mock_db_users') || '[]';
    let users = JSON.parse(existingUsersStr);

    const userIndex = users.findIndex(u => u.uid === currentUser.uid);
    if (userIndex === -1) {
      throw new Error("User not found in mock database.");
    }

    // Apply updates
    const updatedUserInDb = { ...users[userIndex], ...profileUpdates };

    // Check if email is being updated and if it's already in use by another user
    if (profileUpdates.email && profileUpdates.email !== currentUser.email) {
      const emailExists = users.some(u => u.email === profileUpdates.email && u.uid !== currentUser.uid);
      if (emailExists) {
        throw new Error("Email already in use by another account.");
      }
    }

    users[userIndex] = updatedUserInDb;
    localStorage.setItem('serene_mock_db_users', JSON.stringify(users));

    // Update the current user in session and local storage
    saveUserAndLogin(updatedUserInDb);

    return updatedUserInDb;
  }


  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    loginWithApple,
    logout,
    resetPassword,
    updateUserPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
