import { useEffect, useRef, useState } from "react";

export default function MapplsTestMap({ form }) {
  const mapRef = useRef(null);
  const [status, setStatus] = useState("Loading Mappls SDK...");

  useEffect(() => {
    const key = import.meta.env.VITE_MAPPLS_KEY;

    if (!key) {
      setStatus("Mappls key missing. Add VITE_MAPPLS_KEY in .env.local");
      return;
    }

    const initializeMap = () => {
      if (!window.mappls) {
        setStatus("Mappls SDK loaded but window.mappls not found.");
        return;
      }

      const lat = Number(form.latitude);
      const lng = Number(form.longitude);

      if (mapRef.current) {
        mapRef.current.innerHTML = "";
      }

      try {
        const map = new window.mappls.Map("mappls-map", {
          center: { lat, lng },
          zoom: 13,
        });

        new window.mappls.Marker({
          map,
          position: { lat, lng },
          title: "Selected Event Zone",
        });

        new window.mappls.Circle({
          map,
          center: { lat, lng },
          radius: 1400,
          strokeColor: "#ef4444",
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: "#ef4444",
          fillOpacity: 0.18,
        });

        new window.mappls.Circle({
          map,
          center: { lat, lng },
          radius: 700,
          strokeColor: "#f97316",
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: "#f97316",
          fillOpacity: 0.24,
        });

        setStatus("Mappls API connected successfully.");
      } catch (error) {
        console.error(error);
        setStatus("Mappls loaded, but map initialization failed. Check key/domain access.");
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
      setStatus("Failed to load Mappls SDK. Check key or allowed domain.");
    };

    document.body.appendChild(script);
  }, [form.latitude, form.longitude]);

  return (
    <section className="panel">
      <h2>Mappls API Test</h2>
      <p className="subtitle">
        This confirms MapmyIndia/Mappls integration before replacing the main Area Lens Map.
      </p>

      <div id="mappls-map" ref={mapRef} className="mapplsMap"></div>

      <div className="techNote">
        <b>Status:</b> {status}
      </div>
    </section>
  );
}