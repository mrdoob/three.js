/**
 * @author hughes
 */

THREE.CircleGeometry = function ( radius, segments, thetaStart, thetaLength ) {

	THREE.Geometry.call( this );

	this.radius = radius = radius || 50;
	this.segments = segments = segments !== undefined ? Math.max( 3, segments ) : 8;

	this.thetaStart = thetaStart = thetaStart !== undefined ? thetaStart : 0;
	this.thetaLength = thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

	var i, uvs = [],
	center = new THREE.Vector3(), centerUV = new THREE.Vector2( 0.5, 0.5 );

	this.vertices.push(center);
	uvs.push( centerUV );

	for ( i = 0; i <= segments; i ++ ) {

		var vertex = new THREE.Vector3();
		var segment = thetaStart + i / segments * thetaLength;

		vertex.x = radius * Math.cos( segment );
		vertex.y = radius * Math.sin( segment );

		this.vertices.push( vertex );
		uvs.push( new THREE.Vector2( ( vertex.x / radius + 1 ) / 2, ( vertex.y / radius + 1 ) / 2 ) );

	}

	var n = new THREE.Vector3( 0, 0, 1 );

	for ( i = 1; i <= segments; i ++ ) {

		var v1 = i;
		var v2 = i + 1 ;
		var v3 = 0;

		this.faces.push( new THREE.Face3( v1, v2, v3, [ n, n, n ] ) );
		this.faceVertexUvs[ 0 ].push( [ uvs[ i ], uvs[ i + 1 ], centerUV ] );

	}

	this.computeCentroids();
	this.computeFaceNormals();

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

};

THREE.CircleGeometry.prototype = Object.create( THREE.Geometry.prototype );
