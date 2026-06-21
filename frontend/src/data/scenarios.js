export const DEFAULT_FORM = {
  event_type: "planned",
  event_cause: "public_event",
  latitude: 12.9716,
  longitude: 77.5946,
  corridor: "Non-corridor",
  police_station: "Cubbon Park",
  zone: "Central Zone 1",
  junction: "TownhallJunction",
  priority: "High",
  crowd_size: 18000,
  start_hour: 18,
  duration_hours: 3,
  available_officers: 35,
  available_barricades: 5,
  scenario: "crowd_surge",
};

export const SCENARIO_CARDS = [
  {
    key: "normal",
    title: "Normal Flow",
    icon: "activity",
    desc: "Baseline event pressure without extra disruption.",
  },
  {
    key: "rain",
    title: "Rain Hit",
    icon: "rain",
    desc: "Slower movement, poor visibility and sudden road pressure.",
  },
  {
    key: "vip_movement",
    title: "VIP Movement",
    icon: "crown",
    desc: "Security movement causes temporary road restrictions.",
  },
  {
    key: "crowd_surge",
    title: "Crowd Surge",
    icon: "users",
    desc: "Large crowd exits together after the event ends.",
  },
  {
    key: "road_blockage",
    title: "Road Blockage",
    icon: "siren",
    desc: "One major route becomes unavailable mid-event.",
  },
  {
    key: "ambulance_emergency",
    title: "Ambulance Emergency",
    icon: "ambulance",
    desc: "Tests whether the lifeline corridor stays clear.",
  },
];

export const TABS = [
  { key: "command", label: "Command Center" },
  { key: "map", label: "Area Lens Map" },
  { key: "timeline", label: "Impact Timeline" },
  { key: "wargame", label: "War-Game Lab" },
  { key: "learning", label: "Learning Loop" },
];