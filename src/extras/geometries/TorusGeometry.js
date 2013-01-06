/**
 * @author oosmoxiecode
 * @author mrdoob / http://mrdoob.com/
 * based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3DLite/src/away3dlite/primitives/Torus.as?r=2888
 */

THREE.TorusGeometry = function ( radius, tube, radialSegments, tubularSegments, arc ) {

	THREE.Geometry.call( this );

	var scope = this;

	this.radius = radius || 100;
	this.tube = tube || 40;
	this.radialSegments = radialSegments || 8;
	this.tubularSegments = tubularSegments || 6;
	this.arc = arc || Math.PI * 2;

	var center = new THREE.Vector3(), uvs = [], normals = [];

	for ( var j = 0; j <= this.radialSegments; j ++ ) {

		for ( var i = 0; i <= this.tubularSegments; i ++ ) {

			var u = i / this.tubularSegments * this.arc;
			var v = j / this.radialSegments * Math.PI * 2;

			center.x = this.radius * Math.cos( u );
			center.y = this.radius * Math.sin( u );

			var vertex = new THREE.Vector3();
			vertex.x = ( this.radius + this.tube * Math.cos( v ) ) * Math.cos( u );
			vertex.y = ( this.radius + this.tube * Math.cos( v ) ) * Math.sin( u );
			vertex.z = this.tube * Math.sin( v );

			this.vertices.push( vertex );

			uvs.push( new THREE.Vector2( i / this.tubularSegments, j / this.radialSegments ) );
			normals.push( vertex.clone().sub( center ).normalize() );

		}
	}


	for ( var j = 1; j <= this.radialSegments; j ++ ) {

		for ( var i = 1; i <= this.tubularSegments; i ++ ) {

			var a = ( this.tubularSegments + 1 ) * j + i - 1;
			var b = ( this.tubularSegments + 1 ) * ( j - 1 ) + i - 1;
			var c = ( this.tubularSegments + 1 ) * ( j - 1 ) + i;
			var d = ( this.tubularSegments + 1 ) * j + i;

			var face = new THREE.Face4( a, b, c, d, [ normals[ a ], normals[ b ], normals[ c ], normals[ d ] ] );
			face.normal.add( normals[ a ] );
			face.normal.add( normals[ b ] );
			face.normal.add( normals[ c ] );
			face.normal.add( normals[ d ] );
			face.normal.normalize();

			this.faces.push( face );

			this.faceVertexUvs[ 0 ].push( [ uvs[ a ].clone(), uvs[ b ].clone(), uvs[ c ].clone(), uvs[ d ].clone() ] );
		}

	}

	this.computeCentroids();

};

THREE.TorusGeometry.prototype = Object.create( THREE.Geometry.prototype );
