/**
 * @author hughes
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CircleGeometry = function ( radius, segments, thetaStart, thetaLength ) {

	THREE.BufferGeometry.call( this );

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

	var indices = new Uint16Array( ( segments + 1 ) * 3 );
	var vertices = new Float32Array( ( segments + 2 ) * 3 );
	var normals = new Float32Array( ( segments + 2 ) * 3 );
	var uvs = new Float32Array( ( segments + 2 ) * 2 );

	normals[ 2 ] = 1;

	uvs[ 0 ] = 0.5;
	uvs[ 1 ] = 0.5;

	var offset = 3, offset2 = 2;

	for ( var i = 0; i <= segments; i ++ ) {

		indices[ offset     ] = i + 1;
		indices[ offset + 1 ] = i + 2;
		indices[ offset + 2 ] = 0;

		var segment = thetaStart + i / segments * thetaLength;

		var x = radius * Math.cos( segment );
		var y = radius * Math.sin( segment );

		vertices[ offset     ] = x;
		vertices[ offset + 1 ] = y;

		normals[ offset + 2 ] = 1;

		uvs[ offset2     ] = ( x / radius + 1 ) / 2;
		uvs[ offset2 + 1 ] = ( y / radius + 1 ) / 2;

		offset += 3;
		offset2 += 2;

	}

	for ( var i = 1; i <= segments; i ++ ) {

		indices[ offset     ] = i;
		indices[ offset + 1 ] = i + 1;
		indices[ offset + 2 ] = 0;

	}

	this.attributes[ 'index' ] = { array: indices, itemSize: 1 };
	this.attributes[ 'position' ] = { array: vertices, itemSize: 3 };
	this.attributes[ 'normal' ] = { array: normals, itemSize: 3 };
	this.attributes[ 'uv' ] = { array: uvs, itemSize: 2 };

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

};

THREE.CircleGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
