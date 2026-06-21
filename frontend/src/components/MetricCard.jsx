export default function MetricCard({ icon, label, value, note, danger }) {
  return (
    <div className={`metricCard ${danger ? "danger" : ""}`}>
      {icon}
      <p>{label}</p>
      <h3>{value}</h3>
      <span>{note}</span>
    </div>
  );
}