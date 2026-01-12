import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList
} from 'recharts';
import { Adjustment, WaterfallDataPoint, ChartColor } from '../types';

interface WaterfallChartProps {
  reportedEbitda: number;
  adjustments: Adjustment[];
  normalizedEbitda: number;
}

const formatCurrencyShort = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return value.toString();
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
};

const abbreviateLabel = (text: string) => {
  if (!text) return '';
  if (text.length <= 12) return text;
  return text.split(' ').map(word => word.length > 4 ? word.substring(0, 4) + '.' : word).join(' ');
};

export const WaterfallChart: React.FC<WaterfallChartProps> = ({ reportedEbitda, adjustments, normalizedEbitda }) => {
  
  const chartData = useMemo(() => {
    let currentTotal = reportedEbitda;
    const data: WaterfallDataPoint[] = [];

    // 1. Initial
    data.push({
      name: 'EBITDA Rep.',
      value: reportedEbitda,
      start: 0,
      fill: ChartColor.TOTAL,
      displayValue: reportedEbitda,
      isTotal: true,
    });

    // 2. Adjustments
    adjustments.forEach((adj) => {
      const val = adj.value;
      let startVal = 0;
      
      if (val >= 0) {
        startVal = currentTotal;
        currentTotal += val;
      } else {
        currentTotal += val; 
        startVal = currentTotal;
      }

      let label = abbreviateLabel(adj.description);
      if (label.length > 20) label = label.substring(0, 18) + '..';

      data.push({
        name: label,
        value: Math.abs(val),
        start: startVal,
        fill: val >= 0 ? ChartColor.POSITIVE : ChartColor.NEGATIVE,
        displayValue: val,
        isTotal: false,
      });
    });

    // 3. Final
    data.push({
      name: 'EBITDA Norm.',
      value: currentTotal,
      start: 0,
      fill: ChartColor.HIGHLIGHT,
      displayValue: currentTotal,
      isTotal: true,
    });

    return data;
  }, [reportedEbitda, adjustments]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload.find((p: any) => p.dataKey === 'value')?.payload as WaterfallDataPoint;
      if (!dataPoint) return null;

      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-md z-50">
          <p className="font-semibold text-slate-800 mb-1">{label}</p>
          <div className="space-y-1 text-sm">
             <p className="text-slate-600">
              <span className="font-medium">Impacto:</span>{' '}
              <span className={dataPoint.displayValue >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                {formatCurrency(dataPoint.displayValue)}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[450px] bg-white p-4 rounded-lg shadow-md border border-slate-200">
      <h3 className="text-lg font-bold text-[#002855] mb-4 flex items-center">
        <div className="w-1.5 h-6 bg-orange-500 mr-3"></div>
        Puente de EBITDA (Waterfall)
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} 
            axisLine={{ stroke: '#cbd5e1' }}
            interval={0} 
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 11 }} 
            axisLine={false} 
            tickFormatter={formatCurrencyShort}
            tickCount={6}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <Bar dataKey="start" stackId="a" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="value" stackId="a" radius={[2, 2, 0, 0]} isAnimationActive={true} animationDuration={500}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
             <LabelList 
                dataKey="displayValue" 
                position="top" 
                formatter={(val: number) => formatCurrencyShort(val)}
                style={{ fill: '#475569', fontSize: '10px', fontWeight: 700 }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};