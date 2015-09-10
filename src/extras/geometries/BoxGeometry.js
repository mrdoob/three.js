/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Cube.as
 */

module.exports = BoxGeometry;

var Face3 = require( "../../core/Face3" ),
	Geometry = require( "../../core/Geometry" ),
	Vector2 = require( "../../math/Vector2" ),
	Vector3 = require( "../../math/Vector3" );

function BoxGeometry( width, height, depth, widthSegments, heightSegments, depthSegments ) {

	Geometry.call( this );

	this.type = "BoxGeometry";

	this.parameters = {
		width: width,
		height: height,
		depth: depth,
		widthSegments: widthSegments,
		heightSegments: heightSegments,
		depthSegments: depthSegments
	};

	this.widthSegments = widthSegments || 1;
	this.heightSegments = heightSegments || 1;
	this.depthSegments = depthSegments || 1;

	var scope = this;

	var widthHalf = width / 2;
	var heightHalf = height / 2;
	var depthHalf = depth / 2;

	buildPlane( "z", "y", - 1, - 1, depth, height, widthHalf, 0 ); // px
	buildPlane( "z", "y",   1, - 1, depth, height, - widthHalf, 1 ); // nx
	buildPlane( "x", "z",   1,   1, width, depth, heightHalf, 2 ); // py
	buildPlane( "x", "z",   1, - 1, width, depth, - heightHalf, 3 ); // ny
	buildPlane( "x", "y",   1, - 1, width, height, depthHalf, 4 ); // pz
	buildPlane( "x", "y", - 1, - 1, width, height, - depthHalf, 5 ); // nz

	function buildPlane( u, v, udir, vdir, width, height, depth, materialIndex ) {

		var w, ix, iy,
			gridX = scope.widthSegments,
			gridY = scope.heightSegments,
			widthHalf = width / 2,
			heightHalf = height / 2,
			offset = scope.vertices.length;

		if ( ( u === "x" && v === "y" ) || ( u === "y" && v === "x" ) ) {

			w = "z";

		} else if ( ( u === "x" && v === "z" ) || ( u === "z" && v === "x" ) ) {

			w = "y";
			gridY = scope.depthSegments;

		} else if ( ( u === "z" && v === "y" ) || ( u === "y" && v === "z" ) ) {

			w = "x";
			gridX = scope.depthSegments;

		}

		var gridX1 = gridX + 1,
			gridY1 = gridY + 1,
			segmentWidth = width / gridX,
			segmentHeight = height / gridY,
			normal = new Vector3(), vector,
			a, b, c, d, uva, uvb, uvc, uvd, face;

		normal[ w ] = depth > 0 ? 1 : - 1;

		for ( iy = 0; iy < gridY1; iy ++ ) {

			for ( ix = 0; ix < gridX1; ix ++ ) {

				vector = new Vector3();
				vector[ u ] = ( ix * segmentWidth - widthHalf ) * udir;
				vector[ v ] = ( iy * segmentHeight - heightHalf ) * vdir;
				vector[ w ] = depth;

				scope.vertices.push( vector );

			}

		}

		for ( iy = 0; iy < gridY; iy ++ ) {

			for ( ix = 0; ix < gridX; ix ++ ) {

				a = ix + gridX1 * iy;
				b = ix + gridX1 * ( iy + 1 );
				c = ( ix + 1 ) + gridX1 * ( iy + 1 );
				d = ( ix + 1 ) + gridX1 * iy;

				uva = new Vector2( ix / gridX, 1 - iy / gridY );
				uvb = new Vector2( ix / gridX, 1 - ( iy + 1 ) / gridY );
				uvc = new Vector2( ( ix + 1 ) / gridX, 1 - ( iy + 1 ) / gridY );
				uvd = new Vector2( ( ix + 1 ) / gridX, 1 - iy / gridY );

				face = new Face3( a + offset, b + offset, d + offset );
				face.normal.copy( normal );
				face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
				face.materialIndex = materialIndex;

				scope.faces.push( face );
				scope.faceVertexUvs[ 0 ].push( [ uva, uvb, uvd ] );

				face = new Face3( b + offset, c + offset, d + offset );
				face.normal.copy( normal );
				face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
				face.materialIndex = materialIndex;

				scope.faces.push( face );
				scope.faceVertexUvs[ 0 ].push( [ uvb.clone(), uvc, uvd.clone() ] );

			}

		}

	}

	this.mergeVertices();

}

BoxGeometry.prototype = Object.create( Geometry.prototype );
BoxGeometry.prototype.constructor = BoxGeometry;

BoxGeometry.prototype.clone = function () {

	var geometry = new BoxGeometry(
		this.parameters.width,
		this.parameters.height,
		this.parameters.depth,
		this.parameters.widthSegments,
		this.parameters.heightSegments,
		this.parameters.depthSegments
	);

	return geometry;

};
