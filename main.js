//TODO: Textured sand
//TODO: Fun island
//TODO: Clouds
//TODO: DUDV map
//TODO: Fresnel effect
//TODO: Normal map (again)
//TODO: Soft edges

/* --- Configuration --- */
const size = 3000;
const skyboxSize = 4000;
const sunRadius = 100;
const fov = 75;
const fullscreen = false;

/* --- Initialization --- */
const imageLoader = new THREE.TextureLoader()
const modelLoader = new THREE.OBJLoader()
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#canvas')});
const rendererFBO = new THREE.WebGLRenderer({ canvas: document.querySelector('#canvasFBO')});
const height = fullscreen ? window.innerHeight : document.querySelector('#canvas').getAttribute('height')
const width  = fullscreen ? window.innerWidth  : document.querySelector('#canvas').getAttribute('width')
const aspectRatio = width / height;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width , height);
rendererFBO.setSize(width , height);
const reflectionTexture = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat })
const refractionTexture = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat })
const reflectionClipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0))
const refractionClipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0))

/* --- Scene Objects --- */
const scene = new THREE.Scene();
const lightPosition = new THREE.Vector3(-900, 200, -900);
const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 10000);
const controls = new OrbitControls(camera, renderer.domElement);
let sun, skybox, water, light, bottom, island, cube;

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

  let material = new THREE.MeshBasicMaterial({
    color: 0x0076f5,
    side: THREE.BackSide
  })
  let geometry = new THREE.BoxGeometry(skyboxSize, skyboxSize, skyboxSize);

  skybox = new THREE.Mesh(geometry, material);
  sceneObj.add(skybox);
}

function renderWater(sceneObj){
  // const material = new THREE.MeshPhongMaterial({
  //   color: 0x0000ff,
  //   opacity: 0.4,
  //   map: reflectionTexture.texture,
  //   // envMap: reflectionTexture.texture,
  //   // alphaMap: refractionTexture.texture,
  //   combine: THREE.MixOperation,
  //   transparent: true,
  //   normalMap: imageLoader.load('images/water-normal-map.png'),
  //   // normalMapType: THREE.ObjectSpaceNormalMap,
  // })
  //it also doesn't repeat like it's programmed to
  // const mapRepeats = 150; //the map texture is 512x512
  // material.normalMap.wrapS = THREE.RepeatWrapping
  // material.normalMap.wrapT = THREE.RepeatWrapping
  // material.normalMap.repeat.x=mapRepeats
  // material.normalMap.repeat.y=mapRepeats
  // material.normalScale.set(3, 3)

  let material = new THREE.ShaderMaterial({
    uniforms: {
      reflectionTexture: { value: reflectionTexture.texture },
      refractionTexture: { value: refractionTexture.texture },
    },
    vertexShader: vWaterShader,
    fragmentShader: fWaterShader
  })
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

  // const lightHelper = new THREE.PointLightHelper(light)
  //const gridHelper = new THREE.GridHelper(200, 50);
  //scene.add(lightHelper, gridHelper)
}

async function renderIsland(sceenObj) {
  //Trying to add something more complicated to reflect
  // let modelPath = 'models/lowpoly_island/scene.gltf';
  // let model = await loadOBJPromise(modelPath)
  // sceneObj.add(model.scene)
  let islandTexture = imageLoader.load('models/lowpoly-island/textures/textureSurface_Color_2.jpg')
  await modelLoader.load('models/lowpoly-island/island1_design2_c4d.obj',
      // onLoad callback
      function ( obj ) {
        //object loaded, configure and add to scene
        island = obj
        scene.add(island)
        island.scale.x = 0.5
        island.scale.y = 0.5
        island.scale.z = 0.5
        island.position.x = -200
        island.position.y = 10
        island.position.z = -100

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
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({
      color: 0x880000,
    }))

  cube.position.set(-5, 1, -5)
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
  // Load objects into scene
  loadLights(lightPosition, scene);
  renderSun(scene);
  renderCube(scene);
  loadSkyBox(scene);
  renderWater(scene);
  renderSand(scene);
  await renderIsland(scene);

  camera.position.set(10, 10, 10);
  scene.fog = new THREE.Fog(0xffffff, 1000, 6000);

  let i = 0;
  function animate() {
    controls.update()

    //move normal map
    i += 0.001;
    // water.material.normalMap.offset.x = i;
    // water.material.normalMap.offset.y = i;

    //prep camera for reflection
    let distance = 2 * (camera.position.y - water.position.y)
    let angle = 2 * camera.rotation.x;
    camera.position.y -= distance;
    camera.rotateX(-angle);
    water.material.visible = false;

    //render reflection
    renderer.clippingPlanes = [reflectionClipPlane]
    renderer.setRenderTarget(reflectionTexture)
    renderer.render(scene, camera)
    //renders reflection to neighboring canvas
    //TODO: Somethigns a little off here, not sure exactly what. Fix it though
    rendererFBO.clippingPlanes = [reflectionClipPlane]
    rendererFBO.render(scene, camera)

    //reset camera
    camera.position.y += distance;
    camera.rotateX(angle)

    //render refraction
    renderer.clippingPlanes = [refractionClipPlane]
    renderer.setRenderTarget(refractionTexture)
    renderer.render(scene, camera)
    //renders refraction to neighboring canvas
    // rendererFBO.clippingPlanes = [refractionClipPlane]
    // rendererFBO.render(scene, camera)

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