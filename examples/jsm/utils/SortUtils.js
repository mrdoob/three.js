// Hybrid radix sort from
// - https://gist.github.com/sciecode/93ed864dd77c5c8803c6a86698d68dab
// - https://github.com/mrdoob/three.js/pull/27202#issuecomment-1817640271
const POWER = 3;
const BIT_MAX = 32;
const BIN_BITS = 1 << POWER;
const BIN_SIZE = 1 << BIN_BITS;
const BIN_MAX = BIN_SIZE - 1;
const ITERATIONS = BIT_MAX / BIN_BITS;

const bins = new Array( ITERATIONS );
const bins_buffer = new ArrayBuffer( ( ITERATIONS + 1 ) * BIN_SIZE * 4 );

let c = 0;
for ( let i = 0; i < ( ITERATIONS + 1 ); i ++ ) {

	bins[ i ] = new Uint32Array( bins_buffer, c, BIN_SIZE );
	c += BIN_SIZE * 4;

}

const defaultGet = ( el ) => el;

export const radixSort = ( arr, opt ) => {

	const len = arr.length;

	const options = opt || {};
	const aux = options.aux || new arr.constructor( len );
	const get = options.get || defaultGet;

	const data = [ arr, aux ];

	let compare, accumulate, recurse;

	if ( options.reversed ) {

		compare = ( a, b ) => a < b;
		accumulate = ( bin ) => {

			for ( let j = BIN_SIZE - 2; j >= 0; j -- )
				bin[ j ] += bin[ j + 1 ];

		};

		recurse = ( cache, depth, start ) => {

			let prev = 0;
			for ( let j = BIN_MAX; j >= 0; j -- ) {

				const cur = cache[ j ], diff = cur - prev;
				if ( diff != 0 ) {

					if ( diff > 32 )
						radixSortBlock( depth + 1, start + prev, diff );
					else
						insertionSortBlock( depth + 1, start + prev, diff );
					prev = cur;

				}

			}

		};

	} else {

		compare = ( a, b ) => a > b;
		accumulate = ( bin ) => {

			for ( let j = 1; j < BIN_SIZE; j ++ )
				bin[ j ] += bin[ j - 1 ];

		};

		recurse = ( cache, depth, start ) => {

			let prev = 0;
			for ( let j = 0; j < BIN_SIZE; j ++ ) {

				const cur = cache[ j ], diff = cur - prev;
				if ( diff != 0 ) {

					if ( diff > 32 )
						radixSortBlock( depth + 1, start + prev, diff );
					else
						insertionSortBlock( depth + 1, start + prev, diff );
					prev = cur;

				}

			}

		};

	}

	const insertionSortBlock = ( depth, start, len ) => {

		const a = data[ depth & 1 ];
		const b = data[ ( depth + 1 ) & 1 ];

		for ( let j = start + 1; j < start + len; j ++ ) {

			const p = a[ j ], t = get( p );
			let i = j;
			while ( i > 0 ) {

				if ( compare( get( a[ i - 1 ] ), t ) )
					a[ i ] = a[ -- i ];
				else
					break;

			}

			a[ i ] = p;

		}

		if ( ( depth & 1 ) == 1 ) {

			for ( let i = start; i < start + len; i ++ )
				b[ i ] = a[ i ];

		}

	};

	const radixSortBlock = ( depth, start, len ) => {

		const a = data[ depth & 1 ];
		const b = data[ ( depth + 1 ) & 1 ];

		const shift = ( 3 - depth ) << POWER;
		const end = start + len;

		const cache = bins[ depth ];
		const bin = bins[ depth + 1 ];

		bin.fill( 0 );

		for ( let j = start; j < end; j ++ )
			bin[ ( get( a[ j ] ) >> shift ) & BIN_MAX ] ++;

		accumulate( bin );

		cache.set( bin );

		for ( let j = end - 1; j >= start; j -- )
			b[ start + -- bin[ ( get( a[ j ] ) >> shift ) & BIN_MAX ] ] = a[ j ];

		if ( depth == ITERATIONS - 1 ) return;

		recurse( cache, depth, start );

	};

	radixSortBlock( 0, 0, len );

};
