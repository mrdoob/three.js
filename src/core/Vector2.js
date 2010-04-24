var Vector2 = Class.extend
({
	x: null, y: null,
	
	init: function(x, y)
	{
		this.x = x ? x : 0;
		this.y = y ? y : 0;
	},

	copy: function(v)
	{
		this.x = v.x;
		this.y = v.y;
	},
	
	addSelf: function(v)
	{
		this.x += v.x;
		this.y += v.y;
	},

	add: function(v1, v2)
	{
		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;
	},
	
	subSelf: function(v)
	{
		this.x -= v.x;
		this.y -= v.y;
	},

	sub: function(v1, v2)
	{
		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;
	},
	
	multiply: function(s)
	{
		this.x *= s;
		this.y *= s;
	},
	
	unit: function()
	{
		this.multiply(1 / this.length());
	},
	
	expand: function(v1, v2)
	{
		this.unit( this.sub(v2, v1) );
		v2.addSelf(this);
		// v1.subSelf(this);
	},

	length: function()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},
	
	lengthSq: function()
	{
		return this.x * this.x + this.y * this.y;
	},
	
	negate: function()
	{
		this.x = -this.x;
		this.y = -this.y;
	},
	
	clone: function()
	{
		return new Vector2(this.x, this.y);
	},	
	
	toString: function()
	{
		return 'Vector2 (' + this.x + ', ' + this.y + ')';
	}
	
});

Vector2.add = function(a, b)
{
	return new Vector2( a.x + b.x, a.y + b.y );
}

Vector2.sub = function(a, b)
{
	return new Vector2( a.x - b.x, a.y - b.y );
}		

Vector2.multiply = function(a, s)
{
	return new Vector2( a.x * s, a.y * s );
}
