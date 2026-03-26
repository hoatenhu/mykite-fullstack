import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { HOLLAND_LABELS, type HollandDimension } from '@mykite/shared'

interface HollandChartProps {
  scores: Record<HollandDimension, number>
}

export function HollandChart({ scores }: HollandChartProps) {
  const data = (Object.keys(HOLLAND_LABELS) as HollandDimension[]).map((dim) => ({
    dimension: HOLLAND_LABELS[dim].vi,
    score: scores[dim],
    fullMark: 100,
  }))

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#374151', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
          />
          <Radar
            name="Điểm số"
            dataKey="score"
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={0.5}
            strokeWidth={2}
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
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
