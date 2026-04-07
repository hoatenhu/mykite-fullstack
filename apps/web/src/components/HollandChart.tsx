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
          <PolarGrid stroke="#d4d7e9" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#34384e', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#67708e', fontSize: 10 }}
          />
          <Radar
            name="Điểm số"
            dataKey="score"
            stroke="#2f398e"
            fill="#8288bb"
            fillOpacity={0.45}
            strokeWidth={2}
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
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
