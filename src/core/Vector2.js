/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Vector2 = function (x, y) {
	
	this.x = x || 0;
	this.y = y || 0;
	
	this.copy = function (v) {
	
		this.x = v.x;
		this.y = v.y;
	}
	
	this.addSelf = function (v) {
	
		this.x += v.x;
		this.y += v.y;
	}

	this.add = function (v1, v2) {
	
		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;
	}
	
	this.subSelf = function (v) {
	
		this.x -= v.x;
		this.y -= v.y;
	}

	this.sub = function (v1, v2) {
	
		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;
	}
	
	this.multiply = function (s) {
	
		this.x *= s;
		this.y *= s;
	}
	
	this.unit = function () {
	
		this.multiply(1 / this.length());
	}
	
	this.expand = function(v1, v2) {
	
		this.unit( this.sub(v2, v1) );
		v2.addSelf(this);
		// v1.subSelf(this);
	}

	this.length = function () {
	
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	
	this.lengthSq = function () {
	
		return this.x * this.x + this.y * this.y;
	}
	
	this.negate = function() {
	
		this.x = -this.x;
		this.y = -this.y;
	}
	
	this.clone = function () {
	
		return new THREE.Vector2(this.x, this.y);
	}
	
	this.toString = function () {
	
		return 'THREE.Vector2 (' + this.x + ', ' + this.y + ')';
	}
}
