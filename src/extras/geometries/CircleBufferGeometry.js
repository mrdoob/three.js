/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

THREE.CircleBufferGeometry = function ( radius, segments, thetaStart, thetaLength ) {

	THREE.BufferGeometry.call( this );

	this.type = 'CircleBufferGeometry';

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

	var i;
	
	var stride = ( 3 + 3 + 2 );
	var vertexData = new Float32Array( ( segments + 2 ) * stride );
	var vertexBuffer = new THREE.InterleavedBuffer( vertexData, stride );

	var positions = new THREE.InterleavedBufferAttribute( vertexBuffer, 3, 0 );
	this.addAttribute( 'position', positions );
	var normals = new THREE.InterleavedBufferAttribute( vertexBuffer, 3, 3 );
	this.addAttribute( 'normal', normals );
	var uvs = new THREE.InterleavedBufferAttribute( vertexBuffer, 2, 6 );
	this.addAttribute( 'uv', uvs );

	// center data is already zero, but need to set a few extras
	// center normal z
	vertexData[5] = 1.0; 
	// center uv
	vertexData[6] = 0.5;
	vertexData[7] = 0.5;

	for ( i = stride, s = 0, ul = ( segments + 2 ) * stride; i < ul; i += stride, s++ ) {

		var segment = thetaStart + s / segments * thetaLength;

		vertexData[i] = radius * Math.cos( segment ); // x
		vertexData[i + 1] = radius * Math.sin( segment ); // y

		vertexData[i + 5] = 1; // normal z

		vertexData[i + 6] = ( vertexData[i] / radius + 1 ) / 2; // u
		vertexData[i + 7] = ( vertexData[i + 1] / radius + 1 ) / 2; // v

	}

	var indices = [];

	for ( i = 1; i <= segments; i ++ ) {

		indices.push( i );
		indices.push( i + 1 );
		indices.push( 0 );

	}

	this.addAttribute( 'index', new THREE.BufferAttribute( new Uint16Array( indices ), 1 ) );

	this.computeFaceNormals();

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

};

THREE.CircleBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.CircleBufferGeometry.prototype.constructor = THREE.CircleBufferGeometry;
