/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

THREE.PlaneGeometry2 = function ( width, height, widthSegments, heightSegments ) {

	THREE.Geometry2.call( this, ( widthSegments * heightSegments ) * 2 * 3 );

	var vertices = this.vertices.array;
	var normals = this.normals.array;
	var uvs = this.uvs.array;

	this.width = width;
	this.height = height;

	this.widthSegments = widthSegments || 1;
	this.heightSegments = heightSegments || 1;

	var widthHalf = width / 2;
	var heightHalf = height / 2;

	var gridX = this.widthSegments;
	var gridY = this.heightSegments;

	var segmentWidth = this.width / gridX;
	var segmentHeight = this.height / gridY;

	var offset = 0;

	for ( var iy = 0; iy < gridY; iy ++ ) {

		var y1 = iy * segmentHeight - heightHalf;
		var y2 = ( iy + 1 ) * segmentHeight - heightHalf;

		for ( var ix = 0; ix < gridX; ix ++ ) {

			var x1 = ix * segmentWidth - widthHalf;
			var x2 = ( ix + 1 ) * segmentWidth - widthHalf;

			vertices[ offset + 0 ] = x1;
			vertices[ offset + 1 ] = y1;

			vertices[ offset + 3 ] = x2;
			vertices[ offset + 4 ] = y1;

			vertices[ offset + 6 ] = x1;
			vertices[ offset + 7 ] = y2;

			normals[ offset + 2 ] = 1;
			normals[ offset + 5 ] = 1;
			normals[ offset + 8 ] = 1;

			vertices[ offset + 9 ] = x2;
			vertices[ offset + 10 ] = y1;

			vertices[ offset + 12 ] = x2;
			vertices[ offset + 13 ] = y2;

			vertices[ offset + 15 ] = x1;
			vertices[ offset + 16 ] = y2;

			normals[ offset + 11 ] = 1;
			normals[ offset + 13 ] = 1;
			normals[ offset + 17 ] = 1;

			offset += 18;

		}

	}

};

THREE.PlaneGeometry2.prototype = Object.create( THREE.Geometry2.prototype );
