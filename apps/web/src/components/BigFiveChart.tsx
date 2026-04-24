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

const COLORS = ['#111111', '#2a2a2a', '#3c3c3c', '#575757', '#7a7a7a']

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
          <CartesianGrid strokeDasharray="3 3" stroke="#d1d1c8" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#4f4f4a' }} />
          <YAxis
            dataKey="dimension"
            type="category"
            tick={{ fill: '#232320', fontSize: 12 }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#f7f7f2',
              border: '2px solid #10100f',
              borderRadius: '12px',
              boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.8)',
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
