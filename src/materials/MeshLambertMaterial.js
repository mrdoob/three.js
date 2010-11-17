/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  map: new THREE.UVMap( <Image> ),
 *  opacity: <float>,
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  wireframe: <boolean>,
 *  wireframe_linewidth: <float>
 * }
 */

THREE.MeshLambertMaterial = function ( parameters ) {

	this.id = THREE.MeshLambertMaterialCounter.value ++;

	this.color = new THREE.Color( 0xeeeeee );
	this.map = null;
	this.opacity = 1;
	this.shading = THREE.SmoothShading;
	this.blending = THREE.NormalBlending;
	this.wireframe = false;
	this.wireframe_linewidth = 1;

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.map !== undefined ) this.map = parameters.map;
		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.shading !== undefined ) this.shading = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframe_linewidth !== undefined ) this.wireframe_linewidth = parameters.wireframe_linewidth;

	}

	this.toString = function () {

		return 'THREE.MeshLambertMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +
			'color: ' + this.color + '<br/>' +
			'map: ' + this.map + '<br/>' +
			'opacity: ' + this.opacity + '<br/>' +
			'shading: ' + this.shading + '<br/>' +
			'blending: ' + this.blending + '<br/>' +
			'wireframe: ' + this.wireframe + '<br/>' +
			'wireframe_size: ' + this.wireframe_linewidth + '<br/>' +
			' )';

	};

};

THREE.MeshLambertMaterialCounter = { value: 0 };
