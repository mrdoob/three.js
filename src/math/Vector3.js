import * as MathUtils from './MathUtils.js';
import { Quaternion } from './Quaternion.js';

class Vector3 {

	constructor( x = 0, y = 0, z = 0 ) {

		Vector3.prototype.isVector3 = true;

		this._x = x;
		this._y = y;
		this._z = z;

	}

	get x() {

		return this._x;

	}

	set x( value ) {

		this._x = value;
		this._onChangeCallback();

	}

	get y() {

		return this._y;

	}

	set y( value ) {

		this._y = value;
		this._onChangeCallback();

	}

	get z() {

		return this._z;

	}

	set z( value ) {

		this._z = value;
		this._onChangeCallback();

	}

	set( x, y, z ) {

		if ( z === undefined ) z = this._z; // sprite.scale.set(x,y)

		this._x = x;
		this._y = y;
		this._z = z;

		this._onChangeCallback();

		return this;

	}

	setScalar( scalar ) {

		this._x = scalar;
		this._y = scalar;
		this._z = scalar;

		this._onChangeCallback();

		return this;

	}

	setX( x ) {

		this._x = x;

		this._onChangeCallback();

		return this;

	}

	setY( y ) {

		this._y = y;

		this._onChangeCallback();

		return this;

	}

	setZ( z ) {

		this._z = z;

		this._onChangeCallback();

		return this;

	}

	setComponent( index, value ) {

		switch ( index ) {

			case 0: this._x = value; break;
			case 1: this._y = value; break;
			case 2: this._z = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

		this._onChangeCallback();

		return this;

	}

	getComponent( index ) {

		switch ( index ) {

			case 0: return this._x;
			case 1: return this._y;
			case 2: return this._z;
			default: throw new Error( 'index is out of range: ' + index );

		}

	}

	clone() {

		return new this.constructor( this._x, this._y, this._z );

	}

	copy( v ) {

		this._x = v.x;
		this._y = v.y;
		this._z = v.z;

		this._onChangeCallback();

		return this;

	}

	add( v ) {

		this._x += v.x;
		this._y += v.y;
		this._z += v.z;

		this._onChangeCallback();

		return this;

	}

	addScalar( s ) {

		this._x += s;
		this._y += s;
		this._z += s;

		this._onChangeCallback();

		return this;

	}

	addVectors( a, b ) {

		this._x = a.x + b.x;
		this._y = a.y + b.y;
		this._z = a.z + b.z;

		this._onChangeCallback();

		return this;

	}

	addScaledVector( v, s ) {

		this._x += v.x * s;
		this._y += v.y * s;
		this._z += v.z * s;

		this._onChangeCallback();

		return this;

	}

	sub( v ) {

		this._x -= v.x;
		this._y -= v.y;
		this._z -= v.z;

		this._onChangeCallback();

		return this;

	}

	subScalar( s ) {

		this._x -= s;
		this._y -= s;
		this._z -= s;

		this._onChangeCallback();

		return this;

	}

	subVectors( a, b ) {

		this._x = a.x - b.x;
		this._y = a.y - b.y;
		this._z = a.z - b.z;

		this._onChangeCallback();

		return this;

	}

	multiply( v ) {

		this._x *= v.x;
		this._y *= v.y;
		this._z *= v.z;

		this._onChangeCallback();

		return this;

	}

	multiplyScalar( scalar ) {

		this._x *= scalar;
		this._y *= scalar;
		this._z *= scalar;

		this._onChangeCallback();

		return this;

	}

	multiplyVectors( a, b ) {

		this._x = a.x * b.x;
		this._y = a.y * b.y;
		this._z = a.z * b.z;

		this._onChangeCallback();

		return this;

	}

	applyEuler( euler ) {

		return this.applyQuaternion( _quaternion.setFromEuler( euler ) );

	}

	applyAxisAngle( axis, angle ) {

		return this.applyQuaternion( _quaternion.setFromAxisAngle( axis, angle ) );

	}

	applyMatrix3( m ) {

		const x = this._x, y = this._y, z = this._z;
		const e = m.elements;

		this._x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this._y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this._z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

		this._onChangeCallback();

		return this;

	}

	applyNormalMatrix( m ) {

		return this.applyMatrix3( m ).normalize();

	}

	applyMatrix4( m ) {

		const x = this._x, y = this._y, z = this._z;
		const e = m.elements;

		const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		this._x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
		this._y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
		this._z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

		this._onChangeCallback();

		return this;

	}

	applyQuaternion( q ) {

		const x = this._x, y = this._y, z = this._z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// calculate quat * vector

		const ix = qw * x + qy * z - qz * y;
		const iy = qw * y + qz * x - qx * z;
		const iz = qw * z + qx * y - qy * x;
		const iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this._x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this._y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this._z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		this._onChangeCallback();

		return this;

	}

	project( camera ) {

		return this.applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );

	}

	unproject( camera ) {

		return this.applyMatrix4( camera.projectionMatrixInverse ).applyMatrix4( camera.matrixWorld );

	}

	transformDirection( m ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		const x = this._x, y = this._y, z = this._z;
		const e = m.elements;

		this._x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		this._y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		this._z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		return this.normalize();

	}

	divide( v ) {

		this._x /= v.x;
		this._y /= v.y;
		this._z /= v.z;

		this._onChangeCallback();

		return this;

	}

	divideScalar( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	min( v ) {

		this._x = Math.min( this._x, v.x );
		this._y = Math.min( this._y, v.y );
		this._z = Math.min( this._z, v.z );

		this._onChangeCallback();

		return this;

	}

	max( v ) {

		this._x = Math.max( this._x, v.x );
		this._y = Math.max( this._y, v.y );
		this._z = Math.max( this._z, v.z );

		this._onChangeCallback();

		return this;

	}

	clamp( min, max ) {

		// assumes min < max, componentwise

		this._x = Math.max( min.x, Math.min( max.x, this._x ) );
		this._y = Math.max( min.y, Math.min( max.y, this._y ) );
		this._z = Math.max( min.z, Math.min( max.z, this._z ) );

		this._onChangeCallback();

		return this;

	}

	clampScalar( minVal, maxVal ) {

		this._x = Math.max( minVal, Math.min( maxVal, this._x ) );
		this._y = Math.max( minVal, Math.min( maxVal, this._y ) );
		this._z = Math.max( minVal, Math.min( maxVal, this._z ) );

		this._onChangeCallback();

		return this;

	}

	clampLength( min, max ) {

		const length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar( Math.max( min, Math.min( max, length ) ) );

	}

	floor() {

		this._x = Math.floor( this._x );
		this._y = Math.floor( this._y );
		this._z = Math.floor( this._z );

		this._onChangeCallback();

		return this;

	}

	ceil() {

		this._x = Math.ceil( this._x );
		this._y = Math.ceil( this._y );
		this._z = Math.ceil( this._z );

		this._onChangeCallback();

		return this;

	}

	round() {

		this._x = Math.round( this._x );
		this._y = Math.round( this._y );
		this._z = Math.round( this._z );

		this._onChangeCallback();

		return this;

	}

	roundToZero() {

		this._x = ( this._x < 0 ) ? Math.ceil( this._x ) : Math.floor( this._x );
		this._y = ( this._y < 0 ) ? Math.ceil( this._y ) : Math.floor( this._y );
		this._z = ( this._z < 0 ) ? Math.ceil( this._z ) : Math.floor( this._z );

		this._onChangeCallback();

		return this;

	}

	negate() {

		this._x = - this._x;
		this._y = - this._y;
		this._z = - this._z;

		this._onChangeCallback();

		return this;

	}

	dot( v ) {

		return this._x * v.x + this._y * v.y + this._z * v.z;

	}

	// TODO lengthSquared?

	lengthSq() {

		return this._x * this._x + this._y * this._y + this._z * this._z;

	}

	length() {

		return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z );

	}

	manhattanLength() {

		return Math.abs( this._x ) + Math.abs( this._y ) + Math.abs( this._z );

	}

	normalize() {

		return this.divideScalar( this.length() || 1 );

	}

	setLength( length ) {

		return this.normalize().multiplyScalar( length );

	}

	lerp( v, alpha ) {

		this._x += ( v.x - this._x ) * alpha;
		this._y += ( v.y - this._y ) * alpha;
		this._z += ( v.z - this._z ) * alpha;

		this._onChangeCallback();

		return this;

	}

	lerpVectors( v1, v2, alpha ) {

		this._x = v1.x + ( v2.x - v1.x ) * alpha;
		this._y = v1.y + ( v2.y - v1.y ) * alpha;
		this._z = v1.z + ( v2.z - v1.z ) * alpha;

		this._onChangeCallback();

		return this;

	}

	cross( v ) {

		return this.crossVectors( this, v );

	}

	crossVectors( a, b ) {

		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

		this._x = ay * bz - az * by;
		this._y = az * bx - ax * bz;
		this._z = ax * by - ay * bx;

		this._onChangeCallback();

		return this;

	}

	projectOnVector( v ) {

		const denominator = v.lengthSq();

		if ( denominator === 0 ) return this.set( 0, 0, 0 );

		const scalar = v.dot( this ) / denominator;

		return this.copy( v ).multiplyScalar( scalar );

	}

	projectOnPlane( planeNormal ) {

		_vector.copy( this ).projectOnVector( planeNormal );

		return this.sub( _vector );

	}

	reflect( normal ) {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		return this.sub( _vector.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

	}

	angleTo( v ) {

		const denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );

		if ( denominator === 0 ) return Math.PI / 2;

		const theta = this.dot( v ) / denominator;

		// clamp, to handle numerical problems

		return Math.acos( MathUtils.clamp( theta, - 1, 1 ) );

	}

	distanceTo( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

	distanceToSquared( v ) {

		const dx = this._x - v.x, dy = this._y - v.y, dz = this._z - v.z;

		return dx * dx + dy * dy + dz * dz;

	}

	manhattanDistanceTo( v ) {

		return Math.abs( this._x - v.x ) + Math.abs( this._y - v.y ) + Math.abs( this._z - v.z );

	}

	setFromSpherical( s ) {

		return this.setFromSphericalCoords( s.radius, s.phi, s.theta );

	}

	setFromSphericalCoords( radius, phi, theta ) {

		const sinPhiRadius = Math.sin( phi ) * radius;

		this._x = sinPhiRadius * Math.sin( theta );
		this._y = Math.cos( phi ) * radius;
		this._z = sinPhiRadius * Math.cos( theta );

		this._onChangeCallback();

		return this;

	}

	setFromCylindrical( c ) {

		return this.setFromCylindricalCoords( c.radius, c.theta, c.y );

	}

	setFromCylindricalCoords( radius, theta, y ) {

		this._x = radius * Math.sin( theta );
		this._y = y;
		this._z = radius * Math.cos( theta );

		this._onChangeCallback();

		return this;

	}

	setFromMatrixPosition( m ) {

		const e = m.elements;

		this._x = e[ 12 ];
		this._y = e[ 13 ];
		this._z = e[ 14 ];

		this._onChangeCallback();

		return this;

	}

	setFromMatrixScale( m ) {

		const sx = this.setFromMatrixColumn( m, 0 ).length();
		const sy = this.setFromMatrixColumn( m, 1 ).length();
		const sz = this.setFromMatrixColumn( m, 2 ).length();

		this._x = sx;
		this._y = sy;
		this._z = sz;

		this._onChangeCallback();

		return this;

	}

	setFromMatrixColumn( m, index ) {

		return this.fromArray( m.elements, index * 4 );

	}

	setFromMatrix3Column( m, index ) {

		return this.fromArray( m.elements, index * 3 );

	}

	setFromEuler( e ) {

		this._x = e._x;
		this._y = e._y;
		this._z = e._z;

		this._onChangeCallback();

		return this;

	}

	equals( v ) {

		return ( ( v.x === this._x ) && ( v.y === this._y ) && ( v.z === this._z ) );

	}

	fromArray( array, offset = 0 ) {

		this._x = array[ offset ];
		this._y = array[ offset + 1 ];
		this._z = array[ offset + 2 ];

		this._onChangeCallback();

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;

		return array;

	}

	fromBufferAttribute( attribute, index ) {

		this._x = attribute.getX( index );
		this._y = attribute.getY( index );
		this._z = attribute.getZ( index );

		this._onChangeCallback();

		return this;

	}

	random() {

		this._x = Math.random();
		this._y = Math.random();
		this._z = Math.random();

		this._onChangeCallback();

		return this;

	}

	randomDirection() {

		// Derived from https://mathworld.wolfram.com/SpherePointPicking.html

		const u = ( Math.random() - 0.5 ) * 2;
		const t = Math.random() * Math.PI * 2;
		const f = Math.sqrt( 1 - u ** 2 );

		this._x = f * Math.cos( t );
		this._y = f * Math.sin( t );
		this._z = u;

		this._onChangeCallback();

		return this;

	}

	_onChange( callback ) {

		this._onChangeCallback = callback;

		return this;

	}

	_onChangeCallback() {}

	*[ Symbol.iterator ]() {

		yield this._x;
		yield this._y;
		yield this._z;

	}

}

const _vector = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();

export { Vector3 };
