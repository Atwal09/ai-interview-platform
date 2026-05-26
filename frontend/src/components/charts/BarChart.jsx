import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-white/10 shadow-xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="font-semibold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const BarChart = ({
  data = [],
  bars = [{ key: 'value', name: 'Value', color: '#8b5cf6' }],
  xKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = false,
  multiColor = false,
  colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
  className = '',
}) => {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          )}
          <XAxis
            dataKey={xKey}
            stroke="rgba(255,255,255,0.15)"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.15)"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          {showLegend && <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />}
          {bars.map(bar => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              fill={bar.color || '#8b5cf6'}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            >
              {multiColor && data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChart
