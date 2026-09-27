import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  testConnection,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveWorkflowToCloud: (workflow: any) => Promise<void>;
  saveChatMessageToCloud: (message: any) => Promise<void>;
  isCloudConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  useEffect(() => {
    // Validate Firestore connection on boot as mandated
    testConnection()
      .then(() => setIsCloudConnected(true))
      .catch(() => setIsCloudConnected(false));

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync user profile to Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          await setDoc(
            userDocRef,
            {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Automation Specialist',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Unable to sync user document to Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const saveWorkflowToCloud = async (workflow: any) => {
    if (!user) return;
    const path = `users/${user.uid}/workflows/${workflow.id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'workflows', workflow.id), {
        id: workflow.id,
        ownerId: user.uid,
        title: workflow.title,
        intent: workflow.intent || '',
        category: workflow.category || 'General',
        status: workflow.status || 'discovered',
        similarityScore: workflow.similarityScore || 0.95,
        repetitionCount: workflow.repetitionCount || 1,
        stepsCount: workflow.steps?.length || 0,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const saveChatMessageToCloud = async (message: any) => {
    if (!user) return;
    const msgId = message.id || `msg-${Date.now()}`;
    const path = `users/${user.uid}/messages/${msgId}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'messages', msgId), {
        id: msgId,
        userId: user.uid,
        role: message.role,
        content: message.content,
        modelUsed: message.modelUsed || 'gemini-3.5-flash',
        timestamp: Date.now(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        logout,
        saveWorkflowToCloud,
        saveChatMessageToCloud,
        isCloudConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
