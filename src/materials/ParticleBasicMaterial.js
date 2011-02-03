/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  color: <hex>,
 *  map: new THREE.Texture( <Image> ),
 *  opacity: <float>,
 *  blending: THREE.NormalBlending
 * }
 */

THREE.ParticleBasicMaterial = function ( parameters ) {

	this.color = new THREE.Color( 0xffffff );
	this.map = null;
	this.opacity = 1;
	this.size = 1;
	
	this.vertex_colors = false;
	
	this.blending = THREE.NormalBlending;

	this.offset = new THREE.Vector2(); // TODO: expose to parameters

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.map !== undefined ) this.map = parameters.map;
		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.size !== undefined ) this.size = parameters.size;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.vertex_colors !== undefined ) this.vertex_colors = parameters.vertex_colors;

	}

};

THREE.ParticleBasicMaterial.prototype = {

	toString: function () {

		return 'THREE.ParticleBasicMaterial (<br/>' +
			'color: ' + this.color + '<br/>' +
			'map: ' + this.map + '<br/>' +
			'opacity: ' + this.opacity + '<br/>' +
			'size: ' + this.size + '<br/>' +
			'blending: ' + this.blending + '<br/>' +
			'vertex_colors: ' + this.vertex_colors + '<br/>' +
			')';

	}

};
