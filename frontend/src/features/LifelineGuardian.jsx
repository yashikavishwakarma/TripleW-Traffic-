import { Ambulance } from "lucide-react";

export default function LifelineGuardian({ result }) {
  if (!result) {
    return (
      <section className="panel emptyState">
        <h2>Lifeline Corridor Guardian</h2>
        <p>Emergency route analysis will appear here after running the model.</p>
      </section>
    );
  }

  const lifeline = result.lifeline_corridor_guardian;

  return (
    <section className="panel">
      <h2>Lifeline Corridor Guardian</h2>
      <p className="subtitle">{lifeline.purpose}</p>

      <div className="lifelineCard">
        <Ambulance size={34} />
        <div>
          <h3>{lifeline.status} · {lifeline.clearance_probability}% clearance</h3>
          <p>Emergency route reserved for ambulance, fire, police and evacuation movement.</p>
        </div>
      </div>

      <ul className="ruleList">
        {lifeline.rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </section>
  );
}