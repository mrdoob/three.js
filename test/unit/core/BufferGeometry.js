/**
 * @author simonThiele / https://github.com/simonThiele
 */

module( "BufferGeometry" );

var DegToRad = Math.PI / 180;

test( "add / delete Attribute", function() {
	var geometry = new THREE.BufferGeometry();
	var attributeName = "position";

	ok ( geometry.attributes[attributeName] === undefined , 'no attribute defined' );

	geometry.addAttribute( attributeName, new THREE.BufferAttribute( new Float32Array( [1, 2, 3], 1 ) ) );

	ok ( geometry.attributes[attributeName] !== undefined , 'attribute is defined' );

	geometry.removeAttribute( attributeName );

	ok ( geometry.attributes[attributeName] === undefined , 'no attribute defined' );
});

test( "applyMatrix", function() {
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( "position", new THREE.BufferAttribute( new Float32Array(6), 3 ) );

	var matrix = new THREE.Matrix4().set(
		1, 0, 0, 1.5,
		0, 1, 0, -2,
		0, 0, 1, 3,
		0, 0, 0, 1
	);
	geometry.applyMatrix(matrix);

	var position = geometry.attributes.position.array;
	var m = matrix.elements;
	ok( position[0] === m[12] && position[1] === m[13] && position[2] === m[14], "position was extracted from matrix" );
	ok( position[3] === m[12] && position[4] === m[13] && position[5] === m[14], "position was extracted from matrix twice" );
	ok( geometry.attributes.position.version === 1, "version was increased during update" );
});

test( "rotateX/Y/Z", function() {
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( "position", new THREE.BufferAttribute( new Float32Array([1, 2, 3, 4, 5, 6]), 3 ) );

	var pos = geometry.attributes.position.array;

	geometry.rotateX( 180 * DegToRad );

	// object was rotated around x so all items should be flipped but the x ones
	ok( pos[0] === 1 && pos[1] === -2 && pos[2] === -3 &&
			pos[3] === 4 && pos[4] === -5 && pos[5] === -6, "vertices were rotated around x by 180 degrees" );


	geometry.rotateY( 180 * DegToRad );

	// vertices were rotated around y so all items should be flipped again but the y ones
	ok( pos[0] === -1 && pos[1] === -2 && pos[2] === 3 &&
			pos[3] === -4 && pos[4] === -5 && pos[5] === 6, "vertices were rotated around y by 180 degrees" );


	geometry.rotateZ( 180 * DegToRad );

	// vertices were rotated around z so all items should be flipped again but the z ones
	ok( pos[0] === 1 && pos[1] === 2 && pos[2] === 3 &&
			pos[3] === 4 && pos[4] === 5 && pos[5] === 6, "vertices were rotated around z by 180 degrees" );
});


test( "translate", function() {
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( "position", new THREE.BufferAttribute( new Float32Array([1, 2, 3, 4, 5, 6]), 3 ) );

	var pos = geometry.attributes.position.array;

	geometry.translate( 10, 20, 30 );

	ok( pos[0] === 11 && pos[1] === 22 && pos[2] === 33 &&
			pos[3] === 14 && pos[4] === 25 && pos[5] === 36, "vertices were translated" );
});

test( "scale", function() {
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( "position", new THREE.BufferAttribute( new Float32Array([-1, -1, -1, 2, 2, 2]), 3 ) );

	var pos = geometry.attributes.position.array;

	geometry.scale( 1, 2, 3 );

	ok( pos[0] === -1 && pos[1] === -2 && pos[2] === -3 &&
			pos[3] === 2 && pos[4] === 4 && pos[5] === 6, "vertices were scaled" );
});

test( "center", function() {
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( "position", new THREE.BufferAttribute( new Float32Array([
		-1, -1, -1,
		1, 1, 1,
		4, 4, 4
	]), 3 ) );

	geometry.center();

	var pos = geometry.attributes.position.array;
	var bb = geometry.boundingBox;

	// the boundingBox should go from (-1, -1, -1) to (4, 4, 4) so it has a size of (5, 5, 5)
	// after centering it the vertices should be placed between (-2.5, -2.5, -2.5) and (2.5, 2.5, 2.5)
	ok( pos[0] === -2.5 && pos[1] === -2.5 && pos[2] === -2.5 &&
			pos[3] === -0.5 && pos[4] === -0.5 && pos[5] === -0.5 &&
			pos[6] === 2.5 && pos[7] === 2.5 && pos[8] === 2.5, "vertices were replaced by boundingBox dimensions" );
});

test( "setFromObject", function() {
	var lineGeo = new THREE.Geometry();
	lineGeo.vertices.push(
		new THREE.Vector3( -10, 0, 0 ),
		new THREE.Vector3( 0, 10, 0 ),
		new THREE.Vector3( 10, 0, 0 )
	);

	lineGeo.colors.push(
		new THREE.Color(1, 0, 0 ),
		new THREE.Color(0, 1, 0 ),
		new THREE.Color(0, 0, 1 )
	);

	var line = new THREE.Line( lineGeo, null );
	var geometry = new THREE.BufferGeometry().setFromObject( line );

	var pos = geometry.attributes.position.array;
	var col = geometry.attributes.color.array;
	var v = lineGeo.vertices;
	var c = lineGeo.colors;

	ok(
		 // position exists
			pos !== undefined &&

			// vertex arrays have the same size
			v.length * 3 === pos.length &&

			// there are three complete vertices (each vertex contains three values)
			geometry.attributes.position.count === 3 &&

			// check if both arrays contains the same data
			pos[0] === v[0].x && pos[1] === v[0].y && pos[2] === v[0].z &&
			pos[3] === v[1].x && pos[4] === v[1].y && pos[5] === v[1].z &&
			pos[6] === v[2].x && pos[7] === v[2].y && pos[8] === v[2].z
			, "positions are equal" );

	ok(
		 // color exists
			col !== undefined &&

			// color arrays have the same size
			c.length * 3 === col.length &&

			// there are three complete colors (each color contains three values)
			geometry.attributes.color.count === 3 &&

			// check if both arrays contains the same data
			col[0] === c[0].r && col[1] === c[0].g && col[2] === c[0].b &&
			col[3] === c[1].r && col[4] === c[1].g && col[5] === c[1].b &&
			col[6] === c[2].r && col[7] === c[2].g && col[8] === c[2].b
			, "colors are equal" );
});

test( "computeBoundingBox", function() {
	var bb = getBBForVertices( [-1, -2, -3, 13, -2, -3.5, -1, -20, 0, -4, 5, 6] );

	ok( bb.min.x === -4 && bb.min.y === -20 && bb.min.z === -3.5, "min values are set correctly" );
	ok( bb.max.x === 13 && bb.max.y === 5 && bb.max.z === 6, "max values are set correctly" );


	bb = getBBForVertices( [] );

	ok( bb.min.x === 0 && bb.min.y === 0 && bb.min.z === 0, "since there are no values given, the bb has size = 0" );
	ok( bb.max.x === 0 && bb.max.y === 0 && bb.max.z === 0, "since there are no values given, the bb has size = 0" );


	bb = getBBForVertices( [-1, -1, -1] );

	ok( bb.min.x === bb.max.x && bb.min.y === bb.max.y && bb.min.z === bb.max.z, "since there is only one vertex, max and min are equal" );
	ok( bb.min.x === -1 && bb.min.y === -1 && bb.min.z === -1, "since there is only one vertex, min and max are this vertex" );

	bb = getBBForVertices( [-1] );
});

test( "computeBoundingSphere", function() {
	var bs = getBSForVertices( [-10, 0, 0, 10, 0, 0] );

	ok( bs.radius === (10 + 10) / 2, "radius is equal to deltaMinMax / 2" )
	ok( bs.center.x === 0 && bs.center.y === 0 && bs.center.y === 0, "bounding sphere is at ( 0, 0, 0 )" )


	var bs = getBSForVertices( [-5, 11, -3, 5, -11, 3] );
	var radius = new THREE.Vector3(5, 11, 3).length();

	ok( bs.radius === radius, "radius is equal to directionLength" )
	ok( bs.center.x === 0 && bs.center.y === 0 && bs.center.y === 0, "bounding sphere is at ( 0, 0, 0 )" )
});

function getBBForVertices(vertices) {
	var geometry = new THREE.BufferGeometry();

	geometry.addAttribute( "position", new THREE.BufferAttribute( new Float32Array(vertices), 3 ) );
	geometry.computeBoundingBox();

	return geometry.boundingBox;
}

function getBSForVertices(vertices) {
	var geometry = new THREE.BufferGeometry();

	geometry.addAttribute( "position", new THREE.BufferAttribute( new Float32Array(vertices), 3 ) );
	geometry.computeBoundingSphere();

	return geometry.boundingSphere;
}

test( "computeVertexNormals", function() {
	// get normals for a counter clockwise created triangle
	var normals = getNormalsForVertices([-1, 0, 0, 1, 0, 0, 0, 1, 0]);

	ok( normals[0] === 0 && normals[1] === 0 && normals[2] === 1,
		"first normal is pointing to screen since the the triangle was created counter clockwise" );

	ok( normals[3] === 0 && normals[4] === 0 && normals[5] === 1,
		"second normal is pointing to screen since the the triangle was created counter clockwise" );

	ok( normals[6] === 0 && normals[7] === 0 && normals[8] === 1,
		"third normal is pointing to screen since the the triangle was created counter clockwise" );


	// get normals for a clockwise created triangle
	var normals = getNormalsForVertices([1, 0, 0, -1, 0, 0, 0, 1, 0]);

	ok( normals[0] === 0 && normals[1] === 0 && normals[2] === -1,
		"first normal is pointing to screen since the the triangle was created clockwise" );

	ok( normals[3] === 0 && normals[4] === 0 && normals[5] === -1,
		"second normal is pointing to screen since the the triangle was created clockwise" );

	ok( normals[6] === 0 && normals[7] === 0 && normals[8] === -1,
		"third normal is pointing to screen since the the triangle was created clockwise" );


	var normals = getNormalsForVertices([0, 0, 1, 0, 0, -1, 1, 1, 0]);

	// the triangle is rotated by 45 degrees to the right so the normals of the three vertices
	// should point to (1, -1, 0).normalized(). The simplest solution is to check against a normalized
	// vector (1, -1, 0) but you will get calculation errors because of floating calculations so another
	// valid technique is to create a vector which stands in 90 degrees to the normals and calculate the
	// dot product which is the cos of the angle between them. This should be < floating calculation error
	// which can be taken from Number.EPSILON
	var direction = new THREE.Vector3(1, 1, 0).normalize(); // a vector which should have 90 degrees difference to normals
	var difference = direction.dot( new THREE.Vector3( normals[0], normals[1], normals[2] ) );
	ok( difference < Number.EPSILON, "normal is equal to reference vector");


	// get normals for a line should be NAN because you need min a triangle to calculate normals
	var normals = getNormalsForVertices([1, 0, 0, -1, 0, 0]);
	for (var i = 0; i < normals.length; i++) {
		ok ( !normals[i], "normals can't be calculated which is good");
	}
});

function getNormalsForVertices(vertices) {
	var geometry = new THREE.BufferGeometry();

	geometry.addAttribute( "position", new THREE.BufferAttribute( new Float32Array(vertices), 3 ) );

	geometry.computeVertexNormals();

	ok( geometry.attributes.normal !== undefined, "normal attribute was created" );

	return geometry.attributes.normal.array;
}

test( "merge", function() {
	var geometry1 = new THREE.BufferGeometry();
	geometry1.addAttribute( "attrName", new THREE.BufferAttribute( new Float32Array([1, 2, 3, 0, 0, 0]), 3 ) );

	var geometry2 = new THREE.BufferGeometry();
	geometry2.addAttribute( "attrName", new THREE.BufferAttribute( new Float32Array([4, 5, 6]), 3 ) );

	var attr = geometry1.attributes.attrName.array;

	geometry1.merge(geometry2, 1);

	// merged array should be 1, 2, 3, 4, 5, 6
	for (var i = 0; i < attr.length; i++) {
	  ok( attr[i] === i + 1, "");
	}

	geometry1.merge(geometry2);
	ok( attr[0] === 4 && attr[1] === 5 && attr[2] === 6, "copied the 3 attributes without offset" );
});

test( "copy", function() {
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( "attrName", new THREE.BufferAttribute( new Float32Array([1, 2, 3, 4, 5, 6]), 3 ) );
	geometry.addAttribute( "attrName2", new THREE.BufferAttribute( new Float32Array([0, 1, 3, 5, 6]), 1 ) );

	var copy = new THREE.BufferGeometry().copy(geometry);

	ok( copy !== geometry && geometry.id !== copy.id, "new object was created" );

	Object.keys(geometry.attributes).forEach(function(key) {
		var attribute = geometry.attributes[key];
		ok( attribute !== undefined, "all attributes where copied");

		for (var i = 0; i < attribute.array.length; i++) {
			ok( attribute.array[i] === copy.attributes[key].array[i], "values of the attribute are equal" );
		}
	});
});
