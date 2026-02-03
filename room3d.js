// ============================================
// HEATER SCENE (Left Canvas)
// ============================================
const heaterCanvas = document.getElementById('heaterCanvas')
const heaterScene = new THREE.Scene()
const heaterCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
heaterCamera.position.set(0, 1.5, 5)
heaterCamera.lookAt(0, 1.5, 0)

const heaterRenderer = new THREE.WebGLRenderer({
    canvas: heaterCanvas,
    antialias: true,
    alpha: true
})
heaterRenderer.setSize(600, 600)
heaterRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
heaterRenderer.setClearColor(0x000000, 0)

// Lighting for heater
const heaterAmbient = new THREE.AmbientLight(0xffffff, 0.6)
heaterScene.add(heaterAmbient)
const heaterDirectional = new THREE.DirectionalLight(0xffffff, 0.8)
heaterDirectional.position.set(5, 10, 5)
heaterScene.add(heaterDirectional)

// Create Halogen Heater
const heaterGroup = new THREE.Group()

// Base oval cinzenta
const baseGeometry = new THREE.CylinderGeometry(0.45, 0.5, 0.08, 32)
const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x6a6a6a,
    metalness: 0.5,
    roughness: 0.4
})
const base = new THREE.Mesh(baseGeometry, baseMaterial)
base.position.y = 0.04
heaterGroup.add(base)

// Corpo principal - caixa cinzenta escura
const bodyGeometry = new THREE.BoxGeometry(0.65, 1.15, 0.18)
const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a5a5a,
    metalness: 0.4,
    roughness: 0.5
})
const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
body.position.set(0, 0.66, 0)
heaterGroup.add(body)

// Moldura arredondada superior cinzenta
const topFrameGeometry = new THREE.BoxGeometry(0.68, 0.08, 0.2)
const topFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x6a6a6a,
    metalness: 0.5,
    roughness: 0.4
})
const topFrame = new THREE.Mesh(topFrameGeometry, topFrameMaterial)
topFrame.position.set(0, 1.2, 0)
heaterGroup.add(topFrame)

// Área da grade (fundo preto)
const grillBackGeometry = new THREE.BoxGeometry(0.55, 0.9, 0.02)
const grillBackMaterial = new THREE.MeshStandardMaterial({
    color: 0x050505,
    metalness: 0.1,
    roughness: 0.9
})
const grillBack = new THREE.Mesh(grillBackGeometry, grillBackMaterial)
grillBack.position.set(0, 0.6, 0.08)
heaterGroup.add(grillBack)

// Grade cinzenta clara - linhas horizontais
for(let i = 0; i < 20; i++) {
    const grillHGeometry = new THREE.BoxGeometry(0.52, 0.008, 0.01)
    const grillHMaterial = new THREE.MeshStandardMaterial({
        color: 0x999999,
        metalness: 0.7,
        roughness: 0.3
    })
    const grillH = new THREE.Mesh(grillHGeometry, grillHMaterial)
    grillH.position.set(0, 0.18 + (i * 0.045), 0.1)
    heaterGroup.add(grillH)
}

// Grade cinzenta clara - linhas verticais
for(let i = 0; i < 12; i++) {
    const grillVGeometry = new THREE.BoxGeometry(0.008, 0.88, 0.01)
    const grillVMaterial = new THREE.MeshStandardMaterial({
        color: 0x999999,
        metalness: 0.7,
        roughness: 0.3
    })
    const grillV = new THREE.Mesh(grillVGeometry, grillVMaterial)
    grillV.position.set(-0.24 + (i * 0.044), 0.6, 0.1)
    heaterGroup.add(grillV)
}

// Criar textura de glow para o aquecedor (mais laranja)
const createHeatGlowTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    gradient.addColorStop(0, 'rgba(255, 140, 50, 0.9)')
    gradient.addColorStop(0.3, 'rgba(255, 120, 40, 0.5)')
    gradient.addColorStop(0.6, 'rgba(255, 100, 30, 0.2)')
    gradient.addColorStop(1, 'rgba(255, 80, 20, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)

    return new THREE.CanvasTexture(canvas)
}

const heatGlowTexture = createHeatGlowTexture()

// 3 Barras de aquecimento LED laranjas
const heatBarPositions = [0.35, 0.6, 0.85]
const heatBars = []
const heatGlowSprites = []

heatBarPositions.forEach((yPos, index) => {
    // Barra LED laranja
    const tubeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.48, 16)
    const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff5500 })
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial)
    tube.rotation.z = Math.PI / 2
    tube.position.set(0, yPos, 0.07)
    heaterGroup.add(tube)
    heatBars.push({ mesh: tube, material: tubeMaterial, lights: [], glowMaterials: [] })

    // Core glow
    const coreGlowGeometry = new THREE.PlaneGeometry(0.5, 0.05)
    const coreGlowMat = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    })
    const coreGlow = new THREE.Mesh(coreGlowGeometry, coreGlowMat)
    coreGlow.position.set(0, yPos, 0.09)
    heaterGroup.add(coreGlow)
    heatBars[index].glowMaterials.push(coreGlowMat)

    // Glow médio
    const midGlowGeometry = new THREE.PlaneGeometry(0.52, 0.1)
    const midGlowMat = new THREE.MeshBasicMaterial({
        color: 0xff5500,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    })
    const midGlow = new THREE.Mesh(midGlowGeometry, midGlowMat)
    midGlow.position.set(0, yPos, 0.11)
    heaterGroup.add(midGlow)
    heatBars[index].glowMaterials.push(midGlowMat)

    // Glow laranja simples à frente de cada barra LED
    const frontGlowMat = new THREE.SpriteMaterial({
        map: heatGlowTexture,
        color: 0xff8833,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.5
    })
    const frontGlow = new THREE.Sprite(frontGlowMat)
    frontGlow.position.set(0, yPos, 0.2)
    frontGlow.scale.set(0.6, 0.15, 1)
    heaterGroup.add(frontGlow)
    heatGlowSprites.push({ sprite: frontGlow, material: frontGlowMat, baseOpacity: 0.5, barIndex: index })

    // Luzes mais suaves ao longo da barra
    for(let i = 0; i < 5; i++) {
        const xOffset = -0.2 + (i * 0.1)
        const light = new THREE.PointLight(0xff5500, 1.2, 1.5)
        light.position.set(xOffset, yPos, 0.15)
        heaterGroup.add(light)
        heatBars[index].lights.push(light)
    }
})

// Partículas de ar quente subindo
const heatParticleCount = 40
const heatParticlesGeometry = new THREE.BufferGeometry()
const heatParticlePositions = new Float32Array(heatParticleCount * 3)

for(let i = 0; i < heatParticleCount; i++) {
    heatParticlePositions[i * 3] = (Math.random() - 0.5) * 0.5
    heatParticlePositions[i * 3 + 1] = 0.3 + Math.random() * 0.8
    heatParticlePositions[i * 3 + 2] = 0.1 + Math.random() * 0.4
}

heatParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(heatParticlePositions, 3))

const heatParticleMaterial = new THREE.PointsMaterial({
    color: 0xff8855,
    size: 0.02,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
})

const heatParticles = new THREE.Points(heatParticlesGeometry, heatParticleMaterial)
heaterGroup.add(heatParticles)

// Botões vermelhos no topo
for(let i = 0; i < 3; i++) {
    const btnGeometry = new THREE.SphereGeometry(0.025, 16, 16)
    const btnMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333 })
    const btn = new THREE.Mesh(btnGeometry, btnMaterial)
    btn.position.set(-0.1 + (i * 0.1), 1.2, 0.12)
    heaterGroup.add(btn)
}

heaterGroup.scale.set(1.4, 1.4, 1.4)
heaterGroup.position.y = 0.05
heaterScene.add(heaterGroup)

// ============================================
// LAMP SCENE (Right Canvas)
// ============================================
const lampCanvas = document.getElementById('lampCanvas')
const lampScene = new THREE.Scene()
const lampCamera = new THREE.PerspectiveCamera(70, 1, 0.1, 100)
lampCamera.position.set(0, 1.2, 8)
lampCamera.lookAt(0, 0.8, 0)

const lampRenderer = new THREE.WebGLRenderer({
    canvas: lampCanvas,
    antialias: true,
    alpha: true
})
lampRenderer.setSize(600, 600)
lampRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
lampRenderer.setClearColor(0x000000, 0)

// Lighting for lamp
const lampAmbient = new THREE.AmbientLight(0xffffff, 0.6)
lampScene.add(lampAmbient)
const lampDirectional = new THREE.DirectionalLight(0xffffff, 0.8)
lampDirectional.position.set(5, 10, 5)
lampScene.add(lampDirectional)

// Create Floor Lamp
const lampGroup = new THREE.Group()

// Base circular - cinza claro
const lampBaseGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32)
const lampBaseMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xaaaaaa,
    metalness: 0.4,
    roughness: 0.5
})
const lampBase = new THREE.Mesh(lampBaseGeometry, lampBaseMaterial)
lampBase.position.y = 0.04
lampGroup.add(lampBase)

// Curva completa do candeeiro (corcunda) - começa no topo da base
const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 0.08, 0),      // Ponto inicial (topo da base)
    new THREE.Vector3(0, 1.8, 0.2),     // Ponto de controle (sobe quase vertical)
    new THREE.Vector3(0, 2.5, 1.0)      // Ponto final (curva para fora)
)

// Estrutura metálica (cinza claro) - barra fina
const metalTubeGeometry = new THREE.TubeGeometry(curve, 64, 0.03, 16, false)
const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.7,
    roughness: 0.3
})
const metalStructure = new THREE.Mesh(metalTubeGeometry, metalMaterial)
lampGroup.add(metalStructure)

// Tira LED usando TubeGeometry (sem artefactos)
const ledCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 0.08, 0.04),   // Começa no topo da base, ligeiramente para fora
    new THREE.Vector3(0, 1.8, 0.24),    // Ponto de controle (ligeiramente para fora)
    new THREE.Vector3(0, 2.5, 1.04)     // Ponto final (ligeiramente para fora)
)

const lampLedGeometry = new THREE.TubeGeometry(ledCurve, 64, 0.015, 8, false)
const lampLedMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffee
})
const ledStrip = new THREE.Mesh(lampLedGeometry, lampLedMaterial)
lampGroup.add(ledStrip)

// Luzes fortes ao longo de toda a curva
for(let i = 0; i <= 12; i++) {
    const t = i / 12
    const point = curve.getPoint(t)
    const light = new THREE.PointLight(0xffffff, 1.2, 3)
    light.position.copy(point)
    light.position.z += 0.08
    lampGroup.add(light)
}

// Luz principal muito forte no topo
const lampLight = new THREE.PointLight(0xffffff, 4, 8)
lampLight.position.set(0, 2.5, 1.0)
lampGroup.add(lampLight)

// Luz ambiente extra para o efeito
const lampSpotLight = new THREE.SpotLight(0xffffff, 3, 10, Math.PI / 4, 0.5)
lampSpotLight.position.set(0, 2.5, 1.2)
lampSpotLight.target.position.set(0, 0, 2)
lampGroup.add(lampSpotLight)
lampGroup.add(lampSpotLight.target)

// Partículas de luz (pozinhos amarelos claros)
const particleCount = 30
const particlesGeometry = new THREE.BufferGeometry()
const particlePositions = new Float32Array(particleCount * 3)

for(let i = 0; i < particleCount; i++) {
    const t = 0.4 + Math.random() * 0.6  // Só na parte superior da curva
    const point = curve.getPoint(t)
    particlePositions[i * 3] = point.x + (Math.random() - 0.5) * 0.6
    particlePositions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.4
    particlePositions[i * 3 + 2] = point.z + Math.random() * 1.0
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffaa,
    size: 0.035,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
})

const particles = new THREE.Points(particlesGeometry, particleMaterial)
lampGroup.add(particles)

// Partículas menores (amarelo claro)
const dustCount = 20
const dustGeometry = new THREE.BufferGeometry()
const dustPositions = new Float32Array(dustCount * 3)

for(let i = 0; i < dustCount; i++) {
    const t = 0.5 + Math.random() * 0.5  // Só na parte superior
    const point = curve.getPoint(t)
    dustPositions[i * 3] = point.x + (Math.random() - 0.5) * 1.0
    dustPositions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.6
    dustPositions[i * 3 + 2] = point.z + Math.random() * 1.5
}

dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))

const dustMaterial = new THREE.PointsMaterial({
    color: 0xffffcc,
    size: 0.02,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
})

const dust = new THREE.Points(dustGeometry, dustMaterial)
lampGroup.add(dust)

// Glow suave com sprite (desfoque natural)
const createGlowTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')

    // Gradiente radial que desvanece
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    gradient.addColorStop(0, 'rgba(255, 255, 250, 0.6)')
    gradient.addColorStop(0.2, 'rgba(255, 255, 240, 0.3)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 230, 0.1)')
    gradient.addColorStop(1, 'rgba(255, 255, 220, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)

    return new THREE.CanvasTexture(canvas)
}

const glowTexture = createGlowTexture()

// Glows suaves ao longo de toda a linha LED
const glowSprites = []
for(let i = 0; i <= 6; i++) {
    const t = i / 6
    const point = ledCurve.getPoint(t)

    // Tamanho e opacidade mais suaves
    const size = 0.5 + t * 0.8
    const opacity = 0.15 + t * 0.25

    const glowMat = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: opacity
    })
    const glow = new THREE.Sprite(glowMat)
    glow.position.copy(point)
    glow.position.z += 0.08
    glow.scale.set(size, size, 1)
    lampGroup.add(glow)
    glowSprites.push({ sprite: glow, material: glowMat, baseOpacity: opacity, baseSize: size })
}

// Glow suave no topo
const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xffffff,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.6
})
const glowSprite = new THREE.Sprite(glowMaterial)
glowSprite.position.set(0, 2.5, 1.1)
glowSprite.scale.set(1.8, 1.8, 1)
lampGroup.add(glowSprite)

lampGroup.scale.set(2.2, 2.2, 2.2)
lampGroup.position.y = -3.0
lampScene.add(lampGroup)

// ============================================
// ROTATION CONTROLS
// ============================================
let heaterRotating = false
let lampRotating = false
let previousMouseX = 0

// Heater controls
heaterCanvas.addEventListener('mousedown', (e) => {
    heaterRotating = true
    previousMouseX = e.clientX
})

heaterCanvas.addEventListener('mousemove', (e) => {
    if (heaterRotating) {
        const deltaX = e.clientX - previousMouseX
        heaterGroup.rotation.y += deltaX * 0.01
        previousMouseX = e.clientX
    }
})

heaterCanvas.addEventListener('mouseup', () => {
    heaterRotating = false
})

heaterCanvas.addEventListener('mouseleave', () => {
    heaterRotating = false
})

// Lamp controls
lampCanvas.addEventListener('mousedown', (e) => {
    lampRotating = true
    previousMouseX = e.clientX
})

lampCanvas.addEventListener('mousemove', (e) => {
    if (lampRotating) {
        const deltaX = e.clientX - previousMouseX
        lampGroup.rotation.y += deltaX * 0.01
        previousMouseX = e.clientX
    }
})

lampCanvas.addEventListener('mouseup', () => {
    lampRotating = false
})

lampCanvas.addEventListener('mouseleave', () => {
    lampRotating = false
})

// Touch support
heaterCanvas.addEventListener('touchstart', (e) => {
    heaterRotating = true
    previousMouseX = e.touches[0].clientX
})

heaterCanvas.addEventListener('touchmove', (e) => {
    if (heaterRotating) {
        const deltaX = e.touches[0].clientX - previousMouseX
        heaterGroup.rotation.y += deltaX * 0.01
        previousMouseX = e.touches[0].clientX
    }
})

heaterCanvas.addEventListener('touchend', () => {
    heaterRotating = false
})

lampCanvas.addEventListener('touchstart', (e) => {
    lampRotating = true
    previousMouseX = e.touches[0].clientX
})

lampCanvas.addEventListener('touchmove', (e) => {
    if (lampRotating) {
        const deltaX = e.touches[0].clientX - previousMouseX
        lampGroup.rotation.y += deltaX * 0.01
        previousMouseX = e.touches[0].clientX
    }
})

lampCanvas.addEventListener('touchend', () => {
    lampRotating = false
})

// ============================================
// ANIMATION LOOP
// ============================================
// Device state control variables
let heaterActive = true
let lampActive = true

let time = 0
function animate() {
    time += 0.01

    // Animar partículas do candeeiro
    if (particles && particles.geometry.attributes.position) {
        const positions = particles.geometry.attributes.position.array
        for(let i = 0; i < particleCount; i++) {
            // Movimento suave flutuante
            positions[i * 3 + 1] += Math.sin(time + i) * 0.002
            positions[i * 3 + 2] += Math.cos(time * 0.5 + i) * 0.001
        }
        particles.geometry.attributes.position.needsUpdate = true
    }

    // Animar dust
    if (dust && dust.geometry.attributes.position) {
        const dustPos = dust.geometry.attributes.position.array
        for(let i = 0; i < dustCount; i++) {
            dustPos[i * 3 + 1] += Math.sin(time * 0.7 + i * 0.5) * 0.001
            dustPos[i * 3] += Math.cos(time * 0.3 + i) * 0.0005
        }
        dust.geometry.attributes.position.needsUpdate = true
    }

    // Animar barras de aquecimento LED
    heatBars.forEach((bar, index) => {
        const phase = time * 2 + index * 0.4
        // Animar luzes
        bar.lights.forEach((light, lightIndex) => {
            light.intensity = heaterActive ? (1.0 + Math.sin(phase + lightIndex * 0.3) * 0.3) : 0
        })
        // Animar glows base
        bar.glowMaterials.forEach((mat, matIndex) => {
            const baseOpacities = [0.6, 0.35]
            const base = baseOpacities[matIndex] || 0.3
            mat.opacity = heaterActive ? (base + Math.sin(phase) * 0.1) : 0
        })
    })

    // Animar glow laranja à frente das barras
    heatGlowSprites.forEach((g, index) => {
        const phase = time * 2 + g.barIndex * 0.5
        // Pulsar opacidade suavemente
        g.material.opacity = heaterActive ? (g.baseOpacity + Math.sin(phase) * 0.15) : 0
    })

    // Animar partículas de ar quente (subindo)
    if (heatParticles && heatParticles.geometry.attributes.position) {
        const heatPos = heatParticles.geometry.attributes.position.array
        for(let i = 0; i < heatParticleCount; i++) {
            // Subir
            heatPos[i * 3 + 1] += 0.002
            // Movimento lateral ondulante
            heatPos[i * 3] += Math.sin(time * 3 + i) * 0.0008
            // Movimento para frente
            heatPos[i * 3 + 2] += Math.sin(time * 2 + i * 0.5) * 0.0003

            // Reset quando sair do topo
            if(heatPos[i * 3 + 1] > 1.3) {
                heatPos[i * 3 + 1] = 0.3
                heatPos[i * 3] = (Math.random() - 0.5) * 0.5
                heatPos[i * 3 + 2] = 0.1 + Math.random() * 0.3
            }
        }
        heatParticles.geometry.attributes.position.needsUpdate = true
    }

    // Pulsar suave dos glows ao longo da curva
    glowSprites.forEach((g, index) => {
        const phase = time * 1.5 + index * 0.3
        g.material.opacity = lampActive ? (g.baseOpacity + Math.sin(phase) * 0.1) : 0
        const s = g.baseSize + Math.sin(phase) * 0.05
        g.sprite.scale.set(s, s, 1)
    })

    // Glow principal no topo
    if (glowMaterial) {
        glowMaterial.opacity = lampActive ? (0.9 + Math.sin(time * 1.5) * 0.1) : 0
    }
    if (glowSprite) {
        glowSprite.scale.set(2.5 + Math.sin(time) * 0.1, 2.5 + Math.sin(time) * 0.1, 1)
    }

    // Controlar luzes do candeeiro
    if (lampLight) {
        lampLight.intensity = lampActive ? (4 + Math.sin(time * 2) * 0.5) : 0
    }

    heaterRenderer.render(heaterScene, heaterCamera)
    lampRenderer.render(lampScene, lampCamera)
    requestAnimationFrame(animate)
}

animate()

// ============================================
// DEVICE STATE CONTROL FUNCTIONS
// ============================================
window.setHeaterState = function(isOn) {
    heaterActive = isOn
}

window.setLampState = function(isOn) {
    lampActive = isOn
}

// Resize handling
window.addEventListener('resize', () => {
    const size = Math.min(600, window.innerWidth / 2 - 80)
    
    heaterCamera.aspect = 1
    heaterCamera.updateProjectionMatrix()
    heaterRenderer.setSize(size, size)
    
    lampCamera.aspect = 1
    lampCamera.updateProjectionMatrix()
    lampRenderer.setSize(size, size)
})
