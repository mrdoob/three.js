/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

THREE.PlaneGeometry2 = function ( width, height, widthSegments, heightSegments ) {

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

	var offset = 0;

	var normal = new THREE.Vector3( 0, 0, 1 );

	for ( var iy = 0; iy < gridY; iy ++ ) {

		var y1 = iy * segmentHeight - heightHalf;
		var y2 = ( iy + 1 ) * segmentHeight - heightHalf;

		for ( var ix = 0; ix < gridX; ix ++ ) {

			var x1 = ix * segmentWidth - widthHalf;
			var x2 = ( ix + 1 ) * segmentWidth - widthHalf;

			vertices[ offset ++ ] = x1;
			vertices[ offset ++ ] = y1;

			offset ++;

			vertices[ offset ++ ] = x2;
			vertices[ offset ++ ] = y1;

			offset ++;

			vertices[ offset ++ ] = x1;
			vertices[ offset ++ ] = y2;

			offset ++;

			vertices[ offset ++ ] = x2;
			vertices[ offset ++ ] = y1;

			offset ++;

			vertices[ offset ++ ] = x2;
			vertices[ offset ++ ] = y2;

			offset ++;

			vertices[ offset ++ ] = x1;
			vertices[ offset ++ ] = y2;

			offset ++;

		}

	}

};

THREE.PlaneGeometry2.prototype = Object.create( THREE.Geometry2.prototype );
