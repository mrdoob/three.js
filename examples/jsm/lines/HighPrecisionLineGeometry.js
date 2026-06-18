import { BufferAttribute, BufferGeometry, DynamicDrawUsage } from 'three';

import { splitDouble } from './utils/splitDouble.js';

/**
 * Geometry for rendering lines using high precision coordinates.
 *
 * Positions are stored as split high/low precision buffers and
 * reconstructed in the vertex shader relative to the camera.
 */
export class HighPrecisionLineGeometry extends BufferGeometry {

	/**
	 * @param {Object} [parameters]
	 * @param {Array<number>} [parameters.points]
	 * Flat array of xyz coordinates:
	 * [ x1, y1, z1, x2, y2, z2, ... ]
	 * @param {Float32Array} [parameters.positionsHigh]
	 * @param {Float32Array} [parameters.positionsLow]
	 */
	constructor( parameters = {} ) {

		super();

		const { points, positionsHigh, positionsLow } = parameters;

		if ( positionsHigh && positionsLow ) {

			if ( positionsHigh.length !== positionsLow.length ) {

				throw new Error(
					'HighPrecisionLineGeometry: positionsHigh and positionsLow must have the same length.',
				);

			}

			this.setPositionsHigh( positionsHigh );
			this.setPositionsLow( positionsLow );

		} else if ( points ) {

			this.setFromPoints( points );

		}

		if ( this.attributes.positionHigh ) {

			this.setDrawRange( 0, this.attributes.positionHigh.count );

		}

		this.isHighPrecisionLineGeometry = true;
		this.type = 'HighPrecisionLineGeometry';

	}

	/**
	 * Creates split high/low precision position buffers
	 * from a flat array of xyz coordinates.
	 *
	 * @param {Array<number>} points
	 * @return {HighPrecisionLineGeometry}
	 */
	setFromPoints( points ) {

		if ( points.length % 3 !== 0 ) {

			throw new Error(
				'HighPrecisionLineGeometry: points array length must be divisible by 3.',
			);

		}

		const positionsHigh = new Float32Array( points.length );
		const positionsLow = new Float32Array( points.length );

		for ( let i = 0; i < points.length; i += 3 ) {

			const [ hx, lx ] = splitDouble( points[ i ] );
			const [ hy, ly ] = splitDouble( points[ i + 1 ] );
			const [ hz, lz ] = splitDouble( points[ i + 2 ] );

			positionsHigh[ i ] = hx;
			positionsHigh[ i + 1 ] = hy;
			positionsHigh[ i + 2 ] = hz;

			positionsLow[ i ] = lx;
			positionsLow[ i + 1 ] = ly;
			positionsLow[ i + 2 ] = lz;

		}

		this.setPositionsHigh( positionsHigh );
		this.setPositionsLow( positionsLow );

		return this;

	}

	/**
	 * Sets the high precision position buffer.
	 *
	 * The attribute is also exposed as "position" so
	 * existing BufferGeometry systems such as bounding
	 * volumes and frustum culling continue to function.
	 *
	 * @param {Float32Array} positionsHigh
	 * @return {HighPrecisionLineGeometry}
	 */
	setPositionsHigh( positionsHigh ) {

		const attribute = new BufferAttribute( positionsHigh, 3 ).setUsage(
			DynamicDrawUsage,
		);

		this.setAttribute( 'positionHigh', attribute );
		this.setAttribute( 'position', attribute );

		return this;

	}

	/**
	 * Sets the low precision position buffer.
	 *
	 * @param {Float32Array} positionsLow
	 * @return {HighPrecisionLineGeometry}
	 */
	setPositionsLow( positionsLow ) {

		this.setAttribute(
			'positionLow',
			new BufferAttribute( positionsLow, 3 ).setUsage( DynamicDrawUsage ),
		);

		return this;

	}

}
