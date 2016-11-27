import { BufferGeometry } from '../core/BufferGeometry';
import { Float32BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute } from '../core/BufferAttribute';
import { ShapeUtils } from '../extras/ShapeUtils';

/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Creates a one-sided polygonal geometry from one or more shapes.
 *
 **/

function ShapeBufferGeometry( shapes, curveSegments ) {

	BufferGeometry.call( this );

	this.type = 'ShapeBufferGeometry';

	this.parameters = {
		shapes: shapes,
		curveSegments: curveSegments
	};

	curveSegments = curveSegments || 12;

	var vertices = [];
	var normals = [];
	var uvs = [];
	var indices = [];

	var groupStart = 0;
	var groupCount = 0;

	// allow single and array values for "shapes" parameter

	if ( Array.isArray( shapes ) === false ) {

		addShape( shapes );

	} else {

		for ( var i = 0; i < shapes.length; i++ ) {

			addShape( shapes[ i ] );

			this.addGroup( groupStart, groupCount, i ); // enables MultiMaterial support

			groupStart += groupCount;
			groupCount = 0;

		}

	}

	// build geometry

	this.setIndex( new ( indices.length > 65535 ? Uint32BufferAttribute : Uint16BufferAttribute )( indices, 1 ) );
	this.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	this.addAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
	this.addAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );


	// helper functions

	function addShape( shape ) {

		var i, l, shapeHole;

		var indexOffset = vertices.length / 3;
		var points = shape.extractPoints( curveSegments );

		var shapeVertices = points.shape;
		var shapeHoles = points.holes;

		// check direction of vertices

		if ( ShapeUtils.isClockWise( shapeVertices ) === false ) {

			shapeVertices = shapeVertices.reverse();

			// also check if holes are in the opposite direction

			for ( i = 0, l = shapeHoles.length; i < l; i ++ ) {

				shapeHole = shapeHoles[ i ];

				if ( ShapeUtils.isClockWise( shapeHole ) === true ) {

					shapeHoles[ i ] = shapeHole.reverse();

				}

			}

		}

		var faces = ShapeUtils.triangulateShape( shapeVertices, shapeHoles );

		// join vertices of inner and outer paths to a single array

		for ( i = 0, l = shapeHoles.length; i < l; i ++ ) {

			shapeHole = shapeHoles[ i ];
			shapeVertices = shapeVertices.concat( shapeHole );

		}

		// vertices, normals, uvs

		for ( i = 0, l = shapeVertices.length; i < l; i ++ ) {

			var vertex = shapeVertices[ i ];

			vertices.push( vertex.x, vertex.y, 0 );
			normals.push( 0, 0, 1 );
			uvs.push( vertex.x, vertex.y ); // world uvs

		}

		// incides

		for ( i = 0, l = faces.length; i < l; i ++ ) {

			var face = faces[ i ];

			var a = face[ 0 ] + indexOffset;
			var b = face[ 1 ] + indexOffset;
			var c = face[ 2 ] + indexOffset;

			indices.push( a, b, c );
			groupCount += 3;

		}

	}

}

ShapeBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
ShapeBufferGeometry.prototype.constructor = ShapeBufferGeometry;


export { ShapeBufferGeometry };
