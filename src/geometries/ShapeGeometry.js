import { Geometry } from '../core/Geometry';
import { ShapeBufferGeometry } from './ShapeBufferGeometry';

/**
 * @author jonobr1 / http://jonobr1.com
 *
 * Creates a one-sided polygonal geometry from a path shape.
 *
 **/

function ShapeGeometry( shapes, curveSegments ) {

	Geometry.call( this );

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

ShapeGeometry.prototype = Object.create( Geometry.prototype );
ShapeGeometry.prototype.constructor = ShapeGeometry;


export { ShapeGeometry };
