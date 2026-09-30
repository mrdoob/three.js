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

// The JavaScript port is always ready. `ready` resolves once the WebAssembly
// build of it below is instantiated; see the end of this file.
export const isReady = true;

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
function generateTangents( position, normal, texcoord ) {

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

// ── WebAssembly ─────────────────────────────────────────────────────────────
//
// The port above, compiled to WebAssembly by jz (https://github.com/dy/jz, at
// commit a4e3da3a) from this file's JavaScript with generateTangents exported:
//
//   sed -n '1,/^\/\/ ── WebAssembly/p' mikktspace.module.js | sed 's/^function generateTangents(/export &/' > port.js
//   node cli.js port.js -o mikktspace.wasm
//
// Nothing runs on import. A caller that awaits `ready` has generateTangents run
// in WebAssembly from then on; every other caller, and every engine without
// WebAssembly, gets the JavaScript. The two give the same tangents (README).

const wasmBase64 = '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QQAL9QROAGEATgBJAG4AZgBpAG4AaQB0AHkALQBJAG4AZgBpAG4AaQB0AHkAdAByAHUAZQBmAGEAbABzAGUAbgB1AGwAbAB1AG4AZABlAGYAaQBuAGUAZABbAEEAcgByAGEAeQBdAFsATwBiAGoAZQBjAHQAXQBvAGsAbgBvAHQALQBlAHEAdQBhAGwAdABpAG0AZQBkAC0AbwB1AHQAWwBvAGIAagBlAGMAdAAgAE8AYgBqAGUAYwB0AF0AWwBvAGIAagBlAGMAdAAgAE0AYQBwAF0AWwBvAGIAagBlAGMAdAAgAFMAZQB0AF0AWwBvAGIAagBlAGMAdAAgAEEAcgByAGEAeQBCAHUAZgBmAGUAcgBdAGYAdQBuAGMAdABpAG8AbgAgACgAKQAgAHsAIABbAG4AYQB0AGkAdgBlACAAYwBvAGQAZQBdACAAfQAAAAAAAABZgiwVCQAAAFQAeQBwAGUARQByAHIAbwByAAAAtJvDfC8AAABUAEgAUgBFAEUALgBNAGkAawBrAFQAUwBwAGEAYwBlADoAIABFAHgAcABlAGMAdABlAGQAIABGAGwAbwBhAHQAMwAyAEEAcgByAGEAeQAgAGkAbgBwAHUAdABzAC4AAACLLCmkQgAAAFQASABSAEUARQAuAE0AaQBrAGsAVABTAHAAYQBjAGUAOgAgAEUAeABwAGUAYwB0AGUAZAAgAG0AYQB0AGMAaABpAG4AZwAgAHUAbgBpAG4AZABlAHgAZQBkACAAdAByAGkAYQBuAGcAbABlACAAYQB0AHQAcgBpAGIAdQB0AGUAcwAuAOQI8iQHAAAAbQBlAHMAcwBhAGcAZQBBgAULGAIAAAACAAAAaAIAAAEA+n/ucLsMAFD6fwBBoAULKAIAAAACAAAAaAIAAAEA+n/ucLsMAFD6f4gCAAAAgPh/qAIAAACA+H8AQYgGC6cB2AIAAACA+H/oAgAAAID4f/gCAAAAgPh/CAMAAACA+H/ETDrOIwAAAEMAYQBuAG4AbwB0ACAAcgBlAGEAZAAgAHAAcgBvAHAAZQByAHQAaQBlAHMAIABvAGYAIAB1AG4AZABlAGYAaQBuAGUAZAAAAI8ZV7sKAAAAYgB5AHQAZQBMAGUAbgBnAHQAaAAEWRFeCgAAAGIAeQB0AGUATwBmAGYAcwBlAHQAQbgHCwZZgiwVWAEAQdAHC4EBgOcJqqW3kPnsWqo3mjLMb65YfwcVMG/eHceiDlv4v3m9ycxe/UMOyeOB1VTegL3xEzHqzORv1W6iHDchA79vjBbb8FpmrDllYl/+aceNSO2GQcG+gCpLGRhNMmrNYPH6Znv2t1c+FgBPgz6Vufk3b8urnpcU+qSV54TyM89r4M0BAEHkCAtlwLIgqk98RTfRfHqEYCYzM1uveb5MW4Fza8GwAJ/9xA+ybPjhMyXCWGXHKGpIV9lH19bSRd7yxkwDYyidOOha9XxOoTt/rGVwysiyY71/90GVwcEb60ErW2bd/gziCCUyAAAAAAEAQdcJC+EBIDRQZcBfyaZSuxPLrsRAwhgGyN9xANWofPVvD9pY/CcTbkdWNX0kIGUCx+do5IykHenmAmjXzTlheXf8wkBb7xZ5jN5D/6dR+ZHzsnj1vb4R6Ffp1ui+6HuwVKyPhI11G+ojpJnp+dOLt6NxQGHaPhXO4z7Lc/lICIyXtCfVG3AQor/vueuFMhVNtE20m7tvGZa2B2z45+6tNtm09ZE1rhMiIhivTmpoTZHaqj1PQHQen72e4AahwJhXwqf9pA6QFw59SXFz4yCPsiDYdgUUOxKFPXQ0gRNDsK0pel8n9DUcAEHHCwsBEABB0AsL3AO5NAMyt/StFBDbGrMIklQODTB9lRRHuhpmCI9NJq3GbfWYv4Xit0URypaFPZK9Hev8oRhg3O9SFjySriILuMG0g50tWwVi2hwwTH6PTouyWxb0Up+LVqUS+9SCdkPtivCP5/kxFWUZGFDxm9lKE+60KEzwpobBJR8DX8Jwy55JFuZCiJxE6yAUsGUINq1upYWF8MoU4v0DGguJmXnVsT0J2NqXOjXrzxCsNj9ec7s4zz5nUvpEr7oVAQAAAAAAAAAFAAAAAAAAABkAAAAAAAAAfQAAAAAAAABxAgAAAAAAADUMAAAAAAAACT0AAAAAAAAtMQEAAAAAAOH1BQAAAAAAZc0dAAAAAAD5ApUAAAAAAN0O6QIAAAAAUUqNDgAAAACVc8JIAAAAAOlBzGsBAAAAjUn9GgcAAADBb/KGIwAAAMUuvKKxAAAA2emsLXgDAAA9kWDkWBEAADHW4nW8VgAA9S5uTa6xAQDJ6iaDZ3gIAO2Vwo8FWioAoe3MzhvC0wAlpAAKi8oiBFRFVFRFVQUEABAEEBQEQAAAAAFAVVUVQVQEAABEAAEAAAAAQEEAAERQREVQVABVVVRVZVEAQABAAQAAAQAFAQARVFFRVFVVBQAVQVAAAARAEAEEBQBBww8LP0CVWWlZVVVUVRVVVVYEBRVBEFRVQEVRVURARVBEUFVVRQBAAEBABESWZVVWVUVARVRRQRVAVZFVVVVVQFEFAQ==';

// The compiled module, kept once compiled; the instance in use, made from it as needed.
let wasmModule = null;
let wasm = null;
let readyPromise = null;

// An instance whose memory grew past this after a call is dropped, and the next call
// makes a fresh one: the memory a large input needed is not held by a small one.
const RETAINED_BYTES = 16 * 1024 * 1024;

function instantiate() {

	if ( readyPromise === null ) {

		readyPromise = ( async () => {

			try {

				const text = atob( wasmBase64 ), bytes = new Uint8Array( text.length );
				for ( let i = 0; i < text.length; i ++ ) bytes[ i ] = text.charCodeAt( i );

				wasmModule = await WebAssembly.compile( bytes );
				wasm = new WebAssembly.Instance( wasmModule ).exports;
				return true;

			} catch ( error ) {

				// WebAssembly unavailable (a content security policy, an old engine): the JavaScript runs.
				return false;

			}

		} )();

	}

	return readyPromise;

}

/**
 * Starts the WebAssembly build on first use and resolves to whether tangents are
 * generated in it from now on (`false` where WebAssembly is unavailable: the
 * JavaScript keeps working). Nothing is loaded until this is awaited.
 */
export const ready = {

	then: function ( onFulfilled, onRejected ) {

		return instantiate().then( onFulfilled, onRejected );

	}

};

/**
 * Releases the WebAssembly module, its instance and memory. Tangents are generated in
 * JavaScript until `ready` is awaited again.
 */
export function dispose() {

	wasmModule = null;
	wasm = null;
	readyPromise = null;

}

// A Float32Array in the module's memory: 16 bytes of header (properties, byte length,
// capacity), then the elements; passed and returned as a NaN-boxed pointer to the elements.
const FLOAT32_ARRAY_BOX = 0x7ff98006n << 32n;

function copyIn( array ) {

	const bytes = array.length * 4;
	const raw = wasm._alloc( 16 + bytes ) >>> 0;
	const header = new DataView( wasm.memory.buffer, raw, 16 );
	header.setInt32( 0, 0, true );
	header.setInt32( 4, 0, true );
	header.setInt32( 8, bytes, true );
	header.setInt32( 12, bytes, true );
	new Float32Array( wasm.memory.buffer, raw + 16, array.length ).set( array );
	return FLOAT32_ARRAY_BOX | BigInt( raw + 16 );

}

function generateTangentsWasm( position, normal, texcoord ) {

	if ( wasm === null ) wasm = new WebAssembly.Instance( wasmModule ).exports;

	let result = null;

	try {

		const box = wasm.generateTangents( copyIn( position ), copyIn( normal ), copyIn( texcoord ) );
		const offset = Number( box & 0xffffffffn );
		const byteLength = new DataView( wasm.memory.buffer ).getInt32( offset - 8, true );
		result = new Float32Array( wasm.memory.buffer, offset, byteLength / 4 ).slice();

	} catch ( error ) {

		// A trap or an allocation failure inside the module: this call is answered in
		// JavaScript, and the instance is not used again.
		wasm = null;
		return generateTangents( position, normal, texcoord );

	}

	// The memory the call used, inputs and all, is reclaimed for the next call.
	wasm._clear();
	if ( wasm.memory.buffer.byteLength > RETAINED_BYTES ) wasm = null;

	return result;

}

function generateTangentsFast( position, normal, texcoord ) {

	if ( wasmModule !== null && position instanceof Float32Array && normal instanceof Float32Array && texcoord instanceof Float32Array &&
		position.length % 9 === 0 && normal.length === position.length && texcoord.length === position.length / 3 * 2 ) {

		return generateTangentsWasm( position, normal, texcoord );

	}

	return generateTangents( position, normal, texcoord );

}

export { generateTangentsFast as generateTangents };
