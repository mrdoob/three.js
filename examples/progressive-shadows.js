import * as THREE from '../build/three.module.js';

import { GUI } from './jsm/libs/dat.gui.module.js';

import { OBJLoader } from './jsm/loaders/OBJLoader.js';

import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { ProgressiveShadowsPass } from './jsm/postprocessing/ProgressiveShadowsPass.js';
import { LambertUVSpace } from './jsm/shaders/ProgressiveShadowsShader.js';

import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { ShadowMapViewer } from './jsm/utils/ShadowMapViewer.js';

let camera, scene, renderer, composer, dirLights = [], controls, dirLightShadowMapViewers = [], smoothedTarget = false;

let progressiveShadowsPass;
let object = new THREE.Mesh();

let basicMaterial = new THREE.MeshBasicMaterial();
let uv_material = new THREE.MeshLambertMaterial({ depthTest: false });
uv_material.onBeforeCompile = function (shader) {
  shader.vertexShader = shader.vertexShader.replace('}',
    `	gl_Position = vec4((uv - 0.5) * 2.0, 1.0, 1.0); }`

  );
  uv_material.userData.shader = shader;
};
uv_material.depthTest = false;

const params = { enable: true };

init();
createGUI();
animate();

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

    //let dirLightShadowMapViewer = new ShadowMapViewer(dirLight);
    //dirLightShadowMapViewer.position.x = 10;
    //dirLightShadowMapViewer.position.y = 10;
    //dirLightShadowMapViewer.size.set(window.innerWidth * 0.15, window.innerWidth * 0.15);
    //dirLightShadowMapViewer.update(); //Required when setting position or size directly
    //dirLightShadowMapViewers.push(dirLightShadowMapViewer);

    scene.add(dirLight);
    dirLights.push(dirLight);
  }

  let groundMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000),
                                  new THREE.MeshPhongMaterial({ color: 0xffffff, depthWrite: true}));
  groundMesh.position.y = -0.1;
  groundMesh.rotation.x = - Math.PI / 2;
  groundMesh.receiveShadow = true;
  groundMesh.layers.disableAll();
  groundMesh.layers.enable(1);
  scene.add(groundMesh);

  function loadModel() {
		object.traverse( function ( child ) {
      if (child.isMesh) {
        child.material = uv_material;
        child.castShadow = true;
        child.receiveShadow = true;
      } else {
        child.layers.disableAll();
        child.layers.enable(1);
      }
		} );

    scene.add(object);
    object.scale.set(2, 2, 2);
    object.position.set(0, -20, 0);
    object.layers.enable(31);
	}

	const manager = new THREE.LoadingManager( loadModel );

	// texture
	const textureLoader = new THREE.TextureLoader( manager );
	const texture = textureLoader.load( 'textures/uv_grid_opengl.jpg' );

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

  // postprocessing
  smoothedTarget = new THREE.WebGLRenderTarget(1024, 1024, {type: THREE.FloatType});
  composer = new EffectComposer(renderer, smoothedTarget);
  composer.renderToScreen = false;
  composer.addPass( new RenderPass( scene, camera ) );

  progressiveShadowsPass = new ProgressiveShadowsPass();
  composer.addPass(progressiveShadowsPass);

  basicMaterial.map = smoothedTarget;

  window.addEventListener( 'resize', onWindowResize );

  if ( typeof TESTING !== 'undefined' ) { for ( let i = 0; i < 45; i ++ ) { render(); }; };
}

function createGUI() {
  const gui = new GUI( { name: 'Averaging Setting' } );
  gui.add( progressiveShadowsPass.uniforms[ "averagingWindow" ], 'value', 1, 1000 ).step( 1 );
  gui.add( params, 'enable' );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
  composer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  // Render Normal Scene
  object.traverse( function ( child ) {
    if (child.isMesh) { child.material = basicMaterial; }
  } );
  scene.background = new THREE.Color(0x9a9a9a);
  camera.layers.enable(1);
  camera.layers.disable(31);
  renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
  renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
  renderer.render( scene, camera );

  object.traverse( function ( child ) {
    if (child.isMesh) { child.material = uv_material; }
  } );
  scene.background = new THREE.Color(0x000000);
  camera.layers.disable(1);
  camera.layers.enable(31);
  //renderer.setViewport( 0, 0, 0.35 * window.innerWidth, 0.35 * window.innerHeight );
  //renderer.setScissor ( 0, 0, 0.35 * window.innerWidth, 0.35 * window.innerHeight );
  //renderer.setScissorTest( true );
  //renderer.setClearColor(0x000000);
  composer.renderToScreen = false;
  composer.render(scene, camera);
  if ( params.enable ) {
    composer.render();
  } else {
    renderer.render( scene, camera );
  }

  for (let l = 0; l < dirLights.length; l++) {
    dirLights[l].position.set(200  + Math.random() * 300,
                              250  + Math.random() * 300,
                              400  + Math.random() * 300);
    //dirLightShadowMapViewers[l].render(renderer);
  }

}

function animate() {
  requestAnimationFrame( animate );
  render();
}