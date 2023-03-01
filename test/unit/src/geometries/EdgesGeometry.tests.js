/* global QUnit */

import { EdgesGeometry } from '../../../../src/geometries/EdgesGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

// DEBUGGING
import { Scene } from '../../../../src/scenes/Scene.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { LineSegments } from '../../../../src/objects/LineSegments.js';
import { LineBasicMaterial } from '../../../../src/materials/LineBasicMaterial.js';
import { WebGLRenderer } from '../../../../src/renderers/WebGLRenderer.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';

//
// HELPERS
//

function testEdges( vertList, idxList, numAfter, assert ) {

	const geoms = createGeometries( vertList, idxList );

	for ( let i = 0; i < geoms.length; i ++ ) {

		const geom = geoms[ i ];

		const numBefore = idxList.length;
		assert.equal( countEdges( geom ), numBefore, 'Edges before!' );

		const egeom = new EdgesGeometry( geom );

		assert.equal( countEdges( egeom ), numAfter, 'Edges after!' );
		output( geom, egeom );

	}

}

function createGeometries( vertList, idxList ) {

	const geomIB = createIndexedBufferGeometry( vertList, idxList );
	const geomDC = addDrawCalls( geomIB.clone() );
	return [ geomIB, geomDC ];

}

function createIndexedBufferGeometry( vertList, idxList ) {

	const geom = new BufferGeometry();

	const indexTable = [];
	const numTris = idxList.length / 3;
	let numVerts = 0;

	const indices = new Uint32Array( numTris * 3 );
	let vertices = new Float32Array( vertList.length * 3 );

	for ( let i = 0; i < numTris; i ++ ) {

		for ( let j = 0; j < 3; j ++ ) {

			const idx = idxList[ 3 * i + j ];
			if ( indexTable[ idx ] === undefined ) {

				const v = vertList[ idx ];
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
	geom.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );

	return geom;

}

function addDrawCalls( geometry ) {

	const numTris = geometry.index.count / 3;

	for ( let i = 0; i < numTris; i ++ ) {

		const start = i * 3;
		const count = 3;

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

	const indices = geom.index;
	if ( indices ) {

		return indices.count;

	}

	return geom.getAttribute( 'position' ).count;

}

//
// DEBUGGING
//
const DEBUG = false;
let renderer;
let camera;
const scene = new Scene();
let xoffset = 0;

function output( geom, egeom ) {

	if ( DEBUG !== true ) return;

	if ( ! renderer ) initDebug();

	const mesh = new Mesh( geom, undefined );
	const edges = new LineSegments( egeom, new LineBasicMaterial( { color: 'black' } ) );

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

	const width = 600;
	const height = 480;

	renderer.setSize( width, height );
	renderer.setClearColor( 0xCCCCCC );

	camera = new PerspectiveCamera( 45, width / height, 1, 100 );
	camera.position.x = 30;
	camera.position.z = 40;
	camera.lookAt( new Vector3( 30, 0, 0 ) );

	document.body.appendChild( renderer.domElement );

	const controls = new THREE.OrbitControls( camera, renderer.domElement ); // TODO: please do somethings for that -_-'
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

		const vertList = [
			new Vector3( 0, 0, 0 ),
			new Vector3( 1, 0, 0 ),
			new Vector3( 1, 1, 0 ),
			new Vector3( 0, 1, 0 ),
			new Vector3( 1, 1, 1 ),
		];

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new EdgesGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'EdgesGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new EdgesGeometry();
			assert.ok( object, 'Can instantiate an EdgesGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new EdgesGeometry();
			assert.ok(
				object.type === 'EdgesGeometry',
				'EdgesGeometry.type should be EdgesGeometry'
			);

		} );

		QUnit.todo( 'parameters', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'singularity', ( assert ) => {

			testEdges( vertList, [ 1, 1, 1 ], 0, assert );

		} );

		QUnit.test( 'needle', ( assert ) => {

			testEdges( vertList, [ 0, 0, 1 ], 0, assert );

		} );

		QUnit.test( 'single triangle', ( assert ) => {

			testEdges( vertList, [ 0, 1, 2 ], 3, assert );

		} );

		QUnit.test( 'two isolated triangles', ( assert ) => {

			const vertList = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 1, 0, 0 ),
				new Vector3( 1, 1, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 1, 1 ),
			];

			testEdges( vertList, [ 0, 1, 2, 3, 4, 5 ], 6, assert );

		} );

		QUnit.test( 'two flat triangles', ( assert ) => {

			testEdges( vertList, [ 0, 1, 2, 0, 2, 3 ], 4, assert );

		} );

		QUnit.test( 'two flat triangles, inverted', ( assert ) => {

			testEdges( vertList, [ 0, 1, 2, 0, 3, 2 ], 5, assert );

		} );

		QUnit.test( 'two non-coplanar triangles', ( assert ) => {

			testEdges( vertList, [ 0, 1, 2, 0, 4, 2 ], 5, assert );

		} );

		QUnit.test( 'three triangles, coplanar first', ( assert ) => {

			testEdges( vertList, [ 0, 2, 3, 0, 1, 2, 0, 4, 2 ], 7, assert );

		} );

		QUnit.test( 'three triangles, coplanar last', ( assert ) => {

			testEdges( vertList, [ 0, 1, 2, 0, 4, 2, 0, 2, 3 ], 6, assert ); // Should be 7

		} );

		QUnit.test( 'tetrahedron', ( assert ) => {

			testEdges( vertList, [ 0, 1, 2, 0, 1, 4, 0, 4, 2, 1, 2, 4 ], 6, assert );

		} );

	} );

} );
