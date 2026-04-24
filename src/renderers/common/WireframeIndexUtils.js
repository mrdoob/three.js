import { Uint16BufferAttribute, Uint32BufferAttribute } from '../../core/BufferAttribute.js';

/**
 * Stable value for the wireframe cache when drawRange or group ranges change
 * (e.g. BatchedMesh grows the used prefix) without a buffer version bump.
 *
 * @param {import('../../core/BufferGeometry.js').BufferGeometry} geometry
 * @return {string}
 */
function getWireframeRangeKey( geometry ) {

	const dr = geometry.drawRange;
	let key = String( dr.start ) + ',' + String( dr.count );
	const g = geometry.groups;
	for ( let i = 0, l = g.length; i < l; i ++ ) {

		const gr = g[ i ];
		key += ';' + gr.start + ',' + gr.count + ',' + gr.materialIndex;

	}

	return key;

}

/**
 * @param {number} itemCount
 * @param {{ start: number, count: number }} drawRange
 * @return {{ start: number, end: number }}
 */
function getEffectiveItemRange( itemCount, drawRange ) {

	let start = drawRange.start;
	let end = drawRange.start + drawRange.count;
	if ( ! Number.isFinite( end ) || end > itemCount ) {

		end = itemCount;

	}

	start = Math.max( 0, Math.min( start, itemCount ) );
	end = Math.max( start, Math.min( end, itemCount ) );

	return { start, end };

}

/**
 * Returns a new buffer attribute whose contents are line indices (pairs for each tri edge)
 * for wireframe drawing. Respects `geometry.drawRange` and `geometry.groups` (indexed) so
 * large pooled or partially used buffers (e.g. BatchedMesh) are not fully expanded.
 *
 * @param {import('../../core/BufferGeometry.js').BufferGeometry} geometry
 * @return {?import('../../core/BufferAttribute.js').BufferAttribute}
 */
function createWireframeIndexBufferAttribute( geometry ) {

	const position = geometry.attributes.position;
	if ( position === undefined ) return null;

	const useUint32 = position.count > 65535;
	const IndexArray = useUint32 ? Uint32Array : Uint16Array;
	const index = geometry.index;

	// Per-item draw range: indices for indexed, vertices for non-indexed.
	if ( index !== null ) {

		const array = index.array;
		const groupList = geometry.groups;
		const { start: rangeStart, end: rangeEnd } = getEffectiveItemRange( index.count, geometry.drawRange );

		let triCount;
		if ( groupList.length > 0 ) {

			triCount = 0;
			for ( let o = 0, ol = groupList.length; o < ol; o ++ ) {

				const g = groupList[ o ];
				const s = Math.max( g.start, rangeStart );
				const e = Math.min( g.start + g.count, rangeEnd );
				if ( s < e ) triCount += Math.floor( ( e - s ) / 3 );

			}

		} else {

			triCount = Math.max( 0, Math.floor( ( rangeEnd - rangeStart ) / 3 ) );

		}

		const out = new IndexArray( triCount * 6 );
		let w = 0;
		if ( groupList.length > 0 ) {

			for ( let o = 0, ol = groupList.length; o < ol; o ++ ) {

				const g = groupList[ o ];
				const s0 = Math.max( g.start, rangeStart );
				const s1 = Math.min( g.start + g.count, rangeEnd );
				for ( let i = s0, l = s1; i < l; i += 3 ) {

					const a = array[ i + 0 ];
					const b = array[ i + 1 ];
					const c = array[ i + 2 ];
					out[ w ++ ] = a; out[ w ++ ] = b;
					out[ w ++ ] = b; out[ w ++ ] = c;
					out[ w ++ ] = c; out[ w ++ ] = a;

				}

			}

		} else {

			for ( let i = rangeStart, l = rangeEnd; i < l; i += 3 ) {

				const a = array[ i + 0 ];
				const b = array[ i + 1 ];
				const c = array[ i + 2 ];
				out[ w ++ ] = a; out[ w ++ ] = b;
				out[ w ++ ] = b; out[ w ++ ] = c;
				out[ w ++ ] = c; out[ w ++ ] = a;

			}

		}

		return new ( useUint32 ? Uint32BufferAttribute : Uint16BufferAttribute )( out, 1 );

	} else {

		// `position.count`, not `array.length / 3` — for InterleavedBufferAttribute, `array` is the
		// full interleaved buffer.
		const { start: rangeStart, end: rangeEnd } = getEffectiveItemRange( position.count, geometry.drawRange );
		const triCount = Math.max( 0, Math.floor( ( rangeEnd - rangeStart ) / 3 ) );

		const out = new IndexArray( triCount * 6 );
		let w = 0;
		for ( let t = 0; t < triCount; t ++ ) {

			const a = rangeStart + t * 3;
			const b = a + 1;
			const c = a + 2;
			out[ w ++ ] = a; out[ w ++ ] = b;
			out[ w ++ ] = b; out[ w ++ ] = c;
			out[ w ++ ] = c; out[ w ++ ] = a;

		}

		return new ( useUint32 ? Uint32BufferAttribute : Uint16BufferAttribute )( out, 1 );

	}

}

export { createWireframeIndexBufferAttribute, getWireframeRangeKey };
