import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth, db, googleProvider,
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile,
  doc, setDoc, getDoc,
  isFirebaseConfigured,
} from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured) {
      // Firebase handles session persistence automatically across page refreshes
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
            const data = userDoc.exists() ? userDoc.data() : {};
            setUser({
              id: fbUser.uid,
              name: fbUser.displayName || data.name || 'User',
              email: fbUser.email,
              role: data.role || 'farmer',
              provider: fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
              verified: fbUser.emailVerified,
            });
          } catch {
            setUser({
              id: fbUser.uid,
              name: fbUser.displayName || 'User',
              email: fbUser.email,
              role: 'farmer',
              verified: true,
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // No Firebase config — load mock user from localStorage
      try {
        const stored = localStorage.getItem('voneng_user');
        if (stored) setUser(JSON.parse(stored));
      } catch {}
      setLoading(false);
    }
  }, []);

  // Persist mock user to localStorage (only when Firebase is not configured)
  useEffect(() => {
    if (!isFirebaseConfigured) {
      if (user) localStorage.setItem('voneng_user', JSON.stringify(user));
      else localStorage.removeItem('voneng_user');
    }
  }, [user]);

  async function signup({ name, email, password, role }) {
    if (isFirebaseConfigured) {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        const userData = {
          id: result.user.uid,
          name,
          email,
          role: role || 'farmer',
          provider: 'email',
          createdAt: new Date().toISOString(),
          verified: true,
        };
        await setDoc(doc(db, 'users', result.user.uid), userData);
        // onAuthStateChanged will automatically set user state
        return { success: true, role: userData.role };
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          return { success: false, error: 'An account with this email already exists.' };
        }
        if (error.code === 'auth/weak-password') {
          return { success: false, error: 'Password must be at least 6 characters.' };
        }
        return { success: false, error: error.message };
      }
    } else {
      // Mock fallback when Firebase is not configured
      const users = JSON.parse(localStorage.getItem('voneng_users') || '[]');
      if (users.find(u => u.email === email)) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // plaintext only in mock/dev mode
        role: role || 'farmer',
        createdAt: new Date().toISOString(),
        verified: true,
      };
      users.push(newUser);
      localStorage.setItem('voneng_users', JSON.stringify(users));
      const { password: _, ...safeUser } = newUser;
      setUser(safeUser);
      return { success: true, role: safeUser.role };
    }
  }

  async function login(email, password) {
    if (isFirebaseConfigured) {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        // Fetch role from Firestore to know where to redirect
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        const role = userDoc.exists() ? userDoc.data().role : 'farmer';
        // onAuthStateChanged will set the full user state
        return { success: true, role };
      } catch (error) {
        const invalidCodes = ['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential', 'auth/invalid-email'];
        if (invalidCodes.includes(error.code)) {
          return { success: false, error: 'Invalid email or password.' };
        }
        return { success: false, error: error.message };
      }
    } else {
      // Mock fallback
      const users = JSON.parse(localStorage.getItem('voneng_users') || '[]');
      const found = users.find(u => u.email === email && u.password === password);
      if (!found) return { success: false, error: 'Invalid email or password.' };
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      return { success: true, role: safeUser.role };
    }
  }

  async function loginWithGoogle(role = 'farmer') {
    if (isFirebaseConfigured) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const userDocRef = doc(db, 'users', fbUser.uid);
        const existing = await getDoc(userDocRef);
        let finalRole = role;
        if (!existing.exists()) {
          // New Google user — save with selected role
          await setDoc(userDocRef, {
            id: fbUser.uid,
            name: fbUser.displayName || 'User',
            email: fbUser.email,
            role,
            provider: 'google',
            createdAt: new Date().toISOString(),
            verified: true,
          });
        } else {
          // Returning Google user — use their stored role
          finalRole = existing.data().role || role;
        }
        // onAuthStateChanged will set user state
        return { success: true, role: finalRole };
      } catch (error) {
        if (error.code === 'auth/popup-closed-by-user') {
          return { success: false, error: 'Sign-in cancelled.' };
        }
        return { success: false, error: error.message };
      }
    } else {
      // Mock fallback
      console.warn("Firebase not configured. Using mock Google account.");
      const mockGoogleUser = {
        id: 'g-mock-' + Date.now(),
        name: 'Demo Google User',
        email: 'mock-google@gmail.com',
        role,
        provider: 'google',
        createdAt: new Date().toISOString(),
        verified: true,
      };
      const users = JSON.parse(localStorage.getItem('voneng_users') || '[]');
      if (!users.find(u => u.email === mockGoogleUser.email)) {
        users.push(mockGoogleUser);
        localStorage.setItem('voneng_users', JSON.stringify(users));
      }
      setUser(mockGoogleUser);
      return { success: true, role, mock: true };
    }
  }

  async function logout() {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
