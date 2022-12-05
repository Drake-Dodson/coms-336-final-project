// Initialization
const scene = new THREE.Scene();
const sceneFBO = new THREE.Scene();
const loader = new THREE.TextureLoader();
const size = 3000;
const skyboxSize = 4000;
const sunRadius = 100;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
});
const rendererFBO = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvasFBO'),
});

// const rendererFBO = new THREE.WebGLRenderTarget(renderer.width, renderer.height);

//TODO: Textured sand
//TODO: Reflections
//TODO: Clouds
//TODO: DUDV map
//TODO: Fresnel effect
//TODO: Soft edges
//TODO: Projective texture mapping
var fov = 75;

var fullscreen = false;


if(fullscreen == true){
  var height = window.innerHeight
  var width = window.innerWidth

}
else{
  var width = document.querySelector('#canvas').getAttribute('width');
  var height = document.querySelector('#canvas').getAttribute('height')
}

var aspectRatio = width / height;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width , height);
rendererFBO.setSize(width , height);
var reflectionTexture = new THREE.WebGLRenderTarget(width, height)
var refractionTexture = new THREE.WebGLRenderTarget(width, height)

const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 10000);


// Scene Objects
var sun;
var skybox;
var water;
var light;
var sandyBottom;

function loadSkyBox(sceneObj) {
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

  var skyboxGeometry = new THREE.BoxGeometry(skyboxSize, skyboxSize, skyboxSize);
  skybox = new THREE.Mesh(skyboxGeometry, material);
  sceneObj.add(skybox);
}

function renderWater(sceneObj){
  // const geometry = new THREE.CircleGeometry(1000, 1000);
  // const material = new THREE.ShaderMaterial({
  //   vertexShader: vWaterShader,
  //   fragmentShader: fWaterShader
  // })

  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    opacity: 0.4,
    // map: reflectionTexture,
    // alphaMap: refractionTexture,
    combine: THREE.AddOperation,
    transparent: true,
    normalMap: loader.load('images/water-normal-map.png'),
    // normalMapType: THREE.ObjectSpaceNormalMap,
  })
  const mapRepeats = 150; //the map texture is 512x512
  material.normalMap.wrapS = THREE.RepeatWrapping
  material.normalMap.wrapT = THREE.RepeatWrapping
  material.normalMap.repeat.x=mapRepeats
  material.normalMap.repeat.y=mapRepeats
  material.normalScale.set(3, 3)

  water = new THREE.Mesh(geometry, material)
  water.rotation.x = toRadians(-90)
  water.position.set(0, 0, 0)
  sceneObj.add(water)
}

function renderSand(sceneObj){
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshPhongMaterial({
    color: 0xD8B863
  })

  sandyBottom = new THREE.Mesh(geometry, material)
  sandyBottom.rotation.x = toRadians(-90)
  sandyBottom.position.set(0, -200, 0)
  sceneObj.add(sandyBottom)
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
  const geometry = new THREE.SphereGeometry(sunRadius);
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

  // Load FBO
  // loadLights(lightPosition, sceneFBO);
  // renderSun(sceneFBO);
  // renderCube(sceneFBO);
  // loadSkyBox(sceneFBO);

  // Load scene
  loadLights(lightPosition, scene);
  renderSun(scene);
  renderCube(scene);
  loadSkyBox(scene);
  renderWater(scene);
  renderSand(scene);

  const controls = new OrbitControls(camera, renderer.domElement);

  scene.fog = new THREE.Fog(0xffffff, 1000, 6000);
  sceneFBO.fog = new THREE.Fog(0xffffff, 1000, 6000);

  //clipping planes
  let reflectionPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0))
  let refractionPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0))
  // refractionPlane.rotateX(180)

  var i = 0
  function animate() {
    requestAnimationFrame(animate);
    controls.update
    //sun.position.set(camera.position.x + 1000, camera.position.y + 1000, camera.position.z + 1000);
    water.material.normalMap.offset.x = i;
    water.material.normalMap.offset.y = i;

    //this causes a lot of lag for me, so I'm commenting it out for now while I work on stuff
    //not sure what you'll do with it later, and how that will affect performance, but yee
    let fboCam = camera.clone()
    // fboCam.position.y = -camera.position.y;
    water.material.visible = false;
    // rendererFBO.render(scene, fboCam);

    renderer.clippingPlanes = [reflectionPlane]
    renderer.render(scene, fboCam, reflectionTexture)

    renderer.clippingPlanes = [refractionPlane]
    renderer.render(scene, fboCam, refractionTexture)

    //TODO: Figure out why applying these to the texture
    //makes it invisible
    //Kinda think we'll need to write custom shaders instead of just using three.js :(
    // water.material.map = reflectionTexture.texture
    // water.material.alphaMap = refractionTexture.texture

    renderer.clippingPlanes = []
    water.material.visible = true;
    renderer.render(scene, camera);
    i += 0.001;
  }

  animate();
}

//use rendererFBO as a test for applying a rendered thing on a texture


