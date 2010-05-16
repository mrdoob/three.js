THREE.Vector3 = function (x, y, z) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;

	this.copy = function (v) {
	
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
	}

	this.add = function(v1, v2) {
	
		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;
		this.z = v1.z + v2.z;	
	}

	this.addSelf = function (v) {
	
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
	}

	this.sub = function(v1, v2) {
	
		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;
		this.z = v1.z - v2.z;	
	}
	
	this.subSelf = function (v) {
	
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
	}
	
	this.cross = function (v) {
	
		var tx = this.x, ty = this.y, tz = this.z;
		
		this.x = ty * v.z - tz * v.y;
		this.y = tz * v.x - tx * v.z;
		this.z = tx * v.y - ty * v.x;
	}
	
	this.multiply = function (s) {
	
		this.x *= s;
		this.y *= s;
		this.z *= s;
	}
	
	this.distanceTo = function (v) {
	
		var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}
	
	this.distanceToSquared = function (v) {
	
		var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return dx * dx + dy * dy + dz * dz;
	}
	
	this.length = function () {
	
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}
	
	this.lengthSq = function () {
	
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}
	
	this.negate = function () {
	
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
	}
	
	this.normalize = function () {
	
		if (this.length() > 0) {
		
			this.multiply(1 / this.length());
			
		} else {
		
			this.multiply(0);
		}
	}
	
	this.dot = function (v) {
	
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}
	
	this.clone = function () {
	
		return new Vector3(this.x, this.y, this.z);
	}
	
	this.toString = function () {
	
		return 'THREE.Vector3 (' + this.x + ', ' + this.y + ', ' + this.z + ')';
	}
}
