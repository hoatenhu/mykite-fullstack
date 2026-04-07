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

const COLORS = ['#2f398e', '#656bb0', '#8288bb', '#c7ccea', '#1d2357']

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
          <CartesianGrid strokeDasharray="3 3" stroke="#d4d7e9" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#67708e' }} />
          <YAxis
            dataKey="dimension"
            type="category"
            tick={{ fill: '#34384e', fontSize: 12 }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #dce2f4',
              borderRadius: '16px',
              boxShadow: '0 18px 40px -26px rgba(32, 35, 50, 0.18)',
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
