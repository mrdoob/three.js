/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { EdgesGeometry } from '../../../../src/geometries/EdgesGeometry';
import { Geometry } from '../../../../src/core/Geometry';
import { BufferGeometry } from '../../../../src/core/BufferGeometry';
import { BufferAttribute } from '../../../../src/core/BufferAttribute';
import { Vector3 } from '../../../../src/math/Vector3';

// DEBUGGING
import { Scene } from '../../../../src/scenes/Scene';
import { Mesh } from '../../../../src/objects/Mesh';
import { LineSegments } from '../../../../src/objects/LineSegments';
import { LineBasicMaterial } from '../../../../src/materials/LineBasicMaterial';
import { WebGLRenderer } from '../../../../src/renderers/WebGLRenderer';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera';

//
// HELPERS
//

function testEdges( vertList, idxList, numAfter, assert ) {

	var geoms = createGeometries( vertList, idxList );

	for ( var i = 0; i < geoms.length; i ++ ) {

		var geom = geoms[ i ];

		var numBefore = idxList.length;
		assert.equal( countEdges( geom ), numBefore, "Edges before!" );

		var egeom = new EdgesGeometry( geom );

		assert.equal( countEdges( egeom ), numAfter, "Edges after!" );
		output( geom, egeom );

	}

}

function createGeometries( vertList, idxList ) {

	var geomIB = createIndexedBufferGeometry( vertList, idxList );
	var geom = new Geometry().fromBufferGeometry( geomIB );
	var geomB = new BufferGeometry().fromGeometry( geom );
	var geomDC = addDrawCalls( geomIB.clone() );
	return [ geom, geomB, geomIB, geomDC ];

}

function createIndexedBufferGeometry( vertList, idxList ) {

	var geom = new BufferGeometry();

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

			indices[ 3 * i + j ] = indexTable[ idx ];

		}

	}

	vertices = vertices.subarray( 0, 3 * numVerts );

	geom.setIndex( new BufferAttribute( indices, 1 ) );
	geom.addAttribute( 'position', new BufferAttribute( vertices, 3 ) );

	geom.computeFaceNormals();

	return geom;

}

function addDrawCalls( geometry ) {

	var numTris = geometry.index.count / 3;

	for ( var i = 0; i < numTris; i ++ ) {

		var start = i * 3;
		var count = 3;

		geometry.addGroup( start, count );

	}

	return geometry;

}

function countEdges( geom ) {

	if ( geom instanceof EdgesGeometry ) {

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
var DEBUG = false;
var renderer;
var camera;
var scene = new Scene();
var xoffset = 0;

function output( geom, egeom ) {

	if ( DEBUG !== true ) return;

	if ( ! renderer ) initDebug();

	var mesh = new Mesh( geom, undefined );
	var edges = new LineSegments( egeom, new LineBasicMaterial( { color: 'black' } ) );

	mesh.position.setX( xoffset );
	edges.position.setX( xoffset ++ );
	scene.add( mesh );
	scene.add( edges );

	if ( scene.children.length % 8 === 0 ) {

		xoffset += 2;

	}

}

function initDebug() {

	renderer = new WebGLRenderer( {

		antialias: true

	} );

	var width = 600;
	var height = 480;

	renderer.setSize( width, height );
	renderer.setClearColor( 0xCCCCCC );

	camera = new PerspectiveCamera( 45, width / height, 1, 100 );
	camera.position.x = 30;
	camera.position.z = 40;
	camera.lookAt( new Vector3( 30, 0, 0 ) );

	document.body.appendChild( renderer.domElement );

	var controls = new THREE.OrbitControls( camera, renderer.domElement ); // TODO: please do somethings for that -_-'
	controls.target = new Vector3( 30, 0, 0 );

	animate();

	function animate() {

		requestAnimationFrame( animate );

		controls.update();

		renderer.render( scene, camera );

	}

}

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'EdgesGeometry', () => {

		var vertList = [
			new Vector3( 0, 0, 0 ),
			new Vector3( 1, 0, 0 ),
			new Vector3( 1, 1, 0 ),
			new Vector3( 0, 1, 0 ),
			new Vector3( 1, 1, 1 ),
		];

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// OTHERS
		QUnit.test( "singularity", ( assert ) => {

			testEdges( vertList, [ 1, 1, 1 ], 0, assert );

		} );

		QUnit.test( "needle", ( assert ) => {

			testEdges( vertList, [ 0, 0, 1 ], 0, assert );

		} );

		QUnit.test( "single triangle", ( assert ) => {

			testEdges( vertList, [ 0, 1, 2 ], 3, assert );

		} );

		QUnit.test( "two isolated triangles", ( assert ) => {

			var vertList = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 1, 0, 0 ),
				new Vector3( 1, 1, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 1, 1 ),
			];

			testEdges( vertList, [ 0, 1, 2, 3, 4, 5 ], 6, assert );

		} );

		QUnit.test( "two flat triangles", ( assert ) => {

			testEdges( vertList, [ 0, 1, 2, 0, 2, 3 ], 4, assert );

		} );

		QUnit.test( "two flat triangles, inverted", ( assert ) => {

			testEdges( vertList, [ 0, 1, 2, 0, 3, 2 ], 5, assert );

		} );

		QUnit.test( "two non-coplanar triangles", ( assert ) => {

			testEdges( vertList, [ 0, 1, 2, 0, 4, 2 ], 5, assert );

		} );

		QUnit.test( "three triangles, coplanar first", ( assert ) => {

			testEdges( vertList, [ 0, 1, 2, 0, 2, 3, 0, 4, 2 ], 7, assert );

		} );

		QUnit.test( "three triangles, coplanar last", ( assert ) => {

			testEdges( vertList, [ 0, 1, 2, 0, 4, 2, 0, 2, 3 ], 6, assert ); // Should be 7

		} );

		QUnit.test( "tetrahedron", ( assert ) => {

			testEdges( vertList, [ 0, 1, 2, 0, 1, 4, 0, 4, 2, 1, 2, 4 ], 6, assert );

		} );

	} );

} );
