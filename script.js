// Variables globales para Three.js
let scene, camera, renderer, mesh, controls;

// Variables de estado de la aplicación
let figuraActual = 'esfera';
let esFormulaEditada = false;

// Inicialización de la escena 3D
function init3D() {
    const container = document.getElementById('canvas3d');

    // 1. Escena
    scene = new THREE.Scene();

    // 2. Cámara
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(15, 15, 20);

    // 3. Renderizador WebGL
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls (rotación y zoom)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 5. Iluminación
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const dirLight1 = new THREE.DirectionalLight(0x06b6d4, 1.2);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xec4899, 1.2);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Eventos de ventana
    window.addEventListener('resize', onWindowResize);

    // Configuración de eventos de UI y primer renderizado
    configurarEventos();
    actualizarCalculo();
    animate();
}

// Vincula eventos a los elementos del DOM
function configurarEventos() {
    document.getElementById('btn-esfera').addEventListener('click', () => cambiarFigura('esfera'));
    document.getElementById('btn-piramide').addEventListener('click', () => cambiarFigura('piramide'));
    document.getElementById('btn-cilindro').addEventListener('click', () => cambiarFigura('cilindro'));

    document.getElementById('input1').addEventListener('input', actualizarCalculo);
    document.getElementById('input2').addEventListener('input', actualizarCalculo);

    document.getElementById('formulaEcuacion').addEventListener('input', marcarFormulaPersonalizada);
    document.getElementById('formulaSustitucion').addEventListener('input', marcarFormulaPersonalizada);

    document.getElementById('btnRestaurar').addEventListener('click', restaurarFormulas);
}

// Cambia la figura 3D seleccionada y ajusta la interfaz
function cambiarFigura(tipo) {
    figuraActual = tipo;
    esFormulaEditada = false;
    document.getElementById('btnRestaurarContenedor').classList.add('hidden');

    const btns = { esfera: 'btn-esfera', piramide: 'btn-piramide', cilindro: 'btn-cilindro' };
    const active = ['border-cyan-400', 'bg-cyan-500/20', 'text-cyan-300', 'shadow-[0_0_15px_rgba(6,182,212,0.3)]'];
    const inactive = ['border-slate-700', 'bg-slate-800/60', 'text-slate-400'];

    Object.keys(btns).forEach(k => {
        const b = document.getElementById(btns[k]);
        if (k === tipo) {
            b.classList.remove(...inactive);
            b.classList.add(...active);
        } else {
            b.classList.remove(...active);
            b.classList.add(...inactive);
        }
    });

    const ctrl2 = document.getElementById('controlInput2');
    const lbl1 = document.getElementById('labelInput1');
    if (tipo === 'esfera') {
        ctrl2.classList.add('hidden');
        lbl1.innerText = 'Radio (r)';
    } else {
        ctrl2.classList.remove('hidden');
        lbl1.innerText = tipo === 'piramide' ? 'Lado de la Base (l)' : 'Radio (r)';
    }

    actualizarCalculo();
}

// Genera la malla 3D según los parámetros
function renderizarFigura3D() {
    if (!scene) return;
    if (mesh) scene.remove(mesh);

    const v1 = parseFloat(document.getElementById('input1').value);
    const v2 = parseFloat(document.getElementById('input2').value);
    let geo;

    const mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2, metalness: 0.3 });

    if (figuraActual === 'esfera') {
        geo = new THREE.SphereGeometry(v1 * 0.8, 32, 32);
    } else if (figuraActual === 'piramide') {
        geo = new THREE.ConeGeometry((v1 * 0.8) / Math.SQRT2, v2 * 0.8, 4);
    } else if (figuraActual === 'cilindro') {
        geo = new THREE.CylinderGeometry(v1 * 0.8, v1 * 0.8, v2 * 0.8, 32);
    }

    mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
}

// Bucle de animación continuo a 60 FPS
function animate() {
    requestAnimationFrame(animate);

    if (mesh) mesh.rotation.y += 0.008;
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

// Reajusta el tamaño del canvas al redimensionar la ventana
function onWindowResize() {
    const container = document.getElementById('canvas3d');
    if (!container || !camera || !renderer) return;

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Registra modificación manual de fórmulas
function marcarFormulaPersonalizada() {
    esFormulaEditada = true;
    document.getElementById('btnRestaurarContenedor').classList.remove('hidden');
}

// Restaura las fórmulas generadas dinámicamente
function restaurarFormulas() {
    esFormulaEditada = false;
    document.getElementById('btnRestaurarContenedor').classList.add('hidden');
    actualizarCalculo();
}

// Recalcula el volumen y actualiza las expresiones matemáticas
function actualizarCalculo() {
    const v1 = parseFloat(document.getElementById('input1').value);
    const v2 = parseFloat(document.getElementById('input2').value);

    document.getElementById('valInput1').innerText = v1;
    document.getElementById('valInput2').innerText = v2;

    let vol = 0;

    if (figuraActual === 'esfera') {
        vol = (4 / 3) * Math.PI * Math.pow(v1, 3);
        if (!esFormulaEditada) {
            document.getElementById('formulaEcuacion').innerText = 'V = (4/3) × π × r³';
            document.getElementById('formulaSustitucion').innerText = `V = (4/3) × 3.1416 × (${v1})³`;
        }
    } else if (figuraActual === 'piramide') {
        vol = (1 / 3) * Math.pow(v1, 2) * v2;
        if (!esFormulaEditada) {
            document.getElementById('formulaEcuacion').innerText = 'V = (1/3) × l² × h';
            document.getElementById('formulaSustitucion').innerText = `V = (1/3) × (${v1})² × ${v2}`;
        }
    } else if (figuraActual === 'cilindro') {
        vol = Math.PI * Math.pow(v1, 2) * v2;
        if (!esFormulaEditada) {
            document.getElementById('formulaEcuacion').innerText = 'V = π × r² × h';
            document.getElementById('formulaSustitucion').innerText = `V = 3.1416 × (${v1})² × ${v2}`;
        }
    }

    document.getElementById('resultadoVolumen').innerText = vol.toFixed(2);
    renderizarFigura3D();
}

// Inicia la aplicación al cargar el DOM
window.addEventListener('DOMContentLoaded', init3D);
