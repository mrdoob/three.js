/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  blending: THREE.NormalBlending,
 *  linewidth: <float>
 * }
 */

THREE.LineBasicMaterial = function ( parameters ) {

	this.color = new THREE.Color( 0xff0000 );
	this.opacity = 1;
	this.blending = THREE.NormalBlending;
	this.linewidth = 1;
	this.linecap = 'round';
	this.linejoin = 'round';

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.linewidth !== undefined ) this.linewidth = parameters.linewidth;
		if ( parameters.linecap !== undefined ) this.linecap = parameters.linecap;
		if ( parameters.linejoin !== undefined ) this.linejoin = parameters.linejoin;
	}

	this.toString = function () {

		return 'THREE.LineBasicMaterial (<br/>' +
			'color: ' + this.color + '<br/>' +
			'opacity: ' + this.opacity + '<br/>' +
			'blending: ' + this.blending + '<br/>' +
			'linewidth: ' + this.linewidth +'<br/>' +
			'linecap: ' + this.linecap +'<br/>' +
			'linejoin: ' + this.linejoin +'<br/>' +
			')';

	};

};
