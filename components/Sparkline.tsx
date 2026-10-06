export default function Sparkline({
    values,
    color = "var(--accent)",
}: {
    values: number[];
    color?: string;
}) {
    if (values.length < 2) {
        return <span className="text-xs text-muted">Needs 2+ days</span>;
    }
    const w = 96;
    const h = 28;
    const pad = 3;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pts = values.map((v, i) => {
        const x = pad + (i / (values.length - 1)) * (w - 2 * pad);
        const y = max === min ? h / 2 : h - pad - ((v - min) / (max - min)) * (h - 2 * pad);
        return [x.toFixed(1), y.toFixed(1)];
    });
    const last = pts[pts.length - 1];

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Opportunity trend: ${values.join(", ")}`}>
            <polyline
                points={pts.map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke={color}
                strokeWidth="1.75"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
        </svg>
    );
}