import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../src/firebase/config';

export interface EmpresaObservada {
  id: string;
  nome: string;
  tipo: string;
  ultimaVisita: string;
  logo: any; // For now using any, ideally this would be a URL string
}

interface WatchedCompaniesContextType {
  watchedCompanies: EmpresaObservada[];
  clearWatchedCompanies: () => Promise<void>;
  addWatchedCompany: (company: EmpresaObservada) => Promise<void>;
  removeWatchedCompany: (companyId: string) => Promise<void>;
}

const WatchedCompaniesContext = createContext<WatchedCompaniesContextType>({
  watchedCompanies: [],
  clearWatchedCompanies: async () => {},
  addWatchedCompany: async () => {},
  removeWatchedCompany: async () => {},
});

export function useWatchedCompanies() {
  return useContext(WatchedCompaniesContext);
}

export function WatchedCompaniesProvider({ children }: { children: React.ReactNode }) {
  const [watchedCompanies, setWatchedCompanies] = useState<EmpresaObservada[]>([]);

  // Reset watched companies when user logs out
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setWatchedCompanies([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const clearWatchedCompanies = async () => {
    setWatchedCompanies([]);
  };

  const addWatchedCompany = async (company: EmpresaObservada) => {
    setWatchedCompanies(prev => [...prev, company]);
  };

  const removeWatchedCompany = async (companyId: string) => {
    setWatchedCompanies(prev => prev.filter(company => company.id !== companyId));
  };

  return (
    <WatchedCompaniesContext.Provider value={{
      watchedCompanies,
      clearWatchedCompanies,
      addWatchedCompany,
      removeWatchedCompany,
    }}>
      {children}
    </WatchedCompaniesContext.Provider>
  );
}