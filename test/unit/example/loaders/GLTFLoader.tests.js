/**
 * @author Don McCurdy / https://www.donmccurdy.com
 */
/* global QUnit */

import { GLTFExporter } from '../../../../examples/jsm/exporters/GLTFExporter';
import { GLTFLoader } from '../../../../examples/jsm/loaders/GLTFLoader';

import { AnimationClip } from '../../../../src/animation/AnimationClip';
import { BufferAttribute } from '../../../../src/core/BufferAttribute';
import { BufferGeometry } from '../../../../src/core/BufferGeometry';
import { Mesh } from '../../../../src/objects/Mesh';
import { MeshStandardMaterial } from '../../../../src/materials/MeshStandardMaterial';
import { Object3D } from '../../../../src/core/Object3D';
import { Scene } from '../../../../src/scenes/Scene';
import { VectorKeyframeTrack } from '../../../../src/animation/tracks/VectorKeyframeTrack';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'GLTFLoader', () => {

		QUnit.test( 'constructor', ( assert ) => {

			assert.ok( new GLTFLoader(), 'Can instantiate a loader.' );

		} );

		QUnit.test( 'parse - basic', ( assert ) => {

			var done = assert.async();

			var geometry = new BufferGeometry();
			var array = new Float32Array( [
				- 1, - 1, - 1,
				1, 1, 1,
				4, 4, 4
			] );
			geometry.addAttribute( 'position', new BufferAttribute( array, 3 ) );

			var meshIn = new Mesh( geometry, new MeshStandardMaterial( { color: 0xFF0000 } ) );
			meshIn.name = 'test_mesh';

			var exporter = new GLTFExporter();
			var loader = new GLTFLoader();

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

					console.error( e );

				} );

			}, { binary: true } );

		} );

		QUnit.test( 'parse - animation', ( assert ) => {

			var done = assert.async();

			var node1 = new Object3D();
			node1.name = 'node1';

			var node2 = new Object3D();
			node2.name = 'node2';

			var scene = new Scene();
			scene.add( node1, node2 );

			var clip = new AnimationClip( 'clip', undefined, [

				new VectorKeyframeTrack( 'node1.position', [ 0, 1, 2 ], [ 0, 0, 0, 30, 0, 0, 0, 0, 0 ] )

			] );

			var exporter = new GLTFExporter();
			var loader = new GLTFLoader();

			exporter.parse( scene, function ( binary ) {

				loader.parse( binary, './', function ( gltf ) {

					var clipOut = gltf.animations[ 0 ];

					assert.equal( 'node1.position', clipOut.tracks[ 0 ].name, 'track name' );
					assert.smartEqual( clip.tracks[ 0 ].times, clipOut.tracks[ 0 ].times, 'track times' );
					assert.smartEqual( clip.tracks[ 0 ].values, clipOut.tracks[ 0 ].values, 'track values' );

					done();

				}, undefined, function ( e ) {

					console.error( e );

				} );

			}, { binary: true, animations: [ clip ] } );

		} );

	} );

} );
