# TripleW Traffic Command

**Where congestion spreads. When it peaks. What action should be deployed.**

TripleW Traffic Command is an AI-powered traffic command system designed to help authorities predict, plan, and manage event-driven congestion before it becomes a crisis.

The name **TripleW** stands for the three key questions every traffic command team needs to answer during an event:

* **Where** will congestion spread?
* **When** will congestion become critical?
* **What** action should be deployed?

Instead of reacting after congestion starts, TripleW helps traffic teams plan the event before the city feels the impact.

---

## Live Links

**Live Demo:**
https://triplew-trafficcommand.onrender.com

**GitHub Repository:**
https://github.com/yashikavishwakarma/TripleW-Traffic-Command

---

## Problem Statement

Event-driven traffic congestion is difficult to control because it can build up quickly around venues, junctions, access roads, parking areas, and diversion routes.

During rallies, festivals, sports events, construction work, VIP movement, or sudden public gatherings, authorities often need to take quick decisions with limited visibility.

Current planning has three major gaps:

1. **Impact is not quantified early**
   It is difficult to estimate how much congestion an event will create before the event begins.

2. **Deployment is experience-driven**
   Manpower, barricades, signal changes, and diversion routes are often planned manually based on assumptions or past experience.

3. **No strong post-event learning loop**
   After the event ends, there is usually no systematic comparison between the predicted impact and the actual traffic outcome.

---

## Key Insight

The highest congestion does not always happen during the event.

In many cases, the most critical traffic pressure occurs **15–30 minutes after the event ends**, when large crowds and vehicles leave together.

This sudden exit wave can overload junctions, break diversion plans, increase delays, and make emergency movement difficult.

TripleW identifies this phase as the **Dispersal Shockwave**.

---

## Solution

TripleW Traffic Command acts as an AI-powered traffic war-room for planned and unplanned events.

It takes event details such as:

* Event type
* Event cause
* Event location
* Expected crowd size
* Event timing
* Available officers
* Available barricades
* Priority level
* Nearby junction and zone information

Using this information, the system predicts risk, identifies likely pressure zones, generates an impact timeline, recommends deployment actions, protects emergency movement, and supports post-event learning.

---

## Core Features

### 1. Area Lens Map with Mappls

The Area Lens Map allows officers to select any event zone and visualize the expected traffic impact.

It shows:

* Shockwave spread zone
* Core pressure zone
* Crowd exit pressure
* Parking spillover
* Diversion overload
* Protected lifeline corridor

This turns the map into a command board, not just a location viewer.

---

### 2. Impact Timeline Engine

Traffic impact is not treated as a single moment. TripleW breaks event traffic into four phases:

1. **Build-up**
   Vehicles and crowds start collecting near the event zone.

2. **Event Peak**
   Road pressure increases near gates, access roads, and key junctions.

3. **Dispersal Shockwave**
   The highest-risk phase after the event ends, when people and vehicles leave together.

4. **Recovery**
   Traffic gradually returns to normal after pressure reduces.

---

### 3. War-Game Plan Lab

Before deployment, the system stress-tests the traffic plan under real-world disruptions such as:

* Rain
* Crowd surge
* Road blockage
* Ambulance emergency

The system checks whether the plan is safe, overloaded, or likely to fail.

Based on the result, it recommends:

* Manpower allocation
* Barricade placement
* Diversion actions
* Road-control measures
* Emergency response support

---

### 4. Lifeline Corridor Guardian

TripleW protects one emergency route for:

* Ambulances
* Fire services
* Police movement
* Evacuation traffic

This ensures that traffic planning does not only control vehicles, but also protects critical movement.

---

### 5. Resource Slack Optimizer

When one zone becomes overloaded, the system identifies nearby lower-pressure zones that can temporarily lend officers or resources.

This helps improve deployment without waiting for manual coordination.

---

### 6. Post-Event Learning Loop

After the event, TripleW compares:

* Predicted traffic impact
* Actual traffic outcome
* Resource usage
* Deployment effectiveness

This helps the system learn what worked, what failed, and how future event planning can be improved.

---

## System Workflow

1. **Event Input Collection**
   The user enters event details such as location, crowd size, timing, and available resources.

2. **Risk Prediction**
   The system analyzes the event and predicts road-closure probability and congestion risk.

3. **Hotspot Identification**
   Likely congestion zones, overloaded junctions, and diversion pressure areas are identified.

4. **Impact Timeline Forecasting**
   The system estimates build-up, event peak, dispersal shockwave, and recovery phases.

5. **Response Plan Generation**
   The system recommends manpower, barricades, diversions, and emergency corridors.

6. **Post-Event Learning**
   Predicted and actual outcomes are compared to improve future planning.

---

## Tech Stack

### Frontend

* React
* Vite
* CSS
* Mappls Map SDK
* Leaflet fallback map

### Backend

* FastAPI
* Python
* Pandas
* Scikit-learn
* NumPy

### Machine Learning

* Random Forest Classifier
* Historical event data based risk prediction
* Road-closure probability estimation

### Deployment

* Render

---

## Project Structure

```txt
TripleW-Traffic-Command/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── data/
│       └── astram_event_data.csv
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── data/
│   │   ├── features/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/yashikavishwakarma/TripleW-Traffic-Command.git
cd TripleW-Traffic-Command
```

---

### 2. Run Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will run on:

```txt
http://127.0.0.1:8000
```

---

### 3. Run Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```txt
http://localhost:5173
```

---

## Environment Variables

Create a `.env.local` file inside the `frontend` folder:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_MAPPLS_KEY=your_mappls_key_here
```

For deployed frontend, set:

```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_MAPPLS_KEY=your_mappls_key_here
```

---

## Why TripleW Traffic Command?

Most traffic systems show congestion after it has already started.

TripleW helps before the breakdown by answering:

* **Where** traffic pressure starts
* **When** it turns critical
* **What** action protects movement

It shifts event traffic management from reactive control to predictive planning.

---



**Where traffic pressure starts, when it turns critical, and what action protects movement before the city feels the impact.**
