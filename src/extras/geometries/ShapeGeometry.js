/**
 * @author jonobr1 / http://jonobr1.com
 *
 * Creates a one-sided polygonal geometry from a path shape. Similar to
 * ExtrudeGeometry.
 *
 * parameters = {
 *
 *	curveSegments: <int>, // number of points on the curves. NOT USED AT THE MOMENT.
 *
 *	material: <int> // material index for front and back faces
 *	uvGenerator: <Object> // object that provides UV generator functions
 *
 * }
 */

module.exports = ShapeGeometry;

var ExtrudeGeometry = require( "./ExtrudeGeometry" ),
	ShapeUtils = require( "../ShapeUtils" ),
	Face3 = require( "../../core/Face3" ),
	Geometry = require( "../../core/Geometry" ),
	Vector3 = require( "../../math/Vector3" );

function ShapeGeometry( shapes, options ) {

	Geometry.call( this );

	this.type = "ShapeGeometry";

	if ( Array.isArray( shapes ) === false ) { shapes = [ shapes ]; }

	this.addShapeList( shapes, options );

	this.computeFaceNormals();

}

ShapeGeometry.prototype = Object.create( Geometry.prototype );
ShapeGeometry.prototype.constructor = ShapeGeometry;

/**
 * Add an array of shapes to ShapeGeometry.
 */

ShapeGeometry.prototype.addShapeList = function ( shapes, options ) {

	for ( var i = 0, l = shapes.length; i < l; i ++ ) {

		this.addShape( shapes[ i ], options );

	}

	return this;

};

/**
 * Adds a shape to ShapeGeometry, based on ExtrudeGeometry.
 */

ShapeGeometry.prototype.addShape = function ( shape, options ) {

	if ( options === undefined ) { options = {}; }
	var curveSegments = options.curveSegments !== undefined ? options.curveSegments : 12;

	var material = options.material;
	var uvgen = options.UVGenerator === undefined ? ExtrudeGeometry.WorldUVGenerator : options.UVGenerator;

	//

	var i, l, hole;

	var shapesOffset = this.vertices.length;
	var shapePoints = shape.extractPoints( curveSegments );

	var vertices = shapePoints.shape;
	var holes = shapePoints.holes;

	var reverse = ! ShapeUtils.isClockWise( vertices );

	if ( reverse ) {

		vertices = vertices.reverse();

		// Maybe we should also check if holes are in the opposite direction, just to be safe...

		for ( i = 0, l = holes.length; i < l; i ++ ) {

			hole = holes[ i ];

			if ( ShapeUtils.isClockWise( hole ) ) {

				holes[ i ] = hole.reverse();

			}

		}

		reverse = false;

	}

	var faces = ShapeUtils.triangulateShape( vertices, holes );

	// Vertices

	for ( i = 0, l = holes.length; i < l; i ++ ) {

		hole = holes[ i ];
		vertices = vertices.concat( hole );

	}

	//

	var vert, vlen = vertices.length;
	var face, flen = faces.length;
	var a, b, c;

	for ( i = 0; i < vlen; i ++ ) {

		vert = vertices[ i ];

		this.vertices.push( new Vector3( vert.x, vert.y, 0 ) );

	}

	for ( i = 0; i < flen; i ++ ) {

		face = faces[ i ];

		a = face[ 0 ] + shapesOffset;
		b = face[ 1 ] + shapesOffset;
		c = face[ 2 ] + shapesOffset;

		this.faces.push( new Face3( a, b, c, null, null, material ) );
		this.faceVertexUvs[ 0 ].push( uvgen.generateTopUV( this, a, b, c ) );

	}

};
