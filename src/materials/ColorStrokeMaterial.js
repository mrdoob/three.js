THREE.ColorStrokeMaterial = function (hex, opacity, lineWidth) {

	this.lineWidth = lineWidth || 1;
	this.color = new THREE.Color( (opacity ? (opacity * 0xff) << 24 : 0xff000000) | hex );
	
	this.toString = function () {
	
		return 'THREE.ColorStrokeMaterial ( lineWidth: ' + this.lineWidth + ', color: ' + this.color + ' )';
	}	
}
