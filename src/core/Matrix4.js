var Matrix4 = Class.extend
({
	n11: null, n12: null, n13: null, n14: null,
	n21: null, n22: null, n23: null, n24: null,
	n31: null, n32: null, n33: null, n34: null,

	x: null, y: null, z: null,

	init: function()
	{
		this.identity();
	},

	identity: function()
	{
		this.n11 = 1; this.n12 = 0; this.n13 = 0; this.n14 = 0;
		this.n21 = 0; this.n22 = 1; this.n23 = 0; this.n24 = 0;
		this.n31 = 0; this.n32 = 0; this.n33 = 1; this.n34 = 0;
		
		this.x = new Vector3(0,0,0);
		this.y = new Vector3(0,0,0);
		this.z = new Vector3(0,0,0);
	},
    
	lookAt: function(eye, center, up)
	{
		this.z.sub(center, eye);
		this.z.normalize();

		this.x.copy(this.z);
		this.x.cross(up);
		this.x.normalize();

		this.y.copy(this.x);
		this.y.cross(this.z);
		this.y.normalize();
		this.y.negate(); //

		this.n11 = this.x.x;
		this.n12 = this.x.y;
		this.n13 = this.x.z;
		this.n14 = -this.x.dot(eye);
		this.n21 = this.y.x;
		this.n22 = this.y.y;
		this.n23 = this.y.z;
		this.n24 = -this.y.dot(eye);
		this.n31 = this.z.x;
		this.n32 = this.z.y;
		this.n33 = this.z.z;
		this.n34 = -this.z.dot(eye);
	},

	transform: function(v)
	{
        	var vx = v.x, vy = v.y, vz = v.z;
        
		v.x = this.n11 * vx + this.n12 * vy + this.n13 * vz + this.n14;
		v.y = this.n21 * vx + this.n22 * vy + this.n23 * vz + this.n24;
		v.z = this.n31 * vx + this.n32 * vy + this.n33 * vz + this.n34;
	},
    

	multiply: function(a, b)
	{
		this.n11 = a.n11 * b.n11 + a.n12 * b.n21 + a.n13 * b.n31;
		this.n12 = a.n11 * b.n12 + a.n12 * b.n22 + a.n13 * b.n32;
		this.n13 = a.n11 * b.n13 + a.n12 * b.n23 + a.n13 * b.n33;
		this.n14 = a.n11 * b.n14 + a.n12 * b.n24 + a.n13 * b.n34 + a.n14;

		this.n21 = a.n21 * b.n11 + a.n22 * b.n21 + a.n23 * b.n31;
		this.n22 = a.n21 * b.n12 + a.n22 * b.n22 + a.n23 * b.n32;
		this.n23 = a.n21 * b.n13 + a.n22 * b.n23 + a.n23 * b.n33;
		this.n24 = a.n21 * b.n14 + a.n22 * b.n24 + a.n23 * b.n34 + a.n24;

		this.n31 = a.n31 * b.n11 + a.n32 * b.n21 + a.n33 * b.n31;
		this.n32 = a.n31 * b.n12 + a.n32 * b.n22 + a.n33 * b.n32;
		this.n33 = a.n31 * b.n13 + a.n32 * b.n23 + a.n33 * b.n33;
		this.n34 = a.n31 * b.n14 + a.n32 * b.n24 + a.n33 * b.n34 + a.n34;
	},

	multiplySelf: function(m)
	{
		var n11 = this.n11, n12 = this.n12, n13 = this.n13, n14 = this.n14;
		var n21 = this.n21, n22 = this.n22, n23 = this.n23, n24 = this.n24;
		var n31 = this.n31, n32 = this.n32, n33 = this.n33, n34 = this.n34;

		this.n11 = n11 * m.n11 + n12 * m.n21 + n13 * m.n31;
		this.n12 = n11 * m.n12 + n12 * m.n22 + n13 * m.n32;
		this.n13 = n11 * m.n13 + n12 * m.n23 + n13 * m.n33;
		this.n14 = n11 * m.n14 + n12 * m.n24 + n13 * m.n34 + n14;

		this.n21 = n21 * m.n11 + n22 * m.n21 + n23 * m.n31;
		this.n22 = n21 * m.n12 + n22 * m.n22 + n23 * m.n32;
		this.n23 = n21 * m.n13 + n22 * m.n23 + n23 * m.n33;
		this.n24 = n21 * m.n14 + n22 * m.n24 + n23 * m.n34 + n24;

		this.n31 = n31 * m.n11 + n32 * m.n21 + n33 * m.n31;
		this.n32 = n31 * m.n12 + n32 * m.n22 + n33 * m.n32;
		this.n33 = n31 * m.n13 + n32 * m.n23 + n33 * m.n33;
		this.n34 = n31 * m.n14 + n32 * m.n24 + n33 * m.n34 + n34;
	},

	clone: function()
	{
		var m = new Matrix4();
		m.n11 = this.n11; m.n12 = this.n12; m.n13 = this.n13; m.n14 = this.n14;
		m.n21 = this.n21; m.n22 = this.n22; m.n23 = this.n23; m.n24 = this.n24;
		m.n31 = this.n31; m.n32 = this.n32; m.n33 = this.n33; m.n34 = this.n34;
		return m;
	},
    
	toString: function()
	{
        	return "| " + this.n11 + " " + this.n12 + " " + this.n13 + " " + this.n14 + " |\n" +
                        "| " + this.n21 + " " + this.n22 + " " + this.n23 + " " + this.n24 + " |\n" +
                        "| " + this.n31 + " " + this.n32 + " " + this.n33 + " " + this.n34 + " |";
	}
});

Matrix4.translationMatrix = function(x, y, z)
{
	var m = new Matrix4();

	m.n14 = x;
	m.n24 = y;
	m.n34 = z;

	return m;
}

Matrix4.scaleMatrix = function(x, y, z)
{
	var m = new Matrix4();

	m.n11 = x;
	m.n22 = y;
	m.n33 = z;

	return m;
}

Matrix4.rotationXMatrix = function(theta)
{
	var rot = new Matrix4();

	rot.n22 = rot.n33 = Math.cos(theta);
	rot.n32 = Math.sin(theta);
	rot.n23 = -rot.n32;

	return rot;
}

Matrix4.rotationYMatrix = function(theta)
{
	var rot = new Matrix4();

	rot.n11 = rot.n33 = Math.cos(theta);
	rot.n13 = Math.sin(theta);
	rot.n31 = -rot.n13;

	return rot;
}

Matrix4.rotationZMatrix = function(theta)
{
	var rot = new Matrix4();

	rot.n11 = rot.n22 = Math.cos(theta);
	rot.n21 = Math.sin(theta);
	rot.n12 = -rot.n21;

	return rot;
}
