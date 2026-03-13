// ---- Constants & Utilities ----

const TRI_INDEX = 4294967295;

// Mutable flags shared across modules
const Flags = {
	TAG: 1,
	SCULPT: 1,
	STATE: 1
};

const _memoryPool = { buffer: new ArrayBuffer( 100000 ) };

function getMemory( nbBytes ) {

	if ( _memoryPool.buffer.byteLength >= nbBytes ) return _memoryPool.buffer;
	_memoryPool.buffer = new ArrayBuffer( nbBytes );
	return _memoryPool.buffer;

}

function replaceElement( array, oldValue, newValue ) {

	for ( let i = 0, l = array.length; i < l; ++ i ) {

		if ( array[ i ] === oldValue ) {

			array[ i ] = newValue;
			return;

		}

	}

}

function removeElement( array, remValue ) {

	for ( let i = 0, l = array.length; i < l; ++ i ) {

		if ( array[ i ] === remValue ) {

			array[ i ] = array[ l - 1 ];
			array.pop();
			return;

		}

	}

}

function tidy( array ) {

	array.sort( ( a, b ) => a - b );
	const len = array.length;
	let j = 0;
	for ( let i = 1; i < len; ++ i ) {

		if ( array[ j ] !== array[ i ] ) array[ ++ j ] = array[ i ];

	}

	if ( len > 1 ) array.length = j + 1;

}

function intersectionArrays( a, b ) {

	let ai = 0, bi = 0;
	const result = [];
	const aLen = a.length, bLen = b.length;
	while ( ai < aLen && bi < bLen ) {

		if ( a[ ai ] < b[ bi ] ) ai ++;
		else if ( a[ ai ] > b[ bi ] ) bi ++;
		else {

			result.push( a[ ai ] );
			++ ai;
			++ bi;

		}

	}

	return result;

}

// ---- Geometry Helpers ----

const _edge1 = [ 0, 0, 0 ];
const _edge2 = [ 0, 0, 0 ];
const _pvec = [ 0, 0, 0 ];
const _tvec = [ 0, 0, 0 ];
const _qvec = [ 0, 0, 0 ];

function cross( out, a, b ) {

	out[ 0 ] = a[ 1 ] * b[ 2 ] - a[ 2 ] * b[ 1 ];
	out[ 1 ] = a[ 2 ] * b[ 0 ] - a[ 0 ] * b[ 2 ];
	out[ 2 ] = a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ];
	return out;

}

function dot( a, b ) {

	return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] + a[ 2 ] * b[ 2 ];

}

function sub( out, a, b ) {

	out[ 0 ] = a[ 0 ] - b[ 0 ];
	out[ 1 ] = a[ 1 ] - b[ 1 ];
	out[ 2 ] = a[ 2 ] - b[ 2 ];
	return out;

}

function sqrLen( a ) {

	return a[ 0 ] * a[ 0 ] + a[ 1 ] * a[ 1 ] + a[ 2 ] * a[ 2 ];

}

function sqrDist( a, b ) {

	const dx = a[ 0 ] - b[ 0 ], dy = a[ 1 ] - b[ 1 ], dz = a[ 2 ] - b[ 2 ];
	return dx * dx + dy * dy + dz * dz;

}

function intersectionRayTriangle( orig, dir, v1, v2, v3, vertInter ) {

	sub( _edge1, v2, v1 );
	sub( _edge2, v3, v1 );
	cross( _pvec, dir, _edge2 );
	const det = dot( _edge1, _pvec );
	const EPSILON = 1e-15;
	if ( det > - EPSILON && det < EPSILON ) return - 1.0;
	const invDet = 1.0 / det;
	sub( _tvec, orig, v1 );
	const u = dot( _tvec, _pvec ) * invDet;
	if ( u < - EPSILON || u > 1.0 + EPSILON ) return - 1.0;
	cross( _qvec, _tvec, _edge1 );
	const v = dot( dir, _qvec ) * invDet;
	if ( v < - EPSILON || u + v > 1.0 + EPSILON ) return - 1.0;
	const t = dot( _edge2, _qvec ) * invDet;
	if ( t < - EPSILON ) return - 1.0;
	if ( vertInter ) {

		vertInter[ 0 ] = orig[ 0 ] + dir[ 0 ] * t;
		vertInter[ 1 ] = orig[ 1 ] + dir[ 1 ] * t;
		vertInter[ 2 ] = orig[ 2 ] + dir[ 2 ] * t;

	}

	return t;

}

function distanceSqToSegment( point, v1, v2 ) {

	const ptx = point[ 0 ] - v1[ 0 ], pty = point[ 1 ] - v1[ 1 ], ptz = point[ 2 ] - v1[ 2 ];
	const vx = v2[ 0 ] - v1[ 0 ], vy = v2[ 1 ] - v1[ 1 ], vz = v2[ 2 ] - v1[ 2 ];
	const len = vx * vx + vy * vy + vz * vz;
	const t2 = ( ptx * vx + pty * vy + ptz * vz ) / len;
	if ( t2 < 0.0 ) return ptx * ptx + pty * pty + ptz * ptz;
	if ( t2 > 1.0 ) {

		const dx = point[ 0 ] - v2[ 0 ], dy = point[ 1 ] - v2[ 1 ], dz = point[ 2 ] - v2[ 2 ];
		return dx * dx + dy * dy + dz * dz;

	}

	const rx = point[ 0 ] - v1[ 0 ] - t2 * vx;
	const ry = point[ 1 ] - v1[ 1 ] - t2 * vy;
	const rz = point[ 2 ] - v1[ 2 ] - t2 * vz;
	return rx * rx + ry * ry + rz * rz;

}

function triangleInsideSphere( point, radiusSq, v1, v2, v3 ) {

	if ( distanceSqToSegment( point, v1, v2 ) < radiusSq ) return true;
	if ( distanceSqToSegment( point, v2, v3 ) < radiusSq ) return true;
	if ( distanceSqToSegment( point, v1, v3 ) < radiusSq ) return true;
	return false;

}

function pointInsideTriangle( point, v1, v2, v3 ) {

	const vec1 = [ v1[ 0 ] - v2[ 0 ], v1[ 1 ] - v2[ 1 ], v1[ 2 ] - v2[ 2 ] ];
	const vec2b = [ v1[ 0 ] - v3[ 0 ], v1[ 1 ] - v3[ 1 ], v1[ 2 ] - v3[ 2 ] ];
	const vecP1 = [ point[ 0 ] - v2[ 0 ], point[ 1 ] - v2[ 1 ], point[ 2 ] - v2[ 2 ] ];
	const vecP2 = [ point[ 0 ] - v3[ 0 ], point[ 1 ] - v3[ 1 ], point[ 2 ] - v3[ 2 ] ];
	const tmp = [ 0, 0, 0 ];
	const total = Math.sqrt( sqrLen( cross( tmp, vec1, vec2b ) ) );
	const area1 = Math.sqrt( sqrLen( cross( tmp, vec1, vecP1 ) ) );
	const area2 = Math.sqrt( sqrLen( cross( tmp, vec2b, vecP2 ) ) );
	const area3 = Math.sqrt( sqrLen( cross( tmp, vecP1, vecP2 ) ) );
	return Math.abs( total - ( area1 + area2 + area3 ) ) < 1e-20;

}

function vertexOnLine( vertex, vNear, vFar ) {

	const abx = vFar[ 0 ] - vNear[ 0 ], aby = vFar[ 1 ] - vNear[ 1 ], abz = vFar[ 2 ] - vNear[ 2 ];
	const px = vertex[ 0 ] - vNear[ 0 ], py = vertex[ 1 ] - vNear[ 1 ], pz = vertex[ 2 ] - vNear[ 2 ];
	const d = ( abx * px + aby * py + abz * pz ) / ( abx * abx + aby * aby + abz * abz );
	return [ vNear[ 0 ] + abx * d, vNear[ 1 ] + aby * d, vNear[ 2 ] + abz * d ];

}

export {
	TRI_INDEX,
	Flags,
	getMemory,
	replaceElement,
	removeElement,
	tidy,
	intersectionArrays,
	cross,
	dot,
	sub,
	sqrLen,
	sqrDist,
	intersectionRayTriangle,
	triangleInsideSphere,
	pointInsideTriangle,
	vertexOnLine
};
