# InSafe — Personal & Women Safety Platform

<p align="center">
  <img src="public/images/insafe-splash.jpg" alt="InSafe Preview" width="340" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
</p>

<p align="center">
  <strong>Safety is Freedom. Automated emergency alerts, live GPS geofencing, and discreet companion tools.</strong>
</p>

---

## 🌟 Key Features

### 1. Zero-Friction Onboarding & Identity
- Direct onboarding with no password barriers.
- **Gender Personalization**: Select Female, Male, Non-Binary, or Other.
- **25+ Curated Safety Avatars**: Diverse, expressive avatar catalog for users and emergency contacts.
- Quick profile and avatar management anytime in Settings.

### 2. 3-Second Press & Hold SOS Trigger
- Dedicated safety hold mechanism (`3-second hold`) prevents accidental triggers while remaining instantaneous in emergencies.
- Dynamic circular progress fill and haptic vibration feedback.

### 3. Automated WhatsApp SOS Dispatch (Zero-Click Required)
- Background WhatsApp dispatch pipeline via `/api/sos-whatsapp`.
- Automatically loops live GPS coordinates every **1 minute (60 seconds)** to all trusted emergency contacts until marked safe.
- Tokenized message templates: `{{location}}`, `{{maps_link}}`, `{{timestamp}}`.

### 4. Live Interactive OpenStreetMap & Geofencing
- Real-time map rendering with a glowing 190px safety geofence zone.
- Custom InSafe safety shield marker with coordinates centering.

### 5. Discreet Safety Tools
- **Fake Call Simulation**: Realistic incoming call screen with custom delay, ringtones, caller names, and interactive Accept/Decline simulation.
- **Mute Call / Silent SOS**: Completely noiseless emergency alert activation for situations where you cannot speak.
- **InSafe Network (SafeNet)**: Community incident reporting (poor lighting, unsafe areas, harassment) with neighborhood map pins.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/SypherKx/InSafe.git

# Navigate to project folder
cd InSafe

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Mobile-First Experience
InSafe is designed with an optimal mobile shell (`max-w-[430px]`) that provides a native mobile app feel directly in modern web browsers.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: Tailwind CSS, Vanilla CSS Design System, Radix UI Slot
- **Icons**: Lucide React
- **Maps**: OpenStreetMap Live Geofence Integration
- **Background Dispatch**: Next.js Serverless Route Handlers (`/api/sos-whatsapp`)

---

## 🛡️ License
MIT License. Built for community safety and empowerment.
