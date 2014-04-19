/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

THREE.PlaneGeometry5 = function ( width, height, widthSegments, heightSegments ) {

	THREE.Geometry5.call( this, ( widthSegments * heightSegments ) * 2 * 3 );

	var vertices = this.vertices;
	var normals = this.normals;
	var uvs = this.uvs;

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

			vertices[ offset + 0 ].set( x1, y1, 0 );
			vertices[ offset + 1 ].set( x2, y1, 0 );
			vertices[ offset + 2 ].set( x1, y2, 0 );

			normals[ offset + 0 ].z = 1;
			normals[ offset + 1 ].z = 1;
			normals[ offset + 2 ].z = 1;

			vertices[ offset + 3 ].set( x2, y1, 0 );
			vertices[ offset + 4 ].set( x2, y2, 0 );
			vertices[ offset + 5 ].set( x1, y2, 0 );

			normals[ offset + 3 ].z = 1;
			normals[ offset + 4 ].z = 1;
			normals[ offset + 5 ].z = 1;

			offset += 6;

		}

	}

};

THREE.PlaneGeometry5.prototype = Object.create( THREE.Geometry5.prototype );
