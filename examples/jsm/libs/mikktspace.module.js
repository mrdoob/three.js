/*!
 * Copyright (C) 2011 by Morten S. Mikkelsen
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 * 1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 *    misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

// JavaScript port, altered from the MikkTSpace reference implementation:
// https://github.com/mmikk/MikkTSpace/tree/3e895b49d05ea07e4c2133156cfa94369e19e409
//
// Specializes the reference algorithm for unindexed triangles, the default
// 180-degree threshold, and basic tangent/sign output. Attribute welding,
// connected orientation groups, angular subgroups, corner-angle weighting,
// and degenerate-triangle fallback follow the reference.
//
// Hash tables replace sorting and linear degenerate lookups. Unlike the
// reference's BuildNeighborsFast(), every edge bucket is processed: its two
// secondary sorting passes omit their final buckets and can miss neighbors.
// This correction can change tangents for affected meshes.

// Retained for compatibility with the asynchronous WASM implementation.
export const isReady = true;

// Backwards compatibility. Initialization is no longer required.
export const ready = Promise.resolve();

/**
 * Retained for API compatibility. There are no persistent resources to release.
 */
export function dispose() {}

// Preserve the reference's float32 rounding and FLT_MIN zero tests. In
// particular, rounding determines membership at the angular subgroup boundary.
const fround = Math.fround;
const FLOAT_MIN = 1.1754943508222875e-38;

const GROUP_WITH_ANY = 4;
const ORIENTATION_PRESERVING = 8;

function dot( ax, ay, az, bx, by, bz ) {

	return fround( fround( fround( ax * bx ) + fround( ay * by ) ) + fround( az * bz ) );

}

function vectorLength( x, y, z ) {

	return fround( Math.sqrt( dot( x, y, z, x, y, z ) ) );

}

function isNonZero( x, y, z ) {

	return Math.abs( x ) > FLOAT_MIN || Math.abs( y ) > FLOAT_MIN || Math.abs( z ) > FLOAT_MIN;

}

function getHashTableSize( vertexCount ) {

	let n = 16;

	while ( n < vertexCount * 2 ) {

		n *= 2;

	}

	return n;

}

function weldVertices( position, normal, texcoord, vertexCount ) {

	const positionBits = new Uint32Array( position.buffer, position.byteOffset, position.length );
	const normalBits = new Uint32Array( normal.buffer, normal.byteOffset, normal.length );
	const texcoordBits = new Uint32Array( texcoord.buffer, texcoord.byteOffset, texcoord.length );
	const table = new Int32Array( getHashTableSize( vertexCount ) );
	const mask = table.length - 1;
	const result = new Int32Array( vertexCount );

	for ( let v = 0; v < vertexCount; v ++ ) {

		const p = v * 3;
		const t = v * 2;
		let hash = 2166136261;

		for ( let c = 0; c < 3; c ++ ) {

			// Equality in the reference treats positive and negative zero alike.
			hash = Math.imul( hash ^ ( position[ p + c ] === 0 ? 0 : positionBits[ p + c ] ), 16777619 );
			hash = Math.imul( hash ^ ( normal[ p + c ] === 0 ? 0 : normalBits[ p + c ] ), 16777619 );

		}

		for ( let c = 0; c < 2; c ++ ) {

			hash = Math.imul( hash ^ ( texcoord[ t + c ] === 0 ? 0 : texcoordBits[ t + c ] ), 16777619 );

		}

		hash ^= hash >>> 16;
		let slot = hash & mask;

		while ( table[ slot ] ) {

			const r = table[ slot ] - 1;
			const q = r * 3;
			const u = r * 2;

			if ( position[ p ] === position[ q ] && position[ p + 1 ] === position[ q + 1 ] && position[ p + 2 ] === position[ q + 2 ] &&
			normal[ p ] === normal[ q ] && normal[ p + 1 ] === normal[ q + 1 ] && normal[ p + 2 ] === normal[ q + 2 ] &&
			texcoord[ t ] === texcoord[ u ] && texcoord[ t + 1 ] === texcoord[ u + 1 ] ) {

				break;

			}

			slot = ( slot + 1 ) & mask;

		}

		if ( ! table[ slot ] ) {

			table[ slot ] = v + 1;

		}

		result[ v ] = table[ slot ] - 1;

	}

	return result;

}

/**
 * Generates MikkTSpace tangents for unindexed triangles using the default
 * 180-degree angular threshold. Normals are expected to be normalized and all
 * input components finite. Extreme values may overflow float32 intermediates,
 * as in the reference implementation. Input attributes are not modified.
 *
 * @param {Float32Array} position - Triangle vertex positions, three components per vertex.
 * @param {Float32Array} normal - Vertex normals, three components per vertex.
 * @param {Float32Array} texcoord - Texture coordinates, two components per vertex.
 * @return {Float32Array} Tangents with four components per vertex: XYZ and handedness.
 */
export function generateTangents( position, normal, texcoord ) {

	if ( ! ( position instanceof Float32Array ) || ! ( normal instanceof Float32Array ) || ! ( texcoord instanceof Float32Array ) ) {

		throw new TypeError( 'THREE.MikkTSpace: Expected Float32Array inputs.' );

	}

	const vertexCount = position.length / 3;

	if ( position.length % 9 || normal.length !== position.length || texcoord.length !== vertexCount * 2 ) {

		throw new Error( 'THREE.MikkTSpace: Expected matching unindexed triangle attributes.' );

	}

	const output = new Float32Array( vertexCount * 4 );

	for ( let v = 0; v < vertexCount; v ++ ) {

		output[ v * 4 ] = 1;
		output[ v * 4 + 3 ] = - 1;

	}

	if ( vertexCount === 0 ) {

		return output;

	}

	const weldedIndices = weldVertices( position, normal, texcoord, vertexCount );
	const triangleCount = vertexCount / 3;
	const triangleVertices = new Int32Array( vertexCount );
	const originalTriangles = new Int32Array( triangleCount );

	// Remove triangles with coincident positions, preserving the order of
	// surviving triangles. Their tangents are copied from surviving vertices
	// after all connected groups have been evaluated.
	const degenerateTriangles = new Uint8Array( triangleCount );
	let activeTriangleCount = 0;

	for ( let f = 0; f < triangleCount; f ++ ) {

		const a = f * 9;
		const b = a + 3;
		const c = a + 6;
		const sameAB = position[ a ] === position[ b ] && position[ a + 1 ] === position[ b + 1 ] && position[ a + 2 ] === position[ b + 2 ];
		const sameAC = position[ a ] === position[ c ] && position[ a + 1 ] === position[ c + 1 ] && position[ a + 2 ] === position[ c + 2 ];
		const sameBC = position[ b ] === position[ c ] && position[ b + 1 ] === position[ c + 1 ] && position[ b + 2 ] === position[ c + 2 ];

		if ( sameAB || sameAC || sameBC ) {

			degenerateTriangles[ f ] = 1;
			continue;

		}

		originalTriangles[ activeTriangleCount ] = f;
		triangleVertices[ activeTriangleCount * 3 ] = weldedIndices[ f * 3 ];
		triangleVertices[ activeTriangleCount * 3 + 1 ] = weldedIndices[ f * 3 + 1 ];
		triangleVertices[ activeTriangleCount * 3 + 2 ] = weldedIndices[ f * 3 + 2 ];
		activeTriangleCount ++;

	}

	const cornerCount = activeTriangleCount * 3;
	const triangleFlags = new Uint8Array( activeTriangleCount );
	const faceDerivatives = computeFaceDerivatives( triangleVertices, activeTriangleCount, position, texcoord, triangleFlags );
	const neighbors = buildNeighbors( triangleVertices, cornerCount );
	generateTangentSpaces( triangleVertices, originalTriangles, triangleFlags, faceDerivatives, neighbors, position, normal, output, cornerCount );

	if ( activeTriangleCount !== triangleCount ) {

		// Match the reference's first surviving corner with identical attributes.
		const firstTangent = new Int32Array( vertexCount );
		firstTangent.fill( - 1 );

		for ( let c = 0; c < cornerCount; c ++ ) {

			if ( firstTangent[ triangleVertices[ c ] ] === - 1 ) {

				firstTangent[ triangleVertices[ c ] ] = ( originalTriangles[ c / 3 | 0 ] * 3 + c % 3 ) * 4;

			}

		}

		for ( let f = 0; f < triangleCount; f ++ ) {

			if ( ! degenerateTriangles[ f ] ) {

				continue;

			}

			for ( let c = 0; c < 3; c ++ ) {

				const v = f * 3 + c;
				const src = firstTangent[ weldedIndices[ v ] ];
				const dst = v * 4;

				if ( src >= 0 ) {

					for ( let i = 0; i < 4; i ++ ) {

						output[ dst + i ] = output[ src + i ];

					}

				}

			}

		}

	}

	return output;

}

function computeFaceDerivatives( triangleVertices, activeTriangleCount, position, texcoord, triangleFlags ) {

	const faceDerivatives = new Float32Array( activeTriangleCount * 6 );

	for ( let f = 0; f < activeTriangleCount; f ++ ) {

		const a = triangleVertices[ f * 3 ];
		const b = triangleVertices[ f * 3 + 1 ];
		const c = triangleVertices[ f * 3 + 2 ];
		const x1 = fround( texcoord[ b * 2 ] - texcoord[ a * 2 ] );
		const y1 = fround( texcoord[ b * 2 + 1 ] - texcoord[ a * 2 + 1 ] );
		const x2 = fround( texcoord[ c * 2 ] - texcoord[ a * 2 ] );
		const y2 = fround( texcoord[ c * 2 + 1 ] - texcoord[ a * 2 + 1 ] );
		const dx1 = fround( position[ b * 3 ] - position[ a * 3 ] );
		const dy1 = fround( position[ b * 3 + 1 ] - position[ a * 3 + 1 ] );
		const dz1 = fround( position[ b * 3 + 2 ] - position[ a * 3 + 2 ] );
		const dx2 = fround( position[ c * 3 ] - position[ a * 3 ] );
		const dy2 = fround( position[ c * 3 + 1 ] - position[ a * 3 + 1 ] );
		const dz2 = fround( position[ c * 3 + 2 ] - position[ a * 3 + 2 ] );
		const area = fround( fround( x1 * y2 ) - fround( y1 * x2 ) );
		triangleFlags[ f ] = GROUP_WITH_ANY | ( area > 0 ? ORIENTATION_PRESERVING : 0 );

		if ( ! ( Math.abs( area ) > FLOAT_MIN ) ) {

			continue;

		}

		const sx = fround( fround( y2 * dx1 ) - fround( y1 * dx2 ) );
		const sy = fround( fround( y2 * dy1 ) - fround( y1 * dy2 ) );
		const sz = fround( fround( y2 * dz1 ) - fround( y1 * dz2 ) );
		const tx = fround( fround( - x2 * dx1 ) + fround( x1 * dx2 ) );
		const ty = fround( fround( - x2 * dy1 ) + fround( x1 * dy2 ) );
		const tz = fround( fround( - x2 * dz1 ) + fround( x1 * dz2 ) );
		const sl = vectorLength( sx, sy, sz );
		const tl = vectorLength( tx, ty, tz );
		const sign = area > 0 ? 1 : - 1;
		const d = f * 6;

		if ( Math.abs( sl ) > FLOAT_MIN ) {

			const scale = fround( sign / sl );
			faceDerivatives[ d ] = sx * scale;
			faceDerivatives[ d + 1 ] = sy * scale;
			faceDerivatives[ d + 2 ] = sz * scale;

		}

		if ( Math.abs( tl ) > FLOAT_MIN ) {

			const scale = fround( sign / tl );
			faceDerivatives[ d + 3 ] = tx * scale;
			faceDerivatives[ d + 4 ] = ty * scale;
			faceDerivatives[ d + 5 ] = tz * scale;

		}

		if ( Math.abs( fround( sl / Math.abs( area ) ) ) > FLOAT_MIN && Math.abs( fround( tl / Math.abs( area ) ) ) > FLOAT_MIN ) {

			triangleFlags[ f ] &= ~ GROUP_WITH_ANY;

		}

	}

	return faceDerivatives;

}

function buildNeighbors( triangleVertices, cornerCount ) {

	// Prepend edges in reverse order so occurrences remain in ascending face order.
	const neighbors = new Int32Array( cornerCount );
	neighbors.fill( - 1 );
	const next = new Int32Array( cornerCount );
	const table = new Int32Array( getHashTableSize( cornerCount ) );
	const mask = table.length - 1;

	for ( let e = cornerCount - 1; e >= 0; e -- ) {

		const base = e - e % 3;
		const end = base + ( e + 1 ) % 3;
		const a = triangleVertices[ e ];
		const b = triangleVertices[ end ];
		const lo = Math.min( a, b );
		const hi = Math.max( a, b );
		let h = Math.imul( lo, 0x9e3779b1 ) ^ Math.imul( hi, 0x85ebca6b );
		h ^= h >>> 16;
		let slot = h & mask;

		while ( table[ slot ] ) {

			const edge = table[ slot ] - 1;
			const edgeEnd = edge - edge % 3 + ( edge + 1 ) % 3;
			const x = triangleVertices[ edge ];
			const y = triangleVertices[ edgeEnd ];

			if ( lo === Math.min( x, y ) && hi === Math.max( x, y ) ) {

				break;

			}

			slot = ( slot + 1 ) & mask;

		}

		next[ e ] = table[ slot ] - 1;
		table[ slot ] = e + 1;

	}

	for ( let e = 0; e < cornerCount; e ++ ) {

		if ( neighbors[ e ] !== - 1 ) {

			continue;

		}

		const base = e - e % 3;
		const a = triangleVertices[ e ];
		const b = triangleVertices[ base + ( e + 1 ) % 3 ];

		for ( let other = next[ e ]; other !== - 1; other = next[ other ] ) {

			if ( neighbors[ other ] !== - 1 ) {

				continue;

			}

			const obase = other - other % 3;

			if ( a === triangleVertices[ obase + ( other + 1 ) % 3 ] && b === triangleVertices[ other ] ) {

				neighbors[ e ] = obase / 3;
				neighbors[ other ] = base / 3;
				break;

			}

		}

	}

	return neighbors;

}

function generateTangentSpaces( triangleVertices, originalTriangles, triangleFlags, faceDerivatives, neighbors, position, normal, output, cornerCount ) {

	// Construct one connected orientation group at a time. A stack preserves
	// the reference depth-first order without risking the JS call stack.
	const assignedCorners = new Uint8Array( cornerCount );
	const stack = new Int32Array( cornerCount / 3 + 1 );
	const groupMembers = new Int32Array( cornerCount / 3 );
	let projectedDerivatives = new Float32Array( 64 * 6 );
	let cornerAngles = new Float32Array( 64 );
	let subgroupMembers = new Int32Array( 64 );
	let memberAny = new Uint8Array( 64 );

	for ( let seed = 0; seed < cornerCount; seed ++ ) {

		const seedTriangle = seed / 3 | 0;

		if ( assignedCorners[ seed ] || ( triangleFlags[ seedTriangle ] & GROUP_WITH_ANY ) ) {

			continue;

		}

		const representative = triangleVertices[ seed ];
		const orientation = triangleFlags[ seedTriangle ] & ORIENTATION_PRESERVING;
		let groupSize = 0;
		let stackSize = 0;
		stack[ stackSize ++ ] = seedTriangle;

		while ( stackSize ) {

			const f = stack[ -- stackSize ];
			const base = f * 3;
			const c = triangleVertices[ base ] === representative ? 0 : triangleVertices[ base + 1 ] === representative ? 1 : 2;
			const corner = base + c;

			if ( assignedCorners[ corner ] ) {

				continue;

			}

			// The first group reaching a UV-degenerate triangle fixes its orientation.
			if ( ( triangleFlags[ f ] & GROUP_WITH_ANY ) && ! assignedCorners[ base ] && ! assignedCorners[ base + 1 ] && ! assignedCorners[ base + 2 ] ) {

				triangleFlags[ f ] = triangleFlags[ f ] & ~ ORIENTATION_PRESERVING | orientation;

			}

			if ( ( triangleFlags[ f ] & ORIENTATION_PRESERVING ) !== orientation ) {

				continue;

			}

			assignedCorners[ corner ] = 1;
			groupMembers[ groupSize ++ ] = corner;
			const left = neighbors[ corner ];
			const right = neighbors[ base + ( c + 2 ) % 3 ];

			if ( right >= 0 ) {

				stack[ stackSize ++ ] = right;

			}

			if ( left >= 0 ) {

				stack[ stackSize ++ ] = left;

			}

		}

		// Evaluation accumulates in ascending face order, as in the reference C.
		for ( let i = 1; i < groupSize; i ++ ) {

			const corner = groupMembers[ i ];
			let j = i - 1;

			while ( j >= 0 && groupMembers[ j ] > corner ) {

				groupMembers[ j + 1 ] = groupMembers[ j ];
				j --;

			}

			groupMembers[ j + 1 ] = corner;

		}

		if ( cornerAngles.length < groupSize ) {

			cornerAngles = new Float32Array( groupSize );
			projectedDerivatives = new Float32Array( groupSize * 6 );
			subgroupMembers = new Int32Array( groupSize );
			memberAny = new Uint8Array( groupSize );

		}

		const n = representative * 3;
		const nx = normal[ n ];
		const ny = normal[ n + 1 ];
		const nz = normal[ n + 2 ];

		for ( let i = 0; i < groupSize; i ++ ) {

			const corner = groupMembers[ i ];
			const f = corner / 3 | 0;
			const d = f * 6;
			const p = i * 6;

			// Projections are inlined: V8 boxes the arguments of calls it does not inline.
			let sx = faceDerivatives[ d ], sy = faceDerivatives[ d + 1 ], sz = faceDerivatives[ d + 2 ];
			const sd = fround( fround( fround( sx * nx ) + fround( sy * ny ) ) + fround( sz * nz ) );
			sx = fround( sx - fround( sd * nx ) );
			sy = fround( sy - fround( sd * ny ) );
			sz = fround( sz - fround( sd * nz ) );

			if ( Math.abs( sx ) > FLOAT_MIN || Math.abs( sy ) > FLOAT_MIN || Math.abs( sz ) > FLOAT_MIN ) {

				const s = fround( 1 / fround( Math.sqrt( fround( fround( fround( sx * sx ) + fround( sy * sy ) ) + fround( sz * sz ) ) ) ) );
				sx *= s;
				sy *= s;
				sz *= s;

			}

			projectedDerivatives[ p ] = sx;
			projectedDerivatives[ p + 1 ] = sy;
			projectedDerivatives[ p + 2 ] = sz;

			let tx = faceDerivatives[ d + 3 ], ty = faceDerivatives[ d + 4 ], tz = faceDerivatives[ d + 5 ];
			const td = fround( fround( fround( tx * nx ) + fround( ty * ny ) ) + fround( tz * nz ) );
			tx = fround( tx - fround( td * nx ) );
			ty = fround( ty - fround( td * ny ) );
			tz = fround( tz - fround( td * nz ) );

			if ( Math.abs( tx ) > FLOAT_MIN || Math.abs( ty ) > FLOAT_MIN || Math.abs( tz ) > FLOAT_MIN ) {

				const s = fround( 1 / fround( Math.sqrt( fround( fround( fround( tx * tx ) + fround( ty * ty ) ) + fround( tz * tz ) ) ) ) );
				tx *= s;
				ty *= s;
				tz *= s;

			}

			projectedDerivatives[ p + 3 ] = tx;
			projectedDerivatives[ p + 4 ] = ty;
			projectedDerivatives[ p + 5 ] = tz;

			memberAny[ i ] = triangleFlags[ f ] & GROUP_WITH_ANY;

			if ( memberAny[ i ] ) {

				cornerAngles[ i ] = 0;
				continue;

			}

			const c = corner % 3;
			const base = corner - c;
			const prev = triangleVertices[ base + ( c + 2 ) % 3 ] * 3;
			const after = triangleVertices[ base + ( c + 1 ) % 3 ] * 3;

			let ax = fround( position[ prev ] - position[ n ] );
			let ay = fround( position[ prev + 1 ] - position[ n + 1 ] );
			let az = fround( position[ prev + 2 ] - position[ n + 2 ] );
			let e = fround( fround( fround( ax * nx ) + fround( ay * ny ) ) + fround( az * nz ) );
			ax = fround( ax - fround( e * nx ) );
			ay = fround( ay - fround( e * ny ) );
			az = fround( az - fround( e * nz ) );

			if ( Math.abs( ax ) > FLOAT_MIN || Math.abs( ay ) > FLOAT_MIN || Math.abs( az ) > FLOAT_MIN ) {

				const s = fround( 1 / fround( Math.sqrt( fround( fround( fround( ax * ax ) + fround( ay * ay ) ) + fround( az * az ) ) ) ) );
				ax = fround( ax * s );
				ay = fround( ay * s );
				az = fround( az * s );

			}

			let bx = fround( position[ after ] - position[ n ] );
			let by = fround( position[ after + 1 ] - position[ n + 1 ] );
			let bz = fround( position[ after + 2 ] - position[ n + 2 ] );
			e = fround( fround( fround( bx * nx ) + fround( by * ny ) ) + fround( bz * nz ) );
			bx = fround( bx - fround( e * nx ) );
			by = fround( by - fround( e * ny ) );
			bz = fround( bz - fround( e * nz ) );

			if ( Math.abs( bx ) > FLOAT_MIN || Math.abs( by ) > FLOAT_MIN || Math.abs( bz ) > FLOAT_MIN ) {

				const s = fround( 1 / fround( Math.sqrt( fround( fround( fround( bx * bx ) + fround( by * by ) ) + fround( bz * bz ) ) ) ) );
				bx = fround( bx * s );
				by = fround( by * s );
				bz = fround( bz * s );

			}

			const cosine = fround( fround( fround( ax * bx ) + fround( ay * by ) ) + fround( az * bz ) );
			cornerAngles[ i ] = Math.acos( Math.max( - 1, Math.min( 1, cosine ) ) );

		}

		// At the default threshold, a group only splits for opposite projected
		// derivatives. Reuse the previous subgroup's result when its members
		// match, so the usual unsplit group is evaluated only once.
		let previousSubgroupSize = - 1;
		let tangentX = 0;
		let tangentY = 0;
		let tangentZ = 0;

		// Usually no pair is opposed and every subgroup is the whole group.
		let split = false;

		for ( let i = 0; i < groupSize && ! split; i ++ ) {

			if ( memberAny[ i ] ) {

				continue;

			}

			const p = i * 6;

			for ( let j = i + 1; j < groupSize; j ++ ) {

				const q = j * 6;

				if ( ! memberAny[ j ] && ! (
					fround( fround( fround( projectedDerivatives[ p ] * projectedDerivatives[ q ] ) + fround( projectedDerivatives[ p + 1 ] * projectedDerivatives[ q + 1 ] ) ) + fround( projectedDerivatives[ p + 2 ] * projectedDerivatives[ q + 2 ] ) ) > - 1 &&
					fround( fround( fround( projectedDerivatives[ p + 3 ] * projectedDerivatives[ q + 3 ] ) + fround( projectedDerivatives[ p + 4 ] * projectedDerivatives[ q + 4 ] ) ) + fround( projectedDerivatives[ p + 5 ] * projectedDerivatives[ q + 5 ] ) ) > - 1 ) ) {

					split = true;
					break;

				}

			}

		}

		if ( ! split ) {

			for ( let j = 0; j < groupSize; j ++ ) {

				subgroupMembers[ j ] = j;

			}

		}

		for ( let i = 0; i < groupSize; i ++ ) {

			const f = groupMembers[ i ] / 3 | 0;
			const p = i * 6;
			let subgroupSize = split ? 0 : groupSize;
			let sameSubgroup = true;

			const anyI = memberAny[ i ];
			const sx = projectedDerivatives[ p ], sy = projectedDerivatives[ p + 1 ], sz = projectedDerivatives[ p + 2 ];
			const tx = projectedDerivatives[ p + 3 ], ty = projectedDerivatives[ p + 4 ], tz = projectedDerivatives[ p + 5 ];

			for ( let j = 0; split && j < groupSize; j ++ ) {

				const q = j * 6;

				if ( i === j || anyI || memberAny[ j ] || (
					fround( fround( fround( sx * projectedDerivatives[ q ] ) + fround( sy * projectedDerivatives[ q + 1 ] ) ) + fround( sz * projectedDerivatives[ q + 2 ] ) ) > - 1 &&
					fround( fround( fround( tx * projectedDerivatives[ q + 3 ] ) + fround( ty * projectedDerivatives[ q + 4 ] ) ) + fround( tz * projectedDerivatives[ q + 5 ] ) ) > - 1 ) ) {

					if ( subgroupMembers[ subgroupSize ] !== j ) {

						sameSubgroup = false;

					}

					subgroupMembers[ subgroupSize ++ ] = j;

				}

			}

			if ( subgroupSize !== previousSubgroupSize || ! sameSubgroup ) {

				let x = 0;
				let y = 0;
				let z = 0;

				for ( let j = 0; j < subgroupSize; j ++ ) {

					const index = subgroupMembers[ j ];
					// Degenerate derivatives do not contribute, even if they contain NaNs.
					if ( memberAny[ index ] ) {

						continue;

					}

					const q = index * 6;
					const a = cornerAngles[ index ];
					x = fround( x + fround( a * projectedDerivatives[ q ] ) );
					y = fround( y + fround( a * projectedDerivatives[ q + 1 ] ) );
					z = fround( z + fround( a * projectedDerivatives[ q + 2 ] ) );

				}

				if ( isNonZero( x, y, z ) ) {

					const s = fround( 1 / vectorLength( x, y, z ) );
					x = fround( x * s );
					y = fround( y * s );
					z = fround( z * s );

				}

				previousSubgroupSize = subgroupSize;
				tangentX = x;
				tangentY = y;
				tangentZ = z;

			}

			const corner = groupMembers[ i ];
			const dst = ( originalTriangles[ f ] * 3 + corner % 3 ) * 4;
			output[ dst ] = tangentX;
			output[ dst + 1 ] = tangentY;
			output[ dst + 2 ] = tangentZ;
			output[ dst + 3 ] = orientation ? 1 : - 1;

		}

	}

}
