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
          <PolarGrid stroke="#c9c9bf" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#232320', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#57574f', fontSize: 10 }}
          />
          <Radar
            name="Điểm số"
            dataKey="score"
            stroke="#111111"
            fill="#4f4f4a"
            fillOpacity={0.36}
            strokeWidth={2}
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
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
