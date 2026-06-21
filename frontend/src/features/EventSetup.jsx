import { MapPinned } from "lucide-react";

export default function EventSetup({ form, options, updateForm, runAnalysis, loading }) {
  return (
    <section className="panel">
      <div className="sectionHead">
        <MapPinned size={20} />
        <h2>Event Setup</h2>
      </div>

      <div className="formGrid">
        <label>
          Event Type
          <select value={form.event_type} onChange={(e) => updateForm("event_type", e.target.value)}>
            {(options?.event_types || ["planned", "unplanned"]).map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </label>

        <label>
          Event Cause
          <select value={form.event_cause} onChange={(e) => updateForm("event_cause", e.target.value)}>
            {(options?.event_causes || ["public_event", "protest", "procession", "vip_movement"]).map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </label>


        <label>
          Corridor
          <select value={form.corridor} onChange={(e) => updateForm("corridor", e.target.value)}>
            {(options?.corridors || ["Non-corridor"]).map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </label>

        <label>
          Police Station
          <select value={form.police_station} onChange={(e) => updateForm("police_station", e.target.value)}>
            {(options?.police_stations || ["Cubbon Park"]).map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </label>

        <label>
          Zone
          <select value={form.zone} onChange={(e) => updateForm("zone", e.target.value)}>
            {(options?.zones || ["Central Zone 1"]).map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </label>

        <label>
          Priority
          <select value={form.priority} onChange={(e) => updateForm("priority", e.target.value)}>
            {(options?.priorities || ["High", "Medium", "Low"]).map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </label>

        <label>
          Crowd Size
          <input type="number" value={form.crowd_size} onChange={(e) => updateForm("crowd_size", e.target.value)} />
        </label>

        <label>
          Start Hour
          <input type="number" min="0" max="23" value={form.start_hour} onChange={(e) => updateForm("start_hour", e.target.value)} />
        </label>
      </div>

      <button onClick={runAnalysis} className="primaryBtn">
        {loading ? "Running ML + Planner..." : "Run WWW Analysis"}
      </button>

     
    </section>
  );
}