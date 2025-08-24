"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import { useState } from "react";
import { Search } from "lucide-react";

interface CompoundData {
  MolecularFormula: string;
  MolecularWeight: number;
  InChIKey: string;
  IUPACName: string;
  XLogP: number;
  ExactMass: number;
  MonoisotopicMass: number;
  TPSA: number;
  Complexity: number;
  Charge: number;
  HBondDonorCount: number;
  HBondAcceptorCount: number;
  RotatableBondCount: number;
  HeavyAtomCount: number;
}

// Helper function to calculate drug-likeness score
const calculateDrugLikenessScore = (data: CompoundData): number => {
  let score = 0;
  if (Number(data.MolecularWeight) <= 500) score++;
  if (Number(data.XLogP) <= 5) score++;
  if (Number(data.HBondDonorCount) <= 5) score++;
  if (Number(data.HBondAcceptorCount) <= 10) score++;
  return score;
};

// Helper function to get bioavailability prediction
const getBioavailabilityPrediction = (data: CompoundData): string => {
  const score = calculateDrugLikenessScore(data);
  if (score === 4) return "High";
  if (score === 3) return "Good";
  if (score === 2) return "Moderate";
  return "Low";
};

// Helper function to get solubility prediction
const getSolubilityPrediction = (xlogp: number): string => {
  if (xlogp < 0) return "Very High";
  if (xlogp <= 1) return "High";
  if (xlogp <= 3) return "Moderate";
  if (xlogp <= 5) return "Low";
  return "Very Low";
};

export default function PubChem() {
  const [compoundName, setCompoundName] = useState("");
  const [compoundData, setCompoundData] = useState<CompoundData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCompoundData = async () => {
    setLoading(true);
    setError("");
    setCompoundData(null);

    try {
      const response = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
          compoundName,
        )}/property/MolecularFormula,MolecularWeight,InChIKey,IUPACName,XLogP,ExactMass,MonoisotopicMass,TPSA,Complexity,Charge,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,HeavyAtomCount/JSON`,
      );

      if (!response.ok) {
        throw new Error("Compound not found");
      }

      const data = await response.json();
              console.log("PubChem API response:", data);

      if (
        data &&
        data.PropertyTable &&
        data.PropertyTable.Properties &&
        data.PropertyTable.Properties.length > 0
      ) {
        const compoundInfo = data.PropertyTable.Properties[0];
        console.log("Compound info:", compoundInfo);
        setCompoundData({
          MolecularFormula: compoundInfo.MolecularFormula,
          MolecularWeight: compoundInfo.MolecularWeight,
          InChIKey: compoundInfo.InChIKey,
          IUPACName: compoundInfo.IUPACName,
          XLogP: compoundInfo.XLogP,
          ExactMass: compoundInfo.ExactMass,
          MonoisotopicMass: compoundInfo.MonoisotopicMass,
          TPSA: compoundInfo.TPSA,
          Complexity: compoundInfo.Complexity,
          Charge: compoundInfo.Charge,
          HBondDonorCount: compoundInfo.HBondDonorCount,
          HBondAcceptorCount: compoundInfo.HBondAcceptorCount,
          RotatableBondCount: compoundInfo.RotatableBondCount,
          HeavyAtomCount: compoundInfo.HeavyAtomCount,
        });
      } else {
        throw new Error("Compound data is not available");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchCompoundData();
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto h-[140dvh] p-0">
        <div className="mb-6 flex flex-col items-center md:flex-row md:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Compound Search{" "}
          </h2>
          <div className="relative mt-4 flex flex-1 md:mt-0 md:justify-end">
            <input
              type="text"
              value={compoundName}
              onChange={(e) => setCompoundName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-gray-300 w-full rounded-lg border bg-white p-3 pl-10 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-96"
              placeholder="Enter a compound name"
            />
            <span className="absolute inset-y-0 right-3 flex items-center">
              <Search className="text-gray-500" />
            </span>
          </div>
        </div>

        {error && <p className="text-red-600 mt-6">{error}</p>}

        {compoundData && (
          <>
            {console.log("Rendering compound data:", compoundData)}
            
            {/* Lipinski's Rule Definition */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">What is Lipinski's Rule of Five?</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Lipinski's Rule of Five is a set of rules used to predict whether a chemical compound will be an orally active drug in humans. 
                A compound should have: <strong>Molecular Weight ≤ 500 Da</strong>, <strong>LogP ≤ 5</strong>, <strong>≤ 5 hydrogen bond donors</strong>, 
                and <strong>≤ 10 hydrogen bond acceptors</strong>. Compounds that meet these criteria are more likely to be absorbed, distributed, 
                metabolized, and excreted effectively in the human body.
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="dark:bg-gray-800  space-y-3 rounded-lg bg-white p-6  shadow-md">
              <h2 className="text-gray-700 mb-4 text-xl text-black  dark:text-white">
                Basic Information
              </h2>
              <p>
                <strong className="text-gray-600 dark:text-gray-300">
                  Molecular Formula:
                </strong>{" "}
                {compoundData.MolecularFormula}
              </p>
              <p>
                <strong className="text-gray-600 dark:text-gray-300">
                  Molecular Weight:
                </strong>{" "}
                {compoundData.MolecularWeight} g/mol
              </p>
              <p>
                <strong className="text-gray-600 dark:text-gray-300">
                  InChIKey:
                </strong>{" "}
                {compoundData.InChIKey}
              </p>
              

              <p>
                <strong className="text-gray-600 dark:text-gray-300">
                  IUPAC Name:
                </strong>{" "}
                {compoundData.IUPACName}
              </p>
            </div>

            <div className="dark:bg-gray-800 space-y-3 rounded-lg bg-white p-6 shadow-md">
              <h2 className="text-gray-700 mb-4 text-xl text-black  dark:text-white">
                Drug-Related Properties
              </h2>
              
              {/* Drug-Likeness Score */}
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">Drug-Likeness Score</h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">{calculateDrugLikenessScore(compoundData)}/4</span>
                  <span className="text-sm text-green-700 dark:text-green-300">Lipinski Rules Passed</span>
                </div>
              </div>
              
              {/* Bioavailability */}
              <p>
                <strong className="text-gray-600 dark:text-gray-300">
                  Predicted Oral Bioavailability:
                </strong>{" "}
                <span className={`px-2 py-1 rounded text-sm ${
                  getBioavailabilityPrediction(compoundData) === 'High' ? 'bg-green-100 text-green-800' :
                  getBioavailabilityPrediction(compoundData) === 'Good' ? 'bg-blue-100 text-blue-800' :
                  getBioavailabilityPrediction(compoundData) === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getBioavailabilityPrediction(compoundData)}
                </span>
              </p>
              
              {/* Solubility */}
              <p>
                <strong className="text-gray-600 dark:text-gray-300">
                  Predicted Water Solubility:
                </strong>{" "}
                <span className={`px-2 py-1 rounded text-sm ${
                  getSolubilityPrediction(Number(compoundData.XLogP)) === 'Very High' || getSolubilityPrediction(Number(compoundData.XLogP)) === 'High' ? 'bg-green-100 text-green-800' :
                  getSolubilityPrediction(Number(compoundData.XLogP)) === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getSolubilityPrediction(Number(compoundData.XLogP))}
                </span>
              </p>
              
              <p>
                <strong className="text-gray-600 dark:text-gray-300">
                  LogP (Lipophilicity):
                </strong>{" "}
                {compoundData.XLogP}
              </p>
              
              <p>
                <strong className="text-gray-600 dark:text-gray-300">
                  Topological Polar Surface Area (TPSA):
                </strong>{" "}
                {compoundData.TPSA} Ų
                <small className="text-gray-500 block">(Ideal: 20-130 Ų for BBB permeability)</small>
              </p>
              
              <p>
                <strong className="text-gray-600 dark:text-gray-300">
                  Molecular Complexity:
                </strong>{" "}
                {compoundData.Complexity}
              </p>
              
              <p>
                <strong className="text-gray-600 dark:text-gray-300">
                  Formal Charge:
                </strong>{" "}
                {compoundData.Charge}
              </p>
            </div>

            <div className="dark:bg-gray-800 space-y-3 rounded-lg bg-white p-6 shadow-md md:col-span-2">
              <h2 className="text-gray-700 mb-4 text-xl text-black  dark:text-white">
                Drug-Like Properties & Molecular Analysis
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <p>
                    <strong className="text-gray-600 dark:text-gray-300">
                      Hydrogen Bond Donors:
                    </strong>{" "}
                    <span className={`px-2 py-1 rounded text-sm ${Number(compoundData.HBondDonorCount) <= 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {compoundData.HBondDonorCount} {Number(compoundData.HBondDonorCount) <= 5 ? '✓' : '⚠'}
                    </span>
                  </p>
                  <p>
                    <strong className="text-gray-600 dark:text-gray-300">
                      Hydrogen Bond Acceptors:
                    </strong>{" "}
                    <span className={`px-2 py-1 rounded text-sm ${Number(compoundData.HBondAcceptorCount) <= 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {compoundData.HBondAcceptorCount} {Number(compoundData.HBondAcceptorCount) <= 10 ? '✓' : '⚠'}
                    </span>
                  </p>
                  <p>
                    <strong className="text-gray-600 dark:text-gray-300">
                      Rotatable Bonds:
                    </strong>{" "}
                    <span className={`px-2 py-1 rounded text-sm ${Number(compoundData.RotatableBondCount) <= 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {compoundData.RotatableBondCount} {Number(compoundData.RotatableBondCount) <= 10 ? '✓' : '⚠'}
                    </span>
                  </p>
                </div>
                <div className="space-y-3">
                  <p>
                    <strong className="text-gray-600 dark:text-gray-300">
                      Heavy Atom Count:
                    </strong>{" "}
                    {compoundData.HeavyAtomCount}
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Lipinski's Rule of Five</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Molecular Weight:</span>
                        <span className={Number(compoundData.MolecularWeight) <= 500 ? 'text-green-600' : 'text-red-600'}>
                          {Number(compoundData.MolecularWeight) <= 500 ? 'Pass' : 'Fail'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>LogP:</span>
                        <span className={Number(compoundData.XLogP) <= 5 ? 'text-green-600' : 'text-red-600'}>
                          {Number(compoundData.XLogP) <= 5 ? 'Pass' : 'Fail'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>H-Bond Donors:</span>
                        <span className={Number(compoundData.HBondDonorCount) <= 5 ? 'text-green-600' : 'text-red-600'}>
                          {Number(compoundData.HBondDonorCount) <= 5 ? 'Pass' : 'Fail'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>H-Bond Acceptors:</span>
                        <span className={Number(compoundData.HBondAcceptorCount) <= 10 ? 'text-green-600' : 'text-red-600'}>
                          {Number(compoundData.HBondAcceptorCount) <= 10 ? 'Pass' : 'Fail'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
}
