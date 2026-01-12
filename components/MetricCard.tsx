import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  type: 'reported' | 'normalized' | 'delta' | 'neutral';
  onChange?: (val: number) => void;
  editable?: boolean;
  suffix?: string;
  isPercentage?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, type, onChange, editable = false, suffix, isPercentage = false }) => {
  const isPositive = value >= 0;
  
  const formattedValue = isPercentage 
    ? `${value.toFixed(1)}%`
    : new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(value);

  const getTypeStyles = () => {
    switch(type) {
      case 'reported': return 'bg-[#002855] text-white border-[#001f40]';
      case 'normalized': return 'bg-orange-500 text-white border-orange-600';
      case 'delta': return 'bg-white text-slate-800 border-slate-200';
      case 'neutral': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-white text-slate-800';
    }
  };

  return (
    <div className={`rounded-lg p-6 shadow-md border ${getTypeStyles()} relative overflow-hidden transition-all duration-300 group h-full`}>
      <div className="relative z-10">
        <p className={`text-xs uppercase tracking-widest font-bold mb-2 ${type === 'normalized' || type === 'reported' ? 'text-white/70' : 'text-slate-500'}`}>
          {title}
        </p>
        <div className="flex items-baseline">
          {editable && onChange ? (
             <div className="relative w-full">
               <input 
                 type="number" 
                 value={value}
                 onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                 className="w-full bg-transparent text-3xl font-bold border-b-2 border-white/20 focus:border-orange-400 focus:outline-none pb-1 transition-colors"
               />
               <span className="absolute right-0 bottom-2 text-[10px] opacity-60 font-semibold uppercase pointer-events-none">Editable</span>
             </div>
          ) : (
            <h2 className={`text-3xl font-bold ${type === 'delta' && !isPercentage ? (isPositive ? 'text-emerald-600' : 'text-red-600') : ''}`}>
              {formattedValue}{suffix && <span className="text-sm font-medium ml-1 opacity-70">{suffix}</span>}
            </h2>
          )}
        </div>
      </div>
      
      {/* Decorative */}
      {type === 'normalized' && (
        <svg className="absolute -right-6 -bottom-6 w-32 h-32 text-white opacity-20 transform -rotate-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
      )}
       {type === 'reported' && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full"></div>
      )}
    </div>
  );
};