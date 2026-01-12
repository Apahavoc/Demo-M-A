import React from 'react';
import { Adjustment } from '../types';

interface AdjustmentTableProps {
  adjustments: Adjustment[];
  onUpdate: (id: string, field: keyof Adjustment, value: string | number) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

const AdjustmentTable: React.FC<AdjustmentTableProps> = ({ adjustments, onUpdate, onAdd, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#002855] flex items-center">
          <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          Detalle de Ajustes
        </h3>
        <button
          onClick={onAdd}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#002855] hover:bg-[#003d80] transition-colors rounded shadow-sm flex items-center border-b-2 border-[#001f40]"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          Añadir
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1 p-0 min-h-[300px]">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 sticky top-0 z-10 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 font-bold tracking-wider w-[60%]">Descripción</th>
              <th className="px-6 py-3 font-bold tracking-wider text-right w-[30%]">Valor (€)</th>
              <th className="px-4 py-3 text-center w-[10%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {adjustments.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                  No hay ajustes definidos. Añade uno para comenzar.
                </td>
              </tr>
            ) : (
              adjustments.map((adj) => (
                <tr key={adj.id} className={`${adj.isSimulation ? 'bg-red-50' : 'hover:bg-orange-50'} group transition-colors`}>
                  <td className="px-6 py-3 truncate" title={adj.description}>
                    <input
                      type="text"
                      value={adj.description}
                      disabled={adj.isSimulation}
                      onChange={(e) => onUpdate(adj.id, 'description', e.target.value)}
                      className={`w-full bg-transparent border-b border-transparent focus:border-orange-400 focus:ring-0 text-slate-700 font-semibold placeholder-slate-400 focus:text-[#002855] transition-all p-1 -ml-1 ${adj.isSimulation ? 'italic text-red-700' : ''}`}
                      placeholder="Nombre del ajuste"
                    />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <input
                      type="number"
                      value={adj.value}
                      disabled={adj.isSimulation}
                      onChange={(e) => onUpdate(adj.id, 'value', parseFloat(e.target.value) || 0)}
                      className={`w-full bg-transparent border-b border-transparent focus:border-orange-400 focus:ring-0 text-right font-mono font-bold p-1 -mr-1 transition-all ${
                        adj.value >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!adj.isSimulation && (
                      <button
                        onClick={() => onDelete(adj.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        title="Eliminar fila"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdjustmentTable;