import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { db } from '../../src/firebase/config';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  nome?: string;
  lastLogin?: string;
  isOnline?: boolean;
  photoUri?: string;
}

export interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  users: User[];
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  setUsers: (users: User[]) => void;
  getAllUsers: () => User[];
  getOnlineUsers: () => User[];
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Real-time Firestore listener for 'users' collection
  useEffect(() => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, snapshot => {
        const remote: User[] = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setUsers(remote);
      }, err => {
        console.warn('users onSnapshot error', err);
      });
      return () => unsub();
    } catch (e) {
      // in environments without Firestore available, skip
      console.warn('AdminContext: Firestore listener not initialized', e);
      return;
    }
  }, []);

  const addUser = useCallback(async (user: User) => {
    try {
      // Add user to Firestore; the real-time snapshot will update local state
      await addDoc(collection(db, 'users'), {
        email: user.email,
        nome: user.nome || '',
        isOnline: user.isOnline ?? false,
        photoUri: user.photoUri || null,
        createdAt: new Date()
      });
    } catch (e) {
      console.warn('addUser error', e);
      // fallback local add
      setUsers(prev => {
        const exists = prev.find(u => u.id === user.id);
        if (exists) {
          return prev.map(u => u.id === user.id ? { ...u, ...user } : u);
        }
        return [...prev, user];
      });
    }
  }, []);

  const removeUser = useCallback(async (userId: string) => {
    try {
      // remove from Firestore - snapshot will update local state
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      console.warn('removeUser error', e);
      // fallback local update
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  }, []);

  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', userId), updates as any);
    } catch (e) {
      console.warn('updateUser error', e);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    }
  }, []);

  const getAllUsers = useCallback(() => users, [users]);

  const getOnlineUsers = useCallback(() => users.filter(u => u.isOnline), [users]);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        setIsAdmin,
        users,
        addUser,
        removeUser,
        updateUser,
        setUsers,
        getAllUsers,
        getOnlineUsers,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
