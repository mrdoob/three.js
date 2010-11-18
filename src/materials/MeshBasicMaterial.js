/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  map: new THREE.Texture( <Image> ),
 *  env_map: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  reflectivity: <float>,
 *  opacity: <float>,
 *  blending: THREE.NormalBlending,
 *  wireframe: <boolean>,
 *  wireframe_linewidth: <float>
 * }
 */

THREE.MeshBasicMaterial = function ( parameters ) {

	this.id = THREE.MeshBasicMaterialCounter.value ++;

	this.color = new THREE.Color( 0xeeeeee );
	this.map = null;
	this.env_map = null;
	this.reflectivity = 1;
	this.opacity = 1;
	this.blending = THREE.NormalBlending;
	this.wireframe = false;
	this.wireframe_linewidth = 1;

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.map !== undefined ) this.map = parameters.map;
		if ( parameters.env_map !== undefined ) this.env_map = parameters.env_map;
		if ( parameters.reflectivity !== undefined ) this.reflectivity  = parameters.reflectivity;
		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframe_linewidth !== undefined ) this.wireframe_linewidth = parameters.wireframe_linewidth;

	}

	this.toString = function () {

		return 'THREE.MeshBasicMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +
			'color: ' + this.color + '<br/>' +
			'map: ' + this.map + '<br/>' +
			'env_map: ' + this.env_map + '<br/>' +
			'reflectivity: ' + this.reflectivity + '<br/>' +
			'opacity: ' + this.opacity + '<br/>' +
			'blending: ' + this.blending + '<br/>' +
			'wireframe: ' + this.wireframe + '<br/>' +
			'wireframe_linewidth: ' + this.wireframe_linewidth +'<br/>' +
			')';

	};

}

THREE.MeshBasicMaterialCounter = { value: 0 };
