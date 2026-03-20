📡 MQTT Smart Meter Dashboard

A real-time IoT dashboard that visualizes smart meter telemetry using MQTT, Node.js, and Chart.js.

🚀 Features

Real-time data streaming via MQTT

Live updating dashboard (no page refresh)

Voltage and current visualization using charts

Balance monitoring

Clean and responsive UI

🧠 How It Works

The application connects to an MQTT broker (mqtt://byte-iot.net:1883)

It subscribes to /topic/# to receive smart meter data

Incoming messages are parsed and sent to the frontend using WebSockets (Socket.IO)

The frontend updates charts and metrics in real time

📊 Metrics Displayed

Voltage (V) – Electrical supply level

Current (A) – Power consumption

Balance (KES) – Remaining prepaid energy

🛠️ Tech Stack

Node.js

Express.js

MQTT.js

Socket.IO

Chart.js

▶️ Run Locally
npm install
node app.js

Open:

http://localhost:3000
📌 Use Case

This dashboard can be extended for:

Smart energy monitoring

IoT telemetry systems

Fleet/telematics tracking

Real-time analytics dashboards
