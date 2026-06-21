export default function ImpactTimeline({ result }) {
  if (!result) {
    return (
      <section className="panel emptyState">
        <h2>Impact Timeline Engine</h2>
        <p>Run analysis first to see build-up, peak, dispersal shockwave, and recovery.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Impact Timeline Engine</h2>
      <p className="subtitle">Build-up → Peak → Dispersal Shockwave → Recovery</p>

      <div className="timeline">
        {result.impact_timeline.map((item) => (
          <div className="timelineItem" key={item.phase}>
            <div className="riskBubble">{item.risk}</div>
            <div>
              <h3>{item.phase}</h3>
              <p className="window">{item.window}</p>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}