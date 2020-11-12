/* global QUnit */

import { GLTFExporter } from '../../../../examples/jsm/exporters/GLTFExporter';

import { AnimationClip } from '../../../../src/animation/AnimationClip';
import { BoxBufferGeometry } from '../../../../src/geometries/BoxBufferGeometry';
import { BufferAttribute } from '../../../../src/core/BufferAttribute';
import { BufferGeometry } from '../../../../src/core/BufferGeometry';
import { Mesh } from '../../../../src/objects/Mesh';
import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial';
import { MeshStandardMaterial } from '../../../../src/materials/MeshStandardMaterial';
import { Object3D } from '../../../../src/core/Object3D';
import { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack';
import { Scene } from '../../../../src/scenes/Scene';
import { VectorKeyframeTrack } from '../../../../src/animation/tracks/VectorKeyframeTrack';
import {
	DoubleSide,
	InterpolateLinear,
	InterpolateDiscrete
} from '../../../../src/constants.js';

export default QUnit.module( 'Exporters', () => {

	QUnit.module( 'GLTFExporter', () => {

		QUnit.test( 'constructor', ( assert ) => {

			assert.ok( new GLTFExporter(), 'Can instantiate an exporter.' );

		} );

		QUnit.test( 'parse - metadata', ( assert ) => {

			var done = assert.async();

			var object = new Object3D();

			var exporter = new GLTFExporter();

			exporter.parse( object, function ( gltf ) {

				console.log( gltf );

				assert.equal( '2.0', gltf.asset.version, 'asset.version' );
				assert.equal( 'GLTFExporter', gltf.asset.generator, 'asset.generator' );

				done();

			} );

		} );

		QUnit.test( 'parse - basic', ( assert ) => {

			var done = assert.async();

			var box = new Mesh(
				new BoxBufferGeometry( 1, 1, 1 ),
				new MeshStandardMaterial( { color: 0xFF0000 } )
			);

			var exporter = new GLTFExporter();

			exporter.parse( box, function ( gltf ) {

				assert.equal( 1, gltf.nodes.length, 'correct number of nodes' );
				assert.equal( 0, gltf.nodes[ 0 ].mesh, 'node references mesh' );
				assert.equal( 1, gltf.meshes[ 0 ].primitives.length, 'correct number of primitives' );

				var primitive = gltf.meshes[ 0 ].primitives[ 0 ];
				var material = gltf.materials[ primitive.material ];

				assert.equal( 4, primitive.mode, 'mesh uses TRIANGLES mode' );
				assert.ok( primitive.attributes.POSITION !== undefined, 'mesh contains position data' );
				assert.ok( primitive.attributes.NORMAL !== undefined, 'mesh contains normal data' );

				assert.smartEqual( {

					baseColorFactor: [ 1, 0, 0, 1 ],
					metallicFactor: 0.0,
					roughnessFactor: 1.0

				}, material.pbrMetallicRoughness, 'material' );

				done();

			} );

		} );

		QUnit.test( 'parse - animation', ( assert ) => {

			var done = assert.async();

			var mesh1 = new Mesh();
			mesh1.name = 'mesh1';

			var mesh2 = new Mesh();
			mesh2.name = 'mesh2';

			var mesh3 = new Mesh();
			mesh3.name = 'mesh3';

			var scene = new Scene();
			scene.add( mesh1, mesh2, mesh3 );

			var clip1 = new AnimationClip( 'clip1', undefined, [

				new VectorKeyframeTrack( 'mesh1.position', [ 0, 1, 2 ], [ 0, 0, 0, 30, 0, 0, 0, 0, 0 ] )

			] );

			var clip2 = new AnimationClip( 'clip2', undefined, [

				new VectorKeyframeTrack( 'mesh3.scale', [ 0, 1, 2 ], [ 1, 1, 1, 2, 2, 2, 1, 1, 1 ] )

			] );

			var exporter = new GLTFExporter();

			exporter.parse( scene, function ( gltf ) {

				assert.equal( 2, gltf.animations.length, 'one animation per clip' );

				var target1 = gltf.animations[ 0 ].channels[ 0 ].target;
				var target2 = gltf.animations[ 1 ].channels[ 0 ].target;

				assert.equal( 'mesh1', gltf.nodes[ target1.node ].name, 'clip1 node' );
				assert.equal( 'translation', target1.path, 'clip1 property' );
				assert.equal( 'mesh3', gltf.nodes[ target2.node ].name, 'clip2 node' );
				assert.equal( 'scale', target2.path, 'clip2 property' );

				done();

			}, { animations: [ clip1, clip2 ] } );

		} );

		QUnit.test( 'parse - empty buffergeometry', ( assert ) => {

			var done = assert.async();

			var scene = new Scene();
			var geometry = new BufferGeometry();
			var numElements = 6;

			var positions = new Float32Array( ( numElements ) * 3 );
			var colors = new Float32Array( ( numElements ) * 3 );

			geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
			geometry.setAttribute( 'color', new BufferAttribute( colors, 3 ) );
			geometry.setDrawRange( 0, 0 );

			var empty = new Mesh( geometry, new MeshBasicMaterial( { side: DoubleSide, vertexColors: true } ) );
			empty.name = 'Custom buffered empty (drawrange)';
			scene.add( empty );

			var exporter = new GLTFExporter();

			exporter.parse( scene, function ( gltf ) {

				assert.equal( gltf.meshes, undefined, 'empty meshes' );
				assert.equal( gltf.materials, undefined, 'empty materials' );
				assert.equal( gltf.bufferViews, undefined, 'empty bufferViews' );
				assert.equal( gltf.buffers, undefined, 'buffers' );
				assert.equal( gltf.accessors, undefined, 'accessors' );
				assert.equal( gltf.nodes[ 0 ].mesh, undefined, 'nodes[0].mesh' );

				done();

			} );

		} );

		QUnit.test( 'parse - individual morph targets', ( assert ) => {

			var done = assert.async();

			// Creates a geometry with four (4) morph targets, three (3) of which are
			// animated by an animation clip. Because glTF requires all morph targets
			// to be animated in unison, the exporter should write an empty track for
			// the fourth target.

			var geometry = new BufferGeometry();
			var position = new BufferAttribute( new Float32Array( [ 0, 0, 0, 0, 0, 1, 1, 0, 1 ] ), 3 );
			geometry.setAttribute( 'position',	position );
			geometry.morphAttributes.position = [ position, position, position, position ];

			var mesh = new Mesh( geometry );
			mesh.morphTargetDictionary.a = 0;
			mesh.morphTargetDictionary.b = 1;
			mesh.morphTargetDictionary.c = 2;
			mesh.morphTargetDictionary.d = 3;

			var timesA =	[ 0, 1, 2 ];
			var timesB =	[			 2, 3, 4 ];
			var timesC =	[						 4, 5, 6 ];
			var valuesA = [ 0, 1, 0 ];
			var valuesB = [			 0, 1, 0 ];
			var valuesC = [						 0, 1, 0 ];
			var trackA = new VectorKeyframeTrack( '.morphTargetInfluences[a]', timesA, valuesA, InterpolateLinear );
			var trackB = new VectorKeyframeTrack( '.morphTargetInfluences[b]', timesB, valuesB, InterpolateLinear );
			var trackC = new VectorKeyframeTrack( '.morphTargetInfluences[c]', timesC, valuesC, InterpolateLinear );

			var clip = new AnimationClip( 'clip1', undefined, [ trackA, trackB, trackC ] );

			var exporter = new GLTFExporter();

			exporter.parse( mesh, function ( gltf ) {

				assert.equal( 1, gltf.animations.length, 'one animation' );
				assert.equal( 1, gltf.animations[ 0 ].channels.length, 'one channel' );
				assert.equal( 1, gltf.animations[ 0 ].samplers.length, 'one sampler' );

				var channel = gltf.animations[ 0 ].channels[ 0 ];
				var sampler = gltf.animations[ 0 ].samplers[ 0 ];

				assert.smartEqual( channel, { sampler: 0, target: { node: 0, path: 'weights' } } );
				assert.equal( sampler.interpolation, 'LINEAR' );

				var input = gltf.accessors[ sampler.input ];
				var output = gltf.accessors[ sampler.output ];

				assert.equal( input.count, 7 );
				assert.equal( input.type, 'SCALAR' );
				assert.smartEqual( input.min, [ 0 ] );
				assert.smartEqual( input.max, [ 6 ] );

				assert.equal( output.count, 28 ); // 4 targets * 7 frames
				assert.equal( output.type, 'SCALAR' );
				assert.smartEqual( output.min, [ 0 ] );
				assert.smartEqual( output.max, [ 1 ] );

				done();

			}, { animations: [ clip ] } );

		} );

		QUnit.test( 'utils - insertKeyframe', ( assert ) => {

			var track;
			var index;

			function createTrack() {

				return new VectorKeyframeTrack(
					'foo.bar',
					[ 5,		10,	 15,	 20,	 25,	 30 ],
					[ 0, 5, 1, 4, 2, 3, 3, 2, 4, 1, 5, 0 ],
					InterpolateLinear
				);

			}

			track = createTrack();
			index = GLTFExporter.Utils.insertKeyframe( track, 0 );
			assert.equal( index, 0, 'prepend - index' );
			assert.smartEqual( Array.from( track.times ), [ 0, 5, 10, 15, 20, 25, 30 ], 'prepend - time' );
			assert.smartEqual( Array.from( track.values ), [ 0, 5, 0, 5, 1, 4, 2, 3, 3, 2, 4, 1, 5, 0 ], 'prepend - value' );

			track = createTrack();
			index = GLTFExporter.Utils.insertKeyframe( track, 7.5 );
			assert.equal( index, 1, 'insert - index (linear)' );
			assert.smartEqual( Array.from( track.times ), [ 5, 7.5, 10, 15, 20, 25, 30 ], 'insert - time (linear)' );
			assert.smartEqual( Array.from( track.values ), [ 0, 5, 0.5, 4.5, 1, 4, 2, 3, 3, 2, 4, 1, 5, 0 ], 'insert - value (linear)' );

			track = createTrack();
			track.setInterpolation( InterpolateDiscrete );
			index = GLTFExporter.Utils.insertKeyframe( track, 16 );
			assert.equal( index, 3, 'insert - index (linear)' );
			assert.smartEqual( Array.from( track.times ), [ 5, 10, 15, 16, 20, 25, 30 ], 'insert - time (discrete)' );
			assert.smartEqual( Array.from( track.values ), [ 0, 5, 1, 4, 2, 3, 2, 3, 3, 2, 4, 1, 5, 0 ], 'insert - value (discrete)' );

			track = createTrack();
			index = GLTFExporter.Utils.insertKeyframe( track, 100 );
			assert.equal( index, 6, 'append - index' );
			assert.smartEqual( Array.from( track.times ), [ 5, 10, 15, 20, 25, 30, 100 ], 'append time' );
			assert.smartEqual( Array.from( track.values ), [ 0, 5, 1, 4, 2, 3, 3, 2, 4, 1, 5, 0, 5, 0 ], 'append value' );

			track = createTrack();
			index = GLTFExporter.Utils.insertKeyframe( track, 15 );
			assert.equal( index, 2, 'existing - index' );
			assert.smartEqual( Array.from( track.times ), [ 5, 10, 15, 20, 25, 30 ], 'existing - time' );
			assert.smartEqual( Array.from( track.values ), [ 0, 5, 1, 4, 2, 3, 3, 2, 4, 1, 5, 0 ], 'existing - value' );

			track = createTrack();
			index = GLTFExporter.Utils.insertKeyframe( track, 20.000005 );
			assert.equal( index, 3, 'tolerance - index' );
			assert.smartEqual( Array.from( track.times ), [ 5, 10, 15, 20, 25, 30 ], 'tolerance - time' );
			assert.smartEqual( Array.from( track.values ), [ 0, 5, 1, 4, 2, 3, 3, 2, 4, 1, 5, 0 ], 'tolerance - value' );

		} );

		QUnit.test( 'utils - mergeMorphTargetTracks', ( assert ) => {

			var trackA = new NumberKeyframeTrack(
				'foo.morphTargetInfluences[a]',
				[ 5, 10, 15, 20, 25, 30 ],
				[ 0, 0.2, 0.4, 0.6, 0.8, 1.0 ],
				InterpolateLinear
			);

			var trackB = new NumberKeyframeTrack(
				'foo.morphTargetInfluences[b]',
				[ 10, 50 ],
				[ 0.25, 0.75 ],
				InterpolateLinear
			);

			var geometry = new BufferGeometry();
			var position = new BufferAttribute( new Float32Array( [ 0, 0, 0, 0, 0, 1, 1, 0, 1 ] ), 3 );
			geometry.setAttribute( 'position',	position );
			geometry.morphAttributes.position = [ position, position ];

			var mesh = new Mesh( geometry );
			mesh.name = 'foo';
			mesh.morphTargetDictionary.a = 0;
			mesh.morphTargetDictionary.b = 1;

			var root = new Object3D();
			root.add( mesh );

			var clip = new AnimationClip( 'waltz', undefined, [ trackA, trackB ] );
			clip = GLTFExporter.Utils.mergeMorphTargetTracks( clip, root );

			assert.equal( clip.tracks.length, 1, 'tracks are merged' );

			var track = clip.tracks[ 0 ];

			assert.smartEqual( Array.from( track.times ), [ 5, 10, 15, 20, 25, 30, 50 ], 'all keyframes are present' );

			var expectedValues = [ 0, 0.25, 0.2, 0.25, 0.4, 0.3125, 0.6, 0.375, 0.8, 0.4375, 1.0, 0.5, 1.0, 0.75 ];

			for ( var i = 0; i < track.values.length; i ++ ) {

				assert.numEqual( track.values[ i ], expectedValues[ i ], 'all values are merged or interpolated - ' + i );

			}

		} );

	} );

} );
