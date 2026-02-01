"""
KYNEX PULSE - Digital Twin Smart Home Demo
Demonstração interativa para feira tecnológica
"""

import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import time
import random
from datetime import datetime
import numpy as np

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURAÇÃO DA PÁGINA
# ═══════════════════════════════════════════════════════════════════════════════
st.set_page_config(
    page_title="KYNEX PULSE | Digital Twin",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ═══════════════════════════════════════════════════════════════════════════════
# PALETA DE CORES
# ═══════════════════════════════════════════════════════════════════════════════
COLORS = {
    "background": "#0E1117",
    "card_bg": "rgba(17, 25, 40, 0.75)",
    "text": "#FFFFFF",
    "cyan": "#00E5FF",
    "purple": "#8A2BE2",
    "red": "#FF4B4B",
    "green": "#00FF88",
    "orange": "#FF6B35",
    "glass_border": "rgba(255, 255, 255, 0.125)"
}

# ═══════════════════════════════════════════════════════════════════════════════
# CSS PERSONALIZADO - GLASSMORPHISM & DARK THEME
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown(f"""
<style>
    /* Esconder elementos padrão do Streamlit */
    #MainMenu {{visibility: hidden;}}
    footer {{visibility: hidden;}}
    header {{visibility: hidden;}}

    /* Fundo principal */
    .stApp {{
        background: linear-gradient(135deg, {COLORS["background"]} 0%, #1a1a2e 50%, #16213e 100%);
    }}

    /* Container principal */
    .main .block-container {{
        padding-top: 2rem;
        padding-bottom: 2rem;
    }}

    /* Glassmorphism Card */
    .glass-card {{
        background: {COLORS["card_bg"]};
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-radius: 16px;
        border: 1px solid {COLORS["glass_border"]};
        padding: 24px;
        margin: 10px 0;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }}

    .glass-card-alert {{
        background: rgba(255, 75, 75, 0.15);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-radius: 16px;
        border: 1px solid rgba(255, 75, 75, 0.3);
        padding: 24px;
        margin: 10px 0;
        box-shadow: 0 8px 32px 0 rgba(255, 75, 75, 0.2);
        animation: pulse-red 2s infinite;
    }}

    .glass-card-success {{
        background: rgba(0, 229, 255, 0.1);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-radius: 16px;
        border: 1px solid rgba(0, 229, 255, 0.3);
        padding: 24px;
        margin: 10px 0;
        box-shadow: 0 8px 32px 0 rgba(0, 229, 255, 0.2);
    }}

    @keyframes pulse-red {{
        0%, 100% {{ box-shadow: 0 8px 32px 0 rgba(255, 75, 75, 0.2); }}
        50% {{ box-shadow: 0 8px 48px 0 rgba(255, 75, 75, 0.5); }}
    }}

    @keyframes glow-cyan {{
        0%, 100% {{ text-shadow: 0 0 20px {COLORS["cyan"]}, 0 0 40px {COLORS["cyan"]}; }}
        50% {{ text-shadow: 0 0 30px {COLORS["cyan"]}, 0 0 60px {COLORS["cyan"]}, 0 0 80px {COLORS["cyan"]}; }}
    }}

    /* Título principal */
    .main-title {{
        font-size: 3.5rem;
        font-weight: 800;
        background: linear-gradient(90deg, {COLORS["cyan"]}, {COLORS["purple"]});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-align: center;
        margin-bottom: 0;
        letter-spacing: 3px;
    }}

    .subtitle {{
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.7);
        text-align: center;
        margin-top: 5px;
        letter-spacing: 5px;
        text-transform: uppercase;
    }}

    /* Contador de dinheiro */
    .money-counter {{
        font-size: 4rem;
        font-weight: 900;
        color: {COLORS["red"]};
        text-align: center;
        font-family: 'Courier New', monospace;
        text-shadow: 0 0 30px rgba(255, 75, 75, 0.8);
        animation: pulse-text 0.5s infinite;
    }}

    .money-counter-stopped {{
        font-size: 4rem;
        font-weight: 900;
        color: {COLORS["cyan"]};
        text-align: center;
        font-family: 'Courier New', monospace;
        animation: glow-cyan 2s infinite;
    }}

    @keyframes pulse-text {{
        0%, 100% {{ opacity: 1; }}
        50% {{ opacity: 0.8; }}
    }}

    .metric-label {{
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.6);
        text-transform: uppercase;
        letter-spacing: 2px;
        text-align: center;
    }}

    .metric-value {{
        font-size: 2.5rem;
        font-weight: 700;
        color: {COLORS["text"]};
        text-align: center;
    }}

    .metric-value-cyan {{
        font-size: 2.5rem;
        font-weight: 700;
        color: {COLORS["cyan"]};
        text-align: center;
    }}

    .savings-display {{
        font-size: 3rem;
        font-weight: 900;
        color: {COLORS["cyan"]};
        text-align: center;
        animation: glow-cyan 2s infinite;
    }}

    /* Botão personalizado */
    .stButton > button {{
        background: linear-gradient(135deg, {COLORS["purple"]}, {COLORS["cyan"]});
        color: white;
        font-size: 1.5rem;
        font-weight: 700;
        padding: 20px 60px;
        border: none;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 10px 40px rgba(138, 43, 226, 0.4);
        text-transform: uppercase;
        letter-spacing: 2px;
        width: 100%;
    }}

    .stButton > button:hover {{
        transform: translateY(-3px);
        box-shadow: 0 15px 50px rgba(0, 229, 255, 0.5);
    }}

    .stButton > button:active {{
        transform: translateY(0);
    }}

    /* Sidebar */
    [data-testid="stSidebar"] {{
        background: linear-gradient(180deg, rgba(14, 17, 23, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%);
        border-right: 1px solid {COLORS["glass_border"]};
    }}

    [data-testid="stSidebar"] .stSelectbox label,
    [data-testid="stSidebar"] .stSlider label,
    [data-testid="stSidebar"] .stNumberInput label {{
        color: {COLORS["cyan"]} !important;
        font-weight: 600;
        letter-spacing: 1px;
    }}

    /* Status indicator */
    .status-active {{
        display: inline-block;
        width: 12px;
        height: 12px;
        background: {COLORS["green"]};
        border-radius: 50%;
        margin-right: 8px;
        animation: blink 1s infinite;
        box-shadow: 0 0 10px {COLORS["green"]};
    }}

    .status-inactive {{
        display: inline-block;
        width: 12px;
        height: 12px;
        background: {COLORS["red"]};
        border-radius: 50%;
        margin-right: 8px;
        animation: blink 0.5s infinite;
        box-shadow: 0 0 10px {COLORS["red"]};
    }}

    @keyframes blink {{
        0%, 100% {{ opacity: 1; }}
        50% {{ opacity: 0.3; }}
    }}

    /* Divisor */
    .divider {{
        height: 2px;
        background: linear-gradient(90deg, transparent, {COLORS["cyan"]}, transparent);
        margin: 20px 0;
    }}

    /* Device list */
    .device-item {{
        display: flex;
        align-items: center;
        padding: 10px 15px;
        margin: 5px 0;
        background: rgba(255, 75, 75, 0.1);
        border-radius: 10px;
        border-left: 3px solid {COLORS["red"]};
    }}

    .device-item-safe {{
        display: flex;
        align-items: center;
        padding: 10px 15px;
        margin: 5px 0;
        background: rgba(0, 229, 255, 0.1);
        border-radius: 10px;
        border-left: 3px solid {COLORS["cyan"]};
    }}
</style>
""", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# INICIALIZAÇÃO DO SESSION STATE
# ═══════════════════════════════════════════════════════════════════════════════
if 'kynex_active' not in st.session_state:
    st.session_state.kynex_active = False
if 'money_wasted' not in st.session_state:
    st.session_state.money_wasted = 0.0
if 'start_time' not in st.session_state:
    st.session_state.start_time = time.time()
if 'last_update' not in st.session_state:
    st.session_state.last_update = time.time()

# ═══════════════════════════════════════════════════════════════════════════════
# DADOS DOS DISPOSITIVOS FANTASMAS
# ═══════════════════════════════════════════════════════════════════════════════
PHANTOM_DEVICES = {
    "Sala": [
        {"name": "TV em Stand-by", "watts": 15, "icon": "📺"},
        {"name": "Consola de Jogos", "watts": 12, "icon": "🎮"},
        {"name": "Box TV", "watts": 18, "icon": "📡"},
        {"name": "Sistema de Som", "watts": 10, "icon": "🔊"},
    ],
    "Cozinha": [
        {"name": "Microondas", "watts": 5, "icon": "🍳"},
        {"name": "Máquina de Café", "watts": 8, "icon": "☕"},
        {"name": "Torradeira", "watts": 3, "icon": "🍞"},
    ],
    "Quarto": [
        {"name": "Carregador Portátil", "watts": 5, "icon": "🔌"},
        {"name": "Despertador Digital", "watts": 2, "icon": "⏰"},
        {"name": "Monitor PC", "watts": 8, "icon": "🖥️"},
    ],
    "Escritório": [
        {"name": "Impressora", "watts": 10, "icon": "🖨️"},
        {"name": "Router WiFi", "watts": 12, "icon": "📶"},
        {"name": "PC Desktop", "watts": 20, "icon": "💻"},
    ]
}

# ═══════════════════════════════════════════════════════════════════════════════
# SIDEBAR - CONFIGURAÇÃO
# ═══════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown("""
    <div style="text-align: center; padding: 20px 0;">
        <h1 style="background: linear-gradient(90deg, #00E5FF, #8A2BE2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 2rem;">⚡ KYNEX</h1>
        <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; letter-spacing: 3px;">CONFIGURAÇÃO</p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

    tipo_imovel = st.selectbox(
        "🏠 TIPO DE IMÓVEL",
        ["Apartamento T1", "Apartamento T2", "Apartamento T3", "Moradia V3", "Moradia V4+"],
        index=2
    )

    area = st.slider(
        "📐 ÁREA (m²)",
        min_value=30,
        max_value=300,
        value=100,
        step=10
    )

    ocupantes = st.slider(
        "👥 Nº DE OCUPANTES",
        min_value=1,
        max_value=8,
        value=3
    )

    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

    # Cálculo do multiplicador baseado nos inputs
    base_multiplier = 1.0
    if "T1" in tipo_imovel:
        base_multiplier = 0.6
    elif "T2" in tipo_imovel:
        base_multiplier = 0.8
    elif "T3" in tipo_imovel:
        base_multiplier = 1.0
    elif "V3" in tipo_imovel:
        base_multiplier = 1.3
    else:
        base_multiplier = 1.6

    area_multiplier = area / 100
    ocupantes_multiplier = ocupantes / 3

    total_multiplier = base_multiplier * area_multiplier * ocupantes_multiplier

    # Calcular consumo total
    total_watts = sum(
        device["watts"]
        for room in PHANTOM_DEVICES.values()
        for device in room
    ) * total_multiplier

    cost_per_kwh = 0.18  # €/kWh
    cost_per_second = (total_watts / 1000) * cost_per_kwh / 3600

    st.markdown(f"""
    <div class="glass-card">
        <p class="metric-label">CONSUMO FANTASMA ESTIMADO</p>
        <p class="metric-value-cyan">{total_watts:.0f} W</p>
        <p style="color: rgba(255,255,255,0.5); text-align: center; font-size: 0.8rem;">
            {total_watts * 24 / 1000:.1f} kWh/dia
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown(f"""
    <div class="glass-card">
        <p class="metric-label">CUSTO ENERGIA</p>
        <p class="metric-value">{cost_per_kwh:.2f} €/kWh</p>
    </div>
    """, unsafe_allow_html=True)

    # Reset button
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    if st.button("🔄 RESET DEMO", use_container_width=True):
        st.session_state.kynex_active = False
        st.session_state.money_wasted = 0.0
        st.session_state.start_time = time.time()
        st.rerun()

# ═══════════════════════════════════════════════════════════════════════════════
# HEADER PRINCIPAL
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown('<h1 class="main-title">KYNEX PULSE</h1>', unsafe_allow_html=True)
st.markdown('<p class="subtitle">Digital Twin • Smart Energy Management</p>', unsafe_allow_html=True)
st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# LAYOUT PRINCIPAL
# ═══════════════════════════════════════════════════════════════════════════════
col_main, col_side = st.columns([2, 1])

with col_main:
    # ═══════════════════════════════════════════════════════════════════════════
    # VISUALIZAÇÃO DA PLANTA DA CASA
    # ═══════════════════════════════════════════════════════════════════════════

    # Definir divisões da casa (coordenadas do plano)
    rooms = {
        "Sala": {"x": [0, 4, 4, 0, 0], "y": [0, 0, 3, 3, 0], "center": (2, 1.5)},
        "Cozinha": {"x": [4, 7, 7, 4, 4], "y": [0, 0, 3, 3, 0], "center": (5.5, 1.5)},
        "Quarto": {"x": [0, 3.5, 3.5, 0, 0], "y": [3, 3, 6, 6, 3], "center": (1.75, 4.5)},
        "Escritório": {"x": [3.5, 7, 7, 3.5, 3.5], "y": [3, 3, 6, 6, 3], "center": (5.25, 4.5)},
    }

    fig = go.Figure()

    # Desenhar as divisões
    for room_name, coords in rooms.items():
        # Fundo da divisão
        fill_color = "rgba(255, 75, 75, 0.1)" if not st.session_state.kynex_active else "rgba(0, 229, 255, 0.05)"
        border_color = COLORS["red"] if not st.session_state.kynex_active else COLORS["cyan"]

        fig.add_trace(go.Scatter(
            x=coords["x"],
            y=coords["y"],
            fill="toself",
            fillcolor=fill_color,
            line=dict(color=border_color, width=2),
            mode="lines",
            name=room_name,
            hoverinfo="name"
        ))

        # Nome da divisão
        fig.add_annotation(
            x=coords["center"][0],
            y=coords["center"][1] + 1,
            text=f"<b>{room_name}</b>",
            showarrow=False,
            font=dict(size=14, color="white"),
        )

    # Adicionar dispositivos como pontos
    if not st.session_state.kynex_active:
        # Estado CAOS - bolhas vermelhas pulsantes
        for room_name, devices in PHANTOM_DEVICES.items():
            center = rooms[room_name]["center"]
            for i, device in enumerate(devices):
                # Posição aleatória dentro da divisão
                offset_x = (i % 2) * 0.8 - 0.4
                offset_y = (i // 2) * 0.6 - 0.3

                size = device["watts"] * 2 + 10

                fig.add_trace(go.Scatter(
                    x=[center[0] + offset_x],
                    y=[center[1] + offset_y],
                    mode="markers+text",
                    marker=dict(
                        size=size,
                        color=COLORS["red"],
                        opacity=0.7,
                        line=dict(color=COLORS["red"], width=2)
                    ),
                    text=device["icon"],
                    textposition="middle center",
                    textfont=dict(size=12),
                    name=device["name"],
                    hovertemplate=f"<b>{device['name']}</b><br>{device['watts']}W<extra></extra>"
                ))
    else:
        # Estado KYNEX - pontos verdes pequenos
        for room_name, devices in PHANTOM_DEVICES.items():
            center = rooms[room_name]["center"]
            for i, device in enumerate(devices):
                offset_x = (i % 2) * 0.8 - 0.4
                offset_y = (i // 2) * 0.6 - 0.3

                fig.add_trace(go.Scatter(
                    x=[center[0] + offset_x],
                    y=[center[1] + offset_y],
                    mode="markers+text",
                    marker=dict(
                        size=15,
                        color=COLORS["cyan"],
                        opacity=0.8,
                        symbol="circle",
                        line=dict(color=COLORS["cyan"], width=1)
                    ),
                    text=device["icon"],
                    textposition="middle center",
                    textfont=dict(size=10),
                    name=device["name"],
                    hovertemplate=f"<b>{device['name']}</b><br>✓ Otimizado<extra></extra>"
                ))

    # Layout do gráfico
    fig.update_layout(
        showlegend=False,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=20, r=20, t=40, b=20),
        height=450,
        xaxis=dict(
            showgrid=False,
            zeroline=False,
            showticklabels=False,
            range=[-0.5, 7.5]
        ),
        yaxis=dict(
            showgrid=False,
            zeroline=False,
            showticklabels=False,
            range=[-0.5, 6.5],
            scaleanchor="x",
            scaleratio=1
        ),
        title=dict(
            text="🏠 PLANTA DIGITAL TWIN" if not st.session_state.kynex_active else "🏠 PLANTA DIGITAL TWIN - OTIMIZADO",
            font=dict(size=18, color=COLORS["cyan"] if st.session_state.kynex_active else COLORS["text"]),
            x=0.5
        )
    )

    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})

with col_side:
    # ═══════════════════════════════════════════════════════════════════════════
    # CONTADOR DE DINHEIRO
    # ═══════════════════════════════════════════════════════════════════════════

    if not st.session_state.kynex_active:
        # Atualizar contador
        current_time = time.time()
        time_diff = current_time - st.session_state.last_update
        st.session_state.money_wasted += cost_per_second * time_diff * 100  # Acelerar para demo
        st.session_state.last_update = current_time

        st.markdown(f"""
        <div class="glass-card-alert">
            <p class="metric-label">💸 DINHEIRO DESPERDIÇADO</p>
            <p class="money-counter">{st.session_state.money_wasted:.2f} €</p>
            <p style="color: {COLORS["red"]}; text-align: center; font-size: 0.9rem;">
                ⚠️ A AUMENTAR EM TEMPO REAL
            </p>
        </div>
        """, unsafe_allow_html=True)

        # Status
        st.markdown(f"""
        <div class="glass-card">
            <p style="color: white; display: flex; align-items: center; justify-content: center;">
                <span class="status-inactive"></span>
                <span>KYNEX DESATIVADO</span>
            </p>
        </div>
        """, unsafe_allow_html=True)

    else:
        st.markdown(f"""
        <div class="glass-card-success">
            <p class="metric-label">💰 DESPERDÍCIO TRAVADO EM</p>
            <p class="money-counter-stopped">{st.session_state.money_wasted:.2f} €</p>
            <p style="color: {COLORS["cyan"]}; text-align: center; font-size: 0.9rem;">
                ✓ PROTEGIDO PELA KYNEX
            </p>
        </div>
        """, unsafe_allow_html=True)

        # Status
        st.markdown(f"""
        <div class="glass-card">
            <p style="color: white; display: flex; align-items: center; justify-content: center;">
                <span class="status-active"></span>
                <span style="color: {COLORS["cyan"]};">KYNEX ATIVO</span>
            </p>
        </div>
        """, unsafe_allow_html=True)

    # ═══════════════════════════════════════════════════════════════════════════
    # LISTA DE DISPOSITIVOS
    # ═══════════════════════════════════════════════════════════════════════════
    st.markdown(f"""
    <div class="glass-card">
        <p class="metric-label" style="margin-bottom: 15px;">📱 DISPOSITIVOS MONITORIZADOS</p>
    """, unsafe_allow_html=True)

    devices_html = ""
    for room, devices in PHANTOM_DEVICES.items():
        for device in devices[:2]:  # Mostrar apenas 2 por divisão
            if not st.session_state.kynex_active:
                devices_html += f"""
                <div class="device-item">
                    <span style="margin-right: 10px;">{device["icon"]}</span>
                    <span style="color: white; flex: 1;">{device["name"]}</span>
                    <span style="color: {COLORS["red"]};">{device["watts"]}W</span>
                </div>
                """
            else:
                devices_html += f"""
                <div class="device-item-safe">
                    <span style="margin-right: 10px;">{device["icon"]}</span>
                    <span style="color: white; flex: 1;">{device["name"]}</span>
                    <span style="color: {COLORS["cyan"]};">✓</span>
                </div>
                """

    st.markdown(devices_html + "</div>", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# BOTÃO PRINCIPAL
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    if not st.session_state.kynex_active:
        if st.button("⚡ ATIVAR KYNEX PULSE 🛡️", use_container_width=True, key="activate"):
            st.session_state.kynex_active = True
            st.rerun()
    else:
        if st.button("🔴 DESATIVAR PROTEÇÃO", use_container_width=True, key="deactivate"):
            st.session_state.kynex_active = False
            st.session_state.last_update = time.time()
            st.rerun()

# ═══════════════════════════════════════════════════════════════════════════════
# SEÇÃO DE POUPANÇA (quando ativado)
# ═══════════════════════════════════════════════════════════════════════════════
if st.session_state.kynex_active:
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

    # Calcular poupança anual
    daily_waste = (total_watts / 1000) * 24 * cost_per_kwh
    annual_savings = daily_waste * 365

    col_sav1, col_sav2, col_sav3 = st.columns(3)

    with col_sav1:
        st.markdown(f"""
        <div class="glass-card-success">
            <p class="metric-label">POUPANÇA DIÁRIA</p>
            <p class="savings-display">{daily_waste:.2f} €</p>
        </div>
        """, unsafe_allow_html=True)

    with col_sav2:
        st.markdown(f"""
        <div class="glass-card-success">
            <p class="metric-label">POUPANÇA MENSAL</p>
            <p class="savings-display">{daily_waste * 30:.0f} €</p>
        </div>
        """, unsafe_allow_html=True)

    with col_sav3:
        st.markdown(f"""
        <div class="glass-card-success">
            <p class="metric-label">🎯 POUPANÇA ANUAL</p>
            <p class="savings-display">{annual_savings:.0f} €</p>
        </div>
        """, unsafe_allow_html=True)

    # Gráfico comparativo
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

    col_chart1, col_chart2 = st.columns(2)

    with col_chart1:
        # Gráfico de barras - Antes vs Depois
        fig_bar = go.Figure()

        fig_bar.add_trace(go.Bar(
            x=["Sem KYNEX"],
            y=[annual_savings + 50],
            name="Sem KYNEX",
            marker_color=COLORS["red"],
            text=[f"{annual_savings + 50:.0f} €"],
            textposition="outside",
            textfont=dict(size=16, color=COLORS["red"])
        ))

        fig_bar.add_trace(go.Bar(
            x=["Com KYNEX"],
            y=[50],
            name="Com KYNEX",
            marker_color=COLORS["cyan"],
            text=["~50 €"],
            textposition="outside",
            textfont=dict(size=16, color=COLORS["cyan"])
        ))

        fig_bar.update_layout(
            title=dict(text="💰 CUSTO ANUAL ENERGIA FANTASMA", font=dict(size=16, color="white")),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            showlegend=False,
            height=350,
            yaxis=dict(
                showgrid=True,
                gridcolor="rgba(255,255,255,0.1)",
                tickfont=dict(color="white"),
                title="€/ano"
            ),
            xaxis=dict(tickfont=dict(color="white", size=14)),
            bargap=0.5
        )

        st.plotly_chart(fig_bar, use_container_width=True, config={'displayModeBar': False})

    with col_chart2:
        # Gráfico de pizza - Distribuição por divisão
        room_watts = []
        room_names = []
        for room, devices in PHANTOM_DEVICES.items():
            total = sum(d["watts"] for d in devices) * total_multiplier
            room_watts.append(total)
            room_names.append(room)

        fig_pie = go.Figure(data=[go.Pie(
            labels=room_names,
            values=room_watts,
            hole=0.6,
            marker=dict(colors=[COLORS["cyan"], COLORS["purple"], COLORS["green"], COLORS["orange"]]),
            textinfo="label+percent",
            textfont=dict(size=12, color="white")
        )])

        fig_pie.update_layout(
            title=dict(text="📊 CONSUMO POR DIVISÃO", font=dict(size=16, color="white")),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            showlegend=False,
            height=350,
            annotations=[dict(
                text=f"{sum(room_watts):.0f}W",
                x=0.5, y=0.5,
                font=dict(size=20, color=COLORS["cyan"]),
                showarrow=False
            )]
        )

        st.plotly_chart(fig_pie, use_container_width=True, config={'displayModeBar': False})

# ═══════════════════════════════════════════════════════════════════════════════
# AUTO-REFRESH (apenas quando não ativado)
# ═══════════════════════════════════════════════════════════════════════════════
if not st.session_state.kynex_active:
    time.sleep(0.1)
    st.rerun()

# ═══════════════════════════════════════════════════════════════════════════════
# FOOTER
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown(f"""
<div style="text-align: center; padding: 30px 0; margin-top: 20px;">
    <p style="color: rgba(255,255,255,0.3); font-size: 0.8rem; letter-spacing: 2px;">
        KYNEX PULSE © 2024 | SMART ENERGY MANAGEMENT
    </p>
</div>
""", unsafe_allow_html=True)
