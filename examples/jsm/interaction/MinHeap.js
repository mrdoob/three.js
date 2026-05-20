/**
 * Binary min-heap ordered by {@link MinHeap#push} item `.distance` (ascending).
 */
class MinHeap {

	constructor() {

		/**
		 * @type {Array<{distance: number}>}
		 */
		this._heap = [];

	}

	/**
	 * @param {{distance: number}} item
	 */
	push( item ) {

		this._heap.push( item );
		this._bubbleUp( this._heap.length - 1 );

	}

	/**
	 * @return {{distance: number}|undefined}
	 */
	pop() {

		const n = this._heap.length;

		if ( n === 0 ) return undefined;

		const top = this._heap[ 0 ];

		if ( n === 1 ) {

			this._heap.pop();
			return top;

		}

		const last = this._heap.pop();
		this._heap[ 0 ] = last;
		this._bubbleDown( 0 );

		return top;

	}

	/**
	 * @return {number}
	 */
	size() {

		return this._heap.length;

	}

	_bubbleUp( index ) {

		const heap = this._heap;

		while ( index > 0 ) {

			const parent = ( index - 1 ) >> 1;

			if ( heap[ parent ].distance <= heap[ index ].distance ) break;

			const tmp = heap[ parent ];
			heap[ parent ] = heap[ index ];
			heap[ index ] = tmp;

			index = parent;

		}

	}

	_bubbleDown( index ) {

		const heap = this._heap;
		const n = heap.length;

		while ( true ) {

			const left = ( index << 1 ) + 1;
			const right = left + 1;
			let smallest = index;

			if ( left < n && heap[ left ].distance < heap[ smallest ].distance ) {

				smallest = left;

			}

			if ( right < n && heap[ right ].distance < heap[ smallest ].distance ) {

				smallest = right;

			}

			if ( smallest === index ) break;

			const tmp = heap[ index ];
			heap[ index ] = heap[ smallest ];
			heap[ smallest ] = tmp;

			index = smallest;

		}

	}

}

export { MinHeap };
