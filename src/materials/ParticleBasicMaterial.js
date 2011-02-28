/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 
 *  size: <float>,
 
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 
 *  vertexColors: <bool>
 * }
 */

THREE.ParticleBasicMaterial = function ( parameters ) {

	this.id = THREE.MaterialCounter.value ++;

	this.color = new THREE.Color( 0xffffff );
	this.opacity = 1.0;
	this.map = null;

	this.size = 1.0;

	this.blending = THREE.NormalBlending;
	this.depthTest = true;

	this.offset = new THREE.Vector2(); // TODO: expose to parameters (implemented just in CanvasRenderer)

	this.vertexColors = false;

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.map !== undefined ) this.map = parameters.map;

		if ( parameters.size !== undefined ) this.size = parameters.size;

		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.depthTest !== undefined ) this.depthTest = parameters.depthTest;

		if ( parameters.vertexColors !== undefined ) this.vertexColors = parameters.vertexColors;

	}

};
