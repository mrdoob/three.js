/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

THREE.IndexedPlaneGeometry5 = function ( width, height, widthSegments, heightSegments ) {

	this.width = width;
	this.height = height;

	this.widthSegments = widthSegments || 1;
	this.heightSegments = heightSegments || 1;

	var width_half = width / 2;
	var height_half = height / 2;

	var gridX = this.widthSegments;
	var gridY = this.heightSegments;

	var gridX1 = gridX + 1;
	var gridY1 = gridY + 1;

	var segment_width = this.width / gridX;
	var segment_height = this.height / gridY;

	var indices = gridX * gridY * 6;
	var vertices = gridX1 * gridY1;

	THREE.IndexedGeometry5.call( this, indices, vertices );

	var offset = 0;

	for ( var iy = 0; iy < gridY1; iy ++ ) {

		var y = iy * segment_height - height_half;

		for ( var ix = 0; ix < gridX1; ix ++ ) {

			var x = ix * segment_width - width_half;

			this.vertices[ offset ].x = x;
			this.vertices[ offset ].y = - y;

			this.normals[ offset ].z = 1;

			this.uvs[ offset ].x = ix / gridX;
			this.uvs[ offset ].y = iy / gridY;

			offset ++;

		}

	}

	var offset = 0;

	for ( var iy = 0; iy < gridY; iy ++ ) {

		for ( var ix = 0; ix < gridX; ix ++ ) {

			var a = ix + gridX1 * iy;
			var b = ix + gridX1 * ( iy + 1 );
			var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
			var d = ( ix + 1 ) + gridX1 * iy;

			this.indices[ offset     ] = a;
			this.indices[ offset + 1 ] = b;
			this.indices[ offset + 2 ] = d;

			this.indices[ offset + 3 ] = b;
			this.indices[ offset + 4 ] = c;
			this.indices[ offset + 5 ] = d;

			offset += 6;

		}

	}

};

THREE.IndexedPlaneGeometry5.prototype = Object.create( THREE.IndexedGeometry5.prototype );
