import {
  Activity,
  Ambulance,
  CloudRain,
  Crown,
  Siren,
  Users,
} from "lucide-react";
import { SCENARIO_CARDS } from "../data/scenarios";

const iconMap = {
  activity: <Activity size={18} />,
  ambulance: <Ambulance size={18} />,
  rain: <CloudRain size={18} />,
  crown: <Crown size={18} />,
  siren: <Siren size={18} />,
  users: <Users size={18} />,
};

export default function WarGameLab({ form, result, updateForm, runScenario, runAnalysis, loading }) {
  return (
    <section className="panel">
      <h2>War-Game Plan Lab</h2>
      <p className="subtitle">Build the plan. Break the plan. Improve the plan.</p>

      <div className="warRoomTop">
        <span className="activeScenario">
          Active: {form.scenario.replaceAll("_", " ")}
        </span>
      </div>

      <div className="sliderBlock">
        <div className="sliderHeader">
          <span>Officers Available</span>
          <b>{form.available_officers}</b>
        </div>
        <input
          type="range"
          min="10"
          max="80"
          value={form.available_officers}
          onChange={(e) => updateForm("available_officers", e.target.value)}
        />
      </div>

      <div className="sliderBlock">
        <div className="sliderHeader">
          <span>Barricades Available</span>
          <b>{form.available_barricades}</b>
        </div>
        <input
          type="range"
          min="1"
          max="12"
          value={form.available_barricades}
          onChange={(e) => updateForm("available_barricades", e.target.value)}
        />
      </div>

      <div className="scenarioGrid">
        {SCENARIO_CARDS.map((scenario) => (
          <button
            key={scenario.key}
            type="button"
            className={`scenarioCard ${form.scenario === scenario.key ? "selectedScenario" : ""}`}
            onClick={() => runScenario(scenario.key)}
          >
            <div className="scenarioTitle">
              {iconMap[scenario.icon]}
              <b>{scenario.title}</b>
            </div>
            <span>{scenario.desc}</span>
          </button>
        ))}
      </div>

      <button onClick={runAnalysis} className="primaryBtn">
        {loading ? "Running Stress Test..." : "Run Stress Test"}
      </button>

      {result && (
        <div className="warResult">
          <div className="planGrid">
            <InfoLine label="Manpower" value={result.war_game_plan_lab.deployment_plan.manpower_band} />
            <InfoLine label="Status" value={result.war_game_plan_lab.deployment_plan.manpower_status} />
            <InfoLine label="Barricades" value={result.war_game_plan_lab.deployment_plan.barricades_recommended} />
            <InfoLine label="Road closure" value={result.war_game_plan_lab.deployment_plan.road_closure_recommendation} />
          </div>

          <div className="stressBox">
            <h3>
              {result.war_game_plan_lab.stress_test.plan_status} · Stress {result.war_game_plan_lab.stress_test.stress_score}/100
            </h3>
            <ul>
              {result.war_game_plan_lab.stress_test.failure_points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="infoLine">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}