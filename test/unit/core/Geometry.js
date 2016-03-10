/**
 * @author simonThiele / https://github.com/simonThiele
 */

module( "Geometry" );

test( "rotateX", function() {
	var geometry = getGeometry();

	var matrix = new THREE.Matrix4();
	matrix.makeRotationX( Math.PI / 2 ); // 90 degree

	geometry.applyMatrix( matrix );

	var v0 = geometry.vertices[0], v1 = geometry.vertices[1], v2 = geometry.vertices[2];
	ok ( v0.x === -0.5 && v0.y === 0 && v0.z === 0, "first vertex was rotated" );
	ok ( v1.x === 0.5 && v1.y === 0 && v1.z === 0, "second vertex was rotated" );
	ok ( v2.x === 0 && v2.y < Number.EPSILON && v2.z === 1, "third vertex was rotated" );
});


test( "rotateY", function() {
	var geometry = getGeometry();

	var matrix = new THREE.Matrix4();
	matrix.makeRotationY( Math.PI ); // 180 degrees

	geometry.applyMatrix( matrix );

	var v0 = geometry.vertices[0], v1 = geometry.vertices[1], v2 = geometry.vertices[2];
	ok ( v0.x === 0.5 && v0.y === 0 && v0.z < Number.EPSILON, "first vertex was rotated" );
	ok ( v1.x === -0.5 && v1.y === 0 && v1.z < Number.EPSILON, "second vertex was rotated" );
	ok ( v2.x === 0 && v2.y === 1 && v2.z === 0, "third vertex was rotated" );
});

test( "rotateZ", function() {
	var geometry = getGeometry();

	var matrix = new THREE.Matrix4();
	matrix.makeRotationZ( Math.PI / 2 * 3 ); // 270 degrees

	geometry.applyMatrix( matrix );

	var v0 = geometry.vertices[0], v1 = geometry.vertices[1], v2 = geometry.vertices[2];
	ok ( v0.x < Number.EPSILON && v0.y === 0.5 && v0.z === 0, "first vertex was rotated" );
	ok ( v1.x < Number.EPSILON && v1.y === -0.5 && v1.z === 0, "second vertex was rotated" );
	ok ( v2.x === 1 && v2.y < Number.EPSILON && v2.z === 0, "third vertex was rotated" );
});

test( "fromBufferGeometry", function() {
	var bufferGeometry = new THREE.BufferGeometry();
	bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array( [1, 2, 3, 4, 5, 6, 7, 8, 9] ), 3 ) );
	bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array( [0, 0, 0, 0.5, 0.5, 0.5, 1, 1, 1] ), 3 ) );
	bufferGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array( [0, 1, 0, 1, 0, 1, 1, 1, 0] ), 3 ) );
	bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array( [0, 0, 0, 1, 1, 1] ), 2 ) );
	bufferGeometry.addAttribute('uv2', new THREE.BufferAttribute(new Float32Array( [0, 0, 0, 1, 1, 1] ), 2 ) );

	var geometry = new THREE.Geometry().fromBufferGeometry( bufferGeometry );

	var colors = geometry.colors;
	ok (
		colors[0].r === 0 && colors[0].g === 0 && colors[0].b === 0 &&
		colors[1].r === 0.5 && colors[1].g === 0.5 && colors[1].b === 0.5 &&
		colors[2].r === 1 && colors[2].g === 1 && colors[2].b === 1
		, "colors were created well" );

	var vertices = geometry.vertices;
	ok (
		vertices[0].x === 1 && vertices[0].y === 2 && vertices[0].z === 3 &&
		vertices[1].x === 4 && vertices[1].y === 5 && vertices[1].z === 6 &&
		vertices[2].x === 7 && vertices[2].y === 8 && vertices[2].z === 9
		, "vertices were created well" );

	var vNormals = geometry.faces[0].vertexNormals;
	ok (
		vNormals[0].x === 0 && vNormals[0].y === 1 && vNormals[0].z === 0 &&
		vNormals[1].x === 1 && vNormals[1].y === 0 && vNormals[1].z === 1 &&
		vNormals[2].x === 1 && vNormals[2].y === 1 && vNormals[2].z === 0
		, "vertex normals were created well" );
});

test( "normalize", function() {
	var geometry = getGeometry();
	geometry.computeLineDistances();

	var distances = geometry.lineDistances;
	ok( distances[0] === 0, "distance to the 1st point is 0" );
	ok( distances[1] === 1 + distances[0], "distance from the 1st to the 2nd is sqrt(2nd - 1st) + distance - 1" );
	ok( distances[2] === Math.sqrt( 0.5 * 0.5 + 1 ) + distances[1], "distance from the 1st to the 3nd is sqrt(3rd - 2nd) + distance - 1" );
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
