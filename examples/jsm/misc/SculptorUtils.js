/*!
 * Portions adapted from SculptGL by Stéphane Ginier.
 * Copyright (c) 2019 Stéphane GINIER
 * Licensed under the MIT License; see ./SculptGL.LICENSE.txt.
 */

const TRI_INDEX = 4294967295;

const MAX_FLAG = 0x7fffffff;

let _memoryBuffer = new ArrayBuffer( 100000 );
const _sortByIndex = ( a, b ) => a - b;

function getMemory( byteLength ) {

	if ( _memoryBuffer.byteLength < byteLength ) {

		_memoryBuffer = new ArrayBuffer( Math.max( byteLength, _memoryBuffer.byteLength * 2 ) );

	}

	return _memoryBuffer;

}

function replaceElement( array, oldValue, newValue ) {

	for ( let i = 0, l = array.length; i < l; ++ i ) {

		if ( array[ i ] === oldValue ) {

			array[ i ] = newValue;
			return;

		}

	}

}

function removeElement( array, value ) {

	for ( let i = 0, l = array.length; i < l; ++ i ) {

		if ( array[ i ] === value ) {

			array[ i ] = array[ l - 1 ];
			array.pop();
			return;

		}

	}

}

function tidy( array ) {

	if ( array.length < 2 ) return;

	array.sort( _sortByIndex );
	let writeIndex = 1;

	for ( let i = 1; i < array.length; i ++ ) {

		if ( array[ writeIndex - 1 ] !== array[ i ] ) array[ writeIndex ++ ] = array[ i ];

	}

	array.length = writeIndex;

}

// Geometry helpers

const _edge1 = [ 0, 0, 0 ];
const _edge2 = [ 0, 0, 0 ];
const _pvec = [ 0, 0, 0 ];
const _tvec = [ 0, 0, 0 ];
const _qvec = [ 0, 0, 0 ];
const _scaledDir = [ 0, 0, 0 ];
const RAY_EPSILON = 1e-15;

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

function sqrDist( a, b ) {

	const dx = a[ 0 ] - b[ 0 ], dy = a[ 1 ] - b[ 1 ], dz = a[ 2 ] - b[ 2 ];
	return dx * dx + dy * dy + dz * dz;

}

function setRayIntersection( target, origin, direction, distance ) {

	if ( ! target ) return;

	target[ 0 ] = origin[ 0 ] + direction[ 0 ] * distance;
	target[ 1 ] = origin[ 1 ] + direction[ 1 ] * distance;
	target[ 2 ] = origin[ 2 ] + direction[ 2 ] * distance;

}

function intersectionRayTriangleScaled( orig, dir, v1, v2, v3, vertInter ) {

	sub( _edge1, v2, v1 );
	sub( _edge2, v3, v1 );

	const edge1Scale = Math.max( Math.abs( _edge1[ 0 ] ), Math.abs( _edge1[ 1 ] ), Math.abs( _edge1[ 2 ] ) );
	const edge2Scale = Math.max( Math.abs( _edge2[ 0 ] ), Math.abs( _edge2[ 1 ] ), Math.abs( _edge2[ 2 ] ) );
	const dirScale = Math.max( Math.abs( dir[ 0 ] ), Math.abs( dir[ 1 ] ), Math.abs( dir[ 2 ] ) );

	if ( edge1Scale === 0 || edge2Scale === 0 || dirScale === 0 ||
		Number.isFinite( edge1Scale ) === false || Number.isFinite( edge2Scale ) === false || Number.isFinite( dirScale ) === false ) return - 1.0;

	_edge1[ 0 ] /= edge1Scale; _edge1[ 1 ] /= edge1Scale; _edge1[ 2 ] /= edge1Scale;
	_edge2[ 0 ] /= edge2Scale; _edge2[ 1 ] /= edge2Scale; _edge2[ 2 ] /= edge2Scale;
	_scaledDir[ 0 ] = dir[ 0 ] / dirScale;
	_scaledDir[ 1 ] = dir[ 1 ] / dirScale;
	_scaledDir[ 2 ] = dir[ 2 ] / dirScale;

	cross( _pvec, _scaledDir, _edge2 );
	const det = dot( _edge1, _pvec );
	const determinantScale = Math.hypot( _edge1[ 0 ], _edge1[ 1 ], _edge1[ 2 ] ) *
		Math.hypot( _edge2[ 0 ], _edge2[ 1 ], _edge2[ 2 ] ) *
		Math.hypot( _scaledDir[ 0 ], _scaledDir[ 1 ], _scaledDir[ 2 ] );

	if ( Math.abs( det ) <= RAY_EPSILON * determinantScale ) return - 1.0;

	const invDet = 1.0 / det;
	sub( _tvec, orig, v1 );
	const translationScale = Math.max( Math.abs( _tvec[ 0 ] ), Math.abs( _tvec[ 1 ] ), Math.abs( _tvec[ 2 ] ) );

	if ( Number.isFinite( translationScale ) === false ) return - 1.0;

	if ( translationScale !== 0 ) {

		_tvec[ 0 ] /= translationScale; _tvec[ 1 ] /= translationScale; _tvec[ 2 ] /= translationScale;

	}

	const u = dot( _tvec, _pvec ) * invDet * translationScale / edge1Scale;
	if ( u < - RAY_EPSILON || u > 1.0 + RAY_EPSILON ) return - 1.0;
	cross( _qvec, _tvec, _edge1 );
	const v = dot( _scaledDir, _qvec ) * invDet * translationScale / edge2Scale;
	if ( v < - RAY_EPSILON || u + v > 1.0 + RAY_EPSILON ) return - 1.0;
	const t = dot( _edge2, _qvec ) * invDet * translationScale / dirScale;
	if ( t < - RAY_EPSILON ) return - 1.0;

	setRayIntersection( vertInter, orig, dir, t );

	return t;

}

function intersectionRayTriangle( orig, dir, v1, v2, v3, vertInter ) {

	sub( _edge1, v2, v1 );
	sub( _edge2, v3, v1 );
	cross( _pvec, dir, _edge2 );
	const det = dot( _edge1, _pvec );
	const determinantScale = Math.hypot( _edge1[ 0 ], _edge1[ 1 ], _edge1[ 2 ] ) *
		Math.hypot( _edge2[ 0 ], _edge2[ 1 ], _edge2[ 2 ] ) *
		Math.hypot( dir[ 0 ], dir[ 1 ], dir[ 2 ] );
	const determinantTolerance = RAY_EPSILON * determinantScale;
	if ( Number.isFinite( det ) === false || Number.isFinite( determinantScale ) === false || determinantTolerance === 0 ) {

		return intersectionRayTriangleScaled( orig, dir, v1, v2, v3, vertInter );

	}

	if ( Math.abs( det ) <= determinantTolerance ) return - 1.0;
	const invDet = 1.0 / det;
	sub( _tvec, orig, v1 );
	const u = dot( _tvec, _pvec ) * invDet;
	if ( Number.isFinite( u ) === false ) return intersectionRayTriangleScaled( orig, dir, v1, v2, v3, vertInter );
	if ( u < - RAY_EPSILON || u > 1.0 + RAY_EPSILON ) return - 1.0;
	cross( _qvec, _tvec, _edge1 );
	const v = dot( dir, _qvec ) * invDet;
	if ( Number.isFinite( v ) === false ) return intersectionRayTriangleScaled( orig, dir, v1, v2, v3, vertInter );
	if ( v < - RAY_EPSILON || u + v > 1.0 + RAY_EPSILON ) return - 1.0;
	const t = dot( _edge2, _qvec ) * invDet;
	if ( Number.isFinite( t ) === false ) return intersectionRayTriangleScaled( orig, dir, v1, v2, v3, vertInter );
	if ( t < - RAY_EPSILON ) return - 1.0;

	setRayIntersection( vertInter, orig, dir, t );

	return t;

}

function distanceSqToSegment( point, v1, v2 ) {

	const ptx = point[ 0 ] - v1[ 0 ], pty = point[ 1 ] - v1[ 1 ], ptz = point[ 2 ] - v1[ 2 ];
	const vx = v2[ 0 ] - v1[ 0 ], vy = v2[ 1 ] - v1[ 1 ], vz = v2[ 2 ] - v1[ 2 ];
	const lengthSquared = vx * vx + vy * vy + vz * vz;
	if ( lengthSquared === 0 ) return ptx * ptx + pty * pty + ptz * ptz;

	const t = ( ptx * vx + pty * vy + ptz * vz ) / lengthSquared;
	if ( t < 0 ) return ptx * ptx + pty * pty + ptz * ptz;
	if ( t > 1 ) {

		const dx = point[ 0 ] - v2[ 0 ], dy = point[ 1 ] - v2[ 1 ], dz = point[ 2 ] - v2[ 2 ];
		return dx * dx + dy * dy + dz * dz;

	}

	const rx = point[ 0 ] - v1[ 0 ] - t * vx;
	const ry = point[ 1 ] - v1[ 1 ] - t * vy;
	const rz = point[ 2 ] - v1[ 2 ] - t * vz;
	return rx * rx + ry * ry + rz * rz;

}

function distanceSqToTriangle( point, v1, v2, v3 ) {

	const abx = v2[ 0 ] - v1[ 0 ], aby = v2[ 1 ] - v1[ 1 ], abz = v2[ 2 ] - v1[ 2 ];
	const acx = v3[ 0 ] - v1[ 0 ], acy = v3[ 1 ] - v1[ 1 ], acz = v3[ 2 ] - v1[ 2 ];
	const bcx = v3[ 0 ] - v2[ 0 ], bcy = v3[ 1 ] - v2[ 1 ], bcz = v3[ 2 ] - v2[ 2 ];
	const crossX = aby * acz - abz * acy;
	const crossY = abz * acx - abx * acz;
	const crossZ = abx * acy - aby * acx;
	const areaSquared = crossX * crossX + crossY * crossY + crossZ * crossZ;
	const maxEdgeSquared = Math.max(
		abx * abx + aby * aby + abz * abz,
		acx * acx + acy * acy + acz * acz,
		bcx * bcx + bcy * bcy + bcz * bcz
	);

	if ( areaSquared <= Number.EPSILON * maxEdgeSquared * maxEdgeSquared ) {

		return Math.min(
			distanceSqToSegment( point, v1, v2 ),
			distanceSqToSegment( point, v2, v3 ),
			distanceSqToSegment( point, v3, v1 )
		);

	}

	const apx = point[ 0 ] - v1[ 0 ], apy = point[ 1 ] - v1[ 1 ], apz = point[ 2 ] - v1[ 2 ];
	const d1 = abx * apx + aby * apy + abz * apz;
	const d2 = acx * apx + acy * apy + acz * apz;

	if ( d1 <= 0 && d2 <= 0 ) return apx * apx + apy * apy + apz * apz;

	const bpx = point[ 0 ] - v2[ 0 ], bpy = point[ 1 ] - v2[ 1 ], bpz = point[ 2 ] - v2[ 2 ];
	const d3 = abx * bpx + aby * bpy + abz * bpz;
	const d4 = acx * bpx + acy * bpy + acz * bpz;

	if ( d3 >= 0 && d4 <= d3 ) return bpx * bpx + bpy * bpy + bpz * bpz;

	const vc = d1 * d4 - d3 * d2;

	if ( vc <= 0 && d1 >= 0 && d3 <= 0 ) {

		const v = d1 / ( d1 - d3 );
		const dx = apx - abx * v, dy = apy - aby * v, dz = apz - abz * v;
		return dx * dx + dy * dy + dz * dz;

	}

	const cpx = point[ 0 ] - v3[ 0 ], cpy = point[ 1 ] - v3[ 1 ], cpz = point[ 2 ] - v3[ 2 ];
	const d5 = abx * cpx + aby * cpy + abz * cpz;
	const d6 = acx * cpx + acy * cpy + acz * cpz;

	if ( d6 >= 0 && d5 <= d6 ) return cpx * cpx + cpy * cpy + cpz * cpz;

	const vb = d5 * d2 - d1 * d6;

	if ( vb <= 0 && d2 >= 0 && d6 <= 0 ) {

		const w = d2 / ( d2 - d6 );
		const dx = apx - acx * w, dy = apy - acy * w, dz = apz - acz * w;
		return dx * dx + dy * dy + dz * dz;

	}

	const va = d3 * d6 - d5 * d4;

	if ( va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0 ) {

		const edgeX = v3[ 0 ] - v2[ 0 ], edgeY = v3[ 1 ] - v2[ 1 ], edgeZ = v3[ 2 ] - v2[ 2 ];
		const w = ( d4 - d3 ) / ( d4 - d3 + d5 - d6 );
		const dx = bpx - edgeX * w, dy = bpy - edgeY * w, dz = bpz - edgeZ * w;
		return dx * dx + dy * dy + dz * dz;

	}

	const denominator = va + vb + vc;
	const inverse = 1.0 / denominator;
	const v = vb * inverse;
	const w = vc * inverse;
	const dx = apx - abx * v - acx * w;
	const dy = apy - aby * v - acy * w;
	const dz = apz - abz * v - acz * w;
	return dx * dx + dy * dy + dz * dz;

}

function triangleInsideSphere( point, radiusSquared, v1, v2, v3 ) {

	return distanceSqToTriangle( point, v1, v2, v3 ) < radiusSquared;

}

function falloff( dist ) {

	const d2 = dist * dist;
	return 3.0 * d2 * d2 - 4.0 * d2 * dist + 1.0;

}

export {
	TRI_INDEX,
	MAX_FLAG,
	getMemory,
	replaceElement,
	removeElement,
	tidy,
	sqrDist,
	intersectionRayTriangle,
	triangleInsideSphere,
	falloff
};
