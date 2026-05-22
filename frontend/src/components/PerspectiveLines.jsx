export default function PerspectiveLines() {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: "55vh",
      pointerEvents: "none", zIndex: 0, overflow: "hidden",
    }}>
      <svg width="100%" height="100%" viewBox="0 0 1600 500"
        preserveAspectRatio="xMidYMin slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}>
        <defs>
          <linearGradient id="plFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="white" stopOpacity="1"  />
            <stop offset="70%"  stopColor="white" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"  />
          </linearGradient>
          <mask id="plMask">
            <rect x="0" y="0" width="1600" height="500" fill="url(#plFade)" />
          </mask>
        </defs>
        <g mask="url(#plMask)">
          {Array.from({ length: 20 }).map((_, i) => {
            const vp = { x: 800, y: -40 };
            const y      = 10 + i * (490 / 19);
            const xLeft  = vp.x - (vp.x * (y - vp.y)) / (800 - vp.y);
            const xRight = vp.x + ((1600 - vp.x) * (y - vp.y)) / (800 - vp.y);
            return <line key={"h"+i} x1={Math.max(-300,xLeft)} y1={y} x2={Math.min(1900,xRight)} y2={y} stroke={`rgba(170,130,255,${0.05+i*0.012})`} strokeWidth="0.8"/>;
          })}
          {Array.from({ length: 28 }).map((_, i) => {
            const t = i / 27;
            return <line key={"v"+i} x1={800} y1={-40} x2={t*1600} y2={520} stroke={`rgba(160,120,240,${0.03+Math.sin(t*Math.PI)*0.1})`} strokeWidth="0.7"/>;
          })}
        </g>
      </svg>
    </div>
  );
}
