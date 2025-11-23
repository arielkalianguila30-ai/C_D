import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { ImageSourcePropType } from 'react-native';
import { db } from '../../src/firebase/config';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

export type Company = {
  id: string;
  nome: string;
  endereco: string;
  descricao: string;
  imagem?: ImageSourcePropType;
  telefone?: string;
  horario?: string;
  servicos?: string[];
  latitude?: number;
  longitude?: number;
};

interface CompaniesContextValue {
  companies: Company[];
  getById: (id: string) => Company | undefined;
  removeCompany: (id: string) => void;
  addCompany: (company: Company) => void;
  setCompanies: (companies: Company[]) => void;
}

const CompaniesContext = createContext<CompaniesContextValue | undefined>(undefined);

export const CompaniesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sample dataset — later can be replaced with Firebase fetch
  const initialCompanies: Company[] = useMemo(() => [
    {
      id: '1',
      nome: 'Empresa Tech Solutions',
      endereco: 'Av. 1 de Junho, Luanda',
      descricao: 'Desenvolvimento de software e soluções tecnológicas para empresas.',
      imagem: require('../../assets/images/1.png'),
      telefone: '+244 222 000 111',
      horario: '08:00 - 17:00',
      servicos: ['Software', 'Consultoria', 'Treinamento'],
      latitude: -8.838333,
      longitude: 13.234444,
    },
    {
      id: '2',
      nome: 'Café Maianga',
      endereco: 'Rua Maianga, Luanda',
      descricao: 'Cafeteria e espaço de coworking com internet de alta velocidade.',
      imagem: require('../../assets/images/2.png'),
      telefone: '+244 222 000 222',
      horario: '09:00 - 18:00',
      servicos: ['Café', 'Coworking', 'Internet'],
      latitude: -8.843333,
      longitude: 13.235000,
    },
    {
      id: '3',
      nome: 'Restaurante Mar Azul',
      endereco: 'Av. Marginal, Benguela',
      descricao: 'Especializado em frutos do mar e pratos tradicionais angolanos.',
      imagem: require('../../assets/images/3.png'),
      telefone: '+244 322 123 456',
      horario: '07:00 - 22:00',
      servicos: ['Restaurante', 'Eventos', 'Delivery'],
      latitude: -12.576111,
      longitude: 13.405556,
    },
    // add more sample entries programmatically to demonstrate dynamic blocks
    ...Array.from({ length: 8 }).map((_, i) => ({
      id: String(4 + i),
      nome: `Empresa ${i + 4}`,
      endereco: `Endereço ${i + 4}, Cidade`,
      descricao: `Empresa especializada em serviços profissionais.`,
      imagem: require('../../assets/images/1.png'),
      telefone: `+244 900 000 ${i + 4}`,
      horario: '08:00 - 17:00',
      servicos: ['Consultoria', 'Serviços'],
      latitude: -8.8 + i * 0.01,
      longitude: 13.2 + i * 0.01,
    }))
  ], []);

  const [companies, setCompaniesState] = useState<Company[]>(initialCompanies);

  // Real-time Firestore listener for 'businesses' collection
  useEffect(() => {
    try {
      const q = query(collection(db, 'businesses'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, snapshot => {
        const remote: Company[] = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        // Only update if we actually received data; otherwise keep the initial companies
        if (remote.length > 0) {
          setCompaniesState(remote);
        }
      }, err => {
        console.warn('companies onSnapshot error', err);
      });
      return () => unsub();
    } catch (e) {
      // in environments without Firestore available, skip
      console.warn('CompaniesContext: Firestore listener not initialized', e);
      return;
    }
  }, []);

  const getById = useCallback((id: string) => companies.find(c => c.id === id), [companies]);

  const removeCompany = useCallback(async (id: string) => {
    try {
      // remove from Firestore - snapshot will update local state
      await deleteDoc(doc(db, 'businesses', id));
    } catch (e) {
      console.warn('removeCompany error', e);
      // fallback local update
      setCompaniesState(prev => prev.filter(c => c.id !== id));
    }
  }, []);

  const addCompany = useCallback(async (company: Company) => {
    try {
      // Add company to Firestore; the real-time snapshot will update local state
      await addDoc(collection(db, 'businesses'), {
        nome: company.nome,
        endereco: company.endereco,
        descricao: company.descricao,
        imagem: (company as any).imagem || null,
        telefone: company.telefone || null,
        horario: company.horario || null,
        servicos: company.servicos || [],
        latitude: company.latitude || null,
        longitude: company.longitude || null,
        createdAt: new Date()
      });
    } catch (e) {
      console.warn('addCompany error', e);
      // fallback local add
      setCompaniesState(prev => {
        const exists = prev.find(c => c.id === company.id);
        if (exists) return prev;
        return [...prev, company];
      });
    }
  }, []);

  const updateCompany = useCallback(async (id: string, updates: Partial<Company>) => {
    try {
      await updateDoc(doc(db, 'businesses', id), updates as any);
    } catch (e) {
      console.warn('updateCompany error', e);
      setCompaniesState(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  }, []);

  const setCompanies = useCallback((newCompanies: Company[]) => {
    setCompaniesState(newCompanies);
  }, []);

  return (
    <CompaniesContext.Provider value={{ companies, getById, removeCompany, addCompany, setCompanies }}>
      {children}
    </CompaniesContext.Provider>
  );
};

export function useCompanies() {
  const ctx = useContext(CompaniesContext);
  if (!ctx) throw new Error('useCompanies must be used within CompaniesProvider');
  return ctx;
}

export default CompaniesContext;
