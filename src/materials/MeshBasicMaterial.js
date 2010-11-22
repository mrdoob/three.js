/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  map: new THREE.Texture( <Image> ),
 
 *  env_map: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refraction_ratio: <float>,
 
 *  opacity: <float>,
 *  shading: THREE.SmoothShading,
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
	this.combine = THREE.Multiply;
	this.reflectivity = 1;
	this.refraction_ratio = 0.98;

	this.opacity = 1;
	this.shading = THREE.SmoothShading;
	this.blending = THREE.NormalBlending;

	this.wireframe = false;
	this.wireframe_linewidth = 1;
	this.wireframe_linecap = 'round';
	this.wireframe_linejoin = 'round';

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.map !== undefined ) this.map = parameters.map;

		if ( parameters.env_map !== undefined ) this.env_map = parameters.env_map;
		if ( parameters.combine !== undefined ) this.combine = parameters.combine;
		if ( parameters.reflectivity !== undefined ) this.reflectivity  = parameters.reflectivity;
		if ( parameters.refraction_ratio !== undefined ) this.refraction_ratio  = parameters.refraction_ratio;

		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.shading !== undefined ) this.shading = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframe_linewidth !== undefined ) this.wireframe_linewidth = parameters.wireframe_linewidth;
		if ( parameters.wireframe_linecap !== undefined ) this.wireframe_linecap = parameters.wireframe_linecap;
		if ( parameters.wireframe_linejoin !== undefined ) this.wireframe_linejoin = parameters.wireframe_linejoin;

	}

	this.toString = function () {

		return 'THREE.MeshBasicMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +
			'color: ' + this.color + '<br/>' +
			'map: ' + this.map + '<br/>' +

			'env_map: ' + this.env_map + '<br/>' +
			'combine: ' + this.combine + '<br/>' +
			'reflectivity: ' + this.reflectivity + '<br/>' +
			'refraction_ratio: ' + this.refraction_ratio + '<br/>' +

			'opacity: ' + this.opacity + '<br/>' +
			'blending: ' + this.blending + '<br/>' +

			'wireframe: ' + this.wireframe + '<br/>' +
			'wireframe_linewidth: ' + this.wireframe_linewidth +'<br/>' +
			'wireframe_linecap: ' + this.wireframe_linecap +'<br/>' +
			'wireframe_linejoin: ' + this.wireframe_linejoin +'<br/>' +
			')';

	};

}

THREE.MeshBasicMaterialCounter = { value: 0 };
