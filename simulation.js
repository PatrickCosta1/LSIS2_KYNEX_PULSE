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
        on: true,
        period: 'live',
        liveValue: 0
    },
    lamp: {
        on: true,
        period: 'live',
        liveValue: 0
    }
};

// Elements
const heaterStatus = document.getElementById('heaterStatus');
const heaterToggle = document.getElementById('heaterToggle');
const heaterConsumption = document.getElementById('heaterConsumption');

const lampStatus = document.getElementById('lampStatus');
const lampToggle = document.getElementById('lampToggle');
const lampConsumption = document.getElementById('lampConsumption');

// Initialize toggle states
heaterToggle.classList.add('active');
lampToggle.classList.add('active');

// Toggle functions
heaterToggle.addEventListener('click', () => {
    state.heater.on = !state.heater.on;
    if (state.heater.on) {
        heaterToggle.classList.add('active');
        heaterStatus.textContent = 'ON';
        heaterStatus.classList.add('active');
        heaterStatus.classList.remove('inactive');
    } else {
        heaterToggle.classList.remove('active');
        heaterStatus.textContent = 'OFF';
        heaterStatus.classList.remove('active');
        heaterStatus.classList.add('inactive');
        state.heater.liveValue = 0;
    }
    
    // Controlar glows do modelo 3D
    if (window.setHeaterState) {
        window.setHeaterState(state.heater.on);
    }
    
    updateConsumption('heater');
    updateBackground();
});

lampToggle.addEventListener('click', () => {
    state.lamp.on = !state.lamp.on;
    if (state.lamp.on) {
        lampToggle.classList.add('active');
        lampStatus.textContent = 'ON';
        lampStatus.classList.add('active');
        lampStatus.classList.remove('inactive');
    } else {
        lampToggle.classList.remove('active');
        lampStatus.textContent = 'OFF';
        lampStatus.classList.remove('active');
        lampStatus.classList.add('inactive');
        state.lamp.liveValue = 0;
    }
    
    // Controlar glows do modelo 3D
    if (window.setLampState) {
        window.setLampState(state.lamp.on);
    }
    
    updateConsumption('lamp');
    updateBackground();
});

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
    const bothOff = !state.heater.on && !state.lamp.on;
    if (bothOff) {
        document.body.style.backgroundImage = "url('fundo1.png')";
    } else {
        document.body.style.backgroundImage = "url('fundo0.png')";
    }
}

// Live counter updates every second
setInterval(() => {
    // Update heater - sempre incrementa se estiver ON
    if (state.heater.on) {
        state.heater.liveValue += HEATER_RATES.live;
        if (state.heater.period === 'live') {
            updateConsumption('heater');
        }
    }
    
    // Update lamp - sempre incrementa se estiver ON
    if (state.lamp.on) {
        state.lamp.liveValue += LAMP_RATES.live;
        if (state.lamp.period === 'live') {
            updateConsumption('lamp');
        }
    }
}, 1000);

// Initialize display
updateConsumption('heater');
updateConsumption('lamp');
