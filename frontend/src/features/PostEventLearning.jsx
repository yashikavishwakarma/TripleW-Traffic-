import { useState } from "react";

export default function PostEventLearning({ result }) {
  const [actualRisk, setActualRisk] = useState(70);
  const [actualClosure, setActualClosure] = useState("yes");

  if (!result) {
    return (
      <section className="panel emptyState">
        <h2>Post-Event Learning Loop</h2>
        <p>Run an event analysis first, then compare predicted vs actual outcome here.</p>
      </section>
    );
  }

  const predictedRisk = result.summary.risk_score;
  const error = actualRisk - predictedRisk;

  let learning = "Plan was close to expected behaviour.";
  if (error > 10) learning = "Actual impact was higher. Increase exit-side coverage and earlier diversion next time.";
  if (error < -10) learning = "Actual impact was lower. Similar future events may need fewer officers or shorter closure window.";

  return (
    <section className="panel learningPanel">
      <h2>Post-Event Learning Loop</h2>
      <p className="subtitle">
        Compare predicted vs actual event behaviour and feed learning back into future planning.
      </p>

      <div className="learningGrid">
        <label>
          Actual Risk Score
          <input
            type="number"
            min="0"
            max="100"
            value={actualRisk}
            onChange={(e) => setActualRisk(Number(e.target.value))}
          />
        </label>

        <label>
          Actual Road Closure
          <select value={actualClosure} onChange={(e) => setActualClosure(e.target.value)}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
      </div>

      <div className="learningResult">
        <div>
          <span>Predicted Risk</span>
          <b>{predictedRisk}/100</b>
        </div>
        <div>
          <span>Actual Risk</span>
          <b>{actualRisk}/100</b>
        </div>
        <div>
          <span>Error</span>
          <b>{error > 0 ? `+${error}` : error}</b>
        </div>
      </div>

      <div className="learningBox">
        <b>System Learning</b>
        <p>{learning}</p>
        <small>
          This closes PS2’s gap: no post-event learning system.
        </small>
      </div>
    </section>
  );
}