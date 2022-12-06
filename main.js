//TODO: Clouds
//TODO: Soft edges

/* --- Configuration --- */
const size = 3000;
const skyboxSize = 8000;
const sunRadius = 100;
const fov = 75;
const fullscreen = true;
const showReflection = false;
const showRefraction = false;
const showNormalMap = true;
const far = 10000;
const near = 0.1;

/* --- Initialization --- */
const imageLoader = new THREE.TextureLoader()
const modelLoader = new THREE.OBJLoader()
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#canvas')});
const reflectionRenderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#canvasReflect')});
const refractionRenderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#canvasRefract')});
const height = fullscreen ? window.innerHeight : document.querySelector('#canvas').getAttribute('height')
const width  = fullscreen ? window.innerWidth  : document.querySelector('#canvas').getAttribute('width')
const aspectRatio = width / height;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width , height);
const reflectionTexture = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat })
const refractionTexture = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat })
const reflectionClipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0))
const refractionClipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0))

/* --- Scene Objects --- */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
const controls = new OrbitControls(camera, renderer.domElement);
let sun, skybox, water, light, bottom, island, cube;

/* --- Lighting Objects --- */
const lightPosition = new THREE.Vector4(-900, 300, -900, 1.0);
var lightPropElements = new Float32Array([
  0.7, 0.7, 0.7,
  0.2, 0.7, 0.7,
  0.7, 0.7, 0.7
  ]);

var matPropElements = new Float32Array([
    0.7, 0.7, 0.7,
    0.3, 0.3, 0.3,
    0.2, 0.2, 0.2,
]);
var shininess = 20.0;
var lightFocus = 100;

/* --- Movement Variables --- */
var waveSpeed = 0.0002;
var moveFactor = 0;

function loadSkyBox(sceneObj) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: new THREE.Vector3(0.00, 0.5,0.96)
      }
    },
    vertexShader: vSkyboxShader,
    fragmentShader: fSkyboxShader,
    side: THREE.BackSide
  })
  let geometry = new THREE.BoxGeometry(skyboxSize, skyboxSize, skyboxSize);

  skybox = new THREE.Mesh(geometry, material);
  sceneObj.add(skybox);
}

function renderWater(sceneObj){
  direction = new THREE.Vector4(0, -0, 0, 0);
  direction = direction.applyMatrix4(camera.matrixWorldInverse);

  let material = new THREE.ShaderMaterial({
    uniforms: {
      reflectionTexture: { value: reflectionTexture.texture },
      refractionTexture: { value: refractionTexture.texture },
      lightPosition: { value: lightPosition},
      lightProperties: { value: lightPropElements},
      shininess: { value: shininess},
      lightFocus: {value: lightFocus},
      fD: {value: new THREE.Vector3(direction.x, direction.y, direction.z)},
      dudvMap: {value: imageLoader.load('images/dudv-map.png')},
      moveFactor: {value: moveFactor},
      normalMap: {value: imageLoader.load('images/water-normal-map.png')},
      cameraPos: {value: camera.position},
      // reflectionFactor: {value: 1.0}, for some reason doesn't work if set here :(
      depthMap: {value: refractionTexture.depthTexture},
      nearPlane: {value: near},
      farPlane: {value: far},
    },
    vertexShader: vWaterShader,
    fragmentShader: fWaterShader,
    transparent: true,
  })

  //make the textures wrap
  reflectionTexture.texture.wrapS = THREE.RepeatWrapping
  reflectionTexture.texture.wrapT = THREE.RepeatWrapping
  if(showNormalMap){
    material.uniforms.normalMap.value.wrapS = THREE.RepeatWrapping;
    material.uniforms.normalMap.value.wrapT = THREE.RepeatWrapping;
  }
  material.uniforms.dudvMap.value.wrapS = THREE.RepeatWrapping;
  material.uniforms.dudvMap.value.wrapT = THREE.RepeatWrapping;

  let geometry = new THREE.PlaneGeometry(size, size)
  water = new THREE.Mesh(geometry, material)
  water.rotation.x = toRadians(-90)
  water.position.set(0, 0, 0)
  sceneObj.add(water)
}

function renderSand(sceneObj){
  let geometry = new THREE.PlaneGeometry(size, size);
  let material = new THREE.MeshPhongMaterial({
    color: 0xD8B863
  })

  bottom = new THREE.Mesh(geometry, material)
  bottom.rotation.x = toRadians(-90)
  bottom.position.set(0, -200, 0)
  sceneObj.add(bottom)
}

function loadLights(lightPosition, sceneObj){
  light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
  //https://www.youtube.com/watch?v=PPwR7h5SnOE
  light.target.position.set(0, 0, 0);
  light.castShadow = true;

  let ambientLight = new THREE.AmbientLight(0xffffff);
  sceneObj.add(light, ambientLight);

  //const lightHelper = new THREE.PointLightHelper(light)
  const gridHelper = new THREE.GridHelper(200, 50);
  //scene.add(lightHelper)
}

async function renderIsland(sceenObj) {
  //"Lowpoly island" (https://skfb.ly/68SED) by alfance is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
  let islandTexture = imageLoader.load('models/lowpoly-island/textures/textureSurface_Color_2.jpg')
  await modelLoader.load('models/lowpoly-island/island1_design2_c4d.obj',
      // onLoad callback
      function ( obj ) {
        //object loaded, configure and add to scene
        island = obj
        sceenObj.add(island)
        island.scale.x = 0.5
        island.scale.y = 0.5
        island.scale.z = 0.5
        island.position.x = 0
        island.position.y = 0
        island.position.z = 0

        //have to find the child that is the mesh to load the texture onto it
        island.traverse( function ( child ) {
          if ( child instanceof THREE.Mesh )
            child.material.map = islandTexture;
        });
      },

      // onProgress callback
      function ( xhr ) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
      },

      // onError callback
      function ( err ) {
        console.error( err );
      }
  );
}

function renderCube(sceneObj){
  cube = new THREE.Mesh(
    new THREE.BoxGeometry(8, 8, 8),
    new THREE.MeshPhongMaterial({
      color: 0x880000,
    }))

  cube.position.set(90, -5, -25)
  sceneObj.add(cube)

  cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(20, 20, 20),
    new THREE.MeshPhongMaterial({
      color: 0x886800,
    }))

  cube2.position.set(0, 25, -90)
  sceneObj.add(cube2)
  
  cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 15),
    new THREE.MeshPhongMaterial({
      color: 0x8868f0,
    }))

  cube3.position.set(-100, 5, -5)
  sceneObj.add(cube3)

  cube4 = new THREE.Mesh(
    new THREE.BoxGeometry(200, 400, 200),
    new THREE.MeshPhongMaterial({
      color: 0x00f0fe,
    }))

  cube4.position.set(-400, -100, -100)
  sceneObj.add(cube4)
  
  cube5 = new THREE.Mesh(
    new THREE.BoxGeometry(8, 8, 8),
    new THREE.MeshPhongMaterial({
      color: 0x008800,
    }))

  cube5.position.set(0, 0, -200)
  sceneObj.add(cube5)
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
  // Load objects into scene
  loadLights(lightPosition, scene);
  renderSun(scene);
  renderCube(scene);
  loadSkyBox(scene);
  renderWater(scene);
  // renderSand(scene);
  await renderIsland(scene);

  camera.position.set(75, 75, 75);

  let i = 0;
  var waveSpeedIterator = waveSpeed;
  function animate() {
    controls.update()

    //move normal map
    i += 0.001;

    if(moveFactor > 0.2){
      waveSpeedIterator = -waveSpeedIterator;
    }
    if(moveFactor > 0){
      waveSpeedIterator = -waveSpeedIterator;
    }
    moveFactor += waveSpeedIterator;
    water.material.uniforms.moveFactor.value = moveFactor;

    //prep camera for reflection
    let distance = 2 * (camera.position.y - water.position.y)
    let dir = new THREE.Vector3() //This is a jank way that only works cuz we're using orbit controls
    camera.position.y -= distance;
    camera.lookAt(dir)

    //render reflection
    water.material.visible = false;
    renderer.clippingPlanes = [reflectionClipPlane]
    renderer.setRenderTarget(reflectionTexture)
    renderer.render(scene, camera)

    //renders reflection to neighboring canvas
    if (showReflection){
      reflectionRenderer.clippingPlanes = [reflectionClipPlane]
      reflectionRenderer.render(scene, camera)
    }

    //reset camera
    camera.position.y += distance;
    camera.lookAt(dir)

    //render refraction
    renderer.clippingPlanes = [refractionClipPlane]
    renderer.setRenderTarget(refractionTexture)
    renderer.render(scene, camera)
    //renders refraction to neighboring canvas
    if (showRefraction){
      refractionRenderer.clippingPlanes = [refractionClipPlane]
      refractionRenderer.render(scene, camera)
    }

    //render to the output thingy
    water.material.needsUpdate = true
    renderer.setRenderTarget(null)
    renderer.clippingPlanes = []
    water.material.visible = true
    renderer.render(scene, camera)

    requestAnimationFrame(animate);
  }

  animate();
}