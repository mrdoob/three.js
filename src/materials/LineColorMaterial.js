/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.LineColorMaterial = function ( hex, opacity, lineWidth ) {

	this.lineWidth = lineWidth || 1;
	this.color = new THREE.Color( ( opacity !== undefined ? opacity : 1 ) * 0xff << 24 ^ hex );

};

THREE.LineColorMaterial.prototype = {

	toString: function () {

		return 'THREE.LineColorMaterial ( color: ' + this.color + ', lineWidth: ' + this.lineWidth + ' )';

	}

};
