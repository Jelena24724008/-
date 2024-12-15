// 添加在 script.js 的开头部分
particlesJS("particles-js", {
    particles: {
        number: { value: 80 },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: {
            value: 0.5,
            random: false
        },
        size: {
            value: 3,
            random: true
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: {
                enable: true,
                mode: "repulse"
            },
            onclick: {
                enable: true,
                mode: "push"
            },
            resize: true
        }
    }
});

// 页面加载完成后执行
window.addEventListener('load', function() {
    setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 1.5s ease-out';
        
        setTimeout(function() {
            loadingScreen.style.display = 'none';
        }, 5000); // 将时间从原来的1000ms改为5000ms (5秒)
    }, 4000); // 将时间从原来的2000ms改为4000ms (4秒)
});

let scene, camera, renderer, controls;
let currentModel = null;
let currentModelIndex = 0;
let isRotating = true;
const modelPaths = [
    './models/3D1.glb',
    './models/3D2.glb',
    './models/3D3.glb',
    './models/3D4.glb'
];

function init() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(
        50, 
        document.getElementById('model-container').offsetWidth / 
        document.getElementById('model-container').offsetHeight,
        0.1,
        1000
    );
    
    camera.position.z = 10;
    camera.position.y = 0;
    camera.position.x = 0;
    
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        precision: "highp"
    });
    
    renderer.setSize(
        document.getElementById('model-container').offsetWidth, 
        document.getElementById('model-container').offsetHeight
    );
    
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.gammaFactor = 2.2;
    
    document.getElementById('model-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controls.enablePan = false;
    
    controls.addEventListener('start', function() {
        isRotating = false;
    });
    
    controls.addEventListener('end', function() {
        setTimeout(() => {
            isRotating = true;
        }, 3000);
    });

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(5, 10, 7.5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    showModel(currentModelIndex);
    animate();

    window.addEventListener('resize', onWindowResize, false);
}

function showModel(index) {
    const loader = new THREE.GLTFLoader();
    
    if (currentModel) {
        scene.remove(currentModel);
    }

    loader.load(
        modelPaths[index], 
        function(gltf) {
            currentModel = gltf.scene;
            
            currentModel.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    if (node.material) {
                        node.material.envMapIntensity = 1.5;
                        node.material.needsUpdate = true;
                        node.material.metalness = 0.8;
                        node.material.roughness = 0.2;
                    }
                }
            });
            
            const box = new THREE.Box3().setFromObject(currentModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const maxSize = Math.max(size.x, size.y, size.z);
            const scale = 5 / maxSize;
            currentModel.scale.set(scale, scale, scale);
            
            currentModel.position.x = -center.x * scale;
            currentModel.position.y = -center.y * scale;
            currentModel.position.z = -center.z * scale;

            scene.add(currentModel);
            updateNavigationButtons();
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% 已加载');
        },
        function(error) {
            console.error('模型加载出错:', error);
        }
    );
}

function previousModel() {
    if (currentModelIndex > 0) {
        currentModelIndex--;
        showModel(currentModelIndex);
    }
}

function nextModel() {
    if (currentModelIndex < modelPaths.length - 1) {
        currentModelIndex++;
        showModel(currentModelIndex);
    }
}

function updateNavigationButtons() {
    const prevButton = document.querySelector('.nav-button.prev');
    const nextButton = document.querySelector('.nav-button.next');
    
    prevButton.disabled = currentModelIndex === 0;
    nextButton.disabled = currentModelIndex === modelPaths.length - 1;
}

function onWindowResize() {
    camera.aspect = document.getElementById('model-container').offsetWidth / 
                    document.getElementById('model-container').offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
        document.getElementById('model-container').offsetWidth, 
        document.getElementById('model-container').offsetHeight
    );
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();

// 添加模块切换函数
function switchModule(moduleName) {
    document.getElementById('module1').style.display = 'none';
    document.getElementById('module2').style.display = 'none';
    document.getElementById('module3').style.display = 'none';
    document.getElementById(moduleName).style.display = 'block';
}

function switchModule(moduleName) {
    document.getElementById('module1').style.display = 'none';
    document.getElementById('module2').style.display = 'none';
    document.getElementById('module3').style.display = 'none';
    document.getElementById(moduleName).style.display = 'block';
}

function switchLoginType(type) {
    // 更新按钮状态
    const buttons = document.querySelectorAll('.switch-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // 切换显示内容
    document.getElementById('password-login').style.display = type === 'password' ? 'flex' : 'none';
    document.getElementById('qr-login').style.display = type === 'qr' ? 'flex' : 'none';
}

// ���模块3的特殊模型创建新的场景
let specialScene, specialCamera, specialRenderer, specialControls;

function initSpecialModel() {
    specialScene = new THREE.Scene();
    specialScene.background = new THREE.Color(0xC0C0C0); // 设置黑色背景
    
    specialCamera = new THREE.PerspectiveCamera(
        50,
        500 / 500,
        0.1,
        1000
    );
    
    specialRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    
    specialRenderer.setSize(500, 500);
    specialRenderer.shadowMap.enabled = true;
    specialRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    specialRenderer.outputEncoding = THREE.sRGBEncoding;
    specialRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    specialRenderer.toneMappingExposure = 1.2;
    document.getElementById('special-model-container').appendChild(specialRenderer.domElement);
    
   // 修改控制器设置
   specialControls = new THREE.OrbitControls(specialCamera, specialRenderer.domElement);
   specialControls.enableDamping = true;
   specialControls.dampingFactor = 0.05;
   specialControls.rotateSpeed = 0.5;
   specialControls.autoRotate = true;
   specialControls.autoRotateSpeed = 2.0;
   specialControls.enableZoom = false;  // 禁用缩放
   specialControls.enablePan = false;   // 禁用平移
   specialControls.minDistance = 5;     // 设置最小距离
   specialControls.maxDistance = 5;     // 设置最大距离
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    specialScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    specialScene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(-5, -5, -5);
    specialScene.add(backLight);
    
    // 加载模型
    const loader = new THREE.GLTFLoader();
    loader.load(
        './模块3模型.glb',  // 使用相对路径
        function(gltf) {
            const model = gltf.scene;
            
            // 设置模型材质和阴影
            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    if (node.material) {
                        node.material.envMapIntensity = 1.5;
                        node.material.needsUpdate = true;
                        node.material.metalness = 0.8;
                        node.material.roughness = 0.2;
                    }
                }
            });

            // 调整模型大小和位置
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxSize = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxSize;
            model.scale.set(scale, scale, scale);
            
            specialScene.add(model);
            
            // 调整相机位置以适应模型
            specialCamera.position.set(5, 3, 5);
            specialCamera.lookAt(0, 0, 0);
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% 已加载');
        },
        function(error) {
            console.error('模型加载出错:', error);
        }
    );
    
    animateSpecial();
}

function animateSpecial() {
    requestAnimationFrame(animateSpecial);
    if(specialControls) specialControls.update();
    if(specialRenderer && specialScene && specialCamera) {
        specialRenderer.render(specialScene, specialCamera);
    }
}

// 修改switchModule函数
function switchModule(moduleName) {
    document.getElementById('module1').style.display = 'none';
    document.getElementById('module2').style.display = 'none';
    document.getElementById('module3').style.display = 'none';
    document.getElementById(moduleName).style.display = 'block';
    
    if(moduleName === 'module3' && !specialRenderer) {
        initSpecialModel();
    }
}

// 显示支付二维码
function showPaymentQR() {
    document.getElementById('paymentModal').style.display = 'flex';
}

// 关闭支付二维码
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// 修改购买按钮的点击事件
function buyNow() {
    showPaymentQR();
}

function handleLogin(event) {
    event.preventDefault(); // 阻止表单默认提交
    
    // 获取输入的用户名和密码
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // 简单的验证逻辑（实际应用中应该连接到后端进行验证）
    if (username === "admin" && password === "123456") {
        // 显示登录成功提示
        document.getElementById('login-success').style.display = 'flex';
        
        // 2秒后自动返回主页面
        setTimeout(() => {
            document.getElementById('login-success').style.display = 'none';
            switchModule('module1');
        }, 2000);
    } else {
        alert("用户名或密码错误！");
    }
}

// 初始化粒子效果
document.addEventListener("DOMContentLoaded", function() {
    particlesJS.load('particles-js', 'particles.json', function() {
        console.log('particles.js loaded');
    });
});