import { useEffect, useState } from "react";
import { AlertTriangle, Brain, ShieldCheck, Zap } from "lucide-react";

import { analyzeEvent, getOptions } from "./api/client";
import { DEFAULT_FORM, TABS } from "./data/scenarios";

import Header from "./components/Header";
import Tabs from "./components/Tabs";
import MetricCard from "./components/MetricCard";

import EventSetup from "./features/EventSetup";
import ImpactMap from "./features/ImpactMap";
import ImpactTimeline from "./features/ImpactTimeline";
import ComparableMemory from "./features/ComparableMemory";
import WarGameLab from "./features/WarGameLab";
import LifelineGuardian from "./features/LifelineGuardian";
import ResourceSlack from "./features/ResourceSlack";
import PostEventLearning from "./features/PostEventLearning";
import MapplsAreaLens from "./features/MapplsAreaLens";

import "./App.css";

console.log("Mappls key:", import.meta.env.VITE_MAPPLS_KEY);

function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("command");

  const [selectedArea, setSelectedArea] = useState({
    lat: DEFAULT_FORM.latitude,
    lng: DEFAULT_FORM.longitude,
    label: "Default Bengaluru event zone",
  });

  useEffect(() => {
    getOptions()
      .then((data) => setOptions(data))
      .catch(() => console.log("Backend options not loaded."));
  }, []);

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const makePayload = (sourceForm) => ({
    ...sourceForm,
    latitude: Number(sourceForm.latitude),
    longitude: Number(sourceForm.longitude),
    crowd_size: Number(sourceForm.crowd_size),
    start_hour: Number(sourceForm.start_hour),
    duration_hours: Number(sourceForm.duration_hours),
    available_officers: Number(sourceForm.available_officers),
    available_barricades: Number(sourceForm.available_barricades),
  });

  const runAnalysisWithForm = async (sourceForm) => {
    setLoading(true);
    try {
      const data = await analyzeEvent(makePayload(sourceForm));
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Backend not responding. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    await runAnalysisWithForm(form);
  };

  const runScenario = async (scenarioKey) => {
    const updated = {
      ...form,
      scenario: scenarioKey,
    };

    setForm(updated);
    await runAnalysisWithForm(updated);
  };

  const handleMapClick = (latlng) => {
    const lat = Number(latlng.lat.toFixed(5));
    const lng = Number(latlng.lng.toFixed(5));

    setSelectedArea({
      lat,
      lng,
      label: "Custom selected event zone",
    });

    setForm((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  return (
    <div className="app">
      <div className="shell">
        <Header />

        <Tabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "command" && (
          <div className="tabGrid">
            <EventSetup
              form={form}
              options={options}
              updateForm={updateForm}
              runAnalysis={runAnalysis}
              loading={loading}
            />

            <section className="panel commandBrief">
              <h2>Command Summary</h2>
              {!result ? (
                <p className="subtitle">
                  Run analysis to generate ML-based event risk, comparable events,
                  timeline, deployment plan, lifeline status, and resource slack.
                </p>
              ) : (
                <div className="metricGrid compact">
                  <MetricCard
                    icon={<AlertTriangle />}
                    label="Risk Score"
                    value={`${result.summary.risk_score}/100`}
                    note={result.summary.risk_level}
                    danger
                  />
                  <MetricCard
                    icon={<Brain />}
                    label="Closure Probability"
                    value={`${Math.round(result.summary.road_closure_probability * 100)}%`}
                    note="ML estimate"
                  />
                  <MetricCard
                    icon={<Zap />}
                    label="Highest Risk Window"
                    value="15–30 min"
                    note="after event ends"
                  />
                  <MetricCard
                    icon={<ShieldCheck />}
                    label="Confidence"
                    value={result.comparable_memory.confidence.label}
                    note={`${result.comparable_memory.confidence.score}/100`}
                  />
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "map" && (
          <MapplsAreaLens
            form={form}
            result={result}
            selectedArea={selectedArea}
            handleMapClick={handleMapClick}
          />
        )}

        {activeTab === "timeline" && (
          <div className="tabGrid">
            <ImpactTimeline result={result} />
            <ComparableMemory result={result} />
          </div>
        )}

        {activeTab === "wargame" && (
          <div className="tabGrid">
            <WarGameLab
              form={form}
              result={result}
              updateForm={updateForm}
              runScenario={runScenario}
              runAnalysis={runAnalysis}
              loading={loading}
            />
            <div className="stack">
              <LifelineGuardian result={result} />
              <ResourceSlack result={result} />
            </div>
          </div>
        )}

        {activeTab === "learning" && <PostEventLearning result={result} />}
      </div>
    </div>
  );
}

export default App;