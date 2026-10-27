export default function BarChart({ data, title }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <svg viewBox="0 0 400 180" className="chart" role="img" aria-label={title}>
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient></defs>
      {data.map((d, i) => {
        const h = (d.value / max) * 130, x = 20 + i * (360 / data.length)
        return (<g key={d.label}>
          <rect className="bar" x={x} y={150 - h} width="32" height={h} rx="6" fill="url(#bg)" style={{ animationDelay: `${i * 60}ms` }} />
          <text x={x + 16} y="170" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".6">{d.label}</text>
          <text x={x + 16} y={144 - h} textAnchor="middle" fontSize="11" fill="currentColor">{d.value}</text>
        </g>)
      })}
    </svg>
  )
}
