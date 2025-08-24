"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Molecule {
  id: string;
  moleculeName: string;
  smilesStructure: string;
  molecularWeight: number;
  categoryUsage: string;
  dateAdded: string;
}

interface MoleculeContextType {
  molecules: Molecule[];
  addMolecule: (molecule: Omit<Molecule, 'id' | 'dateAdded'>) => void;
  removeMolecule: (id: string) => void;
  searchMolecules: (query: string) => Molecule[];
}

const MoleculeContext = createContext<MoleculeContextType | undefined>(undefined);

// Default molecules
const defaultMolecules: Molecule[] = [
  {
    id: "1",
    moleculeName: "Aspirin",
    smilesStructure: "CC(=O)OC1=CC=CC=C1C(O)=O",
    molecularWeight: 180.16,
    categoryUsage: "Pain reliever/NSAID",
    dateAdded: "2023-01-01",
  },
  {
    id: "2",
    moleculeName: "Caffeine",
    smilesStructure: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
    molecularWeight: 194.19,
    categoryUsage: "Stimulant",
    dateAdded: "2023-01-01",
  },
  {
    id: "3",
    moleculeName: "Benzene",
    smilesStructure: "C1=CC=CC=C1",
    molecularWeight: 78.11,
    categoryUsage: "Industrial solvent",
    dateAdded: "2023-01-01",
  },
  {
    id: "4",
    moleculeName: "Glucose",
    smilesStructure: "C(C1C(C(C(C(O1)O)O)O)O)O",
    molecularWeight: 180.16,
    categoryUsage: "Energy source/sugar",
    dateAdded: "2023-01-01",
  },
  {
    id: "5",
    moleculeName: "Penicillin",
    smilesStructure: "CC1(C2C(C(C(O2)N1C(=O)COC(=O)C)C)S)C=O",
    molecularWeight: 334.39,
    categoryUsage: "Antibiotic",
    dateAdded: "2023-01-01",
  },
  {
    id: "6",
    moleculeName: "Ibuprofen",
    smilesStructure: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O",
    molecularWeight: 206.28,
    categoryUsage: "Pain reliever/NSAID",
    dateAdded: "2023-01-01",
  },
  {
    id: "7",
    moleculeName: "Acetaminophen",
    smilesStructure: "CC(=O)NC1=CC=C(O)C=C1",
    molecularWeight: 151.16,
    categoryUsage: "Pain reliever/Antipyretic",
    dateAdded: "2023-01-01",
  },
  {
    id: "8",
    moleculeName: "Morphine",
    smilesStructure: "CN1CCC23C4C1CC(C2C3O)OC5=CC=CC=C45",
    molecularWeight: 285.34,
    categoryUsage: "Pain reliever/Opiate",
    dateAdded: "2023-01-01",
  },
  {
    id: "9",
    moleculeName: "Nicotine",
    smilesStructure: "CN1CCCC1C2=CN=CC=C2",
    molecularWeight: 162.23,
    categoryUsage: "Stimulant",
    dateAdded: "2023-01-01",
  },
  {
    id: "10",
    moleculeName: "Ethanol",
    smilesStructure: "CCO",
    molecularWeight: 46.07,
    categoryUsage: "Alcohol/Disinfectant",
    dateAdded: "2023-01-01",
  },
];

export const MoleculeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [molecules, setMolecules] = useState<Molecule[]>([]);

  // Load molecules from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('molecules');
    if (stored) {
      try {
        const parsedMolecules = JSON.parse(stored);
        setMolecules(parsedMolecules);
      } catch (error) {
        console.error('Error parsing stored molecules:', error);
        setMolecules(defaultMolecules);
      }
    } else {
      setMolecules(defaultMolecules);
    }
  }, []);

  // Save molecules to localStorage whenever molecules change
  useEffect(() => {
    if (molecules.length > 0) {
      localStorage.setItem('molecules', JSON.stringify(molecules));
    }
  }, [molecules]);

  const addMolecule = (newMolecule: Omit<Molecule, 'id' | 'dateAdded'>) => {
    const molecule: Molecule = {
      ...newMolecule,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setMolecules(prev => [...prev, molecule]);
  };

  const removeMolecule = (id: string) => {
    setMolecules(prev => prev.filter(molecule => molecule.id !== id));
  };

  const searchMolecules = (query: string): Molecule[] => {
    if (!query.trim()) return molecules;
    
    const lowercaseQuery = query.toLowerCase();
    return molecules.filter(molecule =>
      molecule.moleculeName.toLowerCase().includes(lowercaseQuery) ||
      molecule.categoryUsage.toLowerCase().includes(lowercaseQuery) ||
      molecule.smilesStructure.toLowerCase().includes(lowercaseQuery)
    );
  };

  return (
    <MoleculeContext.Provider value={{
      molecules,
      addMolecule,
      removeMolecule,
      searchMolecules,
    }}>
      {children}
    </MoleculeContext.Provider>
  );
};

export const useMolecules = (): MoleculeContextType => {
  const context = useContext(MoleculeContext);
  if (!context) {
    throw new Error('useMolecules must be used within a MoleculeProvider');
  }
  return context;
};
