var Vector4 = Class.extend
({
	x: null, y: null, z: null, w: null,
	// sx: null, sy: null, sz: null,
	// userData: null,

	dx: null, dy: null, dz: null,
	tx: null, ty: null, tz: null,
	// oll: null,

	init: function(x, y, z, w)
	{
		this.x = x ? x : 0;
		this.y = y ? y : 0;
		this.z = z ? z : 0;
		this.w = w ? w : 1;
	},

	copy: function(v)
	{
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = v.w;
	},

	addSelf: function(v)
	{
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		this.w += v.w;
	},

	add: function(v1, v2)
	{
		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;
		this.z = v1.z + v2.z;
		this.w = v1.w + v2.w;
	},

	subSelf: function(v)
	{
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		this.w -= v.w;
	},

	sub: function(v1, v2)
	{
		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;
		this.z = v1.z - v2.z;
		this.w = v1.w - v2.w;
	},


	clone: function()
	{
		return new Vector4(this.x, this.y, this.z, this.w);
	},	

	toString: function()
	{
		return 'Vector4 (' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ')';
	},
	
	toVector3: function()
	{
		return new Vector3(this.x/this.w,this.y/this.w,this.z/this.w);
	}

});

Vector4.add = function(a, b)
{
	return new Vector3( a.x + b.x, a.y + b.y, a.z + b.z , a.w + b.w );
}

Vector4.sub = function(a, b)
{
	return new Vector3( a.x - b.x, a.y - b.y, a.z - b.z , a.w - b.w );
}		
