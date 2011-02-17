/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 
 *  blending: THREE.NormalBlending,
 *  depth_test: <bool>,
 
 *  linewidth: <float>,
 *  linecap: "round",  
 *  linejoin: "round",
 
 *  vertex_colors: <bool>
 * }
 */

THREE.LineBasicMaterial = function ( parameters ) {

	this.id = THREE.MaterialCounter.value ++;
	
	this.color = new THREE.Color( 0xffffff );
	this.opacity = 1.0;
	
	this.blending = THREE.NormalBlending;
	this.depth_test = true;
	
	this.linewidth = 1.0;
	this.linecap = 'round';	 	// implemented just in CanvasRenderer
	this.linejoin = 'round';	// implemented just in CanvasRenderer	

	this.vertex_colors = false;
	
	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.depth_test !== undefined ) this.depth_test = parameters.depth_test;
		
		if ( parameters.linewidth !== undefined ) this.linewidth = parameters.linewidth;
		if ( parameters.linecap !== undefined ) this.linecap = parameters.linecap;
		if ( parameters.linejoin !== undefined ) this.linejoin = parameters.linejoin;
		
		if ( parameters.vertex_colors !== undefined ) this.vertex_colors = parameters.vertex_colors;
		
	}

};

THREE.LineBasicMaterial.prototype = {

	toString: function () {

		return 'THREE.LineBasicMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +
		
			'color: ' + this.color + '<br/>' +
			'opacity: ' + this.opacity + '<br/>' +
		
			'blending: ' + this.blending + '<br/>' +
			'depth_test: ' + this.depth_test + '<br/>' +
		
			'linewidth: ' + this.linewidth +'<br/>' +
			'linecap: ' + this.linecap +'<br/>' +
			'linejoin: ' + this.linejoin +'<br/>' +
		
			'vertex_colors: ' + this.vertex_colors + '<br/>' +
			')';

	}

};

