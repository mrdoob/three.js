THREE.Color = function (hex) {

	var _r, _g, _b, _a, _hex;
	
	this.styleString;
	
	this.setHex = function (hex) {
	
		_hex = hex;
		this.updateRGBA();
		this.updateStyleString();
	}
	
	this.setRGBA = function (r, g, b, a) {
	
		_r = r;
		_g = g;
		_b = b;
		_a = a;
		
		this.updateHex();
		this.updateStyleString();
	}
	
	this.updateHex = function () {
	
		_hex = _a << 24 | _r << 16 | _g << 8 | _b;
	}
	
	this.updateRGBA = function () {
	
		_r = _hex >> 16 & 0xff;
		_g = _hex >> 8 & 0xff;
		_b = _hex & 0xff;
		_a = _hex >> 24 & 0xff;		
	}
	
	this.updateStyleString = function () {
	
		this.styleString = 'rgba(' + _r + ',' + _g + ',' + _b + ',' + (_a / 255) + ')';	
	}
	
	this.toString = function () {
	
		return 'THREE.Color ( r: ' + _r + ', g: ' + _g + ', b: ' + _b + ', a: ' + _a + ', hex: ' + _hex + ', style: ' + this.styleString + ' )';	
	}
	
	this.setHex(hex);
}
