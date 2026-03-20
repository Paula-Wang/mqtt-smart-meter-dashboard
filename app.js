const express = require('express');
const mqtt = require('mqtt');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

// MQTT
const client = mqtt.connect('mqtt://byte-iot.net:1883');

client.on('connect', () => {
    console.log('Connected to MQTT');
    client.subscribe('/topic/#');
});

// Handle incoming data
client.on('message', (topic, message) => {
    let parsed;

    try {
        parsed = JSON.parse(message.toString());
    } catch {
        return;
    }

    if (!parsed.meter || parsed.meter.length === 0) return;

    const data = {
        time: new Date().toLocaleTimeString(),
        voltage: parsed.meter[0].voltage,
        current: parsed.meter[0].current,
        balance: parsed.meter[0].balance
    };

    io.emit('newData', data);
});

// Route
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>MQTT Dashboard</title>

        <script src="/socket.io/socket.io.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

        <style>
            body {
                font-family: Arial;
                background: #0f172a;
                color: white;
                text-align: center;
            }

            h1 {
                margin-top: 20px;
            }

            p {
                color: #94a3b8;
            }

            .container {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin: 30px;
            }

            .card {
                background: #1e293b;
                padding: 20px;
                border-radius: 12px;
                width: 200px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            }

            .value {
                font-size: 28px;
                color: #38bdf8;
            }

            .charts {
                width: 95%;
                max-width: 1300px;
                margin: auto;
            }

            canvas {
                width: 100% !important;
                height: 400px !important;
                margin-top: 40px;
            }
        </style>
    </head>

    <body>

    <h1>📡 MQTT Smart Meter Dashboard</h1>
    <p>Real-time telemetry</p>

    <div class="container">
        <div class="card">
            <h3>Voltage ⚡</h3>
            <div id="voltage" class="value">-</div>
        </div>

        <div class="card">
            <h3>Current 🔌</h3>
            <div id="current" class="value">-</div>
        </div>

        <div class="card">
            <h3>Balance 💰</h3>
            <div id="balance" class="value">-</div>
        </div>
    </div>

    <div class="charts">
        <canvas id="voltageChart"></canvas>
        <canvas id="currentChart"></canvas>
    </div>

    <script>
        const socket = io();

        // VOLTAGE CHART
        const vCtx = document.getElementById('voltageChart').getContext('2d');
        const voltageChart = new Chart(vCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Voltage (V)',
                    data: [],
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56,189,248,0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                plugins: {
                    legend: { labels: { color: 'white' } }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Time', color: 'white' },
                        ticks: { color: 'white' }
                    },
                    y: {
                        min: 220,
                        max: 240,
                        title: {
                            display: true,
                            text: 'Voltage (V)',
                            color: 'white'
                        },
                        ticks: { color: 'white' }
                    }
                }
            }
        });

        // CURRENT CHART
        const cCtx = document.getElementById('currentChart').getContext('2d');
        const currentChart = new Chart(cCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Current (A)',
                    data: [],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245,158,11,0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                plugins: {
                    legend: { labels: { color: 'white' } }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Time', color: 'white' },
                        ticks: { color: 'white' }
                    },
                    y: {
                        min: 3.5,
                        max: 4.5,
                        title: {
                            display: true,
                            text: 'Current (A)',
                            color: 'white'
                        },
                        ticks: { color: 'white' }
                    }
                }
            }
        });

        socket.on('newData', (data) => {

            // update cards
            document.getElementById('voltage').innerText = data.voltage + ' V';
            document.getElementById('current').innerText = data.current + ' A';
            document.getElementById('balance').innerText = data.balance + ' KES';

            // voltage chart
            voltageChart.data.labels.push(data.time);
            voltageChart.data.datasets[0].data.push(data.voltage);

            // current chart
            currentChart.data.labels.push(data.time);
            currentChart.data.datasets[0].data.push(data.current);

            // keep last 20 points
            if (voltageChart.data.labels.length > 20) {
                voltageChart.data.labels.shift();
                voltageChart.data.datasets[0].data.shift();

                currentChart.data.labels.shift();
                currentChart.data.datasets[0].data.shift();
            }

            voltageChart.update();
            currentChart.update();
        });
    </script>

    </body>
    </html>
    `);
});

// Start server
server.listen(port, () => {
    console.log('Dashboard running at http://localhost:' + port);
});
