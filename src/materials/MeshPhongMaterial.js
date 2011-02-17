/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  ambient: <hex>,
 *  specular: <hex>,
 *  shininess: <float>,
 *  opacity: <float>,

 *  map: new THREE.Texture( <Image> ),

 *  light_map: new THREE.Texture( <Image> ),

 *  env_map: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refraction_ratio: <float>,

 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depth_test: <bool>,
 
 *  wireframe: <boolean>,
 *  wireframe_linewidth: <float>,
 
 *  vertex_colors: <bool>,
 *  skinning: <bool>
 * }
 */

THREE.MeshPhongMaterial = function ( parameters ) {

	this.id = THREE.MaterialCounter.value ++;

	this.color = new THREE.Color( 0xffffff );
	this.ambient = new THREE.Color( 0x050505 );
	this.specular = new THREE.Color( 0x111111 );
	this.shininess = 30.0;
	this.opacity = 1.0;

	this.map = null;

	this.light_map = null;
	
	this.env_map = null;
	this.combine = THREE.MultiplyOperation;
	this.reflectivity = 1.0;
	this.refraction_ratio = 0.98;

	this.fog = true; // implemented just in WebGLRenderer2

	this.shading = THREE.SmoothShading;
	this.blending = THREE.NormalBlending;
	this.depth_test = true;
	
	this.wireframe = false;
	this.wireframe_linewidth = 1.0;
	this.wireframe_linecap = 'round';	// implemented just in CanvasRenderer
	this.wireframe_linejoin = 'round';	// implemented just in CanvasRenderer
	
	this.vertex_colors = false;
	this.skinning = false;

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color = new THREE.Color( parameters.color );
		if ( parameters.ambient !== undefined ) this.ambient = new THREE.Color( parameters.ambient );
		if ( parameters.specular !== undefined ) this.specular = new THREE.Color( parameters.specular );
		if ( parameters.shininess !== undefined ) this.shininess = parameters.shininess;
		if ( parameters.opacity !== undefined ) this.opacity = parameters.opacity;

		if ( parameters.light_map !== undefined ) this.light_map = parameters.light_map;
		
		if ( parameters.map !== undefined ) this.map = parameters.map;

		if ( parameters.env_map !== undefined ) this.env_map = parameters.env_map;
		if ( parameters.combine !== undefined ) this.combine = parameters.combine;
		if ( parameters.reflectivity !== undefined ) this.reflectivity  = parameters.reflectivity;
		if ( parameters.refraction_ratio !== undefined ) this.refraction_ratio  = parameters.refraction_ratio;

		if ( parameters.fog !== undefined ) this.fog  = parameters.fog;

		if ( parameters.shading !== undefined ) this.shading = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.depth_test !== undefined ) this.depth_test = parameters.depth_test;

		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframe_linewidth !== undefined ) this.wireframe_linewidth = parameters.wireframe_linewidth;
		if ( parameters.wireframe_linecap !== undefined ) this.wireframe_linecap = parameters.wireframe_linecap;
		if ( parameters.wireframe_linejoin !== undefined ) this.wireframe_linejoin = parameters.wireframe_linejoin;
		
		if ( parameters.vertex_colors !== undefined ) this.vertex_colors = parameters.vertex_colors;
		if ( parameters.skinning !== undefined ) this.skinning = parameters.skinning;

	}

};

THREE.MeshPhongMaterial.prototype = {

	toString: function () {

		return 'THREE.MeshPhongMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +
		
			'color: ' + this.color + '<br/>' +
			'ambient: ' + this.ambient + '<br/>' +
			'specular: ' + this.specular + '<br/>' +
			'shininess: ' + this.shininess + '<br/>' +
			'opacity: ' + this.opacity + '<br/>' +

			'map: ' + this.map + '<br/>' +

			'env_map: ' + this.env_map + '<br/>' +
			'combine: ' + this.combine + '<br/>' +
			'reflectivity: ' + this.reflectivity + '<br/>' +
			'refraction_ratio: ' + this.refraction_ratio + '<br/>' +

			'shading: ' + this.shading + '<br/>' +
			'blending: ' + this.blending + '<br/>' +
			'depth_test: ' + this.depth_test + '<br/>' +

			'wireframe: ' + this.wireframe + '<br/>' +
			'wireframe_linewidth: ' + this.wireframe_linewidth + '<br/>' +
			'wireframe_linecap: ' + this.wireframe_linecap +'<br/>' +
			'wireframe_linejoin: ' + this.wireframe_linejoin +'<br/>' +
			
			'vertex_colors: ' + this.vertex_colors + '<br/>' +
			'skinning: ' + this.skinning + '<br/>' +
			')';

	}

};

