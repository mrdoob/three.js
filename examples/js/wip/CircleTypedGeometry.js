/**
 * @author hughes
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CircleTypedGeometry = function ( radius, segments, thetaStart, thetaLength ) {

	this.parameters = {
		radius: radius,
		segments: segments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	radius = radius || 50;
	segments = segments !== undefined ? Math.max( 3, segments ) : 8;

	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

	//

	var elements = segments + 2;

	var indices = new Uint16Array( segments * 3 );
	var vertices = new Float32Array( elements * 3 );
	var normals = new Float32Array( elements * 3 );
	var uvs = new Float32Array( elements * 2 );

	// center

	normals[ 2 ] = 1;

	uvs[ 0 ] = 0.5;
	uvs[ 1 ] = 0.5;

	var offset = 0, offset2 = 2, offset3 = 3;

	for ( var i = 0; i <= segments; i ++ ) {

		var segment = thetaStart + i / segments * thetaLength;

		var x = radius * Math.cos( segment );
		var y = radius * Math.sin( segment );

		vertices[ offset3     ] = x;
		vertices[ offset3 + 1 ] = y;

		normals[ offset3 + 2 ] = 1;

		uvs[ offset2     ] = ( x / radius + 1 ) / 2;
		uvs[ offset2 + 1 ] = ( y / radius + 1 ) / 2;

		offset2 += 2;
		offset3 += 3;

		//

		indices[ offset     ] = 0;
		indices[ offset + 1 ] = i + 1;
		indices[ offset + 2 ] = i + 2;

		offset  += 3;

	}

	THREE.IndexedTypedGeometry.call( this );

	this.setArrays( indices, vertices, normals, uvs );

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

};

THREE.CircleTypedGeometry.prototype = Object.create( THREE.IndexedTypedGeometry.prototype );
THREE.CircleTypedGeometry.prototype.constructor = THREE.CircleTypedGeometry;
