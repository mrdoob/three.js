/**
 * @author simonThiele / https://github.com/simonThiele
 */

QUnit.module( "Geometry" );

QUnit.test( "rotateX" , function( assert ) {
	var geometry = getGeometry();

	var matrix = new THREE.Matrix4();
	matrix.makeRotationX( Math.PI / 2 ); // 90 degree

	geometry.applyMatrix( matrix );

	var v0 = geometry.vertices[0], v1 = geometry.vertices[1], v2 = geometry.vertices[2];
	assert.ok( v0.x === -0.5 && v0.y === 0 && v0.z === 0, "first vertex was rotated" );
	assert.ok( v1.x === 0.5 && v1.y === 0 && v1.z === 0, "second vertex was rotated" );
	assert.ok( v2.x === 0 && v2.y < Number.EPSILON && v2.z === 1, "third vertex was rotated" );
});

QUnit.test( "rotateY" , function( assert ) {
	var geometry = getGeometry();

	var matrix = new THREE.Matrix4();
	matrix.makeRotationY( Math.PI ); // 180 degrees

	geometry.applyMatrix( matrix );

	var v0 = geometry.vertices[0], v1 = geometry.vertices[1], v2 = geometry.vertices[2];
	assert.ok( v0.x === 0.5 && v0.y === 0 && v0.z < Number.EPSILON, "first vertex was rotated" );
	assert.ok( v1.x === -0.5 && v1.y === 0 && v1.z < Number.EPSILON, "second vertex was rotated" );
	assert.ok( v2.x === 0 && v2.y === 1 && v2.z === 0, "third vertex was rotated" );
});

QUnit.test( "rotateZ" , function( assert ) {
	var geometry = getGeometry();

	var matrix = new THREE.Matrix4();
	matrix.makeRotationZ( Math.PI / 2 * 3 ); // 270 degrees

	geometry.applyMatrix( matrix );

	var v0 = geometry.vertices[0], v1 = geometry.vertices[1], v2 = geometry.vertices[2];
	assert.ok( v0.x < Number.EPSILON && v0.y === 0.5 && v0.z === 0, "first vertex was rotated" );
	assert.ok( v1.x < Number.EPSILON && v1.y === -0.5 && v1.z === 0, "second vertex was rotated" );
	assert.ok( v2.x === 1 && v2.y < Number.EPSILON && v2.z === 0, "third vertex was rotated" );
});

QUnit.test( "fromBufferGeometry" , function( assert ) {
	var bufferGeometry = new THREE.BufferGeometry();
	bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array( [1, 2, 3, 4, 5, 6, 7, 8, 9] ), 3 ) );
	bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array( [0, 0, 0, 0.5, 0.5, 0.5, 1, 1, 1] ), 3 ) );
	bufferGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array( [0, 1, 0, 1, 0, 1, 1, 1, 0] ), 3 ) );
	bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array( [0, 0, 0, 1, 1, 1] ), 2 ) );
	bufferGeometry.addAttribute('uv2', new THREE.BufferAttribute(new Float32Array( [0, 0, 0, 1, 1, 1] ), 2 ) );

	var geometry = new THREE.Geometry().fromBufferGeometry( bufferGeometry );

	var colors = geometry.colors;
	assert.ok(
		colors[0].r === 0 && colors[0].g === 0 && colors[0].b === 0 &&
		colors[1].r === 0.5 && colors[1].g === 0.5 && colors[1].b === 0.5 &&
		colors[2].r === 1 && colors[2].g === 1 && colors[2].b === 1
		, "colors were created well" );

	var vertices = geometry.vertices;
	assert.ok(
		vertices[0].x === 1 && vertices[0].y === 2 && vertices[0].z === 3 &&
		vertices[1].x === 4 && vertices[1].y === 5 && vertices[1].z === 6 &&
		vertices[2].x === 7 && vertices[2].y === 8 && vertices[2].z === 9
		, "vertices were created well" );

	var vNormals = geometry.faces[0].vertexNormals;
	assert.ok(
		vNormals[0].x === 0 && vNormals[0].y === 1 && vNormals[0].z === 0 &&
		vNormals[1].x === 1 && vNormals[1].y === 0 && vNormals[1].z === 1 &&
		vNormals[2].x === 1 && vNormals[2].y === 1 && vNormals[2].z === 0
		, "vertex normals were created well" );
});

QUnit.test( "normalize" , function( assert ) {
	var geometry = getGeometry();
	geometry.computeLineDistances();

	var distances = geometry.lineDistances;
	assert.ok( distances[0] === 0, "distance to the 1st point is 0" );
	assert.ok( distances[1] === 1 + distances[0], "distance from the 1st to the 2nd is sqrt(2nd - 1st) + distance - 1" );
	assert.ok( distances[2] === Math.sqrt( 0.5 * 0.5 + 1 ) + distances[1], "distance from the 1st to the 3nd is sqrt(3rd - 2nd) + distance - 1" );
});

function getGeometryByParams( x1, y1, z1, x2, y2, z2, x3, y3, z3 ) {
	var geometry = new THREE.Geometry();

	// a triangle
	geometry.vertices = [
		new THREE.Vector3( x1, y1, z1 ),
		new THREE.Vector3( x2, y2, z2 ),
		new THREE.Vector3( x3, y3, z3 )
	];

	return geometry;
}

function getGeometry() {
	return getGeometryByParams( -0.5, 0, 0, 0.5, 0, 0, 0, 1, 0 );
}

QUnit.test( "applyMatrix", function ( assert ) {

	var geometry = getGeometry();
	geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
	var m = new THREE.Matrix4();
	var expectedVerts = [
		new THREE.Vector3( 1.5, 3, 4 ),
		new THREE.Vector3( 2.5, 3, 4 ),
		new THREE.Vector3( 2, 3, 5 )
	];
	var v1, v2, v3;

	m.makeRotationX( Math.PI / 2 );
	m.setPosition( new THREE.Vector3( x, y, z ) );

	geometry.applyMatrix( m );

	v0 = geometry.vertices[ 0 ];
	v1 = geometry.vertices[ 1 ];
	v2 = geometry.vertices[ 2 ];
	assert.ok(
		Math.abs( v0.x - expectedVerts[ 0 ].x ) <= eps &&
		Math.abs( v0.y - expectedVerts[ 0 ].y ) <= eps &&
		Math.abs( v0.z - expectedVerts[ 0 ].z ) <= eps,
		"First vertex is as expected"
	);
	assert.ok(
		Math.abs( v1.x - expectedVerts[ 1 ].x ) <= eps &&
		Math.abs( v1.y - expectedVerts[ 1 ].y ) <= eps &&
		Math.abs( v1.z - expectedVerts[ 1 ].z ) <= eps,
		"Second vertex is as expected"
	);
	assert.ok(
		Math.abs( v2.x - expectedVerts[ 2 ].x ) <= eps &&
		Math.abs( v2.y - expectedVerts[ 2 ].y ) <= eps &&
		Math.abs( v2.z - expectedVerts[ 2 ].z ) <= eps,
		"Third vertex is as expected"
	);

} );

QUnit.test( "translate", function ( assert ) {

	var a = getGeometry();
	var expected = [
		new THREE.Vector3( - 2.5, 3, - 4 ),
		new THREE.Vector3( - 1.5, 3, - 4 ),
		new THREE.Vector3( - 2, 4, - 4 )
	];
	var v;

	a.translate( - x, y, - z );

	for ( var i = 0; i < a.vertices.length; i ++ ) {

		v = a.vertices[ i ];
		assert.ok(
			Math.abs( v.x - expected[ i ].x ) <= eps &&
			Math.abs( v.y - expected[ i ].y ) <= eps &&
			Math.abs( v.z - expected[ i ].z ) <= eps,
			"Vertex #" + i + " was translated as expected"
		);

	}

} );

QUnit.test( "lookAt", function ( assert ) {

	var a = getGeometry();
	var expected = [
		new THREE.Vector3( - 0.5, 0, 0 ),
		new THREE.Vector3( 0.5, 0, 0 ),
		new THREE.Vector3( 0, 0.5 * Math.sqrt( 2 ), 0.5 * Math.sqrt( 2 ) )
	];

	a.lookAt( new THREE.Vector3( 0, - 1, 1 ) );

	for ( var i = 0; i < a.vertices.length; i ++ ) {

		v = a.vertices[ i ];
		assert.ok(
			Math.abs( v.x - expected[ i ].x ) <= eps &&
			Math.abs( v.y - expected[ i ].y ) <= eps &&
			Math.abs( v.z - expected[ i ].z ) <= eps,
			"Vertex #" + i + " was adjusted as expected"
		);

	}

} );

QUnit.test( "scale", function ( assert ) {

	var a = getGeometry();
	var expected = [
		new THREE.Vector3( - 1, 0, 0 ),
		new THREE.Vector3( 1, 0, 0 ),
		new THREE.Vector3( 0, 3, 0 )
	];
	var v;

	a.scale( 2, 3, 4 );

	for ( var i = 0; i < a.vertices.length; i ++ ) {

		v = a.vertices[ i ];
		assert.ok(
			Math.abs( v.x - expected[ i ].x ) <= eps &&
			Math.abs( v.y - expected[ i ].y ) <= eps &&
			Math.abs( v.z - expected[ i ].z ) <= eps,
			"Vertex #" + i + " was scaled as expected"
		);

	}

} );

QUnit.test( "normalize (actual)", function ( assert ) {

	var a = getGeometry();
	var sqrt = 0.5 * Math.sqrt( 2 );
	var expected = [
		new THREE.Vector3( - sqrt, - sqrt, 0 ),
		new THREE.Vector3( sqrt, - sqrt, 0 ),
		new THREE.Vector3( 0, sqrt, 0 )
	];
	var v;

	a.normalize();

	for ( var i = 0; i < a.vertices.length; i ++ ) {

		v = a.vertices[ i ];
		assert.ok(
			Math.abs( v.x - expected[ i ].x ) <= eps &&
			Math.abs( v.y - expected[ i ].y ) <= eps &&
			Math.abs( v.z - expected[ i ].z ) <= eps,
			"Vertex #" + i + " was normalized as expected"
		);

	}

} );

QUnit.test( "toJSON", function ( assert ) {

	var a = getGeometry();
	var gold = {
		"metadata": {
			"version": 4.5,
			"type": "Geometry",
			"generator": "Geometry.toJSON"
		},
		"uuid": null,
		"type": "Geometry",
		"data": {
			"vertices": [ - 0.5, 0, 0, 0.5, 0, 0, 0, 1, 0 ],
			"normals": [ 0, 0, 1 ],
			"faces": [ 50, 0, 1, 2, 0, 0, 0, 0, 0 ]
		}
	};
	var json;

	a.faces.push( new THREE.Face3( 0, 1, 2 ) );
	a.computeFaceNormals();
	a.computeVertexNormals();

	json = a.toJSON();
	json.uuid = null;
	assert.deepEqual( json, gold, "Generated JSON is as expected" );

} );

QUnit.test( "mergeVertices", function ( assert ) {

	var a = new THREE.Geometry();
	var b = new THREE.BoxBufferGeometry( 1, 1, 1 );
	var verts, faces, removed;

	a.fromBufferGeometry( b );

	removed = a.mergeVertices();
	verts = a.vertices.length;
	faces = a.faces.length;

	assert.strictEqual( removed, 16, "Removed the expected number of vertices" );
	assert.strictEqual( verts, 8, "Minimum number of vertices remaining" );
	assert.strictEqual( faces, 12, "Minimum number of faces remaining" );

} );

QUnit.test( "sortFacesByMaterialIndex", function ( assert ) {

	var box = new THREE.BoxBufferGeometry( 1, 1, 1 );
	var a = new THREE.Geometry().fromBufferGeometry( box );
	var expected = [ 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5 ];

	a.faces.reverse(); // a bit too simple probably, still missing stuff like checking new UVs
	a.sortFacesByMaterialIndex();

	var indices = [];

	for ( var i = 0; i < a.faces.length; i ++ ) {

		indices.push( a.faces[ i ].materialIndex );

	}

	assert.deepEqual( indices, expected, "Faces in correct order" );

} );

QUnit.test( "computeBoundingBox", function ( assert ) {

	var a = new THREE.DodecahedronGeometry();

	a.computeBoundingBox();
	assert.strictEqual( a.boundingBox.isEmpty(), false, "Bounding box isn't empty" );

	var allIn = true;
	for ( var i = 0; i < a.vertices.length; i ++ ) {

		if ( ! a.boundingBox.containsPoint( a.vertices[ i ] ) ) {

			allIn = false;

		}

	}
	assert.strictEqual( allIn, true, "All vertices are inside the box" );

} );

QUnit.test( "computeBoundingSphere", function ( assert ) {

	var a = new THREE.DodecahedronGeometry();

	a.computeBoundingSphere();

	var allIn = true;
	for ( var i = 0; i < a.vertices.length; i ++ ) {

		if ( ! a.boundingSphere.containsPoint( a.vertices[ i ] ) ) {

			allIn = false;

		}

	}
	assert.strictEqual( allIn, true, "All vertices are inside the bounding sphere" );

} );
