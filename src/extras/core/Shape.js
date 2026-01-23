import { Path } from './Path.js';
import { generateUUID } from '../../math/MathUtils.js';

/**
 * Defines an arbitrary 2d shape plane using paths with optional holes. It
 * can be used with {@link ExtrudeGeometry}, {@link ShapeGeometry}, to get
 * points, or to get triangulated faces.
 *
 * ```js
 * const heartShape = new THREE.Shape();
 *
 * heartShape.moveTo( 25, 25 );
 * heartShape.bezierCurveTo( 25, 25, 20, 0, 0, 0 );
 * heartShape.bezierCurveTo( - 30, 0, - 30, 35, - 30, 35 );
 * heartShape.bezierCurveTo( - 30, 55, - 10, 77, 25, 95 );
 * heartShape.bezierCurveTo( 60, 77, 80, 55, 80, 35 );
 * heartShape.bezierCurveTo( 80, 35, 80, 0, 50, 0 );
 * heartShape.bezierCurveTo( 35, 0, 25, 25, 25, 25 );
 *
 * const extrudeSettings = {
 * 	depth: 8,
 * 	bevelEnabled: true,
 * 	bevelSegments: 2,
 * 	steps: 2,
 * 	bevelSize: 1,
 * 	bevelThickness: 1
 * };
 *
 * const geometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings );
 * const mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial() );
 * ```
 *
 * @augments Path
 */
class Shape extends Path {

	/**
	 * Constructs a new shape.
	 *
	 * @param {Array<Vector2>} [points] - An array of 2D points defining the shape.
	 */
	constructor( points ) {

		super( points );

		/**
		 * The UUID of the shape.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.uuid = generateUUID();

		this.type = 'Shape';

		/**
		 * Defines the holes in the shape. Hole definitions must use the
		 * opposite winding order (CW/CCW) than the outer shape.
		 *
		 * @type {Array<Path>}
		 * @readonly
		 */
		this.holes = [];

	}

	/**
	 * Returns an array representing each contour of the holes
	 * as a list of 2D points.
	 *
	 * @param {number} divisions - The fineness of the result.
	 * @return {Array<Array<Vector2>>} The holes as a series of 2D points.
	 */
	getPointsHoles( divisions ) {

		const holesPts = [];

		for ( let i = 0, l = this.holes.length; i < l; i ++ ) {

			holesPts[ i ] = this.holes[ i ].getPoints( divisions );

		}

		return holesPts;

	}

	// get points of shape and holes (keypoints based on segments parameter)

	/**
	 * Returns an object that holds contour data for the shape and its holes as
	 * arrays of 2D points.
	 *
	 * @param {number} divisions - The fineness of the result.
	 * @return {{shape:Array<Vector2>,holes:Array<Array<Vector2>>}} An object with contour data.
	 */
	extractPoints( divisions ) {

		return {

			shape: this.getPoints( divisions ),
			holes: this.getPointsHoles( divisions )

		};

	}

	copy( source ) {

		super.copy( source );

		this.holes = [];

		for ( let i = 0, l = source.holes.length; i < l; i ++ ) {

			const hole = source.holes[ i ];

			this.holes.push( hole.clone() );

		}

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.uuid = this.uuid;
		data.holes = [];

		for ( let i = 0, l = this.holes.length; i < l; i ++ ) {

			const hole = this.holes[ i ];
			data.holes.push( hole.toJSON() );

		}

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.uuid = json.uuid;
		this.holes = [];

		for ( let i = 0, l = json.holes.length; i < l; i ++ ) {

			const hole = json.holes[ i ];
			this.holes.push( new Path().fromJSON( hole ) );

		}

		return this;

	}

}


export { Shape };
