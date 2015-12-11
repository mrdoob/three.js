module( "EdgesGeometry" );

var DEBUG = false;

var vertList = [
	new THREE.Vector3(0, 0, 0),
	new THREE.Vector3(1, 0, 0),
	new THREE.Vector3(1, 1, 0),
	new THREE.Vector3(0, 1, 0),
	new THREE.Vector3(1, 1, 1),
];

test( "singularity", function() {

	testEdges( vertList, [1, 1, 1], 0 );

});

test( "needle", function() {

	testEdges( vertList, [0, 0, 1], 0 );

});

test( "single triangle", function() {

	testEdges( vertList, [0, 1, 2], 3 );

});

test( "two isolated triangles", function() {

	var vertList = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(1, 0, 0),
		new THREE.Vector3(1, 1, 0),
		new THREE.Vector3(0, 0, 1),
		new THREE.Vector3(1, 0, 1),
		new THREE.Vector3(1, 1, 1),
	];

	testEdges( vertList, [0, 1, 2, 3, 4, 5], 6 );

});

test( "two flat triangles", function() {

	testEdges( vertList, [0, 1, 2, 0, 2, 3], 4 );

});

test( "two flat triangles, inverted", function() {

	testEdges( vertList, [0, 1, 2, 0, 3, 2], 5 );

});

test( "two non-coplanar triangles", function() {

	testEdges( vertList, [0, 1, 2, 0, 4, 2], 5 );

});

test( "three triangles, coplanar first", function() {

	testEdges( vertList, [0, 1, 2, 0, 2, 3, 0, 4, 2], 7 );

});

test( "three triangles, coplanar last", function() {

	testEdges( vertList, [0, 1, 2, 0, 4, 2, 0, 2, 3], 6 ); // Should be 7

});

test( "tetrahedron", function() {

	testEdges( vertList, [0, 1, 2, 0, 1, 4, 0, 4, 2, 1, 2, 4], 6 );

});



//
// HELPERS
//


function testEdges ( vertList, idxList, numAfter ) {

	var geoms = createGeometries ( vertList, idxList );

	for ( var i = 0 ; i < geoms.length ; i ++ ) {

		var geom = geoms[i];

		var numBefore = idxList.length;
		equal( countEdges (geom), numBefore, "Edges before!" );

		var egeom = new THREE.EdgesGeometry( geom );

		equal( countEdges (egeom), numAfter, "Edges after!" );
		output( geom, egeom );

	}

}

function createGeometries ( vertList, idxList ) {

	var geomIB = createIndexedBufferGeometry ( vertList, idxList );
	var geom = new THREE.Geometry().fromBufferGeometry( geomIB );
	var geomB = new THREE.BufferGeometry().fromGeometry( geom );
	var geomDC = addDrawCalls( geomIB.clone() );
	return [ geom, geomB, geomIB, geomDC ];

}

function createIndexedBufferGeometry ( vertList, idxList ) {

	var geom = new THREE.BufferGeometry();

	var indexTable = [];
	var numTris = idxList.length / 3;
	var numVerts = 0;

	var indices = new Uint32Array( numTris * 3 );
	var vertices = new Float32Array( vertList.length * 3 );

	for ( var i = 0; i < numTris; i ++ ) {

		for ( var j = 0; j < 3; j ++ ) {

			var idx = idxList[ 3 * i + j ];
			if ( indexTable[ idx ] === undefined ) {

				var v = vertList[ idx ];
				vertices[ 3 * numVerts ] = v.x;
				vertices[ 3 * numVerts + 1 ] = v.y;
				vertices[ 3 * numVerts + 2 ] = v.z;

				indexTable[ idx ] = numVerts;

				numVerts ++;

			}

			indices[ 3 * i + j ] = indexTable[ idx ] ;

		}

	}

	vertices = vertices.subarray( 0, 3 * numVerts );

	geom.setIndex( new THREE.BufferAttribute( indices, 1 ) );
	geom.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

	geom.computeFaceNormals();

	return geom;

}

function addDrawCalls ( geometry ) {

	var numTris = geometry.index.count / 3;

	var offset = 0;
	for ( var i = 0 ; i < numTris; i ++ ) {

		var start = i * 3;
		var count = 3;

		geometry.addGroup( start, count );
	}

	return geometry;

}

function countEdges ( geom ) {

	if ( geom instanceof THREE.EdgesGeometry ) {

		return geom.getAttribute( 'position' ).count / 2;

	}

	if ( geom.faces !== undefined ) {

		return geom.faces.length * 3;

	}

	var indices = geom.index;
	if ( indices ) {

		return indices.count;

	}

	return geom.getAttribute( 'position' ).count;

}

//
// DEBUGGING
//

var renderer;
var camera;
var scene = new THREE.Scene();
var xoffset = 0;

function output ( geom, egeom ) {

	if ( DEBUG !== true ) return;

	if ( !renderer ) initDebug();

	var mesh = new THREE.Mesh( geom, undefined );
	var edges = new THREE.LineSegments( egeom, new THREE.LineBasicMaterial( { color: 'black' } ) );

	mesh.position.setX( xoffset );
	edges.position.setX( xoffset ++ );
	scene.add(mesh);
	scene.add(edges);

	if (scene.children.length % 8 === 0) {

		xoffset += 2;

	}

}

function initDebug () {

	renderer = new THREE.WebGLRenderer({

		antialias: true

	});

	var width = 600;
	var height = 480;

	renderer.setSize(width, height);
	renderer.setClearColor( 0xCCCCCC );

	camera = new THREE.PerspectiveCamera(45, width / height, 1, 100);
	camera.position.x = 30;
	camera.position.z = 40;
	camera.lookAt(new THREE.Vector3(30, 0, 0));

	document.body.appendChild(renderer.domElement);

	var controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target = new THREE.Vector3(30, 0, 0);

	animate();

	function animate() {

		requestAnimationFrame( animate );

		controls.update();

		renderer.render( scene, camera );

	}

}
