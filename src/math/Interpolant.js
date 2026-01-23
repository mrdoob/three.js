/**
 * Abstract base class of interpolants over parametric samples.
 *
 * The parameter domain is one dimensional, typically the time or a path
 * along a curve defined by the data.
 *
 * The sample values can have any dimensionality and derived classes may
 * apply special interpretations to the data.
 *
 * This class provides the interval seek in a Template Method, deferring
 * the actual interpolation to derived classes.
 *
 * Time complexity is O(1) for linear access crossing at most two points
 * and O(log N) for random access, where N is the number of positions.
 *
 * References: {@link http://www.oodesign.com/template-method-pattern.html}
 *
 * @abstract
 */
class Interpolant {

	/**
	 * Constructs a new interpolant.
	 *
	 * @param {TypedArray} parameterPositions - The parameter positions hold the interpolation factors.
	 * @param {TypedArray} sampleValues - The sample values.
	 * @param {number} sampleSize - The sample size
	 * @param {TypedArray} [resultBuffer] - The result buffer.
	 */
	constructor( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

		/**
		 * The parameter positions.
		 *
		 * @type {TypedArray}
		 */
		this.parameterPositions = parameterPositions;

		/**
		 * A cache index.
		 *
		 * @private
		 * @type {number}
		 * @default 0
		 */
		this._cachedIndex = 0;

		/**
		 * The result buffer.
		 *
		 * @type {TypedArray}
		 */
		this.resultBuffer = resultBuffer !== undefined ? resultBuffer : new sampleValues.constructor( sampleSize );

		/**
		 * The sample values.
		 *
		 * @type {TypedArray}
		 */
		this.sampleValues = sampleValues;

		/**
		 * The value size.
		 *
		 * @type {TypedArray}
		 */
		this.valueSize = sampleSize;

		/**
		 * The interpolation settings.
		 *
		 * @type {?Object}
		 * @default null
		 */
		this.settings = null;

		/**
		 * The default settings object.
		 *
		 * @type {Object}
		 */
		this.DefaultSettings_ = {};

	}

	/**
	 * Evaluate the interpolant at position `t`.
	 *
	 * @param {number} t - The interpolation factor.
	 * @return {TypedArray} The result buffer.
	 */
	evaluate( t ) {

		const pp = this.parameterPositions;
		let i1 = this._cachedIndex,
			t1 = pp[ i1 ],
			t0 = pp[ i1 - 1 ];

		validate_interval: {

			seek: {

				let right;

				linear_scan: {

					//- See http://jsperf.com/comparison-to-undefined/3
					//- slower code:
					//-
					//- 				if ( t >= t1 || t1 === undefined ) {
					forward_scan: if ( ! ( t < t1 ) ) {

						for ( let giveUpAt = i1 + 2; ; ) {

							if ( t1 === undefined ) {

								if ( t < t0 ) break forward_scan;

								// after end

								i1 = pp.length;
								this._cachedIndex = i1;
								return this.copySampleValue_( i1 - 1 );

							}

							if ( i1 === giveUpAt ) break; // this loop

							t0 = t1;
							t1 = pp[ ++ i1 ];

							if ( t < t1 ) {

								// we have arrived at the sought interval
								break seek;

							}

						}

						// prepare binary search on the right side of the index
						right = pp.length;
						break linear_scan;

					}

					//- slower code:
					//-					if ( t < t0 || t0 === undefined ) {
					if ( ! ( t >= t0 ) ) {

						// looping?

						const t1global = pp[ 1 ];

						if ( t < t1global ) {

							i1 = 2; // + 1, using the scan for the details
							t0 = t1global;

						}

						// linear reverse scan

						for ( let giveUpAt = i1 - 2; ; ) {

							if ( t0 === undefined ) {

								// before start

								this._cachedIndex = 0;
								return this.copySampleValue_( 0 );

							}

							if ( i1 === giveUpAt ) break; // this loop

							t1 = t0;
							t0 = pp[ -- i1 - 1 ];

							if ( t >= t0 ) {

								// we have arrived at the sought interval
								break seek;

							}

						}

						// prepare binary search on the left side of the index
						right = i1;
						i1 = 0;
						break linear_scan;

					}

					// the interval is valid

					break validate_interval;

				} // linear scan

				// binary search

				while ( i1 < right ) {

					const mid = ( i1 + right ) >>> 1;

					if ( t < pp[ mid ] ) {

						right = mid;

					} else {

						i1 = mid + 1;

					}

				}

				t1 = pp[ i1 ];
				t0 = pp[ i1 - 1 ];

				// check boundary cases, again

				if ( t0 === undefined ) {

					this._cachedIndex = 0;
					return this.copySampleValue_( 0 );

				}

				if ( t1 === undefined ) {

					i1 = pp.length;
					this._cachedIndex = i1;
					return this.copySampleValue_( i1 - 1 );

				}

			} // seek

			this._cachedIndex = i1;

			this.intervalChanged_( i1, t0, t1 );

		} // validate_interval

		return this.interpolate_( i1, t0, t, t1 );

	}

	/**
	 * Returns the interpolation settings.
	 *
	 * @return {Object} The interpolation settings.
	 */
	getSettings_() {

		return this.settings || this.DefaultSettings_;

	}

	/**
	 * Copies a sample value to the result buffer.
	 *
	 * @param {number} index - An index into the sample value buffer.
	 * @return {TypedArray} The result buffer.
	 */
	copySampleValue_( index ) {

		// copies a sample value to the result buffer

		const result = this.resultBuffer,
			values = this.sampleValues,
			stride = this.valueSize,
			offset = index * stride;

		for ( let i = 0; i !== stride; ++ i ) {

			result[ i ] = values[ offset + i ];

		}

		return result;

	}

	/**
	 * Copies a sample value to the result buffer.
	 *
	 * @abstract
	 * @param {number} i1 - An index into the sample value buffer.
	 * @param {number} t0 - The previous interpolation factor.
	 * @param {number} t - The current interpolation factor.
	 * @param {number} t1 - The next interpolation factor.
	 * @return {TypedArray} The result buffer.
	 */
	interpolate_( /* i1, t0, t, t1 */ ) {

		throw new Error( 'call to abstract method' );
		// implementations shall return this.resultBuffer

	}

	/**
	 * Optional method that is executed when the interval has changed.
	 *
	 * @param {number} i1 - An index into the sample value buffer.
	 * @param {number} t0 - The previous interpolation factor.
	 * @param {number} t - The current interpolation factor.
	 */
	intervalChanged_( /* i1, t0, t1 */ ) {

		// empty

	}

}

export { Interpolant };
