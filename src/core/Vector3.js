var Vector3 = Class.extend
({
	x: null, y: null, z: null,
	// sx: null, sy: null, sz: null,
	// userData: null,
	
	dx: null, dy: null, dz: null,
	tx: null, ty: null, tz: null,
	// oll: null,
	
	init: function(x, y, z)
	{
		this.x = x ? x : 0;
		this.y = y ? y : 0;
		this.z = z ? z : 0;
	},

	copy: function(v)
	{
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
	},
	
	addSelf: function(v)
	{
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
	},

	add: function(v1, v2)
	{
		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;
		this.z = v1.z + v2.z;
	},
	
	subSelf: function(v)
	{
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
	},

	sub: function(v1, v2)
	{
		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;
		this.z = v1.z - v2.z;
	},
	
	cross: function(v)
	{
		this.tx = this.x;
		this.ty = this.y;
		this.tz = this.z;
		
		this.x = this.ty * v.z - this.tz * v.y;
		this.y = this.tz * v.x - this.tx * v.z;
		this.z = this.tx * v.y - this.ty * v.x;
	},
	
	multiply: function(s)
	{
		this.x *= s;
		this.y *= s;
		this.z *= s;
	},
	
	distanceTo: function(v)
	{
		this.dx = this.x - v.x;
		this.dy = this.y - v.y;
		this.dz = this.z - v.z;
		
		return Math.sqrt(this.dx * this.dx + this.dy * this.dy + this.dz * this.dz);
	},
	
	distanceToSquared: function(v)
	{
		this.dx = this.x - v.x;
		this.dy = this.y - v.y;
		this.dz = this.z - v.z;
		
		return this.dx * this.dx + this.dy * this.dy + this.dz * this.dz;
	},
	
	length: function()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	},
	
	lengthSq: function()
	{
		return this.x * this.x + this.y * this.y + this.z * this.z;
	},
	
	negate: function()
	{
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
	},
	
	normalize: function()
	{
		if (this.length() > 0)
			this.ool = 1.0 / this.length();
		else
			this.ool = 0;
			
		this.x *= this.ool;
		this.y *= this.ool;
		this.z *= this.ool;
		return this;
	},
	
	dot: function(v)
	{
		return this.x * v.x + this.y * v.y + this.z * v.z;
	},
	
	clone: function()
	{
		return new Vector3(this.x, this.y, this.z);
	},	
	
	toVector4: function()
	{
		return new Vector4(this.x,this.y,this.z, 1.0);
	},
	
	toString: function()
	{
		return 'Vector3 (' + this.x + ', ' + this.y + ', ' + this.z + ')';
	}
	
});

Vector3.add = function(a, b)
{
	return new Vector3( a.x + b.x, a.y + b.y, a.z + b.z );
}

Vector3.sub = function(a, b)
{
	return new Vector3( a.x - b.x, a.y - b.y, a.z - b.z );
}		

Vector3.multiply = function(a, s)
{
	return new Vector3( a.x * s, a.y * s, a.z * s );
}

Vector3.cross = function(a, b)
{
	return new Vector3( a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x );
}

Vector3.dot = function(a, b)
{
	return a.x * b.x + a.y * b.y + a.z * b.z;
}
