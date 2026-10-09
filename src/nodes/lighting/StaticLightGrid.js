// Keep GPU buffers below 11 MiB and bound the CPU work before visiting cells.
const MAX_CELLS = 262144;
const MAX_REFERENCES = 1048576;
const MAX_LIGHTS = 65536;
const MAX_CELL_VISITS = MAX_REFERENCES * 4;

/**
 * Packs static point and spot lights into a bounded world-space grid.
 * Spotlights use their range sphere for conservative cell assignment.
 *
 * Each cell stores an offset and count into the light-index buffer. Each light
 * occupies four vec4s: position/range, color/decay, direction/cone cosine and
 * penumbra cosine/spot flag/padding. The spotlight direction points toward the
 * light, matching the fragment-to-light direction used for lighting.
 *
 * The caller must update light and target world matrices before building the
 * grid. A null result requests the ordinary individual-light rendering path.
 *
 * @param {Array<PointLight|SpotLight>} lights - The lights to pack.
 * @return {?Object} The grid and its packed buffers, or null when unsupported.
 */
function buildStaticLightGrid( lights ) {

	if ( lights.length === 0 || lights.length > MAX_LIGHTS ) return null;

	const data = new Float32Array( lights.length * 16 );
	const ranges = new Float32Array( lights.length );
	const min = [ Infinity, Infinity, Infinity ];
	const max = [ - Infinity, - Infinity, - Infinity ];

	for ( let i = 0; i < lights.length; i ++ ) {

		const light = lights[ i ];
		if ( light.isPointLight !== true && light.isSpotLight !== true ) return null;

		const offset = i * 16;
		const position = light.matrixWorld.elements;

		data[ offset ] = position[ 12 ];
		data[ offset + 1 ] = position[ 13 ];
		data[ offset + 2 ] = position[ 14 ];
		data[ offset + 3 ] = light.distance;
		data[ offset + 4 ] = light.color.r * light.intensity;
		data[ offset + 5 ] = light.color.g * light.intensity;
		data[ offset + 6 ] = light.color.b * light.intensity;
		data[ offset + 7 ] = light.decay;

		if ( light.isSpotLight === true ) {

			if ( ! Number.isFinite( light.angle ) || ! Number.isFinite( light.penumbra ) ) return null;

			const target = light.target.matrixWorld.elements;
			const x = position[ 12 ] - target[ 12 ];
			const y = position[ 13 ] - target[ 13 ];
			const z = position[ 14 ] - target[ 14 ];
			const length = Math.hypot( x, y, z ) || 1;

			data[ offset + 8 ] = x / length;
			data[ offset + 9 ] = y / length;
			data[ offset + 10 ] = z / length;
			data[ offset + 11 ] = Math.cos( light.angle );
			data[ offset + 12 ] = Math.cos( light.angle * ( 1 - light.penumbra ) );
			data[ offset + 13 ] = 1;

		}

		for ( let j = 0; j < 16; j ++ ) {

			if ( ! Number.isFinite( data[ offset + j ] ) ) return null;

		}

		const radius = data[ offset + 3 ];
		if ( radius <= 0 ) return null;
		ranges[ i ] = radius;

		for ( let axis = 0; axis < 3; axis ++ ) {

			min[ axis ] = Math.min( min[ axis ], data[ offset + axis ] - radius );
			max[ axis ] = Math.max( max[ axis ], data[ offset + axis ] + radius );

		}

	}

	// Use a typical range so a few very large lights do not collapse the grid.
	// Limiting the longest axis to 64 cells also bounds sparse scene allocation.
	ranges.sort();
	let cellSize = Math.max( ranges[ Math.floor( ranges.length / 2 ) ], ...max.map( ( value, axis ) => ( value - min[ axis ] ) / 64 ) );

	// Leave room for float rounding in the fragment's world-to-cell calculation.
	const origin = min.map( ( value, axis ) => {

		const padding = Math.max( Math.abs( value ), Math.abs( max[ axis ] ), cellSize ) * 1e-6;
		max[ axis ] += padding;
		return Math.fround( value - padding );

	} );

	cellSize = Math.fround( Math.max( cellSize, ...max.map( ( value, axis ) => ( value - origin[ axis ] ) / 64 ) ) * ( 1 + 1e-6 ) );
	if ( ! Number.isFinite( cellSize ) || cellSize <= 0 ) return null;

	const dims = max.map( ( value, axis ) => Math.max( 1, Math.ceil( ( value - origin[ axis ] ) / cellSize ) ) );
	const cellCount = dims[ 0 ] * dims[ 1 ] * dims[ 2 ];

	if ( cellCount > MAX_CELLS || ! Number.isFinite( cellCount ) ) return null;

	for ( let axis = 0; axis < 3; axis ++ ) {

		if ( ! Number.isFinite( origin[ axis ] ) || ! Number.isFinite( Math.fround( max[ axis ] - origin[ axis ] ) ) ) return null;

	}

	const bounds = new Uint32Array( lights.length * 6 );
	const cellPadding = cellSize * 1e-5;
	let visits = 0;

	for ( let i = 0; i < lights.length; i ++ ) {

		const radius = data[ i * 16 + 3 ] + cellPadding;
		let volume = 1;

		for ( let axis = 0; axis < 3; axis ++ ) {

			const position = data[ i * 16 + axis ];
			const low = Math.max( 0, Math.floor( ( position - radius - origin[ axis ] ) / cellSize ) );
			const high = Math.min( dims[ axis ] - 1, Math.floor( ( position + radius - origin[ axis ] ) / cellSize ) );
			bounds[ i * 6 + axis ] = low;
			bounds[ i * 6 + axis + 3 ] = high;
			volume *= high - low + 1;

		}

		visits += volume;
		if ( visits > MAX_CELL_VISITS ) return null;

	}

	const cells = new Uint32Array( cellCount * 2 );
	let references = 0;

	// Count first, then scatter into an exactly sized index buffer. No per-cell
	// cap is used: exceeding the budget falls back instead of dropping lights.
	const visitCells = ( callback ) => {

		for ( let i = 0; i < lights.length; i ++ ) {

			const offset = i * 16;
			const radius = data[ offset + 3 ] + cellPadding;
			const radiusSquared = radius * radius;
			const bound = i * 6;

			for ( let z = bounds[ bound + 2 ]; z <= bounds[ bound + 5 ]; z ++ ) {

				const dz = Math.max( origin[ 2 ] + z * cellSize - data[ offset + 2 ], data[ offset + 2 ] - origin[ 2 ] - ( z + 1 ) * cellSize, 0 );

				for ( let y = bounds[ bound + 1 ]; y <= bounds[ bound + 4 ]; y ++ ) {

					const dy = Math.max( origin[ 1 ] + y * cellSize - data[ offset + 1 ], data[ offset + 1 ] - origin[ 1 ] - ( y + 1 ) * cellSize, 0 );

					for ( let x = bounds[ bound ]; x <= bounds[ bound + 3 ]; x ++ ) {

						const dx = Math.max( origin[ 0 ] + x * cellSize - data[ offset ], data[ offset ] - origin[ 0 ] - ( x + 1 ) * cellSize, 0 );
						if ( dx * dx + dy * dy + dz * dz > radiusSquared ) continue;

						const cell = ( ( z * dims[ 1 ] + y ) * dims[ 0 ] + x ) * 2;
						if ( callback( cell, i ) === false ) return false;

					}

				}

			}

		}

		return true;

	};

	if ( visitCells( ( cell ) => {

		cells[ cell + 1 ] ++;
		return ++ references <= MAX_REFERENCES;

	} ) === false ) return null;

	let offset = 0;

	for ( let i = 0; i < cells.length; i += 2 ) {

		cells[ i ] = offset;
		offset += cells[ i + 1 ];

	}

	const indices = new Uint32Array( references );
	const cursors = new Uint32Array( cellCount );

	visitCells( ( cell, index ) => {

		indices[ cells[ cell ] + cursors[ cell / 2 ] ++ ] = index;

	} );

	return { origin, dims, cellSize, cells, indices, data };

}

export { buildStaticLightGrid };
