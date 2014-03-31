/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

THREE.PlaneGeometry2b = function ( width, height, widthSegments, heightSegments ) {

	THREE.Geometry2.call( this, ( widthSegments * heightSegments ) * 2 * 3 );

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

	var index = 0;

	for ( var iy = 0; iy < gridY; iy ++ ) {

		var y1 = iy * segmentHeight - heightHalf;
		var y2 = ( iy + 1 ) * segmentHeight - heightHalf;

		for ( var ix = 0; ix < gridX; ix ++ ) {

			var x1 = ix * segmentWidth - widthHalf;
			var x2 = ( ix + 1 ) * segmentWidth - widthHalf;

			this.vertices.setXY( index + 0,  x1, y1 );
			this.vertices.setXY( index + 1,  x2, y1 );
			this.vertices.setXY( index + 2,  x1, y2 );

			this.vertices.setXY( index + 3, x2, y1 );
			this.vertices.setXY( index + 4, x2, y2 );
			this.vertices.setXY( index + 5, x1, y2 );

			this.normals.setZ( index + 0, 1 );
			this.normals.setZ( index + 1, 1 );
			this.normals.setZ( index + 2, 1 );

			this.normals.setZ( index + 3, 1 );
			this.normals.setZ( index + 4, 1 );
			this.normals.setZ( index + 5, 1 );

			index += 6;

		}

	}

};

THREE.PlaneGeometry2b.prototype = Object.create( THREE.Geometry2.prototype );
