/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

module.exports = PlaneBufferGeometry;

var BufferAttribute = require( "../../core/BufferAttribute" ),
	BufferGeometry = require( "../../core/BufferGeometry" );

function PlaneBufferGeometry( width, height, widthSegments, heightSegments ) {

	BufferGeometry.call( this );

	this.type = "PlaneBufferGeometry";

	this.parameters = {
		width: width,
		height: height,
		widthSegments: widthSegments,
		heightSegments: heightSegments
	};

	var widthHalf = width / 2;
	var heightHalf = height / 2;

	var gridX = Math.floor( widthSegments ) || 1;
	var gridY = Math.floor( heightSegments ) || 1;

	var gridX1 = gridX + 1;
	var gridY1 = gridY + 1;

	var segmentWidth = width / gridX;
	var segmentHeight = height / gridY;

	var vertices = new Float32Array( gridX1 * gridY1 * 3 );
	var normals = new Float32Array( gridX1 * gridY1 * 3 );
	var uvs = new Float32Array( gridX1 * gridY1 * 2 );

	var offset = 0;
	var offset2 = 0;

	var iy, ix, x, y,
		indices, a, b, c, d;

	for ( iy = 0; iy < gridY1; iy ++ ) {

		y = iy * segmentHeight - heightHalf;

		for ( ix = 0; ix < gridX1; ix ++ ) {

			x = ix * segmentWidth - widthHalf;

			vertices[ offset ] = x;
			vertices[ offset + 1 ] = - y;

			normals[ offset + 2 ] = 1;

			uvs[ offset2 ] = ix / gridX;
			uvs[ offset2 + 1 ] = 1 - ( iy / gridY );

			offset += 3;
			offset2 += 2;

		}

	}

	offset = 0;

	indices = ( vertices.length / 3 ) > BufferGeometry.MaxIndex ? new Uint32Array( gridX * gridY * 6 ) : new Uint16Array( gridX * gridY * 6 );

	for ( iy = 0; iy < gridY; iy ++ ) {

		for ( ix = 0; ix < gridX; ix ++ ) {

			a = ix + gridX1 * iy;
			b = ix + gridX1 * ( iy + 1 );
			c = ( ix + 1 ) + gridX1 * ( iy + 1 );
			d = ( ix + 1 ) + gridX1 * iy;

			indices[ offset ] = a;
			indices[ offset + 1 ] = b;
			indices[ offset + 2 ] = d;

			indices[ offset + 3 ] = b;
			indices[ offset + 4 ] = c;
			indices[ offset + 5 ] = d;

			offset += 6;

		}

	}

	this.addIndex( new BufferAttribute( indices, 1 ) );
	this.addAttribute( "position", new BufferAttribute( vertices, 3 ) );
	this.addAttribute( "normal", new BufferAttribute( normals, 3 ) );
	this.addAttribute( "uv", new BufferAttribute( uvs, 2 ) );

}

PlaneBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
PlaneBufferGeometry.prototype.constructor = PlaneBufferGeometry;

PlaneBufferGeometry.prototype.clone = function () {

	var geometry = new PlaneBufferGeometry(
		this.parameters.width,
		this.parameters.height,
		this.parameters.widthSegments,
		this.parameters.heightSegments
	);

	geometry.copy( this );

	return geometry;

};
