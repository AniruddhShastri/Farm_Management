import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider, signInWithPopup, doc, setDoc, isFirebaseConfigured } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('voneng_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [pendingOTP, setPendingOTP] = useState(null);

  // Persist user to localStorage independently for fast boot
  useEffect(() => {
    if (user) {
      localStorage.setItem('voneng_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('voneng_user');
    }
  }, [user]);

  // Simulate sending OTP — in production this calls AbstractAPI + Twilio
  function sendOTP(email) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[VONeng DEV] OTP for ${email}: ${otp}`); // only visible in dev console
    setPendingOTP({ email, otp, expires: Date.now() + 10 * 60 * 1000 }); // 10 min expiry
    return otp; // returned so UI can show it in dev mode
  }

  function verifyOTP(email, enteredOTP) {
    if (!pendingOTP) return { success: false, error: 'No OTP was sent' };
    if (Date.now() > pendingOTP.expires) return { success: false, error: 'OTP expired. Please request a new one.' };
    if (pendingOTP.email !== email) return { success: false, error: 'Email mismatch' };
    if (pendingOTP.otp !== enteredOTP.trim()) return { success: false, error: 'Incorrect OTP. Please try again.' };
    setPendingOTP(null);
    return { success: true };
  }

  // --- STANDARD EMAIL APP FALLBACK ---
  function signup({ name, email, password, role }) {
    const users = JSON.parse(localStorage.getItem('voneng_users') || '[]');
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // NOTE: in production, use bcrypt hashing server-side
      role: role || 'farmer',
      createdAt: new Date().toISOString(),
      verified: true
    };
    users.push(newUser);
    localStorage.setItem('voneng_users', JSON.stringify(users));
    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    return { success: true };
  }

  function login(email, password) {
    const users = JSON.parse(localStorage.getItem('voneng_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, error: 'Invalid email or password.' };
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    return { success: true };
  }

  async function loginWithGoogle(role = 'farmer') {
    if (isFirebaseConfigured) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const normalizedUser = {
          id: fbUser.uid,
          name: fbUser.displayName || 'VONeng User',
          email: fbUser.email,
          role: role,
          provider: 'google',
          createdAt: new Date().toISOString(),
          verified: true
        };

        // Write safely to company database (Firestore)
        await setDoc(doc(db, 'users', fbUser.uid), normalizedUser, { merge: true });

        setUser(normalizedUser);
        return { success: true };
      } catch (error) {
        console.error("Google Sign-in Error:", error);
        return { success: false, error: error.message };
      }
    } else {
      // Mock Google Flow if Developer hasn't added .env file
      console.warn("Firebase not configured. Using Mock Google Account.");
      const mockGoogleUser = {
        id: 'g-mock-' + Date.now().toString().slice(-4),
        name: 'Demo Google User',
        email: 'mock-google@gmail.com',
        role: role,
        provider: 'google',
        createdAt: new Date().toISOString(),
        verified: true
      };
      // Save it to pseudo-DB
      const users = JSON.parse(localStorage.getItem('voneng_users') || '[]');
      if (!users.find(u => u.email === mockGoogleUser.email)) {
        users.push(mockGoogleUser);
        localStorage.setItem('voneng_users', JSON.stringify(users));
      }
      setUser(mockGoogleUser);
      return { success: true, mock: true };
    }
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, sendOTP, verifyOTP, signup, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
