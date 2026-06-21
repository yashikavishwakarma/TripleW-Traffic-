export default function ComparableMemory({ result }) {
  if (!result) {
    return (
      <section className="panel emptyState">
        <h2>Comparable Memory Engine</h2>
        <p>Similar past events will appear here after analysis.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Comparable Memory Engine</h2>
      <p className="subtitle">{result.comparable_memory.confidence.message}</p>

      <div className="comparableList">
        {result.comparable_memory.events.map((event, index) => (
          <div className="comparableCard" key={index}>
            <b>{event.event_cause}</b>
            <span>{event.event_type} • {event.police_station}</span>
            <small>
              {event.distance_km} km away • Closure: {event.required_closure ? "Yes" : "No"}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}