import { Zap } from "lucide-react";

export default function Header() {
  return (
    <header className="hero">
      <div>
        <p className="eyebrow">Gridlock Hackathon 2.0 • PS2</p>
        <h1>TripleW Traffic Command</h1>
        <p className="heroText">
          Forecast the event impact timeline, war-game deployment plans,
          protect emergency movement, and learn after every event.
        </p>
      </div>

      <div className="heroCard">
        <Zap size={22} />
        <div>
          <b>Core Innovation</b>
          <span>Dispersal Shockwave + War-Game Plan Lab</span>
        </div>
      </div>
    </header>
  );
}