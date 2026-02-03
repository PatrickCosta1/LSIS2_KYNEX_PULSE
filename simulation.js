// KYNEX PULSE - Simulation Control
console.log('KYNEX PULSE - Simulation Ready');

// Consumption rates
const HEATER_RATES = {
    live: 0.00014,      // € por segundo
    '24h': 11,          // € por 24h
    mensal: 60,         // € por mês (4h/dia)
    anual: 720          // € por ano (4h/dia)
};

const LAMP_RATES = {
    live: 0.00002,      // € por segundo
    mensal: 13,         // € por mês (6h/dia)
    anual: 150          // ~ € por ano (6h/dia)
};

// State
const state = {
    heater: {
        on: null,
        period: 'live',
        liveValue: 0
    },
    lamp: {
        on: null,
        period: 'live',
        liveValue: 0
    }
};

// Elements
const heaterStatus = document.getElementById('heaterStatus');
const heaterConsumption = document.getElementById('heaterConsumption');
const heaterNote = document.getElementById('heaterNote');

const lampStatus = document.getElementById('lampStatus');
const lampConsumption = document.getElementById('lampConsumption');
const lampNote = document.getElementById('lampNote');

function applyDeviceState(device, isOn) {
    const statusElement = device === 'heater' ? heaterStatus : lampStatus;
    const deviceState = state[device];

    deviceState.on = isOn;

    if (isOn === true) {
        statusElement.textContent = 'ON';
        statusElement.classList.add('active');
        statusElement.classList.remove('inactive');
    } else if (isOn === false) {
        statusElement.textContent = 'OFF';
        statusElement.classList.remove('active');
        statusElement.classList.add('inactive');
        deviceState.liveValue = 0;
    } else {
        statusElement.textContent = 'AGUARDANDO';
        statusElement.classList.remove('active');
        statusElement.classList.remove('inactive');
    }

    // Controlar glows do modelo 3D
    if (device === 'heater' && window.setHeaterState && typeof isOn === 'boolean') {
        window.setHeaterState(isOn);
    }
    if (device === 'lamp' && window.setLampState && typeof isOn === 'boolean') {
        window.setLampState(isOn);
    }

    updateConsumption(device);
    updateBackground();
}

// Period button handling
document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const device = e.target.dataset.device;
        const period = e.target.dataset.period;
        
        // Update active state
        document.querySelectorAll(`[data-device="${device}"]`).forEach(b => {
            b.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Update state - NÃO reseta liveValue
        state[device].period = period;
        updateConsumption(device);
    });
});

// Update consumption display
function updateConsumption(device) {
    const rates = device === 'heater' ? HEATER_RATES : LAMP_RATES;
    const element = device === 'heater' ? heaterConsumption : lampConsumption;
    const noteElement = device === 'heater' ? heaterNote : lampNote;
    const deviceState = state[device];

    if (deviceState.on === null) {
        element.textContent = 'Aguardando estado...';
        element.style.fontSize = '1.2rem';
        noteElement.textContent = '';
        return;
    }
    
    if (!deviceState.on) {
        element.textContent = 'Kynex Pulse: Desperdício Zero';
        element.style.fontSize = '1.5rem';
        noteElement.textContent = '';
        return;
    }
    
    // Reset font size quando ligado
    element.style.fontSize = '2.5rem';
    
    if (deviceState.period === 'live') {
        element.textContent = deviceState.liveValue.toFixed(5).replace('.', ',') + ' €';
        noteElement.textContent = '';
    } else if (deviceState.period === '24h') {
        // Apenas para aquecedor
        element.textContent = rates['24h'].toFixed(2).replace('.', ',') + ' €';
        noteElement.textContent = 'se te esqueceres de mim ligado!';
    } else if (deviceState.period === 'mensal') {
        element.textContent = rates.mensal.toFixed(2).replace('.', ',') + ' €';
        noteElement.textContent = device === 'heater' ? '4h/dia' : '6h/dia';
    } else if (deviceState.period === 'anual') {
        element.textContent = rates.anual.toFixed(2).replace('.', ',') + ' €';
        noteElement.textContent = '6h/dia';
    }
}

// Update background based on device states
function updateBackground() {
    const bothOff = state.heater.on === false && state.lamp.on === false;
    if (bothOff) {
        document.body.style.backgroundImage = "url('fundo1.png')";
    } else {
        document.body.style.backgroundImage = "url('fundo0.png')";
    }
}

// Live counter updates every second
setInterval(() => {
    // Update heater - sempre incrementa se estiver ON
    if (state.heater.on === true) {
        state.heater.liveValue += HEATER_RATES.live;
        if (state.heater.period === 'live') {
            updateConsumption('heater');
        }
    }
    
    // Update lamp - sempre incrementa se estiver ON
    if (state.lamp.on === true) {
        state.lamp.liveValue += LAMP_RATES.live;
        if (state.lamp.period === 'live') {
            updateConsumption('lamp');
        }
    }
}, 1000);

// Initialize display
applyDeviceState('heater', null);
applyDeviceState('lamp', null);

// MQTT status stream (SSE)
function resolveBackendUrl() {
    const params = new URLSearchParams(window.location.search);
    const paramUrl = params.get('backend');

    if (paramUrl) {
        localStorage.setItem('kynexBackendUrl', paramUrl);
        return paramUrl;
    }

    return localStorage.getItem('kynexBackendUrl') || '';
}

const backendUrl = resolveBackendUrl();
const statusStream = new EventSource(`${backendUrl}/shelly-status`);
statusStream.addEventListener('message', (event) => {
    try {
        const data = JSON.parse(event.data);
        if (data && data.device && typeof data.on === 'boolean') {
            applyDeviceState(data.device, data.on);
        }
    } catch (err) {
        console.warn('Estado MQTT inválido:', err);
    }
});

statusStream.addEventListener('error', () => {
    console.warn('Ligação ao estado MQTT perdida.');
});
