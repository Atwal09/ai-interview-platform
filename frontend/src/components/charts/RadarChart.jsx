import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-white/10 shadow-xl">
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

const RadarChart = ({
  data = [],
  radars = [{ key: 'value', name: 'Score', color: '#8b5cf6' }],
  angleKey = 'subject',
  height = 300,
  className = '',
}) => {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid
            stroke="rgba(255,255,255,0.07)"
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey={angleKey}
            tick={{ fill: '#64748b', fontSize: 11 }}
            stroke="rgba(255,255,255,0.1)"
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 9 }}
            stroke="rgba(255,255,255,0.05)"
          />
          <Tooltip content={<CustomTooltip />} />
          {radars.length > 1 && <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />}
          {radars.map(radar => (
            <Radar
              key={radar.key}
              name={radar.name}
              dataKey={radar.key}
              stroke={radar.color || '#8b5cf6'}
              fill={radar.color || '#8b5cf6'}
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{ r: 3, fill: radar.color || '#8b5cf6' }}
            />
          ))}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RadarChart
