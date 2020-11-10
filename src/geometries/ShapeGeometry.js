import { Geometry } from '../core/Geometry.js';
import { ShapeBufferGeometry } from './ShapeBufferGeometry.js';

class ShapeGeometry extends Geometry {

	constructor( shapes, curveSegments ) {

		super();
		this.type = 'ShapeGeometry';

		if ( typeof curveSegments === 'object' ) {

			console.warn( 'THREE.ShapeGeometry: Options parameter has been removed.' );

			curveSegments = curveSegments.curveSegments;

		}

		this.parameters = {
			shapes: shapes,
			curveSegments: curveSegments
		};

		this.fromBufferGeometry( new ShapeBufferGeometry( shapes, curveSegments ) );
		this.mergeVertices();

	}

	toJSON() {

		const data = Geometry.prototype.toJSON.call( this );

		const shapes = this.parameters.shapes;

		return toJSON( shapes, data );

	}

}

function toJSON( shapes, data ) {

	data.shapes = [];

	if ( Array.isArray( shapes ) ) {

		for ( let i = 0, l = shapes.length; i < l; i ++ ) {

			const shape = shapes[ i ];

			data.shapes.push( shape.uuid );

		}

	} else {

		data.shapes.push( shapes.uuid );

	}

	return data;

}

export { ShapeGeometry };
