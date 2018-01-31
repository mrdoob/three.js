/**
 * @author Don McCurdy / https://www.donmccurdy.com
 */
/* global QUnit */

import * as GLTFExporter from '../../../../examples/js/exporters/GLTFExporter';
import * as GLTFLoader from '../../../../examples/js/loaders/GLTFLoader';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'GLTFLoader', () => {

		QUnit.test( 'constructor', ( assert ) => {

			assert.ok( new THREE.GLTFLoader(), 'Can instantiate a loader.' );

		} );

		QUnit.test( 'parse - basic', ( assert ) => {

			var done = assert.async();

			var geometry = new THREE.BufferGeometry();
			var array = new Float32Array( [
				- 1, - 1, - 1,
				1, 1, 1,
				4, 4, 4
			] );
			geometry.addAttribute( 'position', new THREE.BufferAttribute( array, 3 ) );

			var meshIn = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial( { color: 0xFF0000 } ) );
			meshIn.name = 'test_mesh';

			var exporter = new THREE.GLTFExporter();
			var loader = new THREE.GLTFLoader();

			exporter.parse( meshIn, function ( binary ) {

				loader.parse( binary, './', function ( gltf ) {

					var meshOut = gltf.scene.children[ 0 ];
					var attrsIn = meshIn.geometry.attributes;
					var attrsOut = meshOut.geometry.attributes;

					assert.equal( meshIn.name, meshOut.name, 'loads names' );
					assert.equal( meshIn.material.color.getHex(), meshOut.material.color.getHex(), 'loads color' );
					assert.smartEqual( attrsIn.position.array, attrsOut.position.array, 'loads positions' );
					assert.equal( undefined, attrsOut.normal, 'ignores missing attributes' );

					done();

				}, undefined, function ( e ) {

					console.error(e);

				} );

			}, { binary: true } );

		} );

		QUnit.test( 'parse - animation', ( assert ) => {

			var done = assert.async();

			var node1 = new THREE.Object3D();
			node1.name = 'node1';

			var node2 = new THREE.Object3D();
			node2.name = 'node2';

			var scene = new THREE.Scene();
			scene.add( node1, node2 );

			var clip = new THREE.AnimationClip( 'clip', undefined, [

				new THREE.VectorKeyframeTrack( 'node1.position', [ 0, 1, 2 ], [ 0, 0, 0, 30, 0, 0, 0, 0, 0 ] )

			] );

			var exporter = new THREE.GLTFExporter();
			var loader = new THREE.GLTFLoader();

			exporter.parse( scene, function ( binary ) {

				loader.parse( binary, './', function ( gltf ) {

					var clipOut = gltf.animations[ 0 ];

					assert.equal( 'node1.position', clipOut.tracks[ 0 ].name, 'track name' );
					assert.smartEqual( clip.tracks[ 0 ].times, clipOut.tracks[ 0 ].times, 'track times' );
					assert.smartEqual( clip.tracks[ 0 ].values, clipOut.tracks[ 0 ].values, 'track values' );

					done();

				}, undefined, function ( e ) {

					console.error(e);

				} );

			}, { binary: true, animations: [ clip ] } );

		} );

	} );

} );
