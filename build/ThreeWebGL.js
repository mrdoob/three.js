// ThreeWebGL.js r32 - http://github.com/mrdoob/three.js
/**
 * @author mr.doob / http://mrdoob.com/
 */

var THREE = THREE || {};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Color = function ( hex ) {

	this.autoUpdate = true;
	this.setHex( hex );

};

THREE.Color.prototype = {

	setRGB: function ( r, g, b ) {

		this.r = r;
		this.g = g;
		this.b = b;

		if ( this.autoUpdate ) {

			this.updateHex();
			this.updateStyleString();

		}

	},

	setHex: function ( hex ) {

		this.hex = ( ~~ hex ) & 0xffffff;

		if ( this.autoUpdate ) {

			this.updateRGBA();
			this.updateStyleString();

		}

	},

	updateHex: function () {

		this.hex = ~~( this.r * 255 ) << 16 ^ ~~( this.g * 255 ) << 8 ^ ~~( this.b * 255 );

	},

	updateRGBA: function () {

		this.r = ( this.hex >> 16 & 255 ) / 255;
		this.g = ( this.hex >> 8 & 255 ) / 255;
		this.b = ( this.hex & 255 ) / 255;

	},

	updateStyleString: function () {

		this.__styleString = 'rgb(' + ~~( this.r * 255 ) + ',' + ~~( this.g * 255 ) + ',' + ~~( this.b * 255 ) + ')';

	},

	clone: function () {

		return new THREE.Color( this.hex );

	},


	toString: function () {

		return 'THREE.Color ( r: ' + this.r + ', g: ' + this.g + ', b: ' + this.b + ', hex: ' + this.hex + ' )';

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author philogb / http://blog.thejit.org/
 */

THREE.Vector2 = function ( x, y ) {

	this.x = x || 0;
	this.y = y || 0;

};

THREE.Vector2.prototype = {

	set: function ( x, y ) {

		this.x = x;
		this.y = y;

		return this;

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;

		return this;

	},

	addSelf: function ( v ) {

		this.x += v.x;
		this.y += v.y;

		return this;

	},

	add: function ( v1, v2 ) {

		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;

		return this;

	},

	subSelf: function ( v ) {

		this.x -= v.x;
		this.y -= v.y;

		return this;

	},

	sub: function ( v1, v2 ) {

		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;

		return this;

	},

	multiplyScalar: function ( s ) {

		this.x *= s;
		this.y *= s;

		return this;

	},

	unit: function () {

		this.multiplyScalar( 1 / this.length() );

		return this;

	},

	length: function () {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	},

	lengthSq: function () {

		return this.x * this.x + this.y * this.y;

	},

	negate: function() {

		this.x = - this.x;
		this.y = - this.y;

		return this;

	},

	clone: function () {

		return new THREE.Vector2( this.x, this.y );

	},

	toString: function () {

		return 'THREE.Vector2 (' + this.x + ', ' + this.y + ')';

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 */

THREE.Vector3 = function ( x, y, z ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;

};

THREE.Vector3.prototype = {

	set: function ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	},

	add: function ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	},

	addSelf: function ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	},

	addScalar: function ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	},

	sub: function( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	},

	subSelf: function ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	},

	cross: function ( a, b ) {

		this.x = a.y * b.z - a.z * b.y;
		this.y = a.z * b.x - a.x * b.z;
		this.z = a.x * b.y - a.y * b.x;

		return this;

	},

	crossSelf: function ( v ) {

		var tx = this.x, ty = this.y, tz = this.z;

		this.x = ty * v.z - tz * v.y;
		this.y = tz * v.x - tx * v.z;
		this.z = tx * v.y - ty * v.x;

		return this;

	},

	multiply: function ( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	},

	multiplySelf: function ( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	},

	multiplyScalar: function ( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;

		return this;

	},

	divideSelf: function ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	},

	divideScalar: function ( s ) {

		this.x /= s;
		this.y /= s;
		this.z /= s;

		return this;

	},

	dot: function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	},

	distanceTo: function ( v ) {

		var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return Math.sqrt( dx * dx + dy * dy + dz * dz );

	},

	distanceToSquared: function ( v ) {

		var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return dx * dx + dy * dy + dz * dz;

	},

	length: function () {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	},

	lengthSq: function () {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	},

	negate: function () {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

		return this;

	},

	normalize: function () {

		var length = Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

		length > 0 ? this.multiplyScalar( 1 / length ) : this.set( 0, 0, 0 );

		return this;

	},

	setLength: function( len ) {

		return this.normalize().multiplyScalar( len );

	},

	isZero: function () {

		var almostZero = 0.0001;
		return ( Math.abs( this.x ) < almostZero ) && ( Math.abs( this.y ) < almostZero ) && ( Math.abs( this.z ) < almostZero );

	},

	clone: function () {

		return new THREE.Vector3( this.x, this.y, this.z );

	},

	toString: function () {

		return 'THREE.Vector3 ( ' + this.x + ', ' + this.y + ', ' + this.z + ' )';

	}

};
/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 */

THREE.Vector4 = function ( x, y, z, w ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = w || 1;

};

THREE.Vector4.prototype = {

	set: function ( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = v.w || 1.0;

		return this;

	},

	add: function ( v1, v2 ) {

		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;
		this.z = v1.z + v2.z;
		this.w = v1.w + v2.w;

		return this;

	},

	addSelf: function ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		this.w += v.w;

		return this;

	},

	sub: function ( v1, v2 ) {

		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;
		this.z = v1.z - v2.z;
		this.w = v1.w - v2.w;

		return this;

	},

	subSelf: function ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		this.w -= v.w;

		return this;

	},

	multiplyScalar: function ( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;
		this.w *= s;

		return this;

	},

	divideScalar: function ( s ) {

		this.x /= s;
		this.y /= s;
		this.z /= s;
		this.w /= s;

		return this;

	},

	lerpSelf: function ( v, alpha ) {

		this.x = this.x + (v.x - this.x) * alpha;
		this.y = this.y + (v.y - this.y) * alpha;
		this.z = this.z + (v.z - this.z) * alpha;
		this.w = this.w + (v.w - this.w) * alpha;
	},

	clone: function () {

		return new THREE.Vector4( this.x, this.y, this.z, this.w );

	},

	toString: function () {

		return 'THREE.Vector4 (' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ')';

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Ray = function ( origin, direction ) {

	this.origin = origin || new THREE.Vector3();
	this.direction = direction || new THREE.Vector3();

}

THREE.Ray.prototype = {

	intersectScene: function ( scene ) {

		var i, l, object,
		objects = scene.objects,
		intersects = [];

		for ( i = 0, l = objects.length; i < l; i++ ) {

			object = objects[i];

			if ( object instanceof THREE.Mesh ) {

				intersects = intersects.concat( this.intersectObject( object ) );

			}

		}

		intersects.sort( function ( a, b ) { return a.distance - b.distance; } );

		return intersects;

	},

	intersectObject: function ( object ) {

		var f, fl, face, a, b, c, d, normal,
		dot, scalar,
		origin, direction,
		geometry = object.geometry,
		vertices = geometry.vertices,
		intersect, intersects = [],
		intersectPoint;

		for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

			face = geometry.faces[ f ];

			origin = this.origin.clone();
			direction = this.direction.clone();

			a = object.matrix.multiplyVector3( vertices[ face.a ].position.clone() );
			b = object.matrix.multiplyVector3( vertices[ face.b ].position.clone() );
			c = object.matrix.multiplyVector3( vertices[ face.c ].position.clone() );
			d = face instanceof THREE.Face4 ? object.matrix.multiplyVector3( vertices[ face.d ].position.clone() ) : null;

			normal = object.rotationMatrix.multiplyVector3( face.normal.clone() );
			dot = direction.dot( normal );

			if ( dot < 0 ) { // Math.abs( dot ) > 0.0001

				scalar = normal.dot( new THREE.Vector3().sub( a, origin ) ) / dot;
				intersectPoint = origin.addSelf( direction.multiplyScalar( scalar ) );

				if ( face instanceof THREE.Face3 ) {

					if ( pointInFace3( intersectPoint, a, b, c ) ) {

						intersect = {

							distance: this.origin.distanceTo( intersectPoint ),
							point: intersectPoint,
							face: face,
							object: object

						};

						intersects.push( intersect );

					}

				} else if ( face instanceof THREE.Face4 ) {

					if ( pointInFace3( intersectPoint, a, b, d ) || pointInFace3( intersectPoint, b, c, d ) ) {

						intersect = {

							distance: this.origin.distanceTo( intersectPoint ),
							point: intersectPoint,
							face: face,
							object: object

						};

						intersects.push( intersect );

					}

				}

			}

		}

		return intersects;

		// http://www.blackpawn.com/texts/pointinpoly/default.html

		function pointInFace3( p, a, b, c ) {

			var v0 = c.clone().subSelf( a ), v1 = b.clone().subSelf( a ), v2 = p.clone().subSelf( a ),
			dot00 = v0.dot( v0 ), dot01 = v0.dot( v1 ), dot02 = v0.dot( v2 ), dot11 = v1.dot( v1 ), dot12 = v1.dot( v2 ),

			invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 ),
			u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom,
			v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

			return ( u > 0 ) && ( v > 0 ) && ( u + v < 1 );

		}

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Rectangle = function () {

	var _left, _top, _right, _bottom,
	_width, _height, _isEmpty = true;

	function resize() {

		_width = _right - _left;
		_height = _bottom - _top;

	}

	this.getX = function () {

		return _left;

	};

	this.getY = function () {

		return _top;

	};

	this.getWidth = function () {

		return _width;

	};

	this.getHeight = function () {

		return _height;

	};

	this.getLeft = function() {

		return _left;

	};

	this.getTop = function() {

		return _top;

	};

	this.getRight = function() {

		return _right;

	};

	this.getBottom = function() {

		return _bottom;

	};

	this.set = function ( left, top, right, bottom ) {

		_isEmpty = false;

		_left = left; _top = top;
		_right = right; _bottom = bottom;

		resize();

	};

	this.addPoint = function ( x, y ) {

		if ( _isEmpty ) {

			_isEmpty = false;
			_left = x; _top = y;
			_right = x; _bottom = y;

			resize();

		} else {

			_left = _left < x ? _left : x; // Math.min( _left, x );
			_top = _top < y ? _top : y; // Math.min( _top, y );
			_right = _right > x ? _right : x; // Math.max( _right, x );
			_bottom = _bottom > y ? _bottom : y; // Math.max( _bottom, y );

			resize();
		}

	};

	this.add3Points = function ( x1, y1, x2, y2, x3, y3 ) {

		if (_isEmpty) {

			_isEmpty = false;
			_left = x1 < x2 ? ( x1 < x3 ? x1 : x3 ) : ( x2 < x3 ? x2 : x3 );
			_top = y1 < y2 ? ( y1 < y3 ? y1 : y3 ) : ( y2 < y3 ? y2 : y3 );
			_right = x1 > x2 ? ( x1 > x3 ? x1 : x3 ) : ( x2 > x3 ? x2 : x3 );
			_bottom = y1 > y2 ? ( y1 > y3 ? y1 : y3 ) : ( y2 > y3 ? y2 : y3 );

			resize();

		} else {

			_left = x1 < x2 ? ( x1 < x3 ? ( x1 < _left ? x1 : _left ) : ( x3 < _left ? x3 : _left ) ) : ( x2 < x3 ? ( x2 < _left ? x2 : _left ) : ( x3 < _left ? x3 : _left ) );
			_top = y1 < y2 ? ( y1 < y3 ? ( y1 < _top ? y1 : _top ) : ( y3 < _top ? y3 : _top ) ) : ( y2 < y3 ? ( y2 < _top ? y2 : _top ) : ( y3 < _top ? y3 : _top ) );
			_right = x1 > x2 ? ( x1 > x3 ? ( x1 > _right ? x1 : _right ) : ( x3 > _right ? x3 : _right ) ) : ( x2 > x3 ? ( x2 > _right ? x2 : _right ) : ( x3 > _right ? x3 : _right ) );
			_bottom = y1 > y2 ? ( y1 > y3 ? ( y1 > _bottom ? y1 : _bottom ) : ( y3 > _bottom ? y3 : _bottom ) ) : ( y2 > y3 ? ( y2 > _bottom ? y2 : _bottom ) : ( y3 > _bottom ? y3 : _bottom ) );

			resize();

		};

	};

	this.addRectangle = function ( r ) {

		if ( _isEmpty ) {

			_isEmpty = false;
			_left = r.getLeft(); _top = r.getTop();
			_right = r.getRight(); _bottom = r.getBottom();

			resize();

		} else {

			_left = _left < r.getLeft() ? _left : r.getLeft(); // Math.min(_left, r.getLeft() );
			_top = _top < r.getTop() ? _top : r.getTop(); // Math.min(_top, r.getTop() );
			_right = _right > r.getRight() ? _right : r.getRight(); // Math.max(_right, r.getRight() );
			_bottom = _bottom > r.getBottom() ? _bottom : r.getBottom(); // Math.max(_bottom, r.getBottom() );

			resize();

		}

	};

	this.inflate = function ( v ) {

		_left -= v; _top -= v;
		_right += v; _bottom += v;

		resize();

	};

	this.minSelf = function ( r ) {

		_left = _left > r.getLeft() ? _left : r.getLeft(); // Math.max( _left, r.getLeft() );
		_top = _top > r.getTop() ? _top : r.getTop(); // Math.max( _top, r.getTop() );
		_right = _right < r.getRight() ? _right : r.getRight(); // Math.min( _right, r.getRight() );
		_bottom = _bottom < r.getBottom() ? _bottom : r.getBottom(); // Math.min( _bottom, r.getBottom() );

		resize();

	};

	/*
	this.contains = function ( x, y ) {

		return x > _left && x < _right && y > _top && y < _bottom;

	};
	*/

	this.instersects = function ( r ) {

		// return this.contains( r.getLeft(), r.getTop() ) || this.contains( r.getRight(), r.getTop() ) || this.contains( r.getLeft(), r.getBottom() ) || this.contains( r.getRight(), r.getBottom() );

		return Math.min( _right, r.getRight() ) - Math.max( _left, r.getLeft() ) >= 0 &&
		        Math.min( _bottom, r.getBottom() ) - Math.max( _top, r.getTop() ) >= 0;

	};

	this.empty = function () {

		_isEmpty = true;

		_left = 0; _top = 0;
		_right = 0; _bottom = 0;

		resize();

	};

	this.isEmpty = function () {

		return _isEmpty;

	};

	this.toString = function () {

		return "THREE.Rectangle ( left: " + _left + ", right: " + _right + ", top: " + _top + ", bottom: " + _bottom + ", width: " + _width + ", height: " + _height + " )";

	};

};
THREE.Matrix3 = function () {

	this.m = [];

};

THREE.Matrix3.prototype = {

	transpose: function () {

		var tmp;

		tmp = this.m[1]; this.m[1] = this.m[3]; this.m[3] = tmp;
		tmp = this.m[2]; this.m[2] = this.m[6]; this.m[6] = tmp;
		tmp = this.m[5]; this.m[5] = this.m[7]; this.m[7] = tmp;

		return this;

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 */

THREE.Matrix4 = function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

	this.n11 = n11 || 1; this.n12 = n12 || 0; this.n13 = n13 || 0; this.n14 = n14 || 0;
	this.n21 = n21 || 0; this.n22 = n22 || 1; this.n23 = n23 || 0; this.n24 = n24 || 0;
	this.n31 = n31 || 0; this.n32 = n32 || 0; this.n33 = n33 || 1; this.n34 = n34 || 0;
	this.n41 = n41 || 0; this.n42 = n42 || 0; this.n43 = n43 || 0; this.n44 = n44 || 1;

};

THREE.Matrix4.prototype = {

	identity: function () {

		this.n11 = 1; this.n12 = 0; this.n13 = 0; this.n14 = 0;
		this.n21 = 0; this.n22 = 1; this.n23 = 0; this.n24 = 0;
		this.n31 = 0; this.n32 = 0; this.n33 = 1; this.n34 = 0;
		this.n41 = 0; this.n42 = 0; this.n43 = 0; this.n44 = 1;

		return this;

	},

	set: function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		this.n11 = n11; this.n12 = n12; this.n13 = n13; this.n14 = n14;
		this.n21 = n21; this.n22 = n22; this.n23 = n23; this.n24 = n24;
		this.n31 = n31; this.n32 = n32; this.n33 = n33; this.n34 = n34;
		this.n41 = n41; this.n42 = n42; this.n43 = n43; this.n44 = n44;

		return this;

	},

	copy: function ( m ) {

		this.n11 = m.n11; this.n12 = m.n12; this.n13 = m.n13; this.n14 = m.n14;
		this.n21 = m.n21; this.n22 = m.n22; this.n23 = m.n23; this.n24 = m.n24;
		this.n31 = m.n31; this.n32 = m.n32; this.n33 = m.n33; this.n34 = m.n34;
		this.n41 = m.n41; this.n42 = m.n42; this.n43 = m.n43; this.n44 = m.n44;

		return this;

	},

	lookAt: function ( eye, center, up ) {

		var x = new THREE.Vector3(), y = new THREE.Vector3(), z = new THREE.Vector3();

		z.sub( eye, center ).normalize();
		x.cross( up, z ).normalize();
		y.cross( z, x ).normalize();

		this.n11 = x.x; this.n12 = x.y; this.n13 = x.z; this.n14 = - x.dot( eye );
		this.n21 = y.x; this.n22 = y.y; this.n23 = y.z; this.n24 = - y.dot( eye );
		this.n31 = z.x; this.n32 = z.y; this.n33 = z.z; this.n34 = - z.dot( eye );
		this.n41 = 0; this.n42 = 0; this.n43 = 0; this.n44 = 1;

		return this;

	},

	multiplyVector3: function ( v ) {

		var vx = v.x, vy = v.y, vz = v.z,
		d = 1 / ( this.n41 * vx + this.n42 * vy + this.n43 * vz + this.n44 );

		v.x = ( this.n11 * vx + this.n12 * vy + this.n13 * vz + this.n14 ) * d;
		v.y = ( this.n21 * vx + this.n22 * vy + this.n23 * vz + this.n24 ) * d;
		v.z = ( this.n31 * vx + this.n32 * vy + this.n33 * vz + this.n34 ) * d;

		return v;

	},

	multiplyVector4: function ( v ) {

		var vx = v.x, vy = v.y, vz = v.z, vw = v.w;

		v.x = this.n11 * vx + this.n12 * vy + this.n13 * vz + this.n14 * vw;
		v.y = this.n21 * vx + this.n22 * vy + this.n23 * vz + this.n24 * vw;
		v.z = this.n31 * vx + this.n32 * vy + this.n33 * vz + this.n34 * vw;
		v.w = this.n41 * vx + this.n42 * vy + this.n43 * vz + this.n44 * vw;

		return v;

	},

	crossVector: function ( a ) {

		var v = new THREE.Vector4();

		v.x = this.n11 * a.x + this.n12 * a.y + this.n13 * a.z + this.n14 * a.w;
		v.y = this.n21 * a.x + this.n22 * a.y + this.n23 * a.z + this.n24 * a.w;
		v.z = this.n31 * a.x + this.n32 * a.y + this.n33 * a.z + this.n34 * a.w;

		v.w = ( a.w ) ? this.n41 * a.x + this.n42 * a.y + this.n43 * a.z + this.n44 * a.w : 1;

		return v;

	},

	multiply: function ( a, b ) {

		var a11 = a.n11, a12 = a.n12, a13 = a.n13, a14 = a.n14,
		a21 = a.n21, a22 = a.n22, a23 = a.n23, a24 = a.n24,
		a31 = a.n31, a32 = a.n32, a33 = a.n33, a34 = a.n34,
		a41 = a.n41, a42 = a.n42, a43 = a.n43, a44 = a.n44,

		b11 = b.n11, b12 = b.n12, b13 = b.n13, b14 = b.n14,
		b21 = b.n21, b22 = b.n22, b23 = b.n23, b24 = b.n24,
		b31 = b.n31, b32 = b.n32, b33 = b.n33, b34 = b.n34,
		b41 = b.n41, b42 = b.n42, b43 = b.n43, b44 = b.n44;

		this.n11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		this.n12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		this.n13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		this.n14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		this.n21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		this.n22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		this.n23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		this.n24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		this.n31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		this.n32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		this.n33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		this.n34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		this.n41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		this.n42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		this.n43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		this.n44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

		return this;

	},

	multiplySelf: function ( m ) {

		var n11 = this.n11, n12 = this.n12, n13 = this.n13, n14 = this.n14,
		n21 = this.n21, n22 = this.n22, n23 = this.n23, n24 = this.n24,
		n31 = this.n31, n32 = this.n32, n33 = this.n33, n34 = this.n34,
		n41 = this.n41, n42 = this.n42, n43 = this.n43, n44 = this.n44,
		mn11 = m.n11, mn21 = m.n21, mn31 = m.n31, mn41 = m.n41,
		mn12 = m.n12, mn22 = m.n22, mn32 = m.n32, mn42 = m.n42,
		mn13 = m.n13, mn23 = m.n23, mn33 = m.n33, mn43 = m.n43,
		mn14 = m.n14, mn24 = m.n24, mn34 = m.n34, mn44 = m.n44;

		this.n11 = n11 * mn11 + n12 * mn21 + n13 * mn31 + n14 * mn41;
		this.n12 = n11 * mn12 + n12 * mn22 + n13 * mn32 + n14 * mn42;
		this.n13 = n11 * mn13 + n12 * mn23 + n13 * mn33 + n14 * mn43;
		this.n14 = n11 * mn14 + n12 * mn24 + n13 * mn34 + n14 * mn44;

		this.n21 = n21 * mn11 + n22 * mn21 + n23 * mn31 + n24 * mn41;
		this.n22 = n21 * mn12 + n22 * mn22 + n23 * mn32 + n24 * mn42;
		this.n23 = n21 * mn13 + n22 * mn23 + n23 * mn33 + n24 * mn43;
		this.n24 = n21 * mn14 + n22 * mn24 + n23 * mn34 + n24 * mn44;

		this.n31 = n31 * mn11 + n32 * mn21 + n33 * mn31 + n34 * mn41;
		this.n32 = n31 * mn12 + n32 * mn22 + n33 * mn32 + n34 * mn42;
		this.n33 = n31 * mn13 + n32 * mn23 + n33 * mn33 + n34 * mn43;
		this.n34 = n31 * mn14 + n32 * mn24 + n33 * mn34 + n34 * mn44;

		this.n41 = n41 * mn11 + n42 * mn21 + n43 * mn31 + n44 * mn41;
		this.n42 = n41 * mn12 + n42 * mn22 + n43 * mn32 + n44 * mn42;
		this.n43 = n41 * mn13 + n42 * mn23 + n43 * mn33 + n44 * mn43;
		this.n44 = n41 * mn14 + n42 * mn24 + n43 * mn34 + n44 * mn44;

		return this;

	},

	multiplyScalar: function ( s ) {

		this.n11 *= s; this.n12 *= s; this.n13 *= s; this.n14 *= s;
		this.n21 *= s; this.n22 *= s; this.n23 *= s; this.n24 *= s;
		this.n31 *= s; this.n32 *= s; this.n33 *= s; this.n34 *= s;
		this.n41 *= s; this.n42 *= s; this.n43 *= s; this.n44 *= s;

		return this;

	},

	determinant: function () {

		//TODO: make this more efficient
		//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )
		return (
			this.n14 * this.n23 * this.n32 * this.n41-
			this.n13 * this.n24 * this.n32 * this.n41-
			this.n14 * this.n22 * this.n33 * this.n41+
			this.n12 * this.n24 * this.n33 * this.n41+

			this.n13 * this.n22 * this.n34 * this.n41-
			this.n12 * this.n23 * this.n34 * this.n41-
			this.n14 * this.n23 * this.n31 * this.n42+
			this.n13 * this.n24 * this.n31 * this.n42+

			this.n14 * this.n21 * this.n33 * this.n42-
			this.n11 * this.n24 * this.n33 * this.n42-
			this.n13 * this.n21 * this.n34 * this.n42+
			this.n11 * this.n23 * this.n34 * this.n42+

			this.n14 * this.n22 * this.n31 * this.n43-
			this.n12 * this.n24 * this.n31 * this.n43-
			this.n14 * this.n21 * this.n32 * this.n43+
			this.n11 * this.n24 * this.n32 * this.n43+

			this.n12 * this.n21 * this.n34 * this.n43-
			this.n11 * this.n22 * this.n34 * this.n43-
			this.n13 * this.n22 * this.n31 * this.n44+
			this.n12 * this.n23 * this.n31 * this.n44+

			this.n13 * this.n21 * this.n32 * this.n44-
			this.n11 * this.n23 * this.n32 * this.n44-
			this.n12 * this.n21 * this.n33 * this.n44+
			this.n11 * this.n22 * this.n33 * this.n44 );

	},

	transpose: function () {

		function swap( obj, p1, p2 ) {

			var aux = obj[ p1 ];
			obj[ p1 ] = obj[ p2 ];
			obj[ p2 ] = aux;

		}

		swap( this, 'n21', 'n12' );
		swap( this, 'n31', 'n13' );
		swap( this, 'n32', 'n23' );
		swap( this, 'n41', 'n14' );
		swap( this, 'n42', 'n24' );
		swap( this, 'n43', 'n34' );

		return this;

	},

	clone: function () {

		var m = new THREE.Matrix4();

		m.n11 = this.n11; m.n12 = this.n12; m.n13 = this.n13; m.n14 = this.n14;
		m.n21 = this.n21; m.n22 = this.n22; m.n23 = this.n23; m.n24 = this.n24;
		m.n31 = this.n31; m.n32 = this.n32; m.n33 = this.n33; m.n34 = this.n34;
		m.n41 = this.n41; m.n42 = this.n42; m.n43 = this.n43; m.n44 = this.n44;

		return m;

	},

	flatten: function() {

		return [ this.n11, this.n21, this.n31, this.n41,
			  this.n12, this.n22, this.n32, this.n42,
			  this.n13, this.n23, this.n33, this.n43,
			  this.n14, this.n24, this.n34, this.n44 ];

	},

	toString: function() {

		return  "| " + this.n11 + " " + this.n12 + " " + this.n13 + " " + this.n14 + " |\n" +
			"| " + this.n21 + " " + this.n22 + " " + this.n23 + " " + this.n24 + " |\n" +
			"| " + this.n31 + " " + this.n32 + " " + this.n33 + " " + this.n34 + " |\n" +
			"| " + this.n41 + " " + this.n42 + " " + this.n43 + " " + this.n44 + " |";

	}

};

THREE.Matrix4.translationMatrix = function ( x, y, z ) {

	var m = new THREE.Matrix4();

	m.n14 = x;
	m.n24 = y;
	m.n34 = z;

	return m;

};

THREE.Matrix4.scaleMatrix = function ( x, y, z ) {

	var m = new THREE.Matrix4();

	m.n11 = x;
	m.n22 = y;
	m.n33 = z;

	return m;

};

THREE.Matrix4.rotationXMatrix = function ( theta ) {

	var rot = new THREE.Matrix4();

	rot.n22 = rot.n33 = Math.cos( theta );
	rot.n32 = Math.sin( theta );
	rot.n23 = - rot.n32;

	return rot;

};

THREE.Matrix4.rotationYMatrix = function ( theta ) {

	var rot = new THREE.Matrix4();

	rot.n11 = rot.n33 = Math.cos( theta );
	rot.n13 = Math.sin( theta );
	rot.n31 = - rot.n13;

	return rot;

};

THREE.Matrix4.rotationZMatrix = function ( theta ) {

	var rot = new THREE.Matrix4();

	rot.n11 = rot.n22 = Math.cos( theta );
	rot.n21 = Math.sin( theta );
	rot.n12 = - rot.n21;

	return rot;

};

THREE.Matrix4.rotationAxisAngleMatrix = function ( axis, angle ) {

	//Based on http://www.gamedev.net/reference/articles/article1199.asp

	var rot = new THREE.Matrix4(),
	c = Math.cos( angle ),
	s = Math.sin( angle ),
	t = 1 - c,
	x = axis.x, y = axis.y, z = axis.z;

	rot.n11 = t * x * x + c;
	rot.n12 = t * x * y - s * z;
	rot.n13 = t * x * z + s * y;
	rot.n21 = t * x * y + s * z;
	rot.n22 = t * y * y + c;
	rot.n23 = t * y * z - s * x;
	rot.n31 = t * x * z - s * y;
	rot.n32 = t * y * z + s * x;
	rot.n33 = t * z * z + c;

	return rot;

};

THREE.Matrix4.makeInvert = function ( m1 ) {

	//TODO: make this more efficient
	//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )
	var m2 = new THREE.Matrix4();

	m2.n11 = m1.n23*m1.n34*m1.n42 - m1.n24*m1.n33*m1.n42 + m1.n24*m1.n32*m1.n43 - m1.n22*m1.n34*m1.n43 - m1.n23*m1.n32*m1.n44 + m1.n22*m1.n33*m1.n44;
	m2.n12 = m1.n14*m1.n33*m1.n42 - m1.n13*m1.n34*m1.n42 - m1.n14*m1.n32*m1.n43 + m1.n12*m1.n34*m1.n43 + m1.n13*m1.n32*m1.n44 - m1.n12*m1.n33*m1.n44;
	m2.n13 = m1.n13*m1.n24*m1.n42 - m1.n14*m1.n23*m1.n42 + m1.n14*m1.n22*m1.n43 - m1.n12*m1.n24*m1.n43 - m1.n13*m1.n22*m1.n44 + m1.n12*m1.n23*m1.n44;
	m2.n14 = m1.n14*m1.n23*m1.n32 - m1.n13*m1.n24*m1.n32 - m1.n14*m1.n22*m1.n33 + m1.n12*m1.n24*m1.n33 + m1.n13*m1.n22*m1.n34 - m1.n12*m1.n23*m1.n34;
	m2.n21 = m1.n24*m1.n33*m1.n41 - m1.n23*m1.n34*m1.n41 - m1.n24*m1.n31*m1.n43 + m1.n21*m1.n34*m1.n43 + m1.n23*m1.n31*m1.n44 - m1.n21*m1.n33*m1.n44;
	m2.n22 = m1.n13*m1.n34*m1.n41 - m1.n14*m1.n33*m1.n41 + m1.n14*m1.n31*m1.n43 - m1.n11*m1.n34*m1.n43 - m1.n13*m1.n31*m1.n44 + m1.n11*m1.n33*m1.n44;
	m2.n23 = m1.n14*m1.n23*m1.n41 - m1.n13*m1.n24*m1.n41 - m1.n14*m1.n21*m1.n43 + m1.n11*m1.n24*m1.n43 + m1.n13*m1.n21*m1.n44 - m1.n11*m1.n23*m1.n44;
	m2.n24 = m1.n13*m1.n24*m1.n31 - m1.n14*m1.n23*m1.n31 + m1.n14*m1.n21*m1.n33 - m1.n11*m1.n24*m1.n33 - m1.n13*m1.n21*m1.n34 + m1.n11*m1.n23*m1.n34;
	m2.n31 = m1.n22*m1.n34*m1.n41 - m1.n24*m1.n32*m1.n41 + m1.n24*m1.n31*m1.n42 - m1.n21*m1.n34*m1.n42 - m1.n22*m1.n31*m1.n44 + m1.n21*m1.n32*m1.n44;
	m2.n32 = m1.n14*m1.n32*m1.n41 - m1.n12*m1.n34*m1.n41 - m1.n14*m1.n31*m1.n42 + m1.n11*m1.n34*m1.n42 + m1.n12*m1.n31*m1.n44 - m1.n11*m1.n32*m1.n44;
	m2.n33 = m1.n13*m1.n24*m1.n41 - m1.n14*m1.n22*m1.n41 + m1.n14*m1.n21*m1.n42 - m1.n11*m1.n24*m1.n42 - m1.n12*m1.n21*m1.n44 + m1.n11*m1.n22*m1.n44;
	m2.n34 = m1.n14*m1.n22*m1.n31 - m1.n12*m1.n24*m1.n31 - m1.n14*m1.n21*m1.n32 + m1.n11*m1.n24*m1.n32 + m1.n12*m1.n21*m1.n34 - m1.n11*m1.n22*m1.n34;
	m2.n41 = m1.n23*m1.n32*m1.n41 - m1.n22*m1.n33*m1.n41 - m1.n23*m1.n31*m1.n42 + m1.n21*m1.n33*m1.n42 + m1.n22*m1.n31*m1.n43 - m1.n21*m1.n32*m1.n43;
	m2.n42 = m1.n12*m1.n33*m1.n41 - m1.n13*m1.n32*m1.n41 + m1.n13*m1.n31*m1.n42 - m1.n11*m1.n33*m1.n42 - m1.n12*m1.n31*m1.n43 + m1.n11*m1.n32*m1.n43;
	m2.n43 = m1.n13*m1.n22*m1.n41 - m1.n12*m1.n23*m1.n41 - m1.n13*m1.n21*m1.n42 + m1.n11*m1.n23*m1.n42 + m1.n12*m1.n21*m1.n43 - m1.n11*m1.n22*m1.n43;
	m2.n44 = m1.n12*m1.n23*m1.n31 - m1.n13*m1.n22*m1.n31 + m1.n13*m1.n21*m1.n32 - m1.n11*m1.n23*m1.n32 - m1.n12*m1.n21*m1.n33 + m1.n11*m1.n22*m1.n33;
	m2.multiplyScalar( 1 / m1.determinant() );

	return m2;

};

THREE.Matrix4.makeInvert3x3 = function ( m1 ) {

	// input:  THREE.Matrix4, output: THREE.Matrix3
	// ( based on http://code.google.com/p/webgl-mjs/ )

	var m = m1.flatten(),
	m2 = new THREE.Matrix3(),

	a11 = m[ 10 ] * m[ 5 ] - m[ 6 ] * m[ 9 ],
	a21 = - m[ 10 ] * m[ 1 ] + m[ 2 ] * m[ 9 ],
	a31 = m[ 6 ] * m[ 1 ] - m[ 2 ] * m[ 5 ],
	a12 = - m[ 10 ] * m[ 4 ] + m[ 6 ] * m[ 8 ],
	a22 = m[ 10 ] * m[ 0 ] - m[ 2 ] * m[ 8 ],
	a32 = - m[ 6 ] * m[ 0 ] + m[ 2 ] * m[ 4 ],
	a13 = m[ 9 ] * m[ 4 ] - m[ 5 ] * m[ 8 ],
	a23 = - m[ 9 ] * m[ 0 ] + m[ 1 ] * m[ 8 ],
	a33 = m[ 5 ] * m[ 0 ] - m[ 1 ] * m[ 4 ],
	det = m[ 0 ] * ( a11 ) + m[ 1 ] * ( a12 ) + m[ 2 ] * ( a13 ),
	idet;

	// no inverse
	if (det == 0) throw "matrix not invertible";

	idet = 1.0 / det;

	m2.m[ 0 ] = idet * a11; m2.m[ 1 ] = idet * a21; m2.m[ 2 ] = idet * a31;
	m2.m[ 3 ] = idet * a12; m2.m[ 4 ] = idet * a22; m2.m[ 5 ] = idet * a32;
	m2.m[ 6 ] = idet * a13; m2.m[ 7 ] = idet * a23; m2.m[ 8 ] = idet * a33;

	return m2;

}

THREE.Matrix4.makeFrustum = function( left, right, bottom, top, near, far ) {

	var m, x, y, a, b, c, d;

	m = new THREE.Matrix4();
	x = 2 * near / ( right - left );
	y = 2 * near / ( top - bottom );
	a = ( right + left ) / ( right - left );
	b = ( top + bottom ) / ( top - bottom );
	c = - ( far + near ) / ( far - near );
	d = - 2 * far * near / ( far - near );

	m.n11 = x;  m.n12 = 0;  m.n13 = a;   m.n14 = 0;
	m.n21 = 0;  m.n22 = y;  m.n23 = b;   m.n24 = 0;
	m.n31 = 0;  m.n32 = 0;  m.n33 = c;   m.n34 = d;
	m.n41 = 0;  m.n42 = 0;  m.n43 = - 1; m.n44 = 0;

	return m;

};

THREE.Matrix4.makePerspective = function( fov, aspect, near, far ) {

	var ymax, ymin, xmin, xmax;

	ymax = near * Math.tan( fov * Math.PI / 360 );
	ymin = - ymax;
	xmin = ymin * aspect;
	xmax = ymax * aspect;

	return THREE.Matrix4.makeFrustum( xmin, xmax, ymin, ymax, near, far );

};

THREE.Matrix4.makeOrtho = function( left, right, top, bottom, near, far ) {

	var m, x, y, z, w, h, p;

	m = new THREE.Matrix4();
	w = right - left;
	h = top - bottom;
	p = far - near;
	x = ( right + left ) / w;
	y = ( top + bottom ) / h;
	z = ( far + near ) / p;

	m.n11 = 2 / w; m.n12 = 0;     m.n13 = 0;      m.n14 = -x;
	m.n21 = 0;     m.n22 = 2 / h; m.n23 = 0;      m.n24 = -y;
	m.n31 = 0;     m.n32 = 0;     m.n33 = -2 / p; m.n34 = -z;
	m.n41 = 0;     m.n42 = 0;     m.n43 = 0;      m.n44 = 1;

	return m;

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Vertex = function ( position, normal ) {

	this.position = position || new THREE.Vector3();
	this.positionWorld = new THREE.Vector3();
	this.positionScreen = new THREE.Vector4();

	this.normal = normal || new THREE.Vector3();
	this.normalWorld = new THREE.Vector3();
	this.normalScreen = new THREE.Vector3();

	this.tangent = new THREE.Vector4();

	this.__visible = true;

};

THREE.Vertex.prototype = {

	toString: function () {

		return 'THREE.Vertex ( position: ' + this.position + ', normal: ' + this.normal + ' )';
	}
};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Face3 = function ( a, b, c, normal, materials ) {

	this.a = a;
	this.b = b;
	this.c = c;

	this.centroid = new THREE.Vector3();
	this.normal = normal instanceof THREE.Vector3 ? normal : new THREE.Vector3();
	this.vertexNormals = normal instanceof Array ? normal : [];

	this.materials = materials instanceof Array ? materials : [ materials ];

};

THREE.Face3.prototype = {

	toString: function () {

		return 'THREE.Face3 ( ' + this.a + ', ' + this.b + ', ' + this.c + ' )';

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Face4 = function ( a, b, c, d, normal, materials ) {

	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;

	this.centroid = new THREE.Vector3();
	this.normal = normal instanceof THREE.Vector3 ? normal : new THREE.Vector3();
	this.vertexNormals = normal instanceof Array ? normal : [];

	this.materials = materials instanceof Array ? materials : [ materials ];

};


THREE.Face4.prototype = {

	toString: function () {

		return 'THREE.Face4 ( ' + this.a + ', ' + this.b + ', ' + this.c + ' ' + this.d + ' )';

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.UV = function ( u, v ) {

	this.u = u || 0;
	this.v = v || 0;

};

THREE.UV.prototype = {

	copy: function ( uv ) {

		this.u = uv.u;
		this.v = uv.v;

	},

	toString: function () {

		return 'THREE.UV (' + this.u + ', ' + this.v + ')';

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Geometry = function () {

	this.vertices = [];
	this.faces = [];
	this.uvs = [];

	this.boundingBox = null;
	this.boundingSphere = null;

	this.geometryChunks = {};

	this.hasTangents = false;

};

THREE.Geometry.prototype = {

	computeCentroids: function () {

		var f, fl, face;

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];
			face.centroid.set( 0, 0, 0 );

			if ( face instanceof THREE.Face3 ) {

				face.centroid.addSelf( this.vertices[ face.a ].position );
				face.centroid.addSelf( this.vertices[ face.b ].position );
				face.centroid.addSelf( this.vertices[ face.c ].position );
				face.centroid.divideScalar( 3 );

			} else if ( face instanceof THREE.Face4 ) {

				face.centroid.addSelf( this.vertices[ face.a ].position );
				face.centroid.addSelf( this.vertices[ face.b ].position );
				face.centroid.addSelf( this.vertices[ face.c ].position );
				face.centroid.addSelf( this.vertices[ face.d ].position );
				face.centroid.divideScalar( 4 );

			}

		}

	},

	computeFaceNormals: function ( useVertexNormals ) {

		var n, nl, v, vl, vertex, f, fl, face, vA, vB, vC,
		cb = new THREE.Vector3(), ab = new THREE.Vector3();

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			vertex = this.vertices[ v ];
			vertex.normal.set( 0, 0, 0 );

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			if ( useVertexNormals && face.vertexNormals.length  ) {

				cb.set( 0, 0, 0 );

				for ( n = 0, nl = face.normal.length; n < nl; n++ ) {

					cb.addSelf( face.vertexNormals[n] );

				}

				cb.divideScalar( 3 );

				if ( ! cb.isZero() ) {

					cb.normalize();

				}

				face.normal.copy( cb );

			} else {

				vA = this.vertices[ face.a ];
				vB = this.vertices[ face.b ];
				vC = this.vertices[ face.c ];

				cb.sub( vC.position, vB.position );
				ab.sub( vA.position, vB.position );
				cb.crossSelf( ab );

				if ( !cb.isZero() ) {

					cb.normalize();

				}

				face.normal.copy( cb );

			}

		}

	},

	computeVertexNormals: function () {

		var v, vl, vertices = [],
		f, fl, face;

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			vertices[ v ] = new THREE.Vector3();

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			if ( face instanceof THREE.Face3 ) {

				vertices[ face.a ].addSelf( face.normal );
				vertices[ face.b ].addSelf( face.normal );
				vertices[ face.c ].addSelf( face.normal );

			} else if ( face instanceof THREE.Face4 ) {

				vertices[ face.a ].addSelf( face.normal );
				vertices[ face.b ].addSelf( face.normal );
				vertices[ face.c ].addSelf( face.normal );
				vertices[ face.d ].addSelf( face.normal );

			}

		}

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			vertices[ v ].normalize();

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			if ( face instanceof THREE.Face3 ) {

				face.vertexNormals[ 0 ] = vertices[ face.a ].clone();
				face.vertexNormals[ 1 ] = vertices[ face.b ].clone();
				face.vertexNormals[ 2 ] = vertices[ face.c ].clone();

			} else if ( face instanceof THREE.Face4 ) {

				face.vertexNormals[ 0 ] = vertices[ face.a ].clone();
				face.vertexNormals[ 1 ] = vertices[ face.b ].clone();
				face.vertexNormals[ 2 ] = vertices[ face.c ].clone();
				face.vertexNormals[ 3 ] = vertices[ face.d ].clone();

			}

		}

	},

	computeTangents: function() {

		// based on http://www.terathon.com/code/tangent.html
		// tangents go to vertices

		var f, fl, v, vl, face, uv, vA, vB, vC, uvA, uvB, uvC,
			x1, x2, y1, y2, z1, z2,
			s1, s2, t1, t2, r, t, test,
			tan1 = [], tan2 = [],
			sdir = new THREE.Vector3(), tdir = new THREE.Vector3(),
			tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(),
			n = new THREE.Vector3(), w;

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			tan1[ v ] = new THREE.Vector3();
			tan2[ v ] = new THREE.Vector3();

		}

		function handleTriangle( context, a, b, c, ua, ub, uc ) {

			vA = context.vertices[ a ].position;
			vB = context.vertices[ b ].position;
			vC = context.vertices[ c ].position;

			uvA = uv[ ua ];
			uvB = uv[ ub ];
			uvC = uv[ uc ];

			x1 = vB.x - vA.x;
			x2 = vC.x - vA.x;
			y1 = vB.y - vA.y;
			y2 = vC.y - vA.y;
			z1 = vB.z - vA.z;
			z2 = vC.z - vA.z;

			s1 = uvB.u - uvA.u;
			s2 = uvC.u - uvA.u;
			t1 = uvB.v - uvA.v;
			t2 = uvC.v - uvA.v;

			r = 1.0 / ( s1 * t2 - s2 * t1 );
			sdir.set( ( t2 * x1 - t1 * x2 ) * r,
					  ( t2 * y1 - t1 * y2 ) * r,
					  ( t2 * z1 - t1 * z2 ) * r );
			tdir.set( ( s1 * x2 - s2 * x1 ) * r,
					  ( s1 * y2 - s2 * y1 ) * r,
					  ( s1 * z2 - s2 * z1 ) * r );

			tan1[ a ].addSelf( sdir );
			tan1[ b ].addSelf( sdir );
			tan1[ c ].addSelf( sdir );

			tan2[ a ].addSelf( tdir );
			tan2[ b ].addSelf( tdir );
			tan2[ c ].addSelf( tdir );

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];
			uv = this.uvs[ f ];

			if ( face instanceof THREE.Face3 ) {

				handleTriangle( this, face.a, face.b, face.c, 0, 1, 2 );

				this.vertices[ face.a ].normal.copy( face.vertexNormals[ 0 ] );
				this.vertices[ face.b ].normal.copy( face.vertexNormals[ 1 ] );
				this.vertices[ face.c ].normal.copy( face.vertexNormals[ 2 ] );


			} else if ( face instanceof THREE.Face4 ) {

				handleTriangle( this, face.a, face.b, face.c, 0, 1, 2 );
				handleTriangle( this, face.a, face.b, face.d, 0, 1, 3 );

				this.vertices[ face.a ].normal.copy( face.vertexNormals[ 0 ] );
				this.vertices[ face.b ].normal.copy( face.vertexNormals[ 1 ] );
				this.vertices[ face.c ].normal.copy( face.vertexNormals[ 2 ] );
				this.vertices[ face.d ].normal.copy( face.vertexNormals[ 3 ] );

			}

		}

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			n.copy( this.vertices[ v ].normal );
			t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			tmp.copy( t );
			tmp.subSelf( n.multiplyScalar( n.dot( t ) ) ).normalize();

			// Calculate handedness

			tmp2.cross( this.vertices[ v ].normal, t );
			test = tmp2.dot( tan2[ v ] );
			w = (test < 0.0) ? -1.0 : 1.0;

			this.vertices[ v ].tangent.set( tmp.x, tmp.y, tmp.z, w );

		}

		this.hasTangents = true;

	},

	computeBoundingBox: function () {

		var vertex;

		if ( this.vertices.length > 0 ) {

			this.boundingBox = { 'x': [ this.vertices[ 0 ].position.x, this.vertices[ 0 ].position.x ],
			'y': [ this.vertices[ 0 ].position.y, this.vertices[ 0 ].position.y ],
			'z': [ this.vertices[ 0 ].position.z, this.vertices[ 0 ].position.z ] };

			for ( var v = 1, vl = this.vertices.length; v < vl; v ++ ) {

				vertex = this.vertices[ v ];

				if ( vertex.position.x < this.boundingBox.x[ 0 ] ) {

					this.boundingBox.x[ 0 ] = vertex.position.x;

				} else if ( vertex.position.x > this.boundingBox.x[ 1 ] ) {

					this.boundingBox.x[ 1 ] = vertex.position.x;

				}

				if ( vertex.position.y < this.boundingBox.y[ 0 ] ) {

					this.boundingBox.y[ 0 ] = vertex.position.y;

				} else if ( vertex.position.y > this.boundingBox.y[ 1 ] ) {

					this.boundingBox.y[ 1 ] = vertex.position.y;

				}

				if ( vertex.position.z < this.boundingBox.z[ 0 ] ) {

					this.boundingBox.z[ 0 ] = vertex.position.z;

				} else if ( vertex.position.z > this.boundingBox.z[ 1 ] ) {

					this.boundingBox.z[ 1 ] = vertex.position.z;

				}

			}

		}

	},

	computeBoundingSphere: function () {

		var radius = this.boundingSphere === null ? 0 : this.boundingSphere.radius;

		for ( var v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			radius = Math.max( radius, this.vertices[ v ].position.length() );

		}

		this.boundingSphere = { radius: radius };

	},

	sortFacesByMaterial: function () {

		// TODO
		// Should optimize by grouping faces with ColorFill / ColorStroke materials
		// which could then use vertex color attributes instead of each being
		// in its separate VBO

		var i, l, f, fl, face, material, materials, vertices, mhash, ghash, hash_map = {};

		function materialHash( material ) {

			var hash_array = [];

			for ( i = 0, l = material.length; i < l; i++ ) {

				if ( material[ i ] == undefined ) {

					hash_array.push( "undefined" );

				} else {

					hash_array.push( material[ i ].toString() );

				}

			}

			return hash_array.join( '_' );

		}

		for ( f = 0, fl = this.faces.length; f < fl; f++ ) {

			face = this.faces[ f ];
			materials = face.materials;

			mhash = materialHash( materials );

			if ( hash_map[ mhash ] == undefined ) {

				hash_map[ mhash ] = { 'hash': mhash, 'counter': 0 };

			}

			ghash = hash_map[ mhash ].hash + '_' + hash_map[ mhash ].counter;

			if ( this.geometryChunks[ ghash ] == undefined ) {

				this.geometryChunks[ ghash ] = { 'faces': [], 'materials': materials, 'vertices': 0 };

			}

			vertices = face instanceof THREE.Face3 ? 3 : 4;

			if ( this.geometryChunks[ ghash ].vertices + vertices > 65535 ) {

				hash_map[ mhash ].counter += 1;
				ghash = hash_map[ mhash ].hash + '_' + hash_map[ mhash ].counter;

				if ( this.geometryChunks[ ghash ] == undefined ) {

					this.geometryChunks[ ghash ] = { 'faces': [], 'materials': materials, 'vertices': 0 };

				}

			}

			this.geometryChunks[ ghash ].faces.push( f );
			this.geometryChunks[ ghash ].vertices += vertices;

		}

	},

	toString: function () {

		return 'THREE.Geometry ( vertices: ' + this.vertices + ', faces: ' + this.faces + ', uvs: ' + this.uvs + ' )';

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Camera = function ( fov, aspect, near, far ) {

	this.fov = fov;
	this.aspect = aspect;
	this.near = near;
	this.far = far;

	this.position = new THREE.Vector3();
	this.target = { position: new THREE.Vector3() };

	this.autoUpdateMatrix = true;

	this.projectionMatrix = null;
	this.matrix = new THREE.Matrix4();

	this.up = new THREE.Vector3( 0, 1, 0 );

	this.translateX = function ( amount ) {

		var vector = this.target.position.clone().subSelf( this.position ).normalize().multiplyScalar( amount );
		vector.cross( vector.clone(), this.up );

		this.position.addSelf( vector );
		this.target.position.addSelf( vector );

	};

	/* TODO
	this.translateY = function ( amount ) {

	};
	*/

	this.translateZ = function ( amount ) {

		var vector = this.target.position.clone().subSelf( this.position ).normalize().multiplyScalar( amount );

		this.position.subSelf( vector );
		this.target.position.subSelf( vector );

	};

	this.updateMatrix = function () {

		this.matrix.lookAt( this.position, this.target.position, this.up );

	};

	this.updateProjectionMatrix = function () {

		this.projectionMatrix = THREE.Matrix4.makePerspective( this.fov, this.aspect, this.near, this.far );

	};

	this.updateProjectionMatrix();

};

THREE.Camera.prototype = {

	toString: function () {

		return 'THREE.Camera ( ' + this.position + ', ' + this.target.position + ' )';

	}

};
THREE.Light = function ( hex ) {

	this.color = new THREE.Color( hex );

};
THREE.AmbientLight = function ( hex ) {

	THREE.Light.call( this, hex );

};

THREE.AmbientLight.prototype = new THREE.Light();
THREE.AmbientLight.prototype.constructor = THREE.AmbientLight; 
THREE.DirectionalLight = function ( hex, intensity ) {

	THREE.Light.call( this, hex );

	this.position = new THREE.Vector3( 0, 1, 0 );
	this.intensity = intensity || 1;

};

THREE.DirectionalLight.prototype = new THREE.Light();
THREE.DirectionalLight.prototype.constructor = THREE.DirectionalLight; 
THREE.PointLight = function ( hex, intensity ) {

	THREE.Light.call( this, hex );

	this.position = new THREE.Vector3();
	this.intensity = intensity || 1;

};

THREE.DirectionalLight.prototype = new THREE.Light();
THREE.DirectionalLight.prototype.constructor = THREE.PointLight; 
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Object3D = function () {

	this.id = THREE.Object3DCounter.value ++;

	this.position = new THREE.Vector3();
	this.rotation = new THREE.Vector3();
	this.scale = new THREE.Vector3( 1, 1, 1 );

	this.matrix = new THREE.Matrix4();
	this.translationMatrix = new THREE.Matrix4();
	this.rotationMatrix = new THREE.Matrix4();
	this.scaleMatrix = new THREE.Matrix4();

	this.screen = new THREE.Vector3();

	this.autoUpdateMatrix = true;
	this.visible = true;

};

THREE.Object3D.prototype = {

	updateMatrix: function () {

		this.matrixPosition = THREE.Matrix4.translationMatrix( this.position.x, this.position.y, this.position.z );

		this.rotationMatrix = THREE.Matrix4.rotationXMatrix( this.rotation.x );
		this.rotationMatrix.multiplySelf( THREE.Matrix4.rotationYMatrix( this.rotation.y ) );
		this.rotationMatrix.multiplySelf( THREE.Matrix4.rotationZMatrix( this.rotation.z ) );

		this.scaleMatrix = THREE.Matrix4.scaleMatrix( this.scale.x, this.scale.y, this.scale.z );

		this.matrix.copy( this.matrixPosition );
		this.matrix.multiplySelf( this.rotationMatrix );
		this.matrix.multiplySelf( this.scaleMatrix );

	}

};

THREE.Object3DCounter = { value: 0 };
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Particle = function ( materials ) {

	THREE.Object3D.call( this );

	this.materials = materials instanceof Array ? materials : [ materials ];

	this.autoUpdateMatrix = false;

};

THREE.Particle.prototype = new THREE.Object3D();
THREE.Particle.prototype.constructor = THREE.Particle;
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ParticleSystem = function ( geometry, materials ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.materials = materials instanceof Array ? materials : [ materials ];

	this.autoUpdateMatrix = false;

};

THREE.ParticleSystem.prototype = new THREE.Object3D();
THREE.ParticleSystem.prototype.constructor = THREE.ParticleSystem;
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Line = function ( geometry, materials, type ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.materials = materials instanceof Array ? materials : [ materials ];
	
	this.type = type !== undefined ? type : THREE.LineContinuous;

};

THREE.LineStrip = 0;
THREE.LinePieces = 1;

THREE.Line.prototype = new THREE.Object3D();
THREE.Line.prototype.constructor = THREE.Line;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Mesh = function ( geometry, materials ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.materials = materials instanceof Array ? materials : [ materials ];

	this.flipSided = false;
	this.doubleSided = false;

	this.overdraw = false; // TODO: Move to material?

	this.geometry.boundingSphere || this.geometry.computeBoundingSphere();

};

THREE.Mesh.prototype = new THREE.Object3D();
THREE.Mesh.prototype.constructor = THREE.Mesh;
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.FlatShading = 0;
THREE.SmoothShading = 1;

THREE.NormalBlending = 0;
THREE.AdditiveBlending = 1;
THREE.SubtractiveBlending = 2;
/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  blending: THREE.NormalBlending,
 *  linewidth: <float>
 * }
 */

THREE.LineBasicMaterial = function ( parameters ) {

	this.color = new THREE.Color( 0xffffff );
	this.opacity = 1;
	this.blending = THREE.NormalBlending;
	this.linewidth = 1;
	this.linecap = 'round';
	this.linejoin = 'round';

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.linewidth !== undefined ) this.linewidth = parameters.linewidth;
		if ( parameters.linecap !== undefined ) this.linecap = parameters.linecap;
		if ( parameters.linejoin !== undefined ) this.linejoin = parameters.linejoin;
	}

};

THREE.LineBasicMaterial.prototype = {

	toString: function () {

		return 'THREE.LineBasicMaterial (<br/>' +
			'color: ' + this.color + '<br/>' +
			'opacity: ' + this.opacity + '<br/>' +
			'blending: ' + this.blending + '<br/>' +
			'linewidth: ' + this.linewidth +'<br/>' +
			'linecap: ' + this.linecap +'<br/>' +
			'linejoin: ' + this.linejoin +'<br/>' +
			')';

	}

}
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  map: new THREE.Texture( <Image> ),
 
 *  env_map: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refraction_ratio: <float>,
 
 *  opacity: <float>,
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  wireframe: <boolean>,
 *  wireframe_linewidth: <float>
 * }
 */

THREE.MeshBasicMaterial = function ( parameters ) {

	this.id = THREE.MeshBasicMaterialCounter.value ++;

	this.color = new THREE.Color( 0xffffff );
	this.map = null;

	this.env_map = null;
	this.combine = THREE.MultiplyOperation;
	this.reflectivity = 1;
	this.refraction_ratio = 0.98;

	this.fog = true;

	this.opacity = 1;
	this.shading = THREE.SmoothShading;
	this.blending = THREE.NormalBlending;

	this.wireframe = false;
	this.wireframe_linewidth = 1;
	this.wireframe_linecap = 'round';
	this.wireframe_linejoin = 'round';

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.map !== undefined ) this.map = parameters.map;

		if ( parameters.env_map !== undefined ) this.env_map = parameters.env_map;
		if ( parameters.combine !== undefined ) this.combine = parameters.combine;
		if ( parameters.reflectivity !== undefined ) this.reflectivity  = parameters.reflectivity;
		if ( parameters.refraction_ratio !== undefined ) this.refraction_ratio  = parameters.refraction_ratio;

		if ( parameters.fog !== undefined ) this.fog  = parameters.fog;

		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.shading !== undefined ) this.shading = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframe_linewidth !== undefined ) this.wireframe_linewidth = parameters.wireframe_linewidth;
		if ( parameters.wireframe_linecap !== undefined ) this.wireframe_linecap = parameters.wireframe_linecap;
		if ( parameters.wireframe_linejoin !== undefined ) this.wireframe_linejoin = parameters.wireframe_linejoin;

	}

};

THREE.MeshBasicMaterial.prototype = {

	toString: function () {

		return 'THREE.MeshBasicMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +
			'color: ' + this.color + '<br/>' +
			'map: ' + this.map + '<br/>' +

			'env_map: ' + this.env_map + '<br/>' +
			'combine: ' + this.combine + '<br/>' +
			'reflectivity: ' + this.reflectivity + '<br/>' +
			'refraction_ratio: ' + this.refraction_ratio + '<br/>' +

			'opacity: ' + this.opacity + '<br/>' +
			'blending: ' + this.blending + '<br/>' +

			'wireframe: ' + this.wireframe + '<br/>' +
			'wireframe_linewidth: ' + this.wireframe_linewidth +'<br/>' +
			'wireframe_linecap: ' + this.wireframe_linecap +'<br/>' +
			'wireframe_linejoin: ' + this.wireframe_linejoin +'<br/>' +
			')';

	}

};

THREE.MeshBasicMaterialCounter = { value: 0 };
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  map: new THREE.Texture( <Image> ),
 
 *  env_map: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refraction_ratio: <float>,
 
 *  opacity: <float>,
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  wireframe: <boolean>,
 *  wireframe_linewidth: <float>
 * }
 */

THREE.MeshLambertMaterial = function ( parameters ) {

	this.id = THREE.MeshLambertMaterialCounter.value ++;

	this.color = new THREE.Color( 0xffffff );
	this.map = null;

	this.env_map = null;
	this.combine = THREE.MultiplyOperation;
	this.reflectivity = 1;
	this.refraction_ratio = 0.98;

	this.fog = true;

	this.opacity = 1;
	this.shading = THREE.SmoothShading;
	this.blending = THREE.NormalBlending;

	this.wireframe = false;
	this.wireframe_linewidth = 1;
	this.wireframe_linecap = 'round';
	this.wireframe_linejoin = 'round';

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.map !== undefined ) this.map = parameters.map;

		if ( parameters.env_map !== undefined ) this.env_map = parameters.env_map;
		if ( parameters.combine !== undefined ) this.combine = parameters.combine;
		if ( parameters.reflectivity !== undefined ) this.reflectivity  = parameters.reflectivity;
		if ( parameters.refraction_ratio !== undefined ) this.refraction_ratio  = parameters.refraction_ratio;

		if ( parameters.fog !== undefined ) this.fog  = parameters.fog;

		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.shading !== undefined ) this.shading = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframe_linewidth !== undefined ) this.wireframe_linewidth = parameters.wireframe_linewidth;
		if ( parameters.wireframe_linecap !== undefined ) this.wireframe_linecap = parameters.wireframe_linecap;
		if ( parameters.wireframe_linejoin !== undefined ) this.wireframe_linejoin = parameters.wireframe_linejoin;

	}

};

THREE.MeshLambertMaterial.prototype = {

	toString: function () {

		return 'THREE.MeshLambertMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +
			'color: ' + this.color + '<br/>' +
			'map: ' + this.map + '<br/>' +

			'env_map: ' + this.env_map + '<br/>' +
			'combine: ' + this.combine + '<br/>' +
			'reflectivity: ' + this.reflectivity + '<br/>' +
			'refraction_ratio: ' + this.refraction_ratio + '<br/>' +

			'opacity: ' + this.opacity + '<br/>' +
			'shading: ' + this.shading + '<br/>' +
			'blending: ' + this.blending + '<br/>' +

			'wireframe: ' + this.wireframe + '<br/>' +
			'wireframe_linewidth: ' + this.wireframe_linewidth +'<br/>' +
			'wireframe_linecap: ' + this.wireframe_linecap +'<br/>' +
			'wireframe_linejoin: ' + this.wireframe_linejoin +'<br/>' +
			' )';

	}

};

THREE.MeshLambertMaterialCounter = { value: 0 };
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  ambient: <hex>,
 *  specular: <hex>,
 *  shininess: <float>,

 *  map: new THREE.Texture( <Image> ),
 *  specular_map: new THREE.Texture( <Image> ),

 *  env_map: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refraction_ratio: <float>,

 *  opacity: <float>,
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  wireframe: <boolean>,
 *  wireframe_linewidth: <float>
 * }
 */

THREE.MeshPhongMaterial = function ( parameters ) {

	this.id = THREE.MeshPhongMaterialCounter.value ++;

	this.color = new THREE.Color( 0xffffff );
	this.ambient = new THREE.Color( 0x050505 );
	this.specular = new THREE.Color( 0x111111 );
	this.shininess = 30;

	this.map = null;
	this.specular_map = null;

	this.env_map = null;
	this.combine = THREE.MultiplyOperation;
	this.reflectivity = 1;
	this.refraction_ratio = 0.98;

	this.fog = true;

	this.opacity = 1;
	this.shading = THREE.SmoothShading;
	this.blending = THREE.NormalBlending;

	this.wireframe = false;
	this.wireframe_linewidth = 1;
	this.wireframe_linecap = 'round';
	this.wireframe_linejoin = 'round';

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color = new THREE.Color( parameters.color );
		if ( parameters.ambient !== undefined ) this.ambient = new THREE.Color( parameters.ambient );
		if ( parameters.specular !== undefined ) this.specular = new THREE.Color( parameters.specular );
		if ( parameters.shininess !== undefined ) this.shininess = parameters.shininess;

		if ( parameters.map !== undefined ) this.map = parameters.map;
		if ( parameters.specular_map !== undefined ) this.specular_map = parameters.specular_map;

		if ( parameters.env_map !== undefined ) this.env_map = parameters.env_map;
		if ( parameters.combine !== undefined ) this.combine = parameters.combine;
		if ( parameters.reflectivity !== undefined ) this.reflectivity  = parameters.reflectivity;
		if ( parameters.refraction_ratio !== undefined ) this.refraction_ratio  = parameters.refraction_ratio;

		if ( parameters.fog !== undefined ) this.fog  = parameters.fog;

		if ( parameters.opacity !== undefined ) this.opacity = parameters.opacity;
		if ( parameters.shading !== undefined ) this.shading = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframe_linewidth !== undefined ) this.wireframe_linewidth = parameters.wireframe_linewidth;
		if ( parameters.wireframe_linecap !== undefined ) this.wireframe_linecap = parameters.wireframe_linecap;
		if ( parameters.wireframe_linejoin !== undefined ) this.wireframe_linejoin = parameters.wireframe_linejoin;

	}

};

THREE.MeshPhongMaterial.prototype = {

	toString: function () {

		return 'THREE.MeshPhongMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +
			'color: ' + this.color + '<br/>' +
			'ambient: ' + this.ambient + '<br/>' +
			'specular: ' + this.specular + '<br/>' +
			'shininess: ' + this.shininess + '<br/>' +

			'map: ' + this.map + '<br/>' +
			'specular_map: ' + this.specular_map + '<br/>' +

			'env_map: ' + this.env_map + '<br/>' +
			'combine: ' + this.combine + '<br/>' +
			'reflectivity: ' + this.reflectivity + '<br/>' +
			'refraction_ratio: ' + this.refraction_ratio + '<br/>' +

			'opacity: ' + this.opacity + '<br/>' +
			'shading: ' + this.shading + '<br/>' +

			'wireframe: ' + this.wireframe + '<br/>' +
			'wireframe_linewidth: ' + this.wireframe_linewidth + '<br/>' +
			'wireframe_linecap: ' + this.wireframe_linecap +'<br/>' +
			'wireframe_linejoin: ' + this.wireframe_linejoin +'<br/>' +
			')';

	}

};

THREE.MeshPhongMaterialCounter = { value: 0 };
/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  opacity: <float>,
 *  blending: THREE.NormalBlending
 * } 
 */

THREE.MeshDepthMaterial = function ( parameters ) {

	this.opacity = 1;
	this.shading = THREE.SmoothShading;
	this.blending = THREE.NormalBlending;

	this.wireframe = false;
	this.wireframe_linewidth = 1;
	this.wireframe_linecap = 'round';
	this.wireframe_linejoin = 'round';

	if ( parameters ) {

		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

	}

};

THREE.MeshDepthMaterial.prototype = {

	toString: function () {

		return 'THREE.MeshDepthMaterial';

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  opacity: <float>,
 *  shading: THREE.FlatShading,
 *  blending: THREE.NormalBlending
 * }
 */

THREE.MeshNormalMaterial = function ( parameters ) {

	this.opacity = 1;
	this.shading = THREE.FlatShading;
	this.blending = THREE.NormalBlending;

	if ( parameters ) {

		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.shading !== undefined ) this.shading  = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

	}

};

THREE.MeshNormalMaterial.prototype = {

	toString: function () {

		return 'THREE.MeshNormalMaterial';

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.MeshFaceMaterial = function () {

};

THREE.MeshFaceMaterial.prototype = {

	toString: function () {

		return 'THREE.MeshFaceMaterial';

	}

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  fragment_shader: <string>,
 *  vertex_shader: <string>,
 *  uniforms: { "parameter1": { type: "f", value: 1.0 }, "parameter2": { type: "i" value2: 2 } },
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  wireframe: <boolean>,
 *  wireframe_linewidth: <float>
 * }
 */

THREE.MeshShaderMaterial = function ( parameters ) {

	this.id = THREE.MeshShaderMaterialCounter.value ++;

	this.fragment_shader = "void main() {}";
	this.vertex_shader = "void main() {}";
	this.uniforms = {};

	this.opacity = 1;
	this.shading = THREE.SmoothShading;
	this.blending = THREE.NormalBlending;

	this.wireframe = false;
	this.wireframe_linewidth = 1;
	this.wireframe_linecap = 'round';
	this.wireframe_linejoin = 'round';

	if ( parameters ) {

		if ( parameters.fragment_shader !== undefined ) this.fragment_shader = parameters.fragment_shader;
		if ( parameters.vertex_shader !== undefined ) this.vertex_shader = parameters.vertex_shader;

		if ( parameters.uniforms !== undefined ) this.uniforms = parameters.uniforms;

		if ( parameters.shading !== undefined ) this.shading = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframe_linewidth !== undefined ) this.wireframe_linewidth = parameters.wireframe_linewidth;
		if ( parameters.wireframe_linecap !== undefined ) this.wireframe_linecap = parameters.wireframe_linecap;
		if ( parameters.wireframe_linejoin !== undefined ) this.wireframe_linejoin = parameters.wireframe_linejoin;

	}

};

THREE.MeshShaderMaterial.prototype = {

	toString: function () {

		return 'THREE.MeshShaderMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +

			'blending: ' + this.blending + '<br/>' +
			'wireframe: ' + this.wireframe + '<br/>' +
			'wireframe_linewidth: ' + this.wireframe_linewidth +'<br/>' +
			'wireframe_linecap: ' + this.wireframe_linecap +'<br/>' +
			'wireframe_linejoin: ' + this.wireframe_linejoin +'<br/>' +
			')';

	}

};

THREE.MeshShaderMaterialCounter = { value: 0 };
/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  color: <hex>,
 *  map: new THREE.Texture( <Image> ),
 *  opacity: <float>,
 *  blending: THREE.NormalBlending
 * }
 */

THREE.ParticleBasicMaterial = function ( parameters ) {

	this.color = new THREE.Color( 0xffffff );
	this.map = null;
	this.opacity = 1;
	this.blending = THREE.NormalBlending;

	this.offset = new THREE.Vector2(); // TODO: expose to parameters

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.map !== undefined ) this.map = parameters.map;
		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

	}

};

THREE.ParticleBasicMaterial.prototype = {

	toString: function () {

		return 'THREE.ParticleBasicMaterial (<br/>' +
			'color: ' + this.color + '<br/>' +
			'map: ' + this.map + '<br/>' +
			'opacity: ' + this.opacity + '<br/>' +
			'blending: ' + this.blending + '<br/>' +
			')';

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  blending: THREE.NormalBlending
 * }
 */

THREE.ParticleCircleMaterial = function ( parameters ) {

	this.color = new THREE.Color( 0xffffff );
	this.opacity = 1;
	this.blending = THREE.NormalBlending;

	if ( parameters ) {

		if ( parameters.color !== undefined ) this.color.setHex( parameters.color );
		if ( parameters.opacity !== undefined ) this.opacity = parameters.opacity;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

	}

};

THREE.ParticleCircleMaterial.prototype = {

	toString: function () {

		return 'THREE.ParticleCircleMaterial (<br/>' +
			'color: ' + this.color + '<br/>' +
			'opacity: ' + this.opacity + '<br/>' +
			'blending: ' + this.blending + '<br/>' +
			')';

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Texture = function ( image, mapping, wrap_s, wrap_t, mag_filter, min_filter ) {

	this.image = image;

	this.mapping = mapping !== undefined ? mapping : new THREE.UVMapping();

	this.wrap_s = wrap_s !== undefined ? wrap_s : THREE.ClampToEdgeWrapping;
	this.wrap_t = wrap_t !== undefined ? wrap_t : THREE.ClampToEdgeWrapping;

	this.mag_filter = mag_filter !== undefined ? mag_filter : THREE.LinearFilter;
	this.min_filter = min_filter !== undefined ? min_filter : THREE.LinearMipMapLinearFilter;

};

THREE.Texture.prototype = {

	clone: function () {

		return new THREE.Texture( this.image, this.mapping, this.wrap_s, this.wrap_t, this.mag_filter, this.min_filter );

	},

	toString: function () {

		return 'THREE.Texture (<br/>' +
			'image: ' + this.image + '<br/>' +
			'wrap_s: ' + this.wrap_s + '<br/>' +
			'wrap_t: ' + this.wrap_t + '<br/>' +
			'mag_filter: ' + this.mag_filter + '<br/>' +
			'min_filter: ' + this.min_filter + '<br/>' +
			')';

	}

};

THREE.MultiplyOperation = 0;
THREE.MixOperation = 1;

THREE.RepeatWrapping = 0;
THREE.ClampToEdgeWrapping = 1;
THREE.MirroredRepeatWrapping = 2;

THREE.NearestFilter = 3;
THREE.NearestMipMapNearestFilter = 4;
THREE.NearestMipMapLinearFilter = 5;
THREE.LinearFilter = 6;
THREE.LinearMipMapNearestFilter = 7;
THREE.LinearMipMapLinearFilter = 8;

THREE.RGBFormat = 9;

THREE.UnsignedByteType = 10;
THREE.RenderTexture = function ( width, height, options ) {

	this.width = width;
	this.height = height;

	options = options || {};

	this.wrap_s = options.wrap_s !== undefined ? options.wrap_s : THREE.ClampToEdgeWrapping;
	this.wrap_t = options.wrap_t !== undefined ? options.wrap_t : THREE.ClampToEdgeWrapping;

	this.mag_filter = options.mag_filter !== undefined ? options.mag_filter : THREE.LinearFilter;
	this.min_filter = options.min_filter !== undefined ? options.min_filter : THREE.LinearFilter;

	this.format = options.format !== undefined ? options.format : THREE.RGBFormat;
	this.type = options.type !== undefined ? options.type : THREE.UnsignedByteType;

};
var Uniforms = {

	clone: function( uniforms_src ) {

		var u, p, parameter, parameter_src, uniforms_dst = {};

		for ( u in uniforms_src ) {

			uniforms_dst[ u ] = {};

			for ( p in uniforms_src[ u ] ) {

				parameter_src = uniforms_src[ u ][ p ];

				if ( parameter_src instanceof THREE.Color ||
					 parameter_src instanceof THREE.Vector3 ||
					 parameter_src instanceof THREE.Texture ) {

					uniforms_dst[ u ][ p ] = parameter_src.clone();

				} else {

					uniforms_dst[ u ][ p ] = parameter_src;

				}

			}

		}

		return uniforms_dst;

	},
	
	merge: function( uniforms ) {
		
		var u, p, tmp, merged = {};
		
		for( u = 0; u < uniforms.length; u++ ) {
			
			tmp = this.clone( uniforms[ u ] );
			
			for ( p in tmp ) {
				
				merged[ p ] = tmp[ p ];
			
			}
			
		}
		
		return merged;
		
	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.CubeReflectionMapping = function () {



};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.CubeRefractionMapping = function () {



};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.LatitudeReflectionMapping = function () {



};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.LatitudeRefractionMapping = function () {



};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.SphericalReflectionMapping = function () {



};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.SphericalRefractionMapping = function () {



};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.UVMapping = function () {



};
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Scene = function () {

	this.objects = [];
	this.lights = [];
	this.fog = null;

	this.addObject = function ( object ) {

		var i = this.objects.indexOf( object );

		if ( i === -1 ) {

			this.objects.push( object );

		}

	};

	this.removeObject = function ( object ) {

		var i = this.objects.indexOf( object );

		if ( i !== -1 ) {

			this.objects.splice( i, 1 );

		}

	};

	this.addLight = function ( light ) {

		var i = this.lights.indexOf( light );

		if ( i === -1 ) {

			this.lights.push( light );

		}

	};

	this.removeLight = function ( light ) {

		var i = this.lights.indexOf( light );

		if ( i !== -1 ) {

			this.lights.splice( i, 1 );

		}

	};

	this.toString = function () {

		return 'THREE.Scene ( ' + this.objects + ' )';

	};

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Fog = function ( hex, near, far ) {

	this.color = new THREE.Color( hex );
	this.near = near || 1;
	this.far = far || 1000;

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.FogExp2 = function ( hex, density ) {

	this.color = new THREE.Color( hex );
	this.density = density || 0.00025;

};
/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.WebGLRenderer = function ( parameters ) {

	// Currently you can use just up to 4 directional / point lights total.
	// Chrome barfs on shader linking when there are more than 4 lights :(

	// The problem comes from shader using too many varying vectors.

	// This is not GPU limitation as the same shader works ok in Firefox
	// and Chrome with "--use-gl=desktop" flag.

	// Difference comes from Chrome on Windows using by default ANGLE,
	// thus going DirectX9 route (while FF uses OpenGL).

	// See http://code.google.com/p/chromium/issues/detail?id=63491

	var _canvas = document.createElement( 'canvas' ), _gl,
	_oldProgram = null,
	_modelViewMatrix = new THREE.Matrix4(), _normalMatrix,

	_viewMatrixArray = new Float32Array(16),
	_modelViewMatrixArray = new Float32Array(16),
	_projectionMatrixArray = new Float32Array(16),
	_normalMatrixArray = new Float32Array(9),
	_objectMatrixArray = new Float32Array(16),

	// parameters defaults
	
	antialias = true,
	clearColor = new THREE.Color( 0x000000 ),
	clearAlpha = 0;

	if ( parameters ) {
		
		if ( parameters.antialias !== undefined ) antialias = parameters.antialias;
		if ( parameters.clearColor !== undefined ) clearColor.setHex( parameters.clearColor );
		if ( parameters.clearAlpha !== undefined ) clearAlpha = parameters.clearAlpha;
		
	}
		
	this.domElement = _canvas;
	this.autoClear = true;

	initGL( antialias, clearColor, clearAlpha );

	//alert( dumpObject( getGLParams() ) );

	this.setSize = function ( width, height ) {

		_canvas.width = width;
		_canvas.height = height;
		_gl.viewport( 0, 0, _canvas.width, _canvas.height );

	};

	this.setClearColor = function( hex, alpha ) {

		var color = new THREE.Color( hex );
		_gl.clearColor( color.r, color.g, color.b, alpha );

	};

	this.clear = function () {

		_gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );

	};

	this.setupLights = function ( program, lights ) {

		var l, ll, light, r = 0, g = 0, b = 0,
			dcolors = [], dpositions = [],
			pcolors = [], ppositions = [];


		for ( l = 0, ll = lights.length; l < ll; l++ ) {

			light = lights[ l ];

			if ( light instanceof THREE.AmbientLight ) {

				r += light.color.r;
				g += light.color.g;
				b += light.color.b;
				
			} else if ( light instanceof THREE.DirectionalLight ) {

				dcolors.push( light.color.r * light.intensity,
							  light.color.g * light.intensity,
							  light.color.b * light.intensity );

				dpositions.push( light.position.x,
								 light.position.y,
								 light.position.z );

			} else if( light instanceof THREE.PointLight ) {

				pcolors.push( light.color.r * light.intensity,
							  light.color.g * light.intensity,
							  light.color.b * light.intensity );

				ppositions.push( light.position.x,
								 light.position.y,
								 light.position.z );
				
			}

		}
		
		return { ambient: [ r, g, b ], directional: { colors: dcolors, positions: dpositions }, point: { colors: pcolors, positions: ppositions } };

	};

	this.createParticleBuffers = function( object ) {
	};
	
	this.createLineBuffers = function( object ) {
		
		var v, vl, vertex, 
			vertexArray = [], lineArray = [], 
			vertices = object.geometry.vertices;
		
		for ( v = 0, vl = vertices.length; v < vl; v++ ) {
			
			vertex = vertices[ v ].position;
			vertexArray.push( vertex.x, vertex.y, vertex.z );
			
			lineArray.push( v );
			
		}
			
		if ( !vertexArray.length ) {

			return;

		}

		object.__webGLVertexBuffer = _gl.createBuffer();
		_gl.bindBuffer( _gl.ARRAY_BUFFER, object.__webGLVertexBuffer );
		_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( vertexArray ), _gl.STATIC_DRAW );
		
		object.__webGLLineBuffer = _gl.createBuffer();
		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, object.__webGLLineBuffer );
		_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( lineArray ), _gl.STATIC_DRAW );
		
		object.__webGLLineCount = lineArray.length;
		
	};
	
	this.createBuffers = function ( object, g ) {

		var f, fl, fi, face, vertexNormals, faceNormal, normal, uv, v1, v2, v3, v4, t1, t2, t3, t4, m, ml, i,

		faceArray = [],
		lineArray = [],

		vertexArray = [],
		normalArray = [],
		tangentArray = [],
		uvArray = [],

		vertexIndex = 0,

		geometryChunk = object.geometry.geometryChunks[ g ],

		needsSmoothNormals = bufferNeedsSmoothNormals ( geometryChunk, object );

		for ( f = 0, fl = geometryChunk.faces.length; f < fl; f++ ) {

			fi = geometryChunk.faces[ f ];

			face = object.geometry.faces[ fi ];
			vertexNormals = face.vertexNormals;
			faceNormal = face.normal;
			uv = object.geometry.uvs[ fi ];

			if ( face instanceof THREE.Face3 ) {

				v1 = object.geometry.vertices[ face.a ].position;
				v2 = object.geometry.vertices[ face.b ].position;
				v3 = object.geometry.vertices[ face.c ].position;

				vertexArray.push( v1.x, v1.y, v1.z,
								  v2.x, v2.y, v2.z,
								  v3.x, v3.y, v3.z );

				if ( object.geometry.hasTangents ) {

					t1 = object.geometry.vertices[ face.a ].tangent;
					t2 = object.geometry.vertices[ face.b ].tangent;
					t3 = object.geometry.vertices[ face.c ].tangent;

					tangentArray.push( t1.x, t1.y, t1.z, t1.w,
									   t2.x, t2.y, t2.z, t2.w,
									   t3.x, t3.y, t3.z, t3.w );

				}

				if ( vertexNormals.length == 3 && needsSmoothNormals ) {


					for ( i = 0; i < 3; i ++ ) {

						normalArray.push( vertexNormals[ i ].x, vertexNormals[ i ].y, vertexNormals[ i ].z );

					}

				} else {

					for ( i = 0; i < 3; i ++ ) {

						normalArray.push( faceNormal.x, faceNormal.y, faceNormal.z );

					}

				}

				if ( uv ) {

					for ( i = 0; i < 3; i ++ ) {

						uvArray.push( uv[ i ].u, uv[ i ].v );

					}

				}

				faceArray.push( vertexIndex, vertexIndex + 1, vertexIndex + 2 );

				// TODO: don't add lines that already exist (faces sharing edge)

				lineArray.push( vertexIndex, vertexIndex + 1,
								vertexIndex, vertexIndex + 2,
								vertexIndex + 1, vertexIndex + 2 );

				vertexIndex += 3;

			} else if ( face instanceof THREE.Face4 ) {

				v1 = object.geometry.vertices[ face.a ].position;
				v2 = object.geometry.vertices[ face.b ].position;
				v3 = object.geometry.vertices[ face.c ].position;
				v4 = object.geometry.vertices[ face.d ].position;

				vertexArray.push( v1.x, v1.y, v1.z,
								  v2.x, v2.y, v2.z,
								  v3.x, v3.y, v3.z,
								  v4.x, v4.y, v4.z );

				if ( object.geometry.hasTangents ) {

					t1 = object.geometry.vertices[ face.a ].tangent;
					t2 = object.geometry.vertices[ face.b ].tangent;
					t3 = object.geometry.vertices[ face.c ].tangent;
					t4 = object.geometry.vertices[ face.d ].tangent;

					tangentArray.push( t1.x, t1.y, t1.z, t1.w,
									   t2.x, t2.y, t2.z, t2.w,
									   t3.x, t3.y, t3.z, t3.w,
									   t4.x, t4.y, t4.z, t4.w );

				}

				if ( vertexNormals.length == 4 && needsSmoothNormals ) {

					for ( i = 0; i < 4; i ++ ) {

						normalArray.push( vertexNormals[ i ].x, vertexNormals[ i ].y, vertexNormals[ i ].z );

					}

				} else {

					for ( i = 0; i < 4; i ++ ) {

						normalArray.push( faceNormal.x, faceNormal.y, faceNormal.z );

					}

				}

				if ( uv ) {

					for ( i = 0; i < 4; i ++ ) {

						uvArray.push( uv[ i ].u, uv[ i ].v );

					}

				}

				faceArray.push( vertexIndex, vertexIndex + 1, vertexIndex + 2,
								vertexIndex, vertexIndex + 2, vertexIndex + 3 );

				// TODO: don't add lines that already exist (faces sharing edge)

				lineArray.push( vertexIndex, vertexIndex + 1,
								vertexIndex, vertexIndex + 2,
								vertexIndex, vertexIndex + 3,
								vertexIndex + 1, vertexIndex + 2,
								vertexIndex + 2, vertexIndex + 3 );

				vertexIndex += 4;

			}

		}

		if ( !vertexArray.length ) {

			return;

		}

		geometryChunk.__webGLVertexBuffer = _gl.createBuffer();
		_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLVertexBuffer );
		_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( vertexArray ), _gl.STATIC_DRAW );

		geometryChunk.__webGLNormalBuffer = _gl.createBuffer();
		_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLNormalBuffer );
		_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( normalArray ), _gl.STATIC_DRAW );

		if ( object.geometry.hasTangents ) {

			geometryChunk.__webGLTangentBuffer = _gl.createBuffer();
			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLTangentBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( tangentArray ), _gl.STATIC_DRAW );

		}

		if ( uvArray.length > 0 ) {

			geometryChunk.__webGLUVBuffer = _gl.createBuffer();
			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLUVBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( uvArray ), _gl.STATIC_DRAW );

		}

		geometryChunk.__webGLFaceBuffer = _gl.createBuffer();
		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryChunk.__webGLFaceBuffer );
		_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( faceArray ), _gl.STATIC_DRAW );

		geometryChunk.__webGLLineBuffer = _gl.createBuffer();
		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryChunk.__webGLLineBuffer );
		_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( lineArray ), _gl.STATIC_DRAW );

		geometryChunk.__webGLFaceCount = faceArray.length;
		geometryChunk.__webGLLineCount = lineArray.length;

	};

	function setMaterialShaders( material, shaders ) {

		material.fragment_shader = shaders.fragment_shader;
		material.vertex_shader = shaders.vertex_shader;
		material.uniforms = Uniforms.clone( shaders.uniforms );

	};

	function refreshUniformsCommon( material, fog ) {
		
		// premultiply alpha
		material.uniforms.color.value.setRGB( material.color.r * material.opacity, material.color.g * material.opacity, material.color.b * material.opacity );
		
		// pure color
		//material.uniforms.color.value.setHex( material.color.hex );
		
		material.uniforms.opacity.value = material.opacity;
		material.uniforms.map.texture = material.map;

		material.uniforms.env_map.texture = material.env_map;
		material.uniforms.reflectivity.value = material.reflectivity;
		material.uniforms.refraction_ratio.value = material.refraction_ratio;
		material.uniforms.combine.value = material.combine;
		material.uniforms.useRefract.value = material.env_map && material.env_map.mapping instanceof THREE.CubeRefractionMapping;

		if ( fog ) {

			material.uniforms.fogColor.value.setHex( fog.color.hex );

			if ( fog instanceof THREE.Fog ) {

				material.uniforms.fogNear.value = fog.near;
				material.uniforms.fogFar.value = fog.far;

			} else if ( fog instanceof THREE.FogExp2 ) {

				material.uniforms.fogDensity.value = fog.density;

			}

		}

	};

	function refreshUniformsLine( material, fog ) {
		
		material.uniforms.color.value.setRGB( material.color.r * material.opacity, material.color.g * material.opacity, material.color.b * material.opacity );		
		material.uniforms.opacity.value = material.opacity;

		if ( fog ) {

			material.uniforms.fogColor.value.setHex( fog.color.hex );

			if ( fog instanceof THREE.Fog ) {

				material.uniforms.fogNear.value = fog.near;
				material.uniforms.fogFar.value = fog.far;

			} else if ( fog instanceof THREE.FogExp2 ) {

				material.uniforms.fogDensity.value = fog.density;

			}

		}

	};
	
	function refreshUniformsPhong( material ) {
		
		//material.uniforms.ambient.value.setHex( material.ambient.hex );
		//material.uniforms.specular.value.setHex( material.specular.hex );
		material.uniforms.ambient.value.setRGB( material.ambient.r, material.ambient.g, material.ambient.b );
		material.uniforms.specular.value.setRGB( material.specular.r, material.specular.g, material.specular.b );
		material.uniforms.shininess.value = material.shininess;
		
	};
	
	
	function refreshLights( material, lights ) {
		
		material.uniforms.enableLighting.value = lights.directional.positions.length + lights.point.positions.length;
		material.uniforms.ambientLightColor.value = lights.ambient;
		material.uniforms.directionalLightColor.value = lights.directional.colors;
		material.uniforms.directionalLightDirection.value = lights.directional.positions;
		material.uniforms.pointLightColor.value = lights.point.colors;
		material.uniforms.pointLightPosition.value = lights.point.positions;
		
	};
	
	this.renderBuffer = function ( camera, lights, fog, material, geometryChunk ) {

		var program, u, identifiers, attributes, parameters, vector_lights, maxLightCount, linewidth, primitives;

		if ( !material.program ) {

			if ( material instanceof THREE.MeshDepthMaterial ) {

				setMaterialShaders( material, THREE.ShaderLib[ 'depth' ] );

				material.uniforms.mNear.value = camera.near;
				material.uniforms.mFar.value = camera.far;

			} else if ( material instanceof THREE.MeshNormalMaterial ) {

				setMaterialShaders( material, THREE.ShaderLib[ 'normal' ] );

			} else if ( material instanceof THREE.MeshBasicMaterial ) {

				setMaterialShaders( material, THREE.ShaderLib[ 'basic' ] );

				refreshUniformsCommon( material, fog );
				
			} else if ( material instanceof THREE.MeshLambertMaterial ) {
				
				setMaterialShaders( material, THREE.ShaderLib[ 'lambert' ] );
				
				refreshUniformsCommon( material, fog );
				
			} else if ( material instanceof THREE.MeshPhongMaterial ) {
				
				setMaterialShaders( material, THREE.ShaderLib[ 'phong' ] );
				
				refreshUniformsCommon( material, fog );
				
			} else if ( material instanceof THREE.LineBasicMaterial ) {
				
				setMaterialShaders( material, THREE.ShaderLib[ 'basic' ] );

				refreshUniformsLine( material, fog );
				
			}

			// heuristics to create shader parameters according to lights in the scene
			// (not to blow over maxLights budget)

			maxLightCount = allocateLights( lights, 4 );

			parameters = { fog: fog, map: material.map, env_map: material.env_map, maxDirLights: maxLightCount.directional, maxPointLights: maxLightCount.point };
			material.program = buildProgram( material.fragment_shader, material.vertex_shader, parameters );

			identifiers = [ 'viewMatrix', 'modelViewMatrix', 'projectionMatrix', 'normalMatrix', 'objectMatrix', 'cameraPosition' ];
			for( u in material.uniforms ) {

				identifiers.push(u);

			}

			cacheUniformLocations( material.program, identifiers );
			cacheAttributeLocations( material.program, [ "position", "normal", "uv", "tangent" ] );

		}

		program = material.program;

		if( program != _oldProgram ) {

			_gl.useProgram( program );
			_oldProgram = program;

		}

		this.loadCamera( program, camera );
		this.loadMatrices( program );

		if ( material instanceof THREE.MeshPhongMaterial || 
			 material instanceof THREE.MeshLambertMaterial ) {

			vector_lights = this.setupLights( program, lights );
			refreshLights( material, vector_lights );

		}

		if ( material instanceof THREE.MeshBasicMaterial ||
			 material instanceof THREE.MeshLambertMaterial ||
			 material instanceof THREE.MeshPhongMaterial ) {
			
			refreshUniformsCommon( material, fog );

		}
		
		if ( material instanceof THREE.LineBasicMaterial ) {
			
			refreshUniformsLine( material, fog );
		}
		
		if ( material instanceof THREE.MeshPhongMaterial ) {
			
			refreshUniformsPhong( material );

		}

		setUniforms( program, material.uniforms );

		attributes = program.attributes;

		// vertices

		_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLVertexBuffer );
		_gl.vertexAttribPointer( attributes.position, 3, _gl.FLOAT, false, 0, 0 );
		_gl.enableVertexAttribArray( attributes.position );

		// normals

		if ( attributes.normal >= 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLNormalBuffer );
			_gl.vertexAttribPointer( attributes.normal, 3, _gl.FLOAT, false, 0, 0 );
			_gl.enableVertexAttribArray( attributes.normal );

		}

		// tangents

		if ( attributes.tangent >= 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLTangentBuffer );
			_gl.vertexAttribPointer( attributes.tangent, 4, _gl.FLOAT, false, 0, 0 );
			_gl.enableVertexAttribArray( attributes.tangent );

		}

		// uvs

		if ( attributes.uv >= 0 ) {

			if ( geometryChunk.__webGLUVBuffer ) {

				_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryChunk.__webGLUVBuffer );
				_gl.vertexAttribPointer( attributes.uv, 2, _gl.FLOAT, false, 0, 0 );

				_gl.enableVertexAttribArray( attributes.uv );

			} else {

				_gl.disableVertexAttribArray( attributes.uv );

			}

		}

		// render lines

		if ( material.wireframe || material instanceof THREE.LineBasicMaterial ) {

			linewidth = material.wireframe_linewidth !== undefined ? material.wireframe_linewidth : 
					    material.linewidth !== undefined ? material.linewidth : 1;
			
			primitives = material instanceof THREE.LineBasicMaterial && geometryChunk.type == THREE.LineStrip ? _gl.LINE_STRIP : _gl.LINES;
			
			_gl.lineWidth( linewidth );
			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryChunk.__webGLLineBuffer );
			_gl.drawElements( primitives, geometryChunk.__webGLLineCount, _gl.UNSIGNED_SHORT, 0 );

		// render triangles

		} else {

			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryChunk.__webGLFaceBuffer );
			_gl.drawElements( _gl.TRIANGLES, geometryChunk.__webGLFaceCount, _gl.UNSIGNED_SHORT, 0 );

		}

	};

	this.renderPass = function ( camera, lights, fog, object, geometryChunk, blending, transparent ) {

		var i, l, m, ml, material, meshMaterial;

		for ( m = 0, ml = object.materials.length; m < ml; m++ ) {

			meshMaterial = object.materials[ m ];

			if ( meshMaterial instanceof THREE.MeshFaceMaterial ) {

				for ( i = 0, l = geometryChunk.materials.length; i < l; i++ ) {

					material = geometryChunk.materials[ i ];

					if ( material && material.blending == blending && ( material.opacity < 1.0 == transparent ) ) {

						this.setBlending( material.blending );
						this.renderBuffer( camera, lights, fog, material, geometryChunk );

					}

				}

			} else {

				material = meshMaterial;
				if ( material && material.blending == blending && ( material.opacity < 1.0 == transparent ) ) {

					this.setBlending( material.blending );
					this.renderBuffer( camera, lights, fog, material, geometryChunk );

				}

			}

		}

	};

	this.render = function( scene, camera, renderTarget ) {

		var o, ol, webGLObject, object, buffer,
			lights = scene.lights,
			fog = scene.fog;

		this.initWebGLObjects( scene );

		setRenderTarget( renderTarget );

		if ( this.autoClear ) {

			this.clear();

		}

		camera.autoUpdateMatrix && camera.updateMatrix();

		_viewMatrixArray.set( camera.matrix.flatten() );
		_projectionMatrixArray.set( camera.projectionMatrix.flatten() );
		
		// opaque pass

		for ( o = 0, ol = scene.__webGLObjects.length; o < ol; o++ ) {

			webGLObject = scene.__webGLObjects[ o ];

			object = webGLObject.object;
			buffer = webGLObject.buffer;

			if ( object.visible ) {

				this.setupMatrices( object, camera );
				this.renderPass( camera, lights, fog, object, buffer, THREE.NormalBlending, false );

			}

		}

		// transparent pass

		for ( o = 0, ol = scene.__webGLObjects.length; o < ol; o++ ) {

			webGLObject = scene.__webGLObjects[ o ];

			object = webGLObject.object;
			buffer = webGLObject.buffer;

			if ( object.visible ) {

				this.setupMatrices( object, camera );

				// opaque blended materials

				this.renderPass( camera, lights, fog, object, buffer, THREE.AdditiveBlending, false );
				this.renderPass( camera, lights, fog, object, buffer, THREE.SubtractiveBlending, false );

				// transparent blended materials

				this.renderPass( camera, lights, fog, object, buffer, THREE.AdditiveBlending, true );
				this.renderPass( camera, lights, fog, object, buffer, THREE.SubtractiveBlending, true );

				// transparent normal materials

				this.renderPass( camera, lights, fog, object, buffer, THREE.NormalBlending, true );

			}

		}

	};

	this.initWebGLObjects = function( scene ) {

		function add_buffer( objmap, id, buffer, object ) {
			
			if ( objmap[ id ] == undefined ) {

				scene.__webGLObjects.push( { buffer: buffer, object: object } );
				objmap[ id ] = 1;

			}
			
		};
		
		var o, ol, object, g, geometryChunk, objmap;

		if ( !scene.__webGLObjects ) {

			scene.__webGLObjects = [];
			scene.__webGLObjectsMap = {};

		}
		
		for ( o = 0, ol = scene.objects.length; o < ol; o++ ) {

			object = scene.objects[ o ];

			if ( scene.__webGLObjectsMap[ object.id ] == undefined ) {

				scene.__webGLObjectsMap[ object.id ] = {};

			}

			objmap = scene.__webGLObjectsMap[ object.id ];
			
			if ( object instanceof THREE.Mesh ) {
				
				// create separate VBOs per geometry chunk

				for ( g in object.geometry.geometryChunks ) {

					geometryChunk = object.geometry.geometryChunks[ g ];

					// initialise VBO on the first access

					if( ! geometryChunk.__webGLVertexBuffer ) {

						this.createBuffers( object, g );

					}

					// create separate wrapper per each use of VBO

					add_buffer( objmap, g, geometryChunk, object );

				}

			} else if ( object instanceof THREE.Line ) {
				
				
				if( ! object.__webGLVertexBuffer ) {
				
					this.createLineBuffers( object );
					
				}
				
				add_buffer( objmap, 0, object, object );
				

			} else if ( object instanceof THREE.ParticleSystem ) {

				if( ! object.__webGLVertexBuffer ) {
				
					this.createParticleBuffers( object );
					
				}
				
				add_buffer( objmap, 0, object, object );
				
				
			}/*else if ( object instanceof THREE.Particle ) {

			}*/

		}

	};

	this.removeObject = function ( scene, object ) {

		var o, ol, zobject;

		for ( o = scene.__webGLObjects.length - 1; o >= 0; o-- ) {

			zobject = scene.__webGLObjects[ o ].object;

			if ( object == zobject ) {

				scene.__webGLObjects.splice( o, 1 );

			}

		}

	};

	this.setupMatrices = function ( object, camera ) {

		object.autoUpdateMatrix && object.updateMatrix();

		_modelViewMatrix.multiply( camera.matrix, object.matrix );
		_modelViewMatrixArray.set( _modelViewMatrix.flatten() );

		_normalMatrix = THREE.Matrix4.makeInvert3x3( _modelViewMatrix ).transpose();
		_normalMatrixArray.set( _normalMatrix.m );

		_objectMatrixArray.set( object.matrix.flatten() );

	};

	this.loadMatrices = function ( program ) {

		_gl.uniformMatrix4fv( program.uniforms.viewMatrix, false, _viewMatrixArray );
		_gl.uniformMatrix4fv( program.uniforms.modelViewMatrix, false, _modelViewMatrixArray );
		_gl.uniformMatrix4fv( program.uniforms.projectionMatrix, false, _projectionMatrixArray );
		_gl.uniformMatrix3fv( program.uniforms.normalMatrix, false, _normalMatrixArray );
		_gl.uniformMatrix4fv( program.uniforms.objectMatrix, false, _objectMatrixArray );

	};

	this.loadCamera = function( program, camera ) {

		_gl.uniform3f( program.uniforms.cameraPosition, camera.position.x, camera.position.y, camera.position.z );

	};

	this.setBlending = function( blending ) {

		switch ( blending ) {

			case THREE.AdditiveBlending:

				_gl.blendEquation( _gl.FUNC_ADD );
				_gl.blendFunc( _gl.ONE, _gl.ONE );

				break;

			case THREE.SubtractiveBlending:

				//_gl.blendEquation( _gl.FUNC_SUBTRACT );
				_gl.blendFunc( _gl.DST_COLOR, _gl.ZERO );

				break;

			default:

				_gl.blendEquation( _gl.FUNC_ADD );
				_gl.blendFunc( _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA );

				break;
		}

	};

	this.setFaceCulling = function ( cullFace, frontFace ) {

		if ( cullFace ) {

			if ( !frontFace || frontFace == "ccw" ) {

				_gl.frontFace( _gl.CCW );

			} else {

				_gl.frontFace( _gl.CW );

			}

			if( cullFace == "back" ) {

				_gl.cullFace( _gl.BACK );

			} else if( cullFace == "front" ) {

				_gl.cullFace( _gl.FRONT );

			} else {

				_gl.cullFace( _gl.FRONT_AND_BACK );

			}

			_gl.enable( _gl.CULL_FACE );

		} else {

			_gl.disable( _gl.CULL_FACE );

		}

	};

	this.supportsVertexTextures = function() {

		return maxVertexTextures() > 0;

	};

	function maxVertexTextures() {

		return _gl.getParameter( _gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );

	};

	function initGL( antialias, clearColor, clearAlpha ) {

		try {

			_gl = _canvas.getContext( 'experimental-webgl', { antialias: antialias } );

		} catch(e) { }

		if (!_gl) {

			alert("WebGL not supported");
			throw "cannot create webgl context";

		}

		_gl.clearColor( 0, 0, 0, 1 );
		_gl.clearDepth( 1 );

		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthFunc( _gl.LEQUAL );

		_gl.frontFace( _gl.CCW );
		_gl.cullFace( _gl.BACK );
		_gl.enable( _gl.CULL_FACE );

		_gl.enable( _gl.BLEND );
		_gl.blendFunc( _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA );
		_gl.clearColor( clearColor.r, clearColor.g, clearColor.b, clearAlpha );

	};
	
	function buildProgram( fragment_shader, vertex_shader, parameters ) {

		var program = _gl.createProgram(),

		prefix_fragment = [
			"#ifdef GL_ES",
			"precision highp float;",
			"#endif",
		
			"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
			"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,

			parameters.fog ? "#define USE_FOG" : "",
			parameters.fog instanceof THREE.FogExp2 ? "#define FOG_EXP2" : "",

			parameters.map ? "#define USE_MAP" : "",
			parameters.env_map ? "#define USE_ENVMAP" : "",

			"uniform mat4 viewMatrix;",
			"uniform vec3 cameraPosition;",
			""
		].join("\n"),

		prefix_vertex = [
			maxVertexTextures() > 0 ? "#define VERTEX_TEXTURES" : "",

			"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
			"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,

			parameters.map ? "#define USE_MAP" : "",
			parameters.env_map ? "#define USE_ENVMAP" : "",

			"uniform mat4 objectMatrix;",
			"uniform mat4 modelViewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform mat4 viewMatrix;",
			"uniform mat3 normalMatrix;",
			"uniform vec3 cameraPosition;",
			"attribute vec3 position;",
			"attribute vec3 normal;",
			"attribute vec2 uv;",
			""
		].join("\n");

		_gl.attachShader( program, getShader( "fragment", prefix_fragment + fragment_shader ) );
		_gl.attachShader( program, getShader( "vertex", prefix_vertex + vertex_shader ) );

		_gl.linkProgram( program );

		if ( !_gl.getProgramParameter( program, _gl.LINK_STATUS ) ) {

			alert( "Could not initialise shaders\n"+
					"VALIDATE_STATUS: " + _gl.getProgramParameter( program, _gl.VALIDATE_STATUS ) + ", gl error [" + _gl.getError() + "]" );
			
			//console.log( prefix_fragment + fragment_shader );
			//console.log( prefix_vertex + vertex_shader );

		}

		program.uniforms = {};
		program.attributes = {};

		return program;

	};

	function setUniforms( program, uniforms ) {

		var u, value, type, location, texture;

		for( u in uniforms ) {

			location = program.uniforms[u];
			if ( !location ) continue;
			
			type = uniforms[u].type;
			value = uniforms[u].value;
			
			if( type == "i" ) {

				_gl.uniform1i( location, value );

			} else if( type == "f" ) {

				_gl.uniform1f( location, value );

			} else if( type == "fv" ) {

				_gl.uniform3fv( location, value );

			} else if( type == "v2" ) {

				_gl.uniform2f( location, value.x, value.y );

			} else if( type == "v3" ) {

				_gl.uniform3f( location, value.x, value.y, value.z );

			} else if( type == "c" ) {

				_gl.uniform3f( location, value.r, value.g, value.b );

			} else if( type == "t" ) {

				_gl.uniform1i( location, value );

				texture = uniforms[u].texture;

				if ( !texture ) continue;

				if ( texture.image instanceof Array && texture.image.length == 6 ) {

					setCubeTexture( texture, value );

				} else {

					setTexture( texture, value );

				}

			}

		}

	};

	function setCubeTexture( texture, slot ) {

		if ( texture.image.length == 6 ) {

			if ( !texture.image.__webGLTextureCube &&
				 !texture.image.__cubeMapInitialized && texture.image.loadCount == 6 ) {

				texture.image.__webGLTextureCube = _gl.createTexture();

				_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, texture.image.__webGLTextureCube );

				_gl.texParameteri( _gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
				_gl.texParameteri( _gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );

				_gl.texParameteri( _gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR );
				_gl.texParameteri( _gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_LINEAR );

				for ( var i = 0; i < 6; ++i ) {

					_gl.texImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, texture.image[ i ] );

				}

				_gl.generateMipmap( _gl.TEXTURE_CUBE_MAP );

				_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, null );

				texture.image.__cubeMapInitialized = true;

			}

			_gl.activeTexture( _gl.TEXTURE0 + slot );
			_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, texture.image.__webGLTextureCube );

		}

	};

	function setTexture( texture, slot ) {

		if ( !texture.__webGLTexture && texture.image.loaded ) {

			texture.__webGLTexture = _gl.createTexture();
			_gl.bindTexture( _gl.TEXTURE_2D, texture.__webGLTexture );
			_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, texture.image );

			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, paramThreeToGL( texture.wrap_s ) );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, paramThreeToGL( texture.wrap_t ) );

			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, paramThreeToGL( texture.mag_filter ) );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, paramThreeToGL( texture.min_filter ) );
			_gl.generateMipmap( _gl.TEXTURE_2D );
			_gl.bindTexture( _gl.TEXTURE_2D, null );

		}

		_gl.activeTexture( _gl.TEXTURE0 + slot );
		_gl.bindTexture( _gl.TEXTURE_2D, texture.__webGLTexture );

	};

	function setRenderTarget( renderTexture ) {

		var framebuffer;

		if ( renderTexture && !renderTexture.__webGLFramebuffer ) {
			renderTexture.__webGLFramebuffer = _gl.createFramebuffer();
			renderTexture.__webGLRenderbuffer = _gl.createRenderbuffer();
			renderTexture.__webGLTexture = _gl.createTexture();

			// Setup renderbuffer
			_gl.bindRenderbuffer( _gl.RENDERBUFFER, renderTexture.__webGLRenderbuffer );
			_gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.DEPTH_COMPONENT16, renderTexture.width, renderTexture.height );

			// Setup texture
			_gl.bindTexture( _gl.TEXTURE_2D, renderTexture.__webGLTexture );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, paramThreeToGL( renderTexture.wrap_s ) );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, paramThreeToGL( renderTexture.wrap_t ) );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, paramThreeToGL( renderTexture.mag_filter ) );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, paramThreeToGL( renderTexture.min_filter ) );
			_gl.generateMipmap(_gl.TEXTURE_2D);
			_gl.texImage2D( _gl.TEXTURE_2D, 0, paramThreeToGL( renderTexture.format ), renderTexture.width, renderTexture.height, 0, paramThreeToGL( renderTexture.format ), paramThreeToGL( renderTexture.type ), null);

			// Setup framebuffer
			_gl.bindFramebuffer( _gl.FRAMEBUFFER, renderTexture.__webGLFramebuffer );
			_gl.framebufferTexture2D( _gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_2D, renderTexture.__webGLTexture, 0 );
			_gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.RENDERBUFFER, renderTexture.__webGLRenderbuffer);

			// Release everything
			_gl.bindTexture( _gl.TEXTURE_2D, null );
			_gl.bindRenderbuffer( _gl.RENDERBUFFER, null );
			_gl.bindFramebuffer( _gl.FRAMEBUFFER, null);
		}

		framebuffer = renderTexture ? renderTexture.__webGLFramebuffer : null;
		_gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );

	}

	function cacheUniformLocations( program, identifiers ) {

		var i, l, id;

		for( i = 0, l = identifiers.length; i < l; i++ ) {

			id = identifiers[ i ];
			program.uniforms[ id ] = _gl.getUniformLocation( program, id );

		}

	};

	function cacheAttributeLocations( program, identifiers ) {

		var i, l, id;

		for( i = 0, l = identifiers.length; i < l; i++ ) {

			id = identifiers[ i ];
			program.attributes[ id ] = _gl.getAttribLocation( program, id );

		}

	};

	function getShader( type, string ) {

		var shader;

		if ( type == "fragment" ) {

			shader = _gl.createShader( _gl.FRAGMENT_SHADER );

		} else if ( type == "vertex" ) {

			shader = _gl.createShader( _gl.VERTEX_SHADER );

		}

		_gl.shaderSource( shader, string );
		_gl.compileShader( shader );

		if ( !_gl.getShaderParameter( shader, _gl.COMPILE_STATUS ) ) {

			alert( _gl.getShaderInfoLog( shader ) );
			return null;

		}

		return shader;

	};

	function paramThreeToGL( p ) {

		switch ( p ) {

			case THREE.RepeatWrapping: return _gl.REPEAT; break;
			case THREE.ClampToEdgeWrapping: return _gl.CLAMP_TO_EDGE; break;
			case THREE.MirroredRepeatWrapping: return _gl.MIRRORED_REPEAT; break;

			case THREE.NearestFilter: return _gl.NEAREST; break;
			case THREE.NearestMipMapNearestFilter: return _gl.NEAREST_MIPMAP_NEAREST; break;
			case THREE.NearestMipMapLinearFilter: return _gl.NEAREST_MIPMAP_LINEAR; break;

			case THREE.LinearFilter: return _gl.LINEAR; break;
			case THREE.LinearMipMapNearestFilter: return _gl.LINEAR_MIPMAP_NEAREST; break;
			case THREE.LinearMipMapLinearFilter: return _gl.LINEAR_MIPMAP_LINEAR; break;

			case THREE.RGBFormat: return _gl.RGB; break;

			case THREE.UnsignedByteType: return _gl.UNSIGNED_BYTE; break;

		}

		return 0;

	};

	function materialNeedsSmoothNormals( material ) {

		return material && material.shading != undefined && material.shading == THREE.SmoothShading;

	};

	function bufferNeedsSmoothNormals( geometryChunk, object ) {

		var m, ml, i, l, meshMaterial, needsSmoothNormals = false;

		for ( m = 0, ml = object.materials.length; m < ml; m++ ) {

			meshMaterial = object.materials[ m ];

			if ( meshMaterial instanceof THREE.MeshFaceMaterial ) {

				for ( i = 0, l = geometryChunk.materials.length; i < l; i++ ) {

					if ( materialNeedsSmoothNormals( geometryChunk.materials[ i ] ) ) {

						needsSmoothNormals = true;
						break;

					}

				}

			} else {

				if ( materialNeedsSmoothNormals( meshMaterial ) ) {

					needsSmoothNormals = true;
					break;

				}

			}

			if ( needsSmoothNormals ) break;

		}

		return needsSmoothNormals;

	};

	function allocateLights( lights, maxLights ) {

		var l, ll, light, dirLights, pointLights, maxDirLights, maxPointLights;
		dirLights = pointLights = maxDirLights = maxPointLights = 0;

		for ( l = 0, ll = lights.length; l < ll; l++ ) {

			light = lights[ l ];

			if ( light instanceof THREE.DirectionalLight ) dirLights++;
			if ( light instanceof THREE.PointLight ) pointLights++;

		}

		if ( ( pointLights + dirLights ) <= maxLights ) {

			maxDirLights = dirLights;
			maxPointLights = pointLights;

		} else {

			maxDirLights = Math.ceil( maxLights * dirLights / ( pointLights + dirLights ) );
			maxPointLights = maxLights - maxDirLights;

		}

		return { 'directional' : maxDirLights, 'point' : maxPointLights };

	};

	/* DEBUG
	function getGLParams() {

		var params  = {

			'MAX_VARYING_VECTORS': _gl.getParameter( _gl.MAX_VARYING_VECTORS ),
			'MAX_VERTEX_ATTRIBS': _gl.getParameter( _gl.MAX_VERTEX_ATTRIBS ),

			'MAX_TEXTURE_IMAGE_UNITS': _gl.getParameter( _gl.MAX_TEXTURE_IMAGE_UNITS ),
			'MAX_VERTEX_TEXTURE_IMAGE_UNITS': _gl.getParameter( _gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ),
			'MAX_COMBINED_TEXTURE_IMAGE_UNITS' : _gl.getParameter( _gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS ),

			'MAX_VERTEX_UNIFORM_VECTORS': _gl.getParameter( _gl.MAX_VERTEX_UNIFORM_VECTORS ),
			'MAX_FRAGMENT_UNIFORM_VECTORS': _gl.getParameter( _gl.MAX_FRAGMENT_UNIFORM_VECTORS )
		}

		return params;
	};

	function dumpObject( obj ) {

		var p, str = "";
		for ( p in obj ) {

			str += p + ": " + obj[p] + "\n";

		}

		return str;
	}
	*/

};

THREE.Snippets = {
	
	fog_pars_fragment: [

	"#ifdef USE_FOG",

		"uniform vec3 fogColor;",

		"#ifdef FOG_EXP2",
			"uniform float fogDensity;",
		"#else",
			"uniform float fogNear;",
			"uniform float fogFar;",
		"#endif",

	"#endif"

	].join("\n"),

	fog_fragment: [

	"#ifdef USE_FOG",

		"float depth = gl_FragCoord.z / gl_FragCoord.w;",

		"#ifdef FOG_EXP2",
			"const float LOG2 = 1.442695;",
			"float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );",
			"fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );",
		"#else",
			"float fogFactor = smoothstep( fogNear, fogFar, depth );",
		"#endif",

		"gl_FragColor = mix( gl_FragColor, vec4( fogColor, 1.0 ), fogFactor );",

	"#endif"
	
	].join("\n"),
	
	envmap_pars_fragment: [
	
	"#ifdef USE_ENVMAP",
	
		"varying vec3 vReflect;",
		"uniform float reflectivity;",
		"uniform samplerCube env_map;",
		"uniform int combine;",
	
	"#endif"
	
	].join("\n"),
	
	envmap_fragment: [
	
	"#ifdef USE_ENVMAP",

		"cubeColor = textureCube( env_map, vec3( -vReflect.x, vReflect.yz ) );",
		
		"if ( combine == 1 ) {",

			"gl_FragColor = mix( gl_FragColor, cubeColor, reflectivity );",

		"} else {",

			"gl_FragColor = gl_FragColor * cubeColor;",

		"}",	

	"#endif"
	
	].join("\n"),
	
	envmap_pars_vertex: [
	
	"#ifdef USE_ENVMAP",
	
		"varying vec3 vReflect;",
		"uniform float refraction_ratio;",
		"uniform bool useRefract;",
		
	"#endif"
	
	].join("\n"),

	envmap_vertex : [
	
	"#ifdef USE_ENVMAP",
	
		"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",
		"vec3 nWorld = mat3( objectMatrix[0].xyz, objectMatrix[1].xyz, objectMatrix[2].xyz ) * normal;",
	
		"if ( useRefract ) {",

			"vReflect = refract( normalize( mPosition.xyz - cameraPosition ), normalize( nWorld.xyz ), refraction_ratio );",

		"} else {",

			"vReflect = reflect( normalize( mPosition.xyz - cameraPosition ), normalize( nWorld.xyz ) );",

		"}",

	"#endif"
	
	].join("\n"),
	
	map_pars_fragment: [
	
	"#ifdef USE_MAP",
		
		"varying vec2 vUv;",
		"uniform sampler2D map;",
		  
	"#endif"
	
	].join("\n"),
	
	map_pars_vertex: [
	
	"#ifdef USE_MAP",
	
		"varying vec2 vUv;",

	"#endif"
	
	].join("\n"),
	
	map_fragment: [

	"#ifdef USE_MAP",

		"mapColor = texture2D( map, vUv );",

	"#endif"
	
	].join("\n"),
	
	map_vertex: [
	
	"#ifdef USE_MAP",
	
		"vUv = uv;",
		
	"#endif"
	
	].join("\n"),
	
	lights_pars_vertex: [
	
	"uniform bool enableLighting;",
	"uniform vec3 ambientLightColor;",
	
	"#if MAX_DIR_LIGHTS > 0",
	
		"uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
		"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
		
	"#endif",

	"#if MAX_POINT_LIGHTS > 0",
	
		"uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];",
		"uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
		
		"#ifdef PHONG",
			"varying vec3 vPointLightVector[ MAX_POINT_LIGHTS ];",
		"#endif",
		
	"#endif"
	
	].join("\n"),
	
	lights_vertex: [
	
	"if ( !enableLighting ) {",

		"vLightWeighting = vec3( 1.0 );",

	"} else {",

		"vLightWeighting = ambientLightColor;",

		"#if MAX_DIR_LIGHTS > 0",
		
		"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",
		
			"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
			"float directionalLightWeighting = max( dot( transformedNormal, normalize( lDirection.xyz ) ), 0.0 );",
			"vLightWeighting += directionalLightColor[ i ] * directionalLightWeighting;",
			
		"}",
		
		"#endif",

		"#if MAX_POINT_LIGHTS > 0",
		
		"for( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {",
		
			"vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",
			"vec3 pointLightVector = normalize( lPosition.xyz - mvPosition.xyz );",
			"float pointLightWeighting = max( dot( transformedNormal, pointLightVector ), 0.0 );",
			"vLightWeighting += pointLightColor[ i ] * pointLightWeighting;",
			
			"#ifdef PHONG",
				"vPointLightVector[ i ] = pointLightVector;",
			"#endif",
			
		"}",
		
		"#endif",
		
	"}"
	
	].join("\n"),
	
	lights_pars_fragment: [
	
	"#if MAX_DIR_LIGHTS > 0",
		"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
	"#endif",
	
	"#if MAX_POINT_LIGHTS > 0",
		"varying vec3 vPointLightVector[ MAX_POINT_LIGHTS ];",
	"#endif",
	
	"varying vec3 vViewPosition;",
	"varying vec3 vNormal;"
	
	].join("\n"),
	
	lights_fragment: [
	
	"vec3 normal = normalize( vNormal );",
	"vec3 viewPosition = normalize( vViewPosition );",
	
	"vec4 mSpecular = vec4( specular, opacity );",

	"#if MAX_POINT_LIGHTS > 0",
		
		"vec4 pointDiffuse  = vec4( 0.0 );",
		"vec4 pointSpecular = vec4( 0.0 );",

		"for( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {",

			"vec3 pointVector = normalize( vPointLightVector[ i ] );",
			"vec3 pointHalfVector = normalize( vPointLightVector[ i ] + vViewPosition );",

			"float pointDotNormalHalf = dot( normal, pointHalfVector );",
			"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",

			"float pointSpecularWeight = 0.0;",
			"if ( pointDotNormalHalf >= 0.0 )",
				"pointSpecularWeight = pow( pointDotNormalHalf, shininess );",

			"pointDiffuse  += mColor * pointDiffuseWeight;",
			"pointSpecular += mSpecular * pointSpecularWeight;",

			"}",

	"#endif",
	
	"#if MAX_DIR_LIGHTS > 0",
	
		"vec4 dirDiffuse  = vec4( 0.0 );",
		"vec4 dirSpecular = vec4( 0.0 );" ,

		"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",

			"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",

			"vec3 dirVector = normalize( lDirection.xyz );",
			"vec3 dirHalfVector = normalize( lDirection.xyz + vViewPosition );",

			"float dirDotNormalHalf = dot( normal, dirHalfVector );",

			"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",

			"float dirSpecularWeight = 0.0;",
			"if ( dirDotNormalHalf >= 0.0 )",
				"dirSpecularWeight = pow( dirDotNormalHalf, shininess );",

			"dirDiffuse  += mColor * dirDiffuseWeight;",
			"dirSpecular += mSpecular * dirSpecularWeight;",

		"}",
	
	"#endif",

	"vec4 totalLight = vec4( ambient, opacity );",

	"#if MAX_DIR_LIGHTS > 0",
		"totalLight += dirDiffuse + dirSpecular;",
	"#endif",
	
	"#if MAX_POINT_LIGHTS > 0",
		"totalLight += pointDiffuse + pointSpecular;",
	"#endif"

	].join("\n")

};

THREE.UniformsLib = {
	
	common: {
		
	"color"   : { type: "c", value: new THREE.Color( 0xeeeeee ) },
	"opacity" : { type: "f", value: 1 },
	"map"     : { type: "t", value: 0, texture: null },
	
	"env_map" 		  : { type: "t", value: 1, texture: null },
	"useRefract"	  : { type: "i", value: 0 },
	"reflectivity"    : { type: "f", value: 1 },
	"refraction_ratio": { type: "f", value: 0.98 },
	"combine"		  : { type: "i", value: 0 },
	
	"fogDensity": { type: "f", value: 0.00025 },
	"fogNear"	: { type: "f", value: 1 },
	"fogFar"	: { type: "f", value: 2000 },
	"fogColor"	: { type: "c", value: new THREE.Color( 0xffffff ) }
	
	},
	
	lights: {
		
	"enableLighting" 			: { type: "i", value: 1 },
	"ambientLightColor" 		: { type: "fv", value: [] },
	"directionalLightDirection" : { type: "fv", value: [] },
	"directionalLightColor" 	: { type: "fv", value: [] },
	"pointLightPosition"		: { type: "fv", value: [] },
	"pointLightColor"			: { type: "fv", value: [] }
	
	}
	
};

THREE.ShaderLib = {

	'depth': {

		uniforms: { "mNear": { type: "f", value: 1.0 },
					"mFar" : { type: "f", value: 2000.0 } },

		fragment_shader: [

			"uniform float mNear;",
			"uniform float mFar;",

			"void main() {",

				"float depth = gl_FragCoord.z / gl_FragCoord.w;",
				"float color = 1.0 - smoothstep( mNear, mFar, depth );",
				"gl_FragColor = vec4( vec3( color ), 1.0 );",

			"}"

		].join("\n"),

		vertex_shader: [

			"void main() {",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n")

	},

	'normal': {

		uniforms: { },

		fragment_shader: [

			"varying vec3 vNormal;",

			"void main() {",

				"gl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, 1.0 );",

			"}"

		].join("\n"),

		vertex_shader: [

			"varying vec3 vNormal;",

			"void main() {",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vNormal = normalize( normalMatrix * normal );",

				"gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n")

	},

	'basic': {
		
		uniforms: THREE.UniformsLib[ "common" ],
		
		fragment_shader: [

			"uniform vec3 color;",
			"uniform float opacity;",
			
			THREE.Snippets[ "map_pars_fragment" ],
			THREE.Snippets[ "envmap_pars_fragment" ],
			THREE.Snippets[ "fog_pars_fragment" ],
				
			"void main() {",

				"vec4 mColor = vec4( color, opacity );",
				"vec4 mapColor = vec4( 1.0 );",
				"vec4 cubeColor = vec4( 1.0 );",

				THREE.Snippets[ "map_fragment" ],
				
				"gl_FragColor = mColor * mapColor;",
				
				THREE.Snippets[ "envmap_fragment" ],
				THREE.Snippets[ "fog_fragment" ],
				
			"}"

		].join("\n"),
		
		vertex_shader: [
			
			THREE.Snippets[ "map_pars_vertex" ],
			THREE.Snippets[ "envmap_pars_vertex" ],
			
			"void main() {",
		
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				
				THREE.Snippets[ "map_vertex" ],
				THREE.Snippets[ "envmap_vertex" ],
				
				"gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n")
		
	},

	'lambert': {
		
		uniforms: Uniforms.merge( [ THREE.UniformsLib[ "common" ], 
									THREE.UniformsLib[ "lights" ] ] ),
		
		fragment_shader: [
			
			"uniform vec3 color;",
			"uniform float opacity;",
			
			"varying vec3 vLightWeighting;",
				
			THREE.Snippets[ "map_pars_fragment" ],
			THREE.Snippets[ "envmap_pars_fragment" ],
			THREE.Snippets[ "fog_pars_fragment" ],
				
			"void main() {",
					
				"vec4 mColor = vec4( color, opacity );",
				"vec4 mapColor = vec4( 1.0 );",
				"vec4 cubeColor = vec4( 1.0 );",

				THREE.Snippets[ "map_fragment" ],

				"gl_FragColor =  mColor * mapColor * vec4( vLightWeighting, 1.0 );",
				
				THREE.Snippets[ "envmap_fragment" ],
				THREE.Snippets[ "fog_fragment" ],

			"}"

		].join("\n"),

		vertex_shader: [
		
			"varying vec3 vLightWeighting;",
			
			THREE.Snippets[ "map_pars_vertex" ],
			THREE.Snippets[ "envmap_pars_vertex" ],
			THREE.Snippets[ "lights_pars_vertex" ],
			
			"void main() {",
		
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				
				THREE.Snippets[ "map_vertex" ],
				THREE.Snippets[ "envmap_vertex" ],
				
				"vec3 transformedNormal = normalize( normalMatrix * normal );",
				
				THREE.Snippets[ "lights_vertex" ],
				
				"gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n")
		
	},
	
	'phong': {
		
		uniforms: Uniforms.merge( [ THREE.UniformsLib[ "common" ], 
									THREE.UniformsLib[ "lights" ],
									
								    { "ambient"  : { type: "c", value: new THREE.Color( 0x050505 ) },
									  "specular" : { type: "c", value: new THREE.Color( 0x111111 ) },
									  "shininess": { type: "f", value: 30 }
									}
									
								] ),
		
		fragment_shader: [
			
			"uniform vec3 color;",
			"uniform float opacity;",
			
			"uniform vec3 ambient;",
			"uniform vec3 specular;",
			"uniform float shininess;",
				
			"varying vec3 vLightWeighting;",
				
			THREE.Snippets[ "map_pars_fragment" ],
			THREE.Snippets[ "envmap_pars_fragment" ],
			THREE.Snippets[ "fog_pars_fragment" ],
			THREE.Snippets[ "lights_pars_fragment" ],
				
			"void main() {",
					
				"vec4 mColor = vec4( color, opacity );",
				"vec4 mapColor = vec4( 1.0 );",
				"vec4 cubeColor = vec4( 1.0 );",

				THREE.Snippets[ "map_fragment" ],
				THREE.Snippets[ "lights_fragment" ],

				"gl_FragColor =  mapColor * totalLight * vec4( vLightWeighting, 1.0 );",
				
				THREE.Snippets[ "envmap_fragment" ],
				THREE.Snippets[ "fog_fragment" ],

			"}"

		].join("\n"),

		vertex_shader: [
		
			"#define PHONG",
			
			"varying vec3 vLightWeighting;",
			"varying vec3 vViewPosition;",
			"varying vec3 vNormal;",
			
			THREE.Snippets[ "map_pars_vertex" ],
			THREE.Snippets[ "envmap_pars_vertex" ],
			THREE.Snippets[ "lights_pars_vertex" ],
			
			"void main() {",
		
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				
				THREE.Snippets[ "map_vertex" ],
				THREE.Snippets[ "envmap_vertex" ],
				
				"#ifndef USE_ENVMAP",
					"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",
				"#endif",
				
				"vViewPosition = cameraPosition - mPosition.xyz;",
				
				"vec3 transformedNormal = normalize( normalMatrix * normal );",
				"vNormal = transformedNormal;",

				THREE.Snippets[ "lights_vertex" ],
				
				"gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n")
		
	}	

};
