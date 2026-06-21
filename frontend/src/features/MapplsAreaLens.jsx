import { useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";

function getClickLatLng(e) {
  if (!e) return null;

  if (e.lngLat) {
    if (typeof e.lngLat.lat === "number" && typeof e.lngLat.lng === "number") {
      return {
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
      };
    }

    if (typeof e.lngLat.lat === "function" && typeof e.lngLat.lng === "function") {
      return {
        lat: e.lngLat.lat(),
        lng: e.lngLat.lng(),
      };
    }
  }

  if (e.latlng) {
    return {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    };
  }

  if (e.latLng) {
    return {
      lat: typeof e.latLng.lat === "function" ? e.latLng.lat() : e.latLng.lat,
      lng: typeof e.latLng.lng === "function" ? e.latLng.lng() : e.latLng.lng,
    };
  }

  return null;
}

function makeNode(lat, lng, name, type, color, description) {
  return {
    name,
    type,
    color,
    description,
    position: { lat, lng },
  };
}

export default function MapplsAreaLens({
  form,
  result,
  selectedArea,
  handleMapClick,
}) {
  const mapRef = useRef(null);
  const [status, setStatus] = useState("Loading Mappls Area Lens...");

  useEffect(() => {
    const key = import.meta.env.VITE_MAPPLS_KEY;

    if (!key) {
      setStatus("Mappls key missing. Add VITE_MAPPLS_KEY in .env.local");
      return;
    }

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    const riskScore = result?.summary?.risk_score || 45;

    const outerRadius = riskScore >= 75 ? 2100 : riskScore >= 45 ? 1400 : 750;
    const innerRadius = Math.round(outerRadius * 0.48);

    const riskNodes = [
      makeNode(
        lat + 0.0045,
        lng - 0.0035,
        "Crowd Exit Pressure",
        "Exit surge",
        "#8b5cf6",
        "Likely point where crowd exits together and spills into the road network."
      ),
      makeNode(
        lat - 0.004,
        lng - 0.006,
        "Parking Spillover",
        "Vehicle buildup",
        "#f59e0b",
        "Parking shortage may push vehicles into nearby lanes and junctions."
      ),
      makeNode(
        lat - 0.006,
        lng + 0.006,
        "Diversion Overload",
        "Route pressure",
        "#ef4444",
        "Diversion route may overload during the dispersal shockwave."
      ),
      makeNode(
        lat + 0.008,
        lng + 0.012,
        "Lifeline Pinch Point",
        "Emergency risk",
        "#0ea5e9",
        "Critical point where the emergency corridor must stay clear."
      ),
    ];

    const initializeMap = () => {
      if (!window.mappls) {
        setStatus("Mappls SDK loaded but window.mappls not found.");
        return;
      }

      if (mapRef.current) {
        mapRef.current.innerHTML = "";
      }

      try {
        const map = new window.mappls.Map("mappls-area-lens-map", {
          center: { lat, lng },
          zoom: 14,
          zoomControl: true,
          location: true,
        });

        if (map.addListener) {
          map.addListener("click", (e) => {
            const clicked = getClickLatLng(e);

            if (clicked) {
              handleMapClick({
                lat: clicked.lat,
                lng: clicked.lng,
              });
            }
          });
        }

        new window.mappls.Circle({
          map,
          center: { lat, lng },
          radius: outerRadius,
          strokeColor: "#ef4444",
          strokeOpacity: 0.95,
          strokeWeight: 2,
          fillColor: "#ef4444",
          fillOpacity: 0.14,
          fitbounds: true,
        });

        new window.mappls.Circle({
          map,
          center: { lat, lng },
          radius: innerRadius,
          strokeColor: "#f97316",
          strokeOpacity: 0.95,
          strokeWeight: 2,
          fillColor: "#f97316",
          fillOpacity: 0.22,
        });

        new window.mappls.Marker({
          map,
          position: { lat, lng },
          title: "Selected Event Venue",
          popupHtml:
            "<b>Selected Event Venue</b><br/>Click anywhere on the map to move this event zone.",
        });

        riskNodes.forEach((node) => {
          const html = `
            <div style="
              width:18px;
              height:18px;
              border-radius:999px;
              background:${node.color};
              border:3px solid white;
              box-shadow:0 8px 22px rgba(15,23,42,0.35);
            "></div>
          `;

          new window.mappls.Marker({
            map,
            position: node.position,
            html,
            title: node.name,
            popupHtml: `
              <b>${node.name}</b><br/>
              ${node.type}<br/>
              ${node.description}
            `,
          });
        });

        new window.mappls.Polyline({
          map,
          path: [
            { lat, lng },
            { lat: lat + 0.012, lng: lng + 0.018 },
          ],
          strokeColor: "#0ea5e9",
          strokeOpacity: 1,
          strokeWeight: 7,
          popupHtml: "Protected Lifeline Corridor",
        });

        setStatus("Mappls Area Lens active. Click on the map to select event zone.");
      } catch (error) {
        console.error(error);
        setStatus("Mappls loaded, but Area Lens initialization failed.");
      }
    };

    const existingScript = document.getElementById("mappls-sdk");

    if (existingScript) {
      initializeMap();
      return;
    }

    const script = document.createElement("script");
    script.id = "mappls-sdk";
    script.src = `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${key}`;
    script.async = true;
    script.onload = initializeMap;
    script.onerror = () => {
      setStatus("Failed to load Mappls SDK. Check static key or whitelisting.");
    };

    document.body.appendChild(script);
  }, [
    form.latitude,
    form.longitude,
    result?.summary?.risk_score,
    handleMapClick,
  ]);

  return (
    <section className="panel">
      <div className="sectionHead">
        <Activity size={20} />
        <h2>Area Lens Map</h2>
      </div>

      <p className="subtitle">
        Powered by Mappls. Click any location to create a new event zone and
        visualize shockwave spread, pressure nodes, and lifeline corridor.
      </p>

      <div id="mappls-area-lens-map" ref={mapRef} className="mapplsMap"></div>

      <div className="legend">
        <span>
          <b className="dot red"></b> Shockwave spread zone
        </span>
        <span>
          <b className="dot orange"></b> Core pressure zone
        </span>
        <span>
          <b className="line blue"></b> Lifeline corridor
        </span>
      </div>

      <div className="nodeLegend">
        <span>
          <b style={{ background: "#8b5cf6" }}></b> Crowd exit
        </span>
        <span>
          <b style={{ background: "#f59e0b" }}></b> Parking spillover
        </span>
        <span>
          <b style={{ background: "#ef4444" }}></b> Diversion overload
        </span>
        <span>
          <b style={{ background: "#0ea5e9" }}></b> Lifeline pinch point
        </span>
      </div>

      <div className="areaLens">
        <div>
          <b>Area Lens Mode</b>
          <p>{status}</p>
        </div>

        <div className="areaCoords">
          {selectedArea.label}
          <span>
            {selectedArea.lat}, {selectedArea.lng}
          </span>
        </div>
      </div>
    </section>
  );
}