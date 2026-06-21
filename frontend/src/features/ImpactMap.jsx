import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Polyline,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Activity } from "lucide-react";
import { useEffect } from "react";

function MapInteraction({ center, onMapClick }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });

  return null;
}

export default function ImpactMap({ form, result, selectedArea, handleMapClick }) {
  const lat = Number(form.latitude);
  const lng = Number(form.longitude);
  const center = [lat, lng];

  const riskScore = result?.summary?.risk_score || 45;
  const outerRadius = riskScore >= 75 ? 2100 : riskScore >= 45 ? 1400 : 750;
  const innerRadius = outerRadius * 0.48;

  const lifelineRoute = [
    [lat, lng],
    [lat + 0.012, lng + 0.018],
  ];

  const riskNodes = [
    {
      name: "Crowd Exit Pressure",
      type: "Exit surge",
      position: [lat + 0.0045, lng - 0.0035],
      color: "#8b5cf6",
      description: "Likely point where crowd exits together and spills into the road network.",
    },
    {
      name: "Parking Spillover",
      type: "Vehicle buildup",
      position: [lat - 0.004, lng - 0.006],
      color: "#f59e0b",
      description: "Parking shortage may push vehicles into nearby lanes and junctions.",
    },
    {
      name: "Diversion Overload",
      type: "Route pressure",
      position: [lat - 0.006, lng + 0.006],
      color: "#ef4444",
      description: "Diversion route may overload during the dispersal shockwave.",
    },
    {
      name: "Lifeline Pinch Point",
      type: "Emergency risk",
      position: [lat + 0.008, lng + 0.012],
      color: "#0ea5e9",
      description: "Critical point where the emergency corridor must stay clear.",
    },
  ];

  return (
    <section className="panel">
      <div className="sectionHead">
        <Activity size={20} />
        <h2>Area Lens Map</h2>
      </div>

      <MapContainer center={center} zoom={13} className="map">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapInteraction center={center} onMapClick={handleMapClick} />

        <Circle
          center={center}
          radius={outerRadius}
          pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.12, weight: 2 }}
        />

        <Circle
          center={center}
          radius={innerRadius}
          pathOptions={{ color: "#f97316", fillColor: "#f97316", fillOpacity: 0.2, weight: 2 }}
        />

        <CircleMarker
          center={center}
          radius={10}
          pathOptions={{ color: "#0f172a", fillColor: "#0f172a", fillOpacity: 1, weight: 3 }}
        >
          <Popup>
            <b>Selected Event Venue</b>
            <br />
            Click anywhere on the map to move this zone.
          </Popup>
        </CircleMarker>

        {riskNodes.map((node) => (
          <CircleMarker
            key={node.name}
            center={node.position}
            radius={8}
            pathOptions={{ color: node.color, fillColor: node.color, fillOpacity: 0.95, weight: 2 }}
          >
            <Popup>
              <b>{node.name}</b>
              <br />
              {node.type}
              <br />
              {node.description}
            </Popup>
          </CircleMarker>
        ))}

        <Polyline positions={lifelineRoute} pathOptions={{ color: "#0ea5e9", weight: 6 }}>
          <Popup>Protected Lifeline Corridor</Popup>
        </Polyline>
      </MapContainer>

      <div className="legend">
        <span><b className="dot red"></b> Shockwave spread zone</span>
        <span><b className="dot orange"></b> Core pressure zone</span>
        <span><b className="line blue"></b> Lifeline corridor</span>
      </div>

      <div className="nodeLegend">
        <span><b style={{ background: "#8b5cf6" }}></b> Crowd exit</span>
        <span><b style={{ background: "#f59e0b" }}></b> Parking spillover</span>
        <span><b style={{ background: "#ef4444" }}></b> Diversion overload</span>
        <span><b style={{ background: "#0ea5e9" }}></b> Lifeline pinch point</span>
      </div>

      <div className="areaLens">
        <div>
          <b>Area Lens Mode</b>
          <p>Click anywhere on the map to set a new event zone and scan its impact.</p>
        </div>
        <div className="areaCoords">
          {selectedArea.label}
          <span>{selectedArea.lat}, {selectedArea.lng}</span>
        </div>
      </div>
    </section>
  );
}