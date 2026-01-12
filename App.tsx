import React, { useState, useMemo, useCallback } from 'react';
import { INITIAL_REPORTED_EBITDA, INITIAL_ADJUSTMENTS, INITIAL_CLIENTS, INITIAL_WC_STATE } from './constants';
import { Adjustment, Client, WorkingCapitalState } from './types';
import { WaterfallChart } from './components/WaterfallChart';
import AdjustmentTable from './components/AdjustmentTable';
import { MetricCard } from './components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// --- SUB-COMPONENTS FOR NEW SECTIONS ---

// SECTION 2: Working Capital
const WorkingCapitalSection: React.FC<{
  wc: WorkingCapitalState, 
  onChange: (newWc: WorkingCapitalState) => void
}> = ({ wc, onChange }) => {
  
  // Calculate NOF: (Sales/360 * DSO) + (COGS/360 * DIO) - (COGS/360 * DPO)
  // COGS = Sales * (1 - GrossMargin)
  const cogs = wc.revenue * (1 - wc.grossMargin / 100);
  const dailySales = wc.revenue / 360;
  const dailyCogs = cogs / 360;

  const currentNOF = (dailySales * wc.dso) + (dailyCogs * wc.dio) - (dailyCogs * wc.dpo);
  
  // Optimized Scenario (10% improvement in DSO, DIO and DPO)
  // Optimization means collecting faster (lower DSO), holding less stock (lower DIO), and paying later (higher DPO)
  const optDSO = wc.dso * 0.9;
  const optDIO = wc.dio * 0.9;
  const optDPO = wc.dpo * 1.1; 
  
  const optimizedNOF = (dailySales * optDSO) + (dailyCogs * optDIO) - (dailyCogs * optDPO);
  
  const cashSavings = currentNOF - optimizedNOF;
  const cycleDays = wc.dso + wc.dio - wc.dpo;

  const chartData = [
    { name: 'Situación Actual', nof: currentNOF },
    { name: 'Optimizada (Eficiencia +10%)', nof: optimizedNOF },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow border border-slate-200">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">DSO (Cobro)</label>
          <div className="flex items-center mt-3">
            <input type="range" min="15" max="150" value={wc.dso} onChange={(e) => onChange({...wc, dso: parseInt(e.target.value)})} className="w-full mr-3 accent-orange-500 cursor-pointer" />
            <span className="font-mono font-bold text-[#002855] text-lg bg-slate-100 px-2 py-1 rounded border border-slate-200 min-w-[3.5rem] text-center">{wc.dso}d</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow border border-slate-200">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">DIO (Stock)</label>
          <div className="flex items-center mt-3">
            <input type="range" min="0" max="120" value={wc.dio} onChange={(e) => onChange({...wc, dio: parseInt(e.target.value)})} className="w-full mr-3 accent-orange-500 cursor-pointer" />
            <span className="font-mono font-bold text-[#002855] text-lg bg-slate-100 px-2 py-1 rounded border border-slate-200 min-w-[3.5rem] text-center">{wc.dio}d</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow border border-slate-200">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">DPO (Pago)</label>
          <div className="flex items-center mt-3">
            <input type="range" min="15" max="150" value={wc.dpo} onChange={(e) => onChange({...wc, dpo: parseInt(e.target.value)})} className="w-full mr-3 accent-orange-500 cursor-pointer" />
            <span className="font-mono font-bold text-[#002855] text-lg bg-slate-100 px-2 py-1 rounded border border-slate-200 min-w-[3.5rem] text-center">{wc.dpo}d</span>
          </div>
        </div>
         <div className="bg-white p-4 rounded shadow border border-slate-200">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Ventas Anuales (€)</label>
          <input 
            type="number" 
            value={wc.revenue} 
            onChange={(e) => onChange({...wc, revenue: parseFloat(e.target.value)})} 
            className="w-full mt-2 p-2 bg-slate-50 border border-slate-300 rounded text-[#002855] font-bold text-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none shadow-inner transition-all" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <h3 className="text-lg font-bold text-[#002855] mb-6">Necesidades Operativas de Fondos (NOF)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 12, fontWeight: 600, fill: '#475569'}} />
              <YAxis tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} tick={{fill: '#64748b'}} />
              <Tooltip 
                formatter={(val:number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val)} 
                contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="nof" fill="#002855" barSize={60} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col space-y-4">
           {cycleDays > 60 && (
             <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
               <div className="flex items-center">
                 <span className="text-2xl mr-3">⚠️</span>
                 <div>
                   <h4 className="font-bold text-red-800">Alerta de Tesorería</h4>
                   <p className="text-sm text-red-700 mt-1">El Ciclo de Caja ({cycleDays} días) es elevado. La empresa financia operaciones durante 2 meses antes de cobrar.</p>
                 </div>
               </div>
             </div>
           )}

           <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded shadow-sm flex-1 flex flex-col justify-center">
             <h4 className="text-orange-800 font-bold text-lg mb-2">Oportunidad de Optimización</h4>
             <p className="text-slate-700 mb-4 font-medium">Mejorando un 10% la gestión de cobros, stock y pagos, se liberarían:</p>
             <p className="text-4xl font-extrabold text-[#002855] tracking-tight">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cashSavings)}</p>
             <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide font-bold">Cash Flow Adicional Inmediato</p>
           </div>
        </div>
      </div>
    </div>
  );
};

// SECTION 3: Concentration
const COLORS = ['#002855', '#334155', '#475569', '#94a3b8', '#cbd5e1', '#e2e8f0'];

const ConcentrationSection: React.FC<{
  clients: Client[],
  onUpdateClient: (id: string, val: number) => void,
  onKillSwitch: () => void,
  isCrisisMode: boolean
}> = ({ clients, onUpdateClient, onKillSwitch, isCrisisMode }) => {
  const top1 = clients[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
       <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <h3 className="text-lg font-bold text-[#002855] mb-6">Top 5 Clientes (% Ventas)</h3>
          <div className="space-y-4">
            {clients.map((client, idx) => (
              <div key={client.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors">
                <span className="font-semibold text-slate-700 flex items-center text-sm md:text-base">
                  <div className="w-3 h-3 rounded-full mr-3 shadow-sm" style={{backgroundColor: COLORS[idx]}}></div>
                  {client.name}
                </span>
                <div className="flex items-center w-32 relative">
                  <input 
                    type="number" 
                    value={client.share} 
                    onChange={(e) => onUpdateClient(client.id, parseFloat(e.target.value))}
                    className="w-full p-2 pr-8 bg-slate-50 border border-slate-300 rounded text-right font-bold text-[#002855] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none shadow-sm"
                  />
                  <span className="absolute right-3 text-slate-500 font-bold pointer-events-none">%</span>
                </div>
              </div>
            ))}
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between text-sm font-medium text-slate-500 px-2">
               <span>Otros Clientes</span>
               <span>{Math.max(0, 100 - clients.reduce((a,b) => a + b.share, 0))}%</span>
            </div>
          </div>
       </div>

       <div className="flex flex-col space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 flex justify-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clients}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="share"
                >
                  {clients.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b'}} 
                   itemStyle={{color: '#002855', fontWeight: 600}}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 text-white p-6 rounded-lg shadow-lg relative overflow-hidden group">
             <div className="relative z-10">
               <h4 className="font-bold text-lg mb-2 text-orange-400 flex items-center">
                 <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 Stress Test: Pérdida Cliente Principal
               </h4>
               <p className="text-sm text-slate-300 mb-5 leading-relaxed">Simula el impacto financiero inmediato en el EBITDA si <span className="text-white font-semibold">"{top1.name}"</span> rescinde el contrato mañana.</p>
               <button 
                 onClick={onKillSwitch}
                 className={`w-full py-3 px-4 rounded font-bold uppercase tracking-wider transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${isCrisisMode ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] border border-red-500' : 'bg-white text-[#002855] hover:bg-slate-100 shadow-lg'}`}
               >
                 {isCrisisMode ? '🚨 RESTAURAR ESCENARIO BASE' : 'ACTIVAR KILL SWITCH'}
               </button>
             </div>
             {/* Industrial Stripes Background */}
             <div className="absolute top-0 right-0 w-32 h-full opacity-5 pointer-events-none" style={{backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 10px, transparent 10px, transparent 20px)'}}></div>
          </div>
       </div>
    </div>
  );
};

// --- MAIN APP ---

type Tab = 'ebitda' | 'treasury' | 'clients';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ebitda');
  
  // Section 1 State
  const [reportedEbitda, setReportedEbitda] = useState<number>(INITIAL_REPORTED_EBITDA);
  const [adjustments, setAdjustments] = useState<Adjustment[]>(INITIAL_ADJUSTMENTS);

  // Section 2 State
  const [wcState, setWcState] = useState<WorkingCapitalState>(INITIAL_WC_STATE);

  // Section 3 State
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [isCrisisMode, setIsCrisisMode] = useState(false);

  // Computed
  const normalizedEbitda = useMemo(() => {
    return reportedEbitda + adjustments.reduce((acc, curr) => acc + curr.value, 0);
  }, [reportedEbitda, adjustments]);

  const realMargin = (normalizedEbitda / wcState.revenue) * 100;

  // Handlers
  const handleUpdateAdjustment = useCallback((id: string, field: keyof Adjustment, value: string | number) => {
    setAdjustments(prev => prev.map(adj => adj.id === id ? { ...adj, [field]: value } : adj));
  }, []);

  const handleAddAdjustment = useCallback(() => {
    const newId = Math.random().toString(36).substr(2, 9);
    setAdjustments(prev => [...prev, { id: newId, description: 'Nuevo Ajuste', value: 0 }]);
  }, []);

  const handleDeleteAdjustment = useCallback((id: string) => {
    setAdjustments(prev => prev.filter(adj => adj.id !== id));
  }, []);

  const handleUpdateClient = (id: string, val: number) => {
    setClients(prev => prev.map(c => c.id === id ? {...c, share: val} : c));
  };

  const toggleKillSwitch = () => {
    if (isCrisisMode) {
      // Restore: Remove the simulated adjustment
      setAdjustments(prev => prev.filter(adj => !adj.isSimulation));
      setIsCrisisMode(false);
    } else {
      // Activate: Add negative adjustment
      const topClient = clients[0];
      const lostRevenue = wcState.revenue * (topClient.share / 100);
      // Assume EBITDA margin on that revenue is similar to current normalized margin (or standard 20%)
      const estimatedMargin = realMargin > 0 ? realMargin / 100 : 0.15; 
      const impactValue = -(lostRevenue * estimatedMargin);

      const simulationAdj: Adjustment = {
        id: 'sim-crisis',
        description: `Pérdida ${topClient.name}`,
        value: Math.round(impactValue),
        isSimulation: true
      };
      
      setAdjustments(prev => [...prev, simulationAdj]);
      setIsCrisisMode(true);
      setActiveTab('ebitda'); // Jump to EBITDA to see impact
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      
      {/* Header */}
      <nav className="bg-[#002855] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 p-1.5 rounded shadow-lg shadow-orange-500/30">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight leading-none">Due Diligence Analyzer 360º</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">By Oscar Ocampo</p>
              </div>
            </div>
            
            {/* Tabs Navigation */}
            <div className="hidden md:flex space-x-1">
              {[
                { id: 'ebitda', label: 'Calidad EBITDA' },
                { id: 'treasury', label: 'Ciclo de Caja (NOF)' },
                { id: 'clients', label: 'Riesgo Clientes' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-slate-50 text-[#002855] border-t-2 border-orange-500 shadow-sm transform translate-y-0.5' 
                      : 'text-slate-300 hover:text-white hover:bg-[#003d80]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Tabs */}
      <div className="md:hidden flex bg-[#001f40] p-2 space-x-2 overflow-x-auto sticky top-16 z-40">
         {['ebitda', 'treasury', 'clients'].map(t => (
           <button key={t} onClick={() => setActiveTab(t as Tab)} className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${activeTab === t ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 bg-[#002855]'}`}>
             {t === 'ebitda' ? 'EBITDA' : t === 'treasury' ? 'NOF' : 'CLIENTES'}
           </button>
         ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* SECTION 1: EBITDA */}
        {activeTab === 'ebitda' && (
          <div className="animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <MetricCard title="EBITDA Reportado" value={reportedEbitda} type="reported" editable onChange={setReportedEbitda} />
                <MetricCard title="EBITDA Normalizado" value={normalizedEbitda} type="normalized" />
                <MetricCard title="Margen Real" value={realMargin} type="neutral" isPercentage suffix=" sobre ventas" />
                <MetricCard title="Ajustes Netos" value={normalizedEbitda - reportedEbitda} type="delta" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[600px]">
                <div className="lg:col-span-5 flex flex-col h-full">
                  <AdjustmentTable 
                    adjustments={adjustments}
                    onUpdate={handleUpdateAdjustment}
                    onAdd={handleAddAdjustment}
                    onDelete={handleDeleteAdjustment}
                  />
                </div>
                <div className="lg:col-span-7 h-full">
                  <WaterfallChart 
                    reportedEbitda={reportedEbitda}
                    adjustments={adjustments}
                    normalizedEbitda={normalizedEbitda}
                  />
                  {isCrisisMode && (
                    <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r flex items-center shadow-sm animate-pulse">
                      <span className="text-2xl mr-3">🚨</span>
                      <div>
                        <strong>Modo Crisis Activo:</strong> Se ha simulado la pérdida del cliente principal. 
                        El gráfico muestra el impacto negativo directo en la valoración.
                      </div>
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}

        {/* SECTION 2: Treasury */}
        {activeTab === 'treasury' && (
          <WorkingCapitalSection wc={wcState} onChange={setWcState} />
        )}

        {/* SECTION 3: Clients */}
        {activeTab === 'clients' && (
           <ConcentrationSection 
             clients={clients} 
             onUpdateClient={handleUpdateClient} 
             onKillSwitch={toggleKillSwitch}
             isCrisisMode={isCrisisMode}
           />
        )}

      </main>

      <footer className="fixed bottom-0 w-full bg-slate-200 py-3 text-center text-xs text-slate-500 border-t border-slate-300 z-30">
        Herramienta de Análisis Estratégico desarrollada por <strong>Oscar Ocampo</strong> &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;