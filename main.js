// Initialization
const scene = new THREE.Scene();
const sceneFBO = new THREE.Scene();
const size = 9000;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
});

const rendererFBO = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvasFBO'),
});


var fov = 75; 

var fullscreen = false;


if(fullscreen == true){
  var aspectRatio = window.innerWidth / window.innerHeight;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
}
else{
  var aspectRatio = document.querySelector('#canvas').getAttribute('width') / document.querySelector('#canvas').getAttribute('height');

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(document.querySelector('#canvas').getAttribute('width') , document.querySelector('#canvas').getAttribute('height'));
}

const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 10000);


// Scene Objects
var sun;
var skybox;
var water;
var light;

function loadSkyBox(sceneObj) {
  const skyboxSize = 4000

  // const material = new THREE.ShaderMaterial({
  //   uniforms: {
  //     color: {
  //       value: new THREE.Vector3(0.66, 0.96,0.96)
  //     }
  //   },
  //   vertexShader: vSkyboxShader,
  //   fragmentShader: fSkyboxShader,
  //   side: THREE.BackSide
  // })

  const material = new THREE.MeshBasicMaterial({
    color: 0x0076f5,
    side: THREE.BackSide
  })

  var skyboxGeometry = new THREE.SphereGeometry(skyboxSize, skyboxSize, skyboxSize);
  skybox = new THREE.Mesh(skyboxGeometry, material);
  sceneObj.add(skybox);
}

function renderWater(sceneObj){
  // const geometry = new THREE.CircleGeometry(1000, 1000);
  // const material = new THREE.ShaderMaterial({
  //   vertexShader: vWaterShader,
  //   fragmentShader: fWaterShader
  // })

  const geometry = new THREE.CircleGeometry(100, 100);
  const material = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    opacity: 0.3,
    transparent: true
  })

  water = new THREE.Mesh(geometry, material)
  water.rotation.x = toRadians(-90)
  water.position.set(0, 0, 0)
  sceneObj.add(water)
}


function loadLights(lightPosition, sceneObj){
  light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
  //https://www.youtube.com/watch?v=PPwR7h5SnOE
  light.target.position.set(0, 0, 0);
  light.castShadow = true;

  const ambientLight = new THREE.AmbientLight(0xffffff);
  sceneObj.add(light, ambientLight);

  const lightHelper = new THREE.PointLightHelper(light)
  //const gridHelper = new THREE.GridHelper(200, 50);
  //scene.add(lightHelper, gridHelper)
}

function renderCube(sceneObj){
  cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({
      color: 0x880000,
    }))
  
  cube.position.set(-5, 5, -5)
  sceneObj.add(cube)
}

function renderSun(sceneObj){
  const geometry = new THREE.SphereGeometry(100, 100, 100);
  const material = new THREE.MeshPhongMaterial({
    color: 0xfaf887,
  })
  sun = new THREE.Mesh(geometry, material);
  sun.position.set(-1100, 200, -1100);
  sceneObj.add(sun)
}

async function main(){

  var lightPosition = new THREE.Vector3(-900, 200, -900);
  
  camera.position.set(10, 10, 10);
  
  renderer.render(scene, camera);
  
  // Load FBO
  loadLights(lightPosition, sceneFBO);
  renderSun(sceneFBO);
  renderCube(sceneFBO);
  loadSkyBox(sceneFBO);
  
  // Load scene
  loadLights(lightPosition, scene);
  renderSun(scene);
  renderCube(scene);
  loadSkyBox(scene);
  renderWater(scene);

  
  
  const controls = new OrbitControls(camera, renderer.domElement);
  
  scene.fog = new THREE.Fog(0xffffff, 1000, 6000);
  sceneFBO.fog = new THREE.Fog(0xffffff, 1000, 6000);

  var i = 0
  function animate() {
    requestAnimationFrame(animate);
    //sun.position.set(camera.position.x + 1000, camera.position.y + 1000, camera.position.z + 1000);
    renderer.render(scene, camera);
    rendererFBO.render(sceneFBO, camera);
    controls.update
  }
  
  animate();
}

