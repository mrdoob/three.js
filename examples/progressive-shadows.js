import * as THREE from '../build/three.module.js';

import { GUI } from './jsm/libs/dat.gui.module.js';

import { OBJLoader } from './jsm/loaders/OBJLoader.js';

import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { ProgressiveShadowsPass } from './jsm/postprocessing/ProgressiveShadowsPass.js';
import { LambertUVSpace } from './jsm/shaders/ProgressiveShadowsShader.js';

import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { ShadowMapViewer } from './jsm/utils/ShadowMapViewer.js';

let camera, scene, renderer, dirLights = [], controls, lightmap_containers = [];

let object = new THREE.Mesh();

const params = { enable: true,  averagingWindow: 100 };

init();
createGUI();
animate();

function addToProgressiveLightMap(object) {
  let progressiveLightmap = new THREE.WebGLRenderTarget(1024, 1024, { type: THREE.FloatType });
  
  let composer = new EffectComposer(renderer, progressiveLightmap);
  composer.renderToScreen = false;
  composer.addPass(new RenderPass(scene, camera));
  let progressiveShadowsPass = new ProgressiveShadowsPass();
  composer.addPass( progressiveShadowsPass ); // This accumulates the shadows over time

  let oldMaterial = object.material;
  oldMaterial.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.slice(0, -1) +
                          '	gl_Position = vec4((uv - 0.5) * 2.0, 1.0, 1.0); }';
    oldMaterial.userData.shader = shader;
  };

  // This material is unaffected by light
  let basicMaterial    = new THREE.MeshBasicMaterial(); 
  basicMaterial.map    = progressiveLightmap.texture;
  object.material      = basicMaterial;
  object.castShadow    = true;
  object.receiveShadow = true;
  
  lightmap_containers.push({
    composer: composer,
    basicMat: basicMaterial,
    uvMat   : oldMaterial,
    object  : object,
    shadowPass: progressiveShadowsPass,
    lightmap: progressiveLightmap
  });
}

function updateProgressiveLightMaps() {
  camera.layers.disable(1);
  camera.layers.enable(31);

  for (let l = 0; l < lightmap_containers.length; l++){
    lightmap_containers[l].shadowPass.uniforms["averagingWindow"] = params.averagingWindow;
    lightmap_containers[l].object.material = lightmap_containers[l].uvMat;
    lightmap_containers[l].object.layers.enable(31);

    scene.background = new THREE.Color(0x000000);
    lightmap_containers[l].composer.render(scene, camera);
    lightmap_containers[l].composer.render();

    // Restore Object's Real-time Material
    lightmap_containers[l].object.material = lightmap_containers[l].basicMat;
    lightmap_containers[l].object.layers.disable(31);
  }

  // Restore Normal Scene Rendering
  scene.background = new THREE.Color(0x9a9a9a);
  camera.layers.enable(1);
  camera.layers.disable(31);
}

function init() {

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 100, 200);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9a9a9a);
  scene.fog = new THREE.Fog(0x9a9a9a, 1000, 3000);
  
  let lightCount = 1;
  for (let l = 0; l < lightCount; l++){
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.5/lightCount);
    dirLight.name = 'Dir. Light '+l;
    dirLight.position.set(200, 200, 200);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near    =   100;
    dirLight.shadow.camera.far     =   5000;
    dirLight.shadow.camera.right   =   150;
    dirLight.shadow.camera.left    = - 150;
    dirLight.shadow.camera.top	   =   150;
    dirLight.shadow.camera.bottom  = - 150;
    dirLight.shadow.mapSize.width  =   1024;
    dirLight.shadow.mapSize.height =   1024;

    let lightTarget = new THREE.Group();
    lightTarget.position.set(0, 100, 0);
    dirLight.target = lightTarget;
    scene.add(lightTarget);

    scene.add(dirLight);
    dirLights.push(dirLight);
  }

  let groundMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 1000),
                                  new THREE.MeshPhongMaterial({ color: 0xffffff, depthWrite: true}));
  groundMesh.position.y = -0.1;
  groundMesh.rotation.x = - Math.PI / 2;
  scene.add(groundMesh);
  addToProgressiveLightMap(groundMesh);

  function loadModel() {
		object.traverse( function ( child ) {
      if (child.isMesh) {
        addToProgressiveLightMap(child);
      } else {
        child.layers.disableAll();
        child.layers.enable(1);
      }
		} );

    scene.add(object);
    object.scale.set(2, 2, 2);
    object.position.set(0, -20, 0);
	}

	const manager = new THREE.LoadingManager( loadModel );

	// model
	const loader = new OBJLoader( manager );
  loader.load('models/obj/ShadowmappableMesh.obj', function (obj) { object = obj; });
  
	// controls
	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.05;
	controls.screenSpacePanning = true;
	controls.minDistance = 100;
	controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 1.5;
  controls.target.set(0, 100, 0);

  window.addEventListener( 'resize', onWindowResize );

  if ( typeof TESTING !== 'undefined' ) { for ( let i = 0; i < 45; i ++ ) { render(); }; };
}

function createGUI() {
  const gui = new GUI( { name: 'Averaging Setting' } );
  gui.add( params, 'averagingWindow', 1, 1000 ).step( 1 );
  gui.add( params, 'enable' );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
  controls.update();

  // Render Normal Scene
  renderer.render( scene, camera );

  updateProgressiveLightMaps();

  for (let l = 0; l < dirLights.length; l++) {
    dirLights[l].position.set(200  + Math.random() * 300,
                              250  + Math.random() * 300,
                              400  + Math.random() * 300);
  }

}

function animate() {
  requestAnimationFrame( animate );
  render();
}