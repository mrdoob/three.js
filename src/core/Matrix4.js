var Matrix4 = Class.extend
({
	n11: null, n12: null, n13: null, n14: null,
	n21: null, n22: null, n23: null, n24: null,
	n31: null, n32: null, n33: null, n34: null,
	n41: null, n42: null, n43: null, n44: null,

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
		this.n41 = 0; this.n42 = 0; this.n43 = 0; this.n44 = 1;

		this.x = new Vector3(0,0,0);
		this.y = new Vector3(0,0,0);
		this.z = new Vector3(0,0,0);
	},
    
	lookAt: function(eye, center, up)
	{
		this.z.sub(center, eye);
		this.z.normalize();
		this.z.negate();

		this.x.copy(this.z);
		this.x.cross(up);
		this.x.normalize();
		this.x.negate();

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
        	var vx = v.x, vy = v.y, vz = v.z, vw = (v.w ? v.w : 1.0);
		v.x = this.n11 * vx + this.n12 * vy + this.n13 * vz + this.n14 * vw;
		v.y = this.n21 * vx + this.n22 * vy + this.n23 * vz + this.n24 * vw;
		v.z = this.n31 * vx + this.n32 * vy + this.n33 * vz + this.n34 * vw;
		
		vw = this.n41 * vx + this.n42 * vy + this.n43 * vz + this.n44 * vw;

		if(v.w)
		{
			v.w = vw;
		}
		else
		{
			v.x = v.x/vw;
			v.y = v.y/vw;
			v.z = v.z/vw;
		}
	},
    
	crossVector: function(a)
	{
		v = new Vector4();
		v.x = this.n11*a.x+n12*a.y+n13*a.z+n14*a.w;
		v.y = this.n21*a.x+n22*a.y+n23*a.z+n24*a.w;
		v.z = this.n31*a.x+n32*a.y+n33*a.z+n34*a.w;
		if (a.w)
		{
			v.w = this.n41*a.x+n42*a.y+n43*a.z+n44*a.w;
		}
		else
		{
			v.w = 1.0;
		}
		return v;
	},
	
	multiply: function(a, b)
	{
		this.n11 = a.n11 * b.n11 + a.n12 * b.n21 + a.n13 * b.n31 + a.n14 * b.n41;
		this.n12 = a.n11 * b.n12 + a.n12 * b.n22 + a.n13 * b.n32 + a.n14 * b.n42;
		this.n13 = a.n11 * b.n13 + a.n12 * b.n23 + a.n13 * b.n33 + a.n14 * b.n43;
		this.n14 = a.n11 * b.n14 + a.n12 * b.n24 + a.n13 * b.n34 + a.n14 * b.n44;

		this.n21 = a.n21 * b.n11 + a.n22 * b.n21 + a.n23 * b.n31 + a.n24 * b.n41;
		this.n22 = a.n21 * b.n12 + a.n22 * b.n22 + a.n23 * b.n32 + a.n24 * b.n42;
		this.n23 = a.n21 * b.n13 + a.n22 * b.n23 + a.n23 * b.n33 + a.n24 * b.n34;
		this.n24 = a.n21 * b.n14 + a.n22 * b.n24 + a.n23 * b.n34 + a.n24 * b.n44;

		this.n31 = a.n31 * b.n11 + a.n32 * b.n21 + a.n33 * b.n31 + a.n34 * b.n41;
		this.n32 = a.n31 * b.n12 + a.n32 * b.n22 + a.n33 * b.n32 + a.n34 * b.n42;
		this.n33 = a.n31 * b.n13 + a.n32 * b.n23 + a.n33 * b.n33 + a.n34 * b.n43;
		this.n34 = a.n31 * b.n14 + a.n32 * b.n24 + a.n33 * b.n34 + a.n34 * b.n44;

		this.n41 = a.n41 * b.n11 + a.n42 * b.n21 + a.n43 * b.n31 + a.n44 * b.n41;
		this.n42 = a.n41 * b.n12 + a.n42 * b.n22 + a.n43 * b.n32 + a.n44 * b.n42;
		this.n43 = a.n41 * b.n13 + a.n42 * b.n23 + a.n43 * b.n33 + a.n44 * b.n43;
		this.n44 = a.n41 * b.n14 + a.n42 * b.n24 + a.n43 * b.n34 + a.n44 * b.n44;
	},

	multiplySelf: function(m)
	{
		var n11 = this.n11, n12 = this.n12, n13 = this.n13, n14 = this.n14;
		var n21 = this.n21, n22 = this.n22, n23 = this.n23, n24 = this.n24;
		var n31 = this.n31, n32 = this.n32, n33 = this.n33, n34 = this.n34;
		var n41 = this.n41, n42 = this.n42, n43 = this.n43, n44 = this.n44;

		this.n11 = n11 * m.n11 + n12 * m.n21 + n13 * m.n31 + n14 * m.n41;
		this.n12 = n11 * m.n12 + n12 * m.n22 + n13 * m.n32 + n14 * m.n42;
		this.n13 = n11 * m.n13 + n12 * m.n23 + n13 * m.n33 + n14 * m.n43;
		this.n14 = n11 * m.n14 + n12 * m.n24 + n13 * m.n34 + n14 * m.n44;

		this.n21 = n21 * m.n11 + n22 * m.n21 + n23 * m.n31 + n24 * m.n41;
		this.n22 = n21 * m.n12 + n22 * m.n22 + n23 * m.n32 + n24 * m.n42;
		this.n23 = n21 * m.n13 + n22 * m.n23 + n23 * m.n33 + n24 * m.n43;
		this.n24 = n21 * m.n14 + n22 * m.n24 + n23 * m.n34 + n24 * m.n44;

		this.n31 = n31 * m.n11 + n32 * m.n21 + n33 * m.n31 + n34 * m.n41;
		this.n32 = n31 * m.n12 + n32 * m.n22 + n33 * m.n32 + n34 * m.n42;
		this.n33 = n31 * m.n13 + n32 * m.n23 + n33 * m.n33 + n34 * m.n43;
		this.n34 = n31 * m.n14 + n32 * m.n24 + n33 * m.n34 + n34 * m.n44;

		this.n41 = n41 * m.n11 + n42 * m.n21 + n43 * m.n31 + n44 * m.n41;
		this.n42 = n41 * m.n12 + n42 * m.n22 + n43 * m.n32 + n44 * m.n42;
		this.n43 = n41 * m.n13 + n42 * m.n23 + n43 * m.n33 + n44 * m.n43;
		this.n44 = n41 * m.n14 + n42 * m.n24 + n43 * m.n34 + n44 * m.n44;
	},

	clone: function()
	{
		var m = new Matrix4();
		m.n11 = this.n11; m.n12 = this.n12; m.n13 = this.n13; m.n14 = this.n14;
		m.n21 = this.n21; m.n22 = this.n22; m.n23 = this.n23; m.n24 = this.n24;
		m.n31 = this.n31; m.n32 = this.n32; m.n33 = this.n33; m.n34 = this.n34;
		m.n41 = this.n41; m.n42 = this.n42; m.n43 = this.n43; m.n44 = this.n44;
		return m;
	},
    
	toString: function()
	{
        	return "| " + this.n11 + " " + this.n12 + " " + this.n13 + " " + this.n14 + " |\n" +
                        "| " + this.n21 + " " + this.n22 + " " + this.n23 + " " + this.n24 + " |\n" +
                        "| " + this.n31 + " " + this.n32 + " " + this.n33 + " " + this.n34 + " |\n" +
                        "| " + this.n41 + " " + this.n42 + " " + this.n43 + " " + this.n44 + " |";
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

Matrix4.makeFrustum = function(left,right,bottom,top,near,far)
{
	var m = new Matrix4();
	
	var x = 2*near/(right-left);
	var y = 2*near/(top-bottom);
	var a = (right+left)/(right-left);
	var b = (top+bottom)/(top-bottom);
	var c = -(far+near)/(far-near);
	var d = -2*far*near/(far-near);
	
	m.n11=x;
	m.n13=a;
	m.n22=y;
	m.n23=b;
	m.n33=c;
	m.n34=d;
	m.n43=-1;
	m.n44=0;
	
	return m;
}

Matrix4.makePerspective = function(fovy, aspect, near, far)
{
	var ymax = near * Math.tan(fovy * 0.00872664625972);
	var ymin = -ymax;
	var xmin = ymin * aspect;
	var xmax = ymax * aspect;
	return Matrix4.makeFrustum(xmin, xmax, ymin, ymax, near, far);
}





