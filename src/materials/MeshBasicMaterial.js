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

THREE.MeshBasicMaterial = function ( parameters ) {

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

	this.shading = THREE.SmoothShading;
	this.blending = THREE.NormalBlending;
	this.depthTest = true;

	this.wireframe = false;
	this.wireframeLinewidth = 1.0;
	this.wireframeLinecap = 'round'; // implemented just in CanvasRenderer
	this.wireframeLinejoin = 'round'; // implemented just in CanvasRenderer

	this.vertexColors = false;
	this.skinning = false;
	this.vertexAnimated = false;

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.opacity !== undefined ) this.opacity = parameters.opacity;
		if ( parameters.map !== undefined ) this.map = parameters.map;

		if ( parameters.lightMap !== undefined ) this.lightMap = parameters.lightMap;

		if ( parameters.envMap !== undefined ) this.envMap = parameters.envMap;
		if ( parameters.combine !== undefined ) this.combine = parameters.combine;
		if ( parameters.reflectivity !== undefined ) this.reflectivity  = parameters.reflectivity;
		if ( parameters.refractionRatio !== undefined ) this.refractionRatio  = parameters.refractionRatio;

		if ( parameters.fog !== undefined ) this.fog  = parameters.fog;

		if ( parameters.shading !== undefined ) this.shading = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.depthTest !== undefined ) this.depthTest = parameters.depthTest;

		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframeLinewidth !== undefined ) this.wireframeLinewidth = parameters.wireframeLinewidth;
		if ( parameters.wireframeLinecap !== undefined ) this.wireframeLinecap = parameters.wireframeLinecap;
		if ( parameters.wireframeLinejoin !== undefined ) this.wireframeLinejoin = parameters.wireframeLinejoin;

		if ( parameters.vertexColors !== undefined ) this.vertexColors = parameters.vertexColors;
		if ( parameters.skinning !== undefined ) this.skinning = parameters.skinning;
		if ( parameters.vertexAnimated !== undefined ) this.vertexAnimated = parameters.vertexAnimated;

	}

};
