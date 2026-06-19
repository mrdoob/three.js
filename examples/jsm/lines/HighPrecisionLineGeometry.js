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
	 * @param {Array<number>} [parameters.positions]
	 * Flat array of xyz coordinates:
	 * [ x1, y1, z1, x2, y2, z2, ... ]
	 * @param {Float32Array} [parameters.positionsHigh]
	 * @param {Float32Array} [parameters.positionsLow]
	 */
	constructor( parameters = {} ) {

		super();

		const { positions, positionsHigh, positionsLow } = parameters;

		if ( positionsHigh && positionsLow ) {

			if ( positionsHigh.length !== positionsLow.length ) {

				throw new Error(
					'HighPrecisionLineGeometry: positionsHigh and positionsLow must have the same length.',
				);

			}

			this.setPositionsHigh( positionsHigh );
			this.setPositionsLow( positionsLow );

		} else if ( positions !== undefined ) {

			this.setFromPositions( positions );

		}

		if ( this.attributes.positionHigh ) {

			this.setDrawRange( 0, this.attributes.positionHigh.count );

		}

		this.isHighPrecisionLineGeometry = true;
		this.type = 'HighPrecisionLineGeometry';

	}

	/**
	 * Creates split high/low precision position buffers
	 * from an array of Vector2 or Vector3 points.
	 *
	 * This method mirrors BufferGeometry.setFromPoints()
	 * for API compatibility with existing Three.js geometry
	 * workflows.
	 *
	 * @param {Array<import("three").Vector2|import("three").Vector3>} points
	 * @return {HighPrecisionLineGeometry}
	 */
	setFromPoints( points ) {

		const positions = [];

		for ( const point of points ) {

			positions.push( point.x, point.y, point.z ?? 0 );

		}

		return this.setFromPositions( positions );

	}

	/**
	 * Creates split high/low precision position buffers
	 * from a flat array of xyz coordinates.
	 *
	 * @param {Array<number>} positions
	 * @return {HighPrecisionLineGeometry}
	 */
	setFromPositions( positions ) {

		if ( positions.length % 3 !== 0 ) {

			throw new Error(
				'HighPrecisionLineGeometry: positions array length must be divisible by 3.',
			);

		}

		const positionsHigh = new Float32Array( positions.length );
		const positionsLow = new Float32Array( positions.length );

		for ( let i = 0; i < positions.length; i += 3 ) {

			const [ hx, lx ] = splitDouble( positions[ i ] );
			const [ hy, ly ] = splitDouble( positions[ i + 1 ] );
			const [ hz, lz ] = splitDouble( positions[ i + 2 ] );

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
