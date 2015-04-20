/**
 * @author benaadams / https://twitter.com/ben_a_adams
 * based on THREE.SphereGeometry
 */

THREE.SphereBufferGeometry = function ( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) {

	THREE.BufferGeometry.call( this );

	this.type = 'SphereBufferGeometry';

	this.parameters = {
		radius: radius,
		widthSegments: widthSegments,
		heightSegments: heightSegments,
		phiStart: phiStart,
		phiLength: phiLength,
		thetaStart: thetaStart,
		thetaLength: thetaLength 
	};

	radius = radius || 50;

	widthSegments = Math.max( 3, Math.floor( widthSegments ) || 8 );
	heightSegments = Math.max( 2, Math.floor( heightSegments ) || 6 );

	phiStart = phiStart !== undefined ? phiStart : 0;
	phiLength = phiLength !== undefined ? phiLength : Math.PI * 2;

	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI;

	var stride = ( 3 + 3 + 2 );
	var vertexBuffer = new THREE.InterleavedBuffer( new Float32Array( ( ( widthSegments + 1 ) * ( heightSegments + 1 ) ) * stride ), stride );

	var positions = new THREE.InterleavedBufferAttribute( vertexBuffer, 3, 0 );
	this.addAttribute( 'position', positions );
	var normals = new THREE.InterleavedBufferAttribute( vertexBuffer, 3, 3 );
	this.addAttribute( 'normal', normals );
	var uvs = new THREE.InterleavedBufferAttribute( vertexBuffer, 2, 6 );
	this.addAttribute( 'uv', uvs );

	var x, y, u, v, px, py, pz, index = 0, vertices = [], normal = new THREE.Vector3();

	for ( y = 0; y <= heightSegments; y ++ ) {

		var verticesRow = [];

		v = y / heightSegments;

		for ( x = 0; x <= widthSegments; x ++ ) {

			u = x / widthSegments;

			px = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
			py = radius * Math.cos( thetaStart + v * thetaLength );
			pz = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

			normal.set( px, py, pz ).normalize();

			positions.setXYZ( index, px, py, pz );
			normals.setXYZ( index, normal.x, normal.y, normal.z );
			uvs.setXY( index, u, 1 - v );

			verticesRow.push( index );

			index++;

		}

		vertices.push( verticesRow );

	}

	var indices = [];
	var ul;
	for ( y = 0, ul = heightSegments - 1; y < ul; y++ ) {

		for ( x = 0; x < widthSegments; x++ ) {

			var v1 = vertices[y][x + 1];
			var v2 = vertices[y][x];
			var v3 = vertices[y + 1][x];
			var v4 = vertices[y + 1][x + 1];

			if ( y !== 0 ) indices.push( v1, v2, v4 );
			indices.push( v2, v3, v4 );

		}
	}

	y = heightSegments;

	for ( x = 0; x < widthSegments; x++ ) {

		var v2 = vertices[y][x];
		var v3 = vertices[y - 1][x];
		var v4 = vertices[y - 1][x + 1];

		indices.push( v2, v4, v3 );

	}

	this.addAttribute( 'index', new THREE.BufferAttribute( new Uint16Array( indices ), 1 ) );

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

};

THREE.SphereBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.SphereBufferGeometry.prototype.constructor = THREE.SphereBufferGeometry;