/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

THREE.PlaneGeometry3 = function ( width, height, widthSegments, heightSegments ) {

	THREE.Geometry3.call( this, ( widthSegments * heightSegments ) * 2 * 3 );

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

			vertices[ offset + 0 ][ 0 ] = x1;
			vertices[ offset + 0 ][ 1 ] = y1;

			vertices[ offset + 1 ][ 0 ] = x2;
			vertices[ offset + 1 ][ 1 ] = y1;

			vertices[ offset + 2 ][ 0 ] = x1;
			vertices[ offset + 2 ][ 1 ] = y2;

			normals[ offset + 0 ][ 2 ] = 1;
			normals[ offset + 1 ][ 2 ] = 1;
			normals[ offset + 2 ][ 2 ] = 1;

			vertices[ offset + 3 ][ 0 ] = x2;
			vertices[ offset + 3 ][ 1 ] = y1;

			vertices[ offset + 4 ][ 0 ] = x2;
			vertices[ offset + 4 ][ 1 ] = y2;

			vertices[ offset + 5 ][ 0 ] = x1;
			vertices[ offset + 5 ][ 1 ] = y2;

			normals[ offset + 3 ][ 2 ] = 1;
			normals[ offset + 4 ][ 2 ] = 1;
			normals[ offset + 5 ][ 2 ] = 1;

			offset += 6;

		}

	}

};

THREE.PlaneGeometry3.prototype = Object.create( THREE.Geometry3.prototype );
THREE.PlaneGeometry3.prototype.constructor = THREE.PlaneGeometry3;
