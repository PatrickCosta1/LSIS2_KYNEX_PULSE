const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 3, 8)
scene.add(camera)

// Controls - permite rotação 360º completa
const controls = new THREE.OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = true
controls.enablePan = false
controls.minDistance = 5
controls.maxDistance = 15

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setClearColor(0x0a0a0a, 1)

// Iluminação
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(5, 10, 5)
scene.add(directionalLight)

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.set(-5, 5, -5)
scene.add(pointLight)

// Criar Aquecedor de Chão
function createFloorHeater() {
    const heaterGroup = new THREE.Group()
    
    // Base do aquecedor
    const baseGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.6)
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,
        metalness: 0.3,
        roughness: 0.7
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    heaterGroup.add(base)
    
    // Corpo principal do aquecedor
    const bodyGeometry = new THREE.BoxGeometry(0.7, 1.2, 0.15)
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf5f5f5,
        metalness: 0.2,
        roughness: 0.4
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.65
    heaterGroup.add(body)
    
    // Grade de ventilação (horizontal)
    for(let i = 0; i < 10; i++) {
        const grillGeometry = new THREE.BoxGeometry(0.6, 0.02, 0.01)
        const grillMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a
        })
        const grill = new THREE.Mesh(grillGeometry, grillMaterial)
        grill.position.set(0, 0.2 + (i * 0.1), 0.08)
        heaterGroup.add(grill)
    }
    
    // Painel de controle no topo
    const panelGeometry = new THREE.BoxGeometry(0.5, 0.15, 0.05)
    const panelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        metalness: 0.6,
        roughness: 0.3
    })
    const panel = new THREE.Mesh(panelGeometry, panelMaterial)
    panel.position.set(0, 1.3, 0.1)
    heaterGroup.add(panel)
    
    // LED indicador (vermelho - ligado)
    const ledGeometry = new THREE.CircleGeometry(0.03, 16)
    const ledMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff3333,
        emissive: 0xff3333,
        emissiveIntensity: 2
    })
    const led = new THREE.Mesh(ledGeometry, ledMaterial)
    led.position.set(-0.15, 1.3, 0.13)
    heaterGroup.add(led)
    
    // Luz de calor (alaranjada)
    const heatLight = new THREE.PointLight(0xff6600, 1.5, 3)
    heatLight.position.set(0, 0.6, 0.2)
    heaterGroup.add(heatLight)
    
    heaterGroup.position.set(-2.5, 0.05, 0)
    scene.add(heaterGroup)
    
    return heaterGroup
}

// Criar Candeeiro de Chão
function createFloorLamp() {
    const lampGroup = new THREE.Group()
    
    // Base circular pesada
    const baseGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32)
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        metalness: 0.8,
        roughness: 0.2
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.04
    lampGroup.add(base)
    
    // Haste vertical (fino)
    const poleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 2.5, 16)
    const poleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,
        metalness: 0.9,
        roughness: 0.1
    })
    const pole = new THREE.Mesh(poleGeometry, poleMaterial)
    pole.position.y = 1.3
    lampGroup.add(pole)
    
    // Soquete no topo
    const socketGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.15, 16)
    const socketMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a3a3a,
        metalness: 0.7,
        roughness: 0.3
    })
    const socket = new THREE.Mesh(socketGeometry, socketMaterial)
    socket.position.y = 2.55
    lampGroup.add(socket)
    
    // Cúpula/Abajur (cónico invertido)
    const shadeGeometry = new THREE.ConeGeometry(0.5, 0.7, 32, 1, true)
    const shadeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf0f0f0,
        side: THREE.DoubleSide,
        metalness: 0.1,
        roughness: 0.6,
        transparent: true,
        opacity: 0.9
    })
    const shade = new THREE.Mesh(shadeGeometry, shadeMaterial)
    shade.position.y = 2.95
    shade.rotation.x = Math.PI
    lampGroup.add(shade)
    
    // Lâmpada (esfera brilhante)
    const bulbGeometry = new THREE.SphereGeometry(0.12, 16, 16)
    const bulbMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffcc,
        emissive: 0xffffcc,
        emissiveIntensity: 1
    })
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial)
    bulb.position.y = 2.7
    lampGroup.add(bulb)
    
    // Luz da lâmpada
    const lampLight = new THREE.PointLight(0xffffdd, 2, 5)
    lampLight.position.set(0, 2.7, 0)
    lampGroup.add(lampLight)
    
    lampGroup.position.set(2.5, 0, 0)
    scene.add(lampGroup)
    
    return lampGroup
}

// Criar os modelos
createFloorHeater()
createFloorLamp()

// Resize handler
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Animation loop
const tick = () => {
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()

