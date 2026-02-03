const express = require('express');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const app = express();
const PORT = process.env.PORT || 3000;

// Substitua pela sua string de conexão do Atlas
const MONGO_URI = 'mongodb+srv://dbuser:sinf2abmp@sinf2.ymbvmi4.mongodb.net/';

mongoose.connect(MONGO_URI).catch((err) => {
  console.warn('MongoDB indisponível. Funcionalidades de email podem falhar.');
  console.warn(err?.message || err);
});

mongoose.connection.on('error', (err) => {
  console.warn('Erro de ligação ao MongoDB:', err?.message || err);
});

const EmailSchema = new mongoose.Schema({
  email: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const Email = mongoose.model('Email', EmailSchema);

app.use(express.json());
app.use(express.static(__dirname));
const mqttConfig = {
  broker: process.env.SHELLY_MQTT_BROKER || '3885b212bedd4eebb03ddfd6e5eff3cc.s1.eu.hivemq.cloud',
  port: Number(process.env.SHELLY_MQTT_PORT || 8883),
  username: process.env.SHELLY_MQTT_USERNAME || 'kynex',
  password: process.env.SHELLY_MQTT_PASSWORD || '1a2b3c4dA',
  topicHeater: process.env.SHELLY_MQTT_TOPIC_1 || process.env.SHELLY_MQTT_TOPIC || 'shellyazplug-e4b3232ea858/rpc',
  topicLamp: process.env.SHELLY_MQTT_TOPIC_2 || 'shellyplugsg3-d0cf13c8eeac/rpc'
};

const mqttTopics = {
  heater: {
    rpc: mqttConfig.topicHeater,
    events: mqttConfig.topicHeater?.replace('/rpc', '/events/rpc')
  },
  lamp: {
    rpc: mqttConfig.topicLamp,
    events: mqttConfig.topicLamp?.replace('/rpc', '/events/rpc')
  }
};

const shellyStatus = {
  heater: { on: null, updatedAt: null },
  lamp: { on: null, updatedAt: null }
};

const statusClients = new Set();

function broadcastStatus(device) {
  const payload = {
    device,
    on: shellyStatus[device].on,
    updatedAt: shellyStatus[device].updatedAt
  };

  const data = `data: ${JSON.stringify(payload)}\n\n`;
  statusClients.forEach((res) => res.write(data));
}

function extractSwitchOutput(message) {
  if (!message || typeof message !== 'object') return null;

  const params = message.params || message.result || message;

  if (params && typeof params.output === 'boolean') return params.output;

  const switchPayload = params && (params.switch || params['switch:0'] || params['switch:1']);
  if (switchPayload && typeof switchPayload.output === 'boolean') return switchPayload.output;
  if (switchPayload && typeof switchPayload.on === 'boolean') return switchPayload.on;

  const notifyStatus = params && (params['switch:0'] || params['switch:1']);
  if (notifyStatus && typeof notifyStatus.output === 'boolean') return notifyStatus.output;

  if (typeof message.output === 'boolean') return message.output;

  return null;
}

function updateShellyStatus(device, on) {
  if (typeof on !== 'boolean') return;
  shellyStatus[device].on = on;
  shellyStatus[device].updatedAt = Date.now();
  broadcastStatus(device);
}

const mqttClient = mqtt.connect({
  host: mqttConfig.broker,
  port: mqttConfig.port,
  protocol: 'mqtts',
  username: mqttConfig.username,
  password: mqttConfig.password,
  clientId: `kynex-site-${Math.random().toString(16).slice(2)}`,
  keepalive: 60
});

function requestShellyStatus(topic, requestId) {
  const payload = {
    id: requestId,
    src: 'kynex-site',
    method: 'Switch.GetStatus',
    params: { id: 0 }
  };
  mqttClient.publish(topic, JSON.stringify(payload));
}

mqttClient.on('connect', () => {
  console.log('MQTT conectado ao broker Shelly.');
  const topics = [
    mqttTopics.heater.rpc,
    mqttTopics.lamp.rpc,
    mqttTopics.heater.events,
    mqttTopics.lamp.events
  ].filter(Boolean);
  mqttClient.subscribe(topics, (err) => {
    if (err) {
      console.error('Erro ao subscrever MQTT:', err);
    }
  });

  if (mqttTopics.heater.rpc) {
    requestShellyStatus(mqttTopics.heater.rpc, 1);
  }
  if (mqttTopics.lamp.rpc) {
    requestShellyStatus(mqttTopics.lamp.rpc, 2);
  }
});

setInterval(() => {
  if (mqttClient.connected) {
    if (mqttTopics.heater.rpc) {
      requestShellyStatus(mqttTopics.heater.rpc, 101);
    }
    if (mqttTopics.lamp.rpc) {
      requestShellyStatus(mqttTopics.lamp.rpc, 102);
    }
  }
}, 15000);

mqttClient.on('message', (topic, payload) => {
  let parsed = null;
  try {
    parsed = JSON.parse(payload.toString());
  } catch (err) {
    console.warn('MQTT payload inválido:', err);
    return;
  }

  const isHeaterTopic = topic === mqttTopics.heater.rpc || topic === mqttTopics.heater.events;
  const isLampTopic = topic === mqttTopics.lamp.rpc || topic === mqttTopics.lamp.events;

  const output = extractSwitchOutput(parsed);

  if (isHeaterTopic) {
    updateShellyStatus('heater', output);
    if (typeof output === 'boolean') {
      console.log('Estado aquecedor:', output ? 'ON' : 'OFF');
    }
  } else if (isLampTopic) {
    updateShellyStatus('lamp', output);
    if (typeof output === 'boolean') {
      console.log('Estado candeeiro:', output ? 'ON' : 'OFF');
    }
  }
});

mqttClient.on('error', (err) => {
  console.error('Erro MQTT:', err);
});

app.get('/shelly-status', (req, res) => {
  const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  console.log('Cliente SSE conectado.');
  statusClients.add(res);

  ['heater', 'lamp'].forEach((device) => {
    if (typeof shellyStatus[device].on === 'boolean') {
      const data = {
        device,
        on: shellyStatus[device].on,
        updatedAt: shellyStatus[device].updatedAt
      };
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  });

  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    statusClients.delete(res);
    console.log('Cliente SSE desligado.');
  });
});

app.post('/save-email', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  try {
    await Email.create({ email });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao guardar email' });
  }
});

app.get('/emails', async (req, res) => {
  try {
    const emails = await Email.find().sort({ created_at: -1 });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar emails' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});