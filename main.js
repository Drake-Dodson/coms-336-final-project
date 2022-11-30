const scene = new THREE.Scene();
const size = 9000;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
});

var fov = 75; 
var aspectRatio = window.innerWidth / window.innerHeight;

const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 10000);

function loadSkyBox() {
  const skyboxSize = 4000

  const material = new THREE.MeshStandardMaterial({
    color: 0x075fed,
    side: THREE.BackSide
  })

  var skyboxGeo = new THREE.SphereGeometry(skyboxSize, skyboxSize, skyboxSize);
  var skybox = new THREE.Mesh(skyboxGeo, material);
  scene.add(skybox);
}

// function createPathStrings(filename) {
//   const basePath = "./images/";
//   const baseFilename = basePath + filename;
//   const fileType = ".jpg";
//   const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
//   const pathStings = sides.map(side => {
//       return baseFilename + "_" + side + fileType;
//   });
  
//   return pathStings;
//   }

// function createMaterialArray(filename) {
//   const skyboxImagepaths = createPathStrings(filename);

//   const materialArray = skyboxImagepaths.map(image => {
//     let texture = new THREE.TextureLoader().load(image);

//     return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }); 
//   });
//   return materialArray;
// }

function renderWater(i){
  const geometry = new THREE.CircleGeometry(1000, 1000);
  const material = new THREE.MeshBasicMaterial({
    color: 0x4cede0,
    opacity: 0.5,
    transparent: true
  })

  const water = new THREE.Mesh(geometry, material)
  water.rotation.x = toRadians(-90)
  water.position.set(1, -1, 1)
  scene.add(water)
}


function loadLights(){
  const pointLight = new THREE.SpotLight(0xffffff);
  pointLight.position.set(-10, 10, -10);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(pointLight, ambientLight);


  const lightHelper = new THREE.PointLightHelper(pointLight)
  // const gridHelper = new THREE.GridHelper(200, 50);
  // scene.add(lightHelper, gridHelper)
}

function renderCube(){
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({
    color: 0x880000,
  })

  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)
}


async function main(){
  var fov = 75; 
  var aspectRatio = window.innerWidth / window.innerHeight;

  const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 10000);

  const size = 5000;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  camera.position.set(10, 10, 10);
  
  renderer.render(scene, camera);
  
  
  loadLights();
  //renderGround();
  renderCube();
  loadSkyBox();
  renderWater();

  const controls = new OrbitControls(camera, renderer.domElement);
  
  scene.fog = new THREE.Fog(0x075fed, 100, 900)

  var i = 0
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update
  }
  
  animate();
}

