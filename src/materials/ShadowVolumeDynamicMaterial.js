/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 
 *  lightMap: new THREE.Texture( <Image> ),
 
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 
 *  vertexColors: <bool>,
 *  skinning: <bool>
 * }
 */

THREE.ShadowVolumeDynamicMaterial = function ( parameters ) {

	this.id = THREE.MaterialCounter.value ++;

	this.color = new THREE.Color( 0xffffff );
	this.opacity = 1.0;
	this.map = null;

	this.lightMap = null;

	this.envMap = null;
	this.combine = THREE.MultiplyOperation;
	this.reflectivity = 1.0;
	this.refractionRatio = 0.98;

	this.fog = true; // implemented just in WebGLRenderer2

	this.shading = THREE.FlatShading;
	this.blending = THREE.NormalBlending;
	this.depthTest = true;

	this.wireframe = false;
	this.wireframeLinewidth = 1.0;
	this.wireframeLinecap = 'round'; // implemented just in CanvasRenderer
	this.wireframeLinejoin = 'round'; // implemented just in CanvasRenderer

	this.vertexColors = false;
	this.skinning = false;
	this.morphTargets = false;

};
