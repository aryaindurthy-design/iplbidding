# 🏏 IPL Mega Auction Arena & Pro AI Squad Analyzer

A broadcast-grade, real-time multiplayer IPL Mega Auction simulator inspired by `crickauction.in`, built with instant room lobbies, official player headshots, T20 stats, authentic IPL franchise theme songs on every hammer drop, and the **Pro AI Cricket Judge of All Time**!

---

## ⚡ Quick Start

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Start the Live Auction Server
npm start
```

- **Local URL (on your laptop):** `http://localhost:3000`
- **Wi-Fi URL (for your friends on their phones/laptops):** `http://<YOUR-IP>:3000` (e.g. `http://10.204.237.21:3000`)

---

## 🌟 Key Features

### 1. 👥 Real-Time Multiplayer Rooms
- **Host a Room:** Choose your franchise, customize your budget (₹80 Cr, ₹100 Cr, ₹120 Cr), set hammer countdown timer (10s, 12s, 15s), and generate a 5-letter Room Code.
- **Join with 1 Click:** Friends open the room link or enter the Room Code from their phones/laptops and pick from remaining unpicked franchises.
- **Smart AI Bots:** If only 2, 3, or 4 friends are playing, the remaining franchises are controlled by intelligent AI bots with unique bidding personalities (e.g. MI aggressive pacer bidding, CSK veteran/spin bias, SRH power-hitter bias).
- **1-Click Solo Arena:** Quick test against 9 bots in pass-and-play mode!

### 2. 🎵 Authentic IPL Franchise Anthems & SFX
- **SOLD Announcement:** Whenever a player is sold to any franchise:
  - The auction gavel strikes with a sharp wooden `CLACK!`
  - Confetti erupts across the screen in the winning franchise's colors!
  - The enthusiastic auctioneer voice announces: *"SOLD! Virat Kohli goes to Royal Challengers Bengaluru for ₹22.00 Crores! Play Bold!"*
  - **The official team anthem blasts immediately:**
    - 🟡 **CSK:** *Whistle Podu* Whistle Trills & Dholak Beats
    - 🔵 **MI:** *Duniya Hila Denge* Fanfare Brass Trumpets & Drums
    - 🔴 **RCB:** *Play Bold* Stadium Rock Distortion Riff
    - 🟣 **KKR:** *Korbo Lorbo Jeetbo* Dholak & Celebration Horns
    - 🟠 **SRH:** *Orange Army* War Cry Brass
    - 🌸 **RR:** *Halla Bol* Folk Dhol & Stadium Chant
    - 🔵 **DC:** *Roar Macha* Urban Beat Drop
    - 🔴 **PBKS:** *Dhum Punjabi / Sadda Punjab* Bhangra Dhol Beats
    - 🔷 **LSG:** *Gazab Andaz* Horn Swag
    - 🛡️ **GT:** *Aava De* Garba Beat Synth
- **Tension Countdown Sound:** Ticking tension sound during the final 5 seconds of the auction clock.
- **Anti-Snipe Protection:** Bidding with under 4 seconds remaining resets the clock to 7 seconds!

### 3. 🧠 The Legendary Pro AI Squad Analyzer & Brutal Cricket Judge
The feature crickauction.in was missing! Once you complete your 11-player squad (or end the auction):
- **Tactical Playing XI Builder (1 to 11):**
  - Dynamically arranges the 11 players into optimal batting order (Openers, Anchors, Middle-order enforcers, Designated Wicketkeeper, Finishers, Bowling All-rounders, and Frontline Pacers & Spinners).
  - Automatically identifies Designated Captain 👑 (C) and Wicketkeeper 🧤 (WK).
- **Radar & Metrics (0-100):**
  - 🏏 Batting Firepower & Depth
  - 🎯 Bowling Penetration & Death Bowling Execution
  - ⚖️ Tactical Synergy & Balance
  - ✈️ Overseas Quota Compliance (max 4 allowed)
- **Aura Points Engine (-5,000 to +10,000 Aura):**
  - Evaluates match-winners, clutch players, and tactical masterclasses.
  - Brutal penalties for:
    - 🚫 Zero Wicketkeepers (-2,000 Aura: *"Who is keeping wickets? The owner?")*
    - ✈️ >4 Overseas Players (-2,500 Aura: *"BCCI rules violated!")*
    - 📉 <5 Bowling options (-1,200 Aura)
  - Tier Grades: `SSS GOD TIER DYNASTY`, `S CHAMPIONSHIP FAVORITES`, `A PLAYOFF LOCK`, `B MID-TABLE DRAMA`, `C PBKS CLOWN FIESTA`, `F TOTAL FRAUD`.
- **The 3 Iconic Commentaries:**
  1. 🎙️ **Ravi Shastri Electrifying Breakdown:** *"LIKE A TRACER BULLET!..."*
  2. 🧐 **Harsha Bhogle Poetic Analysis:** *"There is a quiet, deliberate symmetry..."*
  3. 🔥 **Savage Gen-Z Roast & Aura Audit:** Roasts toxic overpays, missing gloves, and clown bids!
- **Playoffs Simulation:**
  - Simulates the entire IPL league stage and playoffs (Qualifier 1, Eliminator, Qualifier 2, Grand Finale)!
  - Crowns the Champion Trophy 🏆, Orange Cap 🟠, Purple Cap 🟣, and Clown Franchise Award 🤡.
- **1-Click Shareable Squad Card:**
  - One-click copy formatted squad report card to flex on your friends in WhatsApp and Discord!

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express, Socket.io (zero external cloud dependencies, instant latency).
- **Audio Engine:** Web Audio API polyphonic synthesizers + Web Speech API auctioneer.
- **Frontend:** Broadcast-grade Glassmorphism UI, Responsive CSS, Canvas Confetti.
- **Dataset:** 275+ verified IPL superstars with official headshots, T20 stats, and base prices.

