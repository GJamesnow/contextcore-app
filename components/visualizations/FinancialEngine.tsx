'use client';

import { useState } from 'react';
import { updateAnalysis } from '@/app/actions/update-analysis';

// Strict Interface
interface AnalysisData {
  id: string;
  purchasePrice: number;
  rehabCost: number;
  estRent: number;
  taxAmount: number;
  interestRate: number;
  downPaymentPct: number;
  loanTermYears: number;
  vacancyRate: number;
  managementRate: number;
  opexAnnual: number;
  closingCosts: number;
}

interface FinancialProps {
  initialData: AnalysisData;
}

export default function FinancialEngine({ initialData }: FinancialProps) {
  const [data, setData] = useState<AnalysisData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  
  // -- MATH ENGINE --
  const purchasePrice = data.purchasePrice || 0;
  const downPaymentPct = data.downPaymentPct || 0;
  const interestRate = data.interestRate || 0;
  
  const loanAmount = purchasePrice * (1 - (downPaymentPct / 100));
  const downPaymentCash = purchasePrice * (downPaymentPct / 100);
  const closingCosts = data.closingCosts || 0;
  const rehabCost = data.rehabCost || 0;
  const totalInvestment = downPaymentCash + rehabCost + closingCosts;

  // Mortgage Logic
  let monthlyMortgage = 0;
  if (interestRate === 0) {
      monthlyMortgage = data.loanTermYears > 0 ? loanAmount / (data.loanTermYears * 12) : 0;
  } else {
      const r = (interestRate / 100) / 12;
      const n = data.loanTermYears * 12;
      monthlyMortgage = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }
  if (isNaN(monthlyMortgage)) monthlyMortgage = 0;

  // Operations
  const annualGrossRent = (data.estRent || 0) * 12;
  const vacancyLoss = annualGrossRent * ((data.vacancyRate || 0) / 100);
  const effectiveGrossIncome = annualGrossRent - vacancyLoss;
  
  const annualOpex = (data.taxAmount || 0) + (data.opexAnnual || 0) + (annualGrossRent * ((data.managementRate || 0) / 100));
  const noi = effectiveGrossIncome - annualOpex;
  
  const annualDebtService = monthlyMortgage * 12;
  const cashFlow = noi - annualDebtService;

  // Metrics
  const capRate = purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 99.9;
  const cocReturn = totalInvestment > 0 ? (cashFlow / totalInvestment) * 100 : 0;

  const handleChange = (field: keyof AnalysisData, value: string) => {
    const cleanValue = value === '' ? 0 : parseFloat(value);
    setData({ ...data, [field]: isNaN(cleanValue) ? 0 : cleanValue });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateAnalysis(data.id, data);
    setIsSaving(false);
  };

  // Helper for dynamic colors without template literal confusion
  const getDscrColor = (val: number) => {
    if (val >= 1.25) return 'text-emerald-600';
    if (val < 1.0) return 'text-red-500';
    return 'text-amber-500';
  };

  return (
    <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8'>
      
      {/* HEADER */}
      <div className='sticky top-0 bg-white/95 backdrop-blur z-10 py-2 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h2 className='text-xl font-bold text-slate-800'>Financial Engine</h2>
          <p className='text-slate-500 text-xs md:text-sm'>Professional Underwriting Model</p>
        </div>
        <div className='flex gap-4 w-full md:w-auto justify-between md:justify-end'>
           <div className='text-right'>
              <div className='text-[10px] md:text-xs text-slate-400 font-semibold uppercase'>DSCR</div>
              <div className={'text-xl md:text-2xl font-bold ' + getDscrColor(dscr)}>
                {dscr >= 50 ? '' : dscr.toFixed(2)}x
              </div>
           </div>
           <div className='text-right'>
              <div className='text-[10px] md:text-xs text-slate-400 font-semibold uppercase'>Cap Rate</div>
              <div className='text-xl md:text-2xl font-bold text-slate-700'>{capRate.toFixed(2)}%</div>
           </div>
           <div className='text-right'>
              <div className='text-[10px] md:text-xs text-slate-400 font-semibold uppercase'>CoC Return</div>
              <div className={'text-xl md:text-2xl font-bold ' + (cocReturn >= 8 ? 'text-emerald-600' : 'text-slate-700')}>
                {cocReturn.toFixed(1)}%
              </div>
           </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4'>
        
        {/* ACQUISITION */}
        <div className='space-y-4'>
          <h3 className='text-sm font-semibold text-slate-900 flex items-center gap-2'>
             Acquisition
          </h3>
          <div className='space-y-1'>
            <label className='text-xs font-medium text-slate-500'>Purchase Price</label>
            <input 
              type='number' 
              value={data.purchasePrice || ''}
              onChange={(e) => handleChange('purchasePrice', e.target.value)}
              className='w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-700'
            />
          </div>
          <div className='space-y-1'>
            <label className='text-xs font-medium text-slate-500'>Rehab Budget</label>
            <input 
              type='number' 
              value={data.rehabCost || ''}
              onChange={(e) => handleChange('rehabCost', e.target.value)}
              className='w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-700'
            />
          </div>
           <div className='space-y-1'>
            <label className='text-xs font-medium text-slate-500'>Closing Costs</label>
            <input 
              type='number' 
              value={data.closingCosts || ''}
              onChange={(e) => handleChange('closingCosts', e.target.value)}
              className='w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-700'
            />
          </div>
        </div>

        {/* DEBT */}
        <div className='space-y-4'>
          <h3 className='text-sm font-semibold text-slate-900 flex items-center gap-2'>
             Debt Structure
          </h3>
          <div className='space-y-1'>
             <div className='flex justify-between'>
                <label className='text-xs font-medium text-slate-500'>Down Payment</label>
                <span className='text-xs font-bold text-slate-700'>{data.downPaymentPct}%</span>
             </div>
             <input 
               type='range' min='0' max='100' step='5'
               value={data.downPaymentPct || 0}
               onChange={(e) => handleChange('downPaymentPct', e.target.value)}
               className='w-full accent-blue-600'
             />
          </div>
          <div className='space-y-1'>
             <div className='flex justify-between'>
                <label className='text-xs font-medium text-slate-500'>Interest Rate</label>
                <span className='text-xs font-bold text-slate-700'>{data.interestRate}%</span>
             </div>
             <input 
               type='range' min='0' max='12' step='0.125'
               value={data.interestRate || 0}
               onChange={(e) => handleChange('interestRate', e.target.value)}
               className='w-full accent-blue-600'
             />
          </div>
          <div className='p-3 border border-slate-100 rounded-lg bg-slate-50'>
             <div className='flex justify-between text-sm'>
                <span className='text-slate-500'>Monthly P&I</span>
                <span className='font-mono font-bold text-slate-900'>${monthlyMortgage.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
             </div>
          </div>
        </div>

        {/* OPS */}
        <div className='space-y-4'>
          <h3 className='text-sm font-semibold text-slate-900 flex items-center gap-2'>
             Operations
          </h3>
          <div className='space-y-1'>
            <label className='text-xs font-medium text-slate-500'>Market Rent (Monthly)</label>
            <input 
              type='number' 
              value={data.estRent || ''}
              onChange={(e) => handleChange('estRent', e.target.value)}
              className='w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-700'
            />
          </div>
          <div className='space-y-1'>
            <label className='text-xs font-medium text-slate-500'>Annual Tax</label>
            <input 
              type='number' 
              value={data.taxAmount || ''}
              onChange={(e) => handleChange('taxAmount', e.target.value)}
              className='w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-700'
            />
          </div>
          <div className='pt-2'>
             <button 
                onClick={handleSave}
                disabled={isSaving}
                className='w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium transition-colors disabled:opacity-50 text-sm'
             >
                {isSaving ? 'Syncing...' : 'Save Scenarios'}
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}