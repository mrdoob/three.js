/**
 * @author jonobr1 / http://jonobr1.com
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Geometry } from '../core/Geometry.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { ShapeUtils } from '../extras/ShapeUtils.js';

// ShapeGeometry

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

ShapeGeometry.prototype.toJSON = function () {

	var data = Geometry.prototype.toJSON.call( this );

	var shapes = this.parameters.shapes;

	return toJSON( shapes, data );

};

// ShapeBufferGeometry

function ShapeBufferGeometry( shapes, curveSegments ) {

	BufferGeometry.call( this );

	this.type = 'ShapeBufferGeometry';

	this.parameters = {
		shapes: shapes,
		curveSegments: curveSegments
	};

	curveSegments = curveSegments || 12;

	// buffers

	var indices = [];
	var vertices = [];
	var normals = [];
	var uvs = [];

	// helper variables

	var groupStart = 0;
	var groupCount = 0;

	// allow single and array values for "shapes" parameter

	if ( Array.isArray( shapes ) === false ) {

		addShape( shapes );

	} else {

		for ( var i = 0; i < shapes.length; i ++ ) {

			addShape( shapes[ i ] );

			this.addGroup( groupStart, groupCount, i ); // enables MultiMaterial support

			groupStart += groupCount;
			groupCount = 0;

		}

	}

	// build geometry

	this.setIndex( indices );
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

ShapeBufferGeometry.prototype.toJSON = function () {

	var data = BufferGeometry.prototype.toJSON.call( this );

	var shapes = this.parameters.shapes;

	return toJSON( shapes, data );

};

//

function toJSON( shapes, data ) {

	data.shapes = [];

	if ( Array.isArray( shapes ) ) {

		for ( var i = 0, l = shapes.length; i < l; i ++ ) {

			var shape = shapes[ i ];

			data.shapes.push( shape.uuid );

		}

	} else {

		data.shapes.push( shapes.uuid );

	}

	return data;

}


export { ShapeGeometry, ShapeBufferGeometry };
