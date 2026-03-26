import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { BIGFIVE_LABELS, type BigFiveDimension } from '@mykite/shared'

interface BigFiveChartProps {
  scores: Record<BigFiveDimension, number>
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

export function BigFiveChart({ scores }: BigFiveChartProps) {
  const data = (Object.keys(BIGFIVE_LABELS) as BigFiveDimension[]).map((dim, idx) => ({
    dimension: BIGFIVE_LABELS[dim].vi,
    short: dim,
    score: scores[dim],
    color: COLORS[idx],
  }))

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
          <YAxis
            dataKey="dimension"
            type="category"
            tick={{ fill: '#374151', fontSize: 12 }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value: number) => [`${value}%`, 'Điểm số']}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
