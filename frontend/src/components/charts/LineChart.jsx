import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-white/10 shadow-xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="font-semibold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const LineChart = ({
  data = [],
  lines = [{ key: 'value', name: 'Score', color: '#8b5cf6' }],
  xKey = 'date',
  height = 300,
  area = false,
  showGrid = true,
  showLegend = false,
  className = '',
}) => {
  const ChartComponent = area ? AreaChart : RechartsLineChart

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <defs>
            {lines.map(line => (
              <linearGradient key={line.key} id={`gradient-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={line.color || '#8b5cf6'} stopOpacity={0.15} />
                <stop offset="95%" stopColor={line.color || '#8b5cf6'} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
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
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
            />
          )}
          {lines.map(line =>
            area ? (
              <Area
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color || '#8b5cf6'}
                strokeWidth={2}
                fill={`url(#gradient-${line.key})`}
                dot={false}
                activeDot={{ r: 5, fill: line.color || '#8b5cf6', strokeWidth: 2, stroke: '#0a0b14' }}
              />
            ) : (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color || '#8b5cf6'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: line.color || '#8b5cf6', strokeWidth: 2, stroke: '#0a0b14' }}
              />
            )
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}

export default LineChart
