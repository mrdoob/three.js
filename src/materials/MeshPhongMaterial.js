/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  ambient: <hex>,
 *  specular: <hex>,
 *  shininess: <float>,

 *  map: new THREE.Texture( <Image> ),
 *  specular_map: new THREE.Texture( <Image> ),

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

THREE.MeshPhongMaterial = function ( parameters ) {

	this.id = THREE.MeshPhongMaterialCounter.value ++;

	this.color = new THREE.Color( 0xeeeeee );
	this.ambient = new THREE.Color( 0x050505 );
	this.specular = new THREE.Color( 0x111111 );
	this.shininess = 30;

	this.map = null;
	this.specular_map = null;

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

		if ( parameters.color !== undefined ) this.color = new THREE.Color( parameters.color );
		if ( parameters.ambient !== undefined ) this.ambient = new THREE.Color( parameters.ambient );
		if ( parameters.specular !== undefined ) this.specular = new THREE.Color( parameters.specular );
		if ( parameters.shininess !== undefined ) this.shininess = parameters.shininess;

		if ( parameters.map !== undefined ) this.map = parameters.map;
		if ( parameters.specular_map !== undefined ) this.specular_map = parameters.specular_map;

		if ( parameters.env_map !== undefined ) this.env_map = parameters.env_map;
		if ( parameters.combine !== undefined ) this.combine = parameters.combine;
		if ( parameters.reflectivity !== undefined ) this.reflectivity  = parameters.reflectivity;
		if ( parameters.refraction_ratio !== undefined ) this.refraction_ratio  = parameters.refraction_ratio;

		if ( parameters.opacity !== undefined ) this.opacity = parameters.opacity;
		if ( parameters.shading !== undefined ) this.shading = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframe_linewidth !== undefined ) this.wireframe_linewidth = parameters.wireframe_linewidth;
		if ( parameters.wireframe_linecap !== undefined ) this.wireframe_linecap = parameters.wireframe_linecap;
		if ( parameters.wireframe_linejoin !== undefined ) this.wireframe_linejoin = parameters.wireframe_linejoin;

	}

	this.toString = function () {

		return 'THREE.MeshPhongMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +
			'color: ' + this.color + '<br/>' +
			'ambient: ' + this.ambient + '<br/>' +
			'specular: ' + this.specular + '<br/>' +
			'shininess: ' + this.shininess + '<br/>' +

			'map: ' + this.map + '<br/>' +
			'specular_map: ' + this.specular_map + '<br/>' +

			'env_map: ' + this.env_map + '<br/>' +
			'combine: ' + this.combine + '<br/>' +
			'reflectivity: ' + this.reflectivity + '<br/>' +
			'refraction_ratio: ' + this.refraction_ratio + '<br/>' +

			'opacity: ' + this.opacity + '<br/>' +
			'shading: ' + this.shading + '<br/>' +

			'wireframe: ' + this.wireframe + '<br/>' +
			'wireframe_linewidth: ' + this.wireframe_linewidth + '<br/>' +
			'wireframe_linecap: ' + this.wireframe_linecap +'<br/>' +
			'wireframe_linejoin: ' + this.wireframe_linejoin +'<br/>' +
			+ ')';

	};

};

THREE.MeshPhongMaterialCounter = { value: 0 };
