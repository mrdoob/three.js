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
 *  depth_test: <bool>,
 
 *  vertex_colors: <bool>
 * }
 */

THREE.ParticleBasicMaterial = function ( parameters ) {

	this.id = THREE.MaterialCounter.value ++;
	
	this.color = new THREE.Color( 0xffffff );
	this.opacity = 1.0;
	this.map = null;
	
	this.size = 1.0;
	
	this.blending = THREE.NormalBlending;
	this.depth_test = true;

	this.offset = new THREE.Vector2(); // TODO: expose to parameters (implemented just in CanvasRenderer)

	this.vertex_colors = false;

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.map !== undefined ) this.map = parameters.map;
		
		if ( parameters.size !== undefined ) this.size = parameters.size;
		
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.depth_test !== undefined ) this.depth_test = parameters.depth_test;
		
		if ( parameters.vertex_colors !== undefined ) this.vertex_colors = parameters.vertex_colors;

	}

};

THREE.ParticleBasicMaterial.prototype = {

	toString: function () {

		return 'THREE.ParticleBasicMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +
		
			'color: ' + this.color + '<br/>' +
			'opacity: ' + this.opacity + '<br/>' +
			'map: ' + this.map + '<br/>' +
		
			'size: ' + this.size + '<br/>' +
		
			'blending: ' + this.blending + '<br/>' +
			'depth_test: ' + this.depth_test + '<br/>' +
		
			'vertex_colors: ' + this.vertex_colors + '<br/>' +
			')';

	}

};

