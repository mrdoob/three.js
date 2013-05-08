/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

THREE.PlaneGeometry = function ( width, height, widthSegments, heightSegments ) {

	THREE.Geometry.call( this );

	this.width = width;
	this.height = height;

	this.widthSegments = widthSegments || 1;
	this.heightSegments = heightSegments || 1;

	var ix, iz;
	var width_half = width / 2;
	var height_half = height / 2;

	var gridX = this.widthSegments;
	var gridZ = this.heightSegments;

	var gridX1 = gridX + 1;
	var gridZ1 = gridZ + 1;

	var segment_width = this.width / gridX;
	var segment_height = this.height / gridZ;

	var normal = new THREE.Vector3( 0, 0, 1 );

	for ( iz = 0; iz < gridZ1; iz ++ ) {

		for ( ix = 0; ix < gridX1; ix ++ ) {

			var x = ix * segment_width - width_half;
			var y = iz * segment_height - height_half;

			this.vertices.push( new THREE.Vector3( x, - y, 0 ) );

		}

	}

	for ( iz = 0; iz < gridZ; iz ++ ) {

		for ( ix = 0; ix < gridX; ix ++ ) {

			var a = ix + gridX1 * iz;
			var b = ix + gridX1 * ( iz + 1 );
			var c = ( ix + 1 ) + gridX1 * ( iz + 1 );
			var d = ( ix + 1 ) + gridX1 * iz;

			var aUV = new THREE.Vector2( ix / gridX, 1 - iz / gridZ );
			var bUV = new THREE.Vector2( ix / gridX, 1 - ( iz + 1 ) / gridZ );
			var cUV = new THREE.Vector2( (ix + 1) / gridX, 1 - ( iz + 1 ) / gridZ );
			var dUV = new THREE.Vector2( (ix + 1) / gridX, 1 - iz / gridZ );

			var face1 = new THREE.Face3( a, b, c);
			var face2 = new THREE.Face3( a, c, d );

			this.faces.push( face1 );
			this.faces.push( face2 );

			this.faceVertexUvs[0].push( [aUV, bUV, cUV], [aUV, cUV, dUV] );
		}

	}

	this.computeFaceNormals();
	this.computeCentroids();

};

THREE.PlaneGeometry.prototype = Object.create( THREE.Geometry.prototype );
