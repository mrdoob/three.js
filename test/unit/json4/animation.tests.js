import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';
import { InterpolateLinear, InterpolateSmooth, InterpolateDiscrete } from '../../../src/constants.js';

export default QUnit.module( 'JSON4 Format', () => {

	QUnit.module( 'Animation', () => {

		QUnit.test( 'AnimationClip - name, duration, tracks', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BoxGeometry',
					width: 1,
					height: 1,
					depth: 1
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680
				} ],
				animations: [ {
					uuid: 'anim-1',
					name: 'MoveRight',
					duration: 2,
					tracks: [
						{
							name: '.position',
							type: 'vector',
							times: [ 0, 1, 2 ],
							values: [ 0, 0, 0, 5, 0, 0, 10, 0, 0 ]
						}
					]
				} ],
				object: {
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					animations: [ 'anim-1' ]
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			assert.strictEqual( mesh.animations.length, 1, 'Has 1 animation' );
			assert.strictEqual( mesh.animations[ 0 ].name, 'MoveRight', 'Animation name' );
			assert.strictEqual( mesh.animations[ 0 ].duration, 2, 'Animation duration' );
			assert.strictEqual( mesh.animations[ 0 ].tracks.length, 1, 'Has 1 track' );

		} );

		QUnit.test( 'VectorKeyframeTrack (position)', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BoxGeometry',
					width: 1,
					height: 1,
					depth: 1
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680
				} ],
				animations: [ {
					uuid: 'anim-1',
					name: 'Position',
					duration: 1,
					tracks: [
						{
							name: '.position',
							type: 'vector',
							times: [ 0, 0.5, 1 ],
							values: [ 0, 0, 0, 0, 5, 0, 0, 0, 0 ]
						}
					]
				} ],
				object: {
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					animations: [ 'anim-1' ]
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			const track = mesh.animations[ 0 ].tracks[ 0 ];
			assert.strictEqual( track.name, '.position', 'Track name' );
			assert.strictEqual( track.times.length, 3, 'Has 3 keyframes' );
			assert.strictEqual( track.values.length, 9, 'Has 9 values (3 vec3)' );

		} );

		QUnit.test( 'QuaternionKeyframeTrack (rotation)', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BoxGeometry',
					width: 1,
					height: 1,
					depth: 1
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680
				} ],
				animations: [ {
					uuid: 'anim-1',
					name: 'Rotation',
					duration: 1,
					tracks: [
						{
							name: '.quaternion',
							type: 'quaternion',
							times: [ 0, 1 ],
							values: [ 0, 0, 0, 1, 0, 0.7071, 0, 0.7071 ]
						}
					]
				} ],
				object: {
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					animations: [ 'anim-1' ]
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			const track = mesh.animations[ 0 ].tracks[ 0 ];
			assert.strictEqual( track.name, '.quaternion', 'Track name' );
			assert.strictEqual( track.times.length, 2, 'Has 2 keyframes' );
			assert.strictEqual( track.values.length, 8, 'Has 8 values (2 quat)' );

		} );

		QUnit.test( 'NumberKeyframeTrack (opacity)', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BoxGeometry',
					width: 1,
					height: 1,
					depth: 1
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680,
					transparent: true
				} ],
				animations: [ {
					uuid: 'anim-1',
					name: 'Fade',
					duration: 1,
					tracks: [
						{
							name: '.material.opacity',
							type: 'number',
							times: [ 0, 0.5, 1 ],
							values: [ 1, 0, 1 ]
						}
					]
				} ],
				object: {
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					animations: [ 'anim-1' ]
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			const track = mesh.animations[ 0 ].tracks[ 0 ];
			assert.strictEqual( track.name, '.material.opacity', 'Track name' );
			assert.strictEqual( track.times.length, 3, 'Has 3 keyframes' );
			assert.strictEqual( track.values.length, 3, 'Has 3 values' );

		} );

		QUnit.test( 'Track interpolation modes', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BoxGeometry',
					width: 1,
					height: 1,
					depth: 1
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680
				} ],
				animations: [ {
					uuid: 'anim-1',
					name: 'Interpolation',
					duration: 3,
					tracks: [
						{
							name: '.position[x]',
							type: 'number',
							times: [ 0, 1 ],
							values: [ 0, 10 ],
							interpolation: InterpolateLinear
						},
						{
							name: '.position[y]',
							type: 'number',
							times: [ 0, 1 ],
							values: [ 0, 10 ],
							interpolation: InterpolateSmooth
						},
						{
							name: '.position[z]',
							type: 'number',
							times: [ 0, 1 ],
							values: [ 0, 10 ],
							interpolation: InterpolateDiscrete
						}
					]
				} ],
				object: {
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					animations: [ 'anim-1' ]
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			const tracks = mesh.animations[ 0 ].tracks;
			assert.strictEqual( tracks[ 0 ].getInterpolation(), InterpolateLinear, 'Linear interpolation' );
			assert.strictEqual( tracks[ 1 ].getInterpolation(), InterpolateSmooth, 'Smooth interpolation' );
			assert.strictEqual( tracks[ 2 ].getInterpolation(), InterpolateDiscrete, 'Discrete interpolation' );

		} );

		QUnit.test( 'ColorKeyframeTrack', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BoxGeometry',
					width: 1,
					height: 1,
					depth: 1
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680
				} ],
				animations: [ {
					uuid: 'anim-1',
					name: 'ColorChange',
					duration: 1,
					tracks: [
						{
							name: '.material.color',
							type: 'color',
							times: [ 0, 1 ],
							values: [ 1, 0, 0, 0, 0, 1 ]
						}
					]
				} ],
				object: {
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					animations: [ 'anim-1' ]
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			const track = mesh.animations[ 0 ].tracks[ 0 ];
			assert.strictEqual( track.name, '.material.color', 'Track name' );
			assert.strictEqual( track.values.length, 6, 'Has 6 values (2 rgb)' );

		} );

		QUnit.test( 'BooleanKeyframeTrack', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BoxGeometry',
					width: 1,
					height: 1,
					depth: 1
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680
				} ],
				animations: [ {
					uuid: 'anim-1',
					name: 'Visibility',
					duration: 2,
					tracks: [
						{
							name: '.visible',
							type: 'bool',
							times: [ 0, 1, 2 ],
							values: [ true, false, true ]
						}
					]
				} ],
				object: {
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					animations: [ 'anim-1' ]
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			const track = mesh.animations[ 0 ].tracks[ 0 ];
			assert.strictEqual( track.name, '.visible', 'Track name' );
			assert.strictEqual( track.times.length, 3, 'Has 3 keyframes' );

		} );

		QUnit.test( 'Multiple animations on object', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BoxGeometry',
					width: 1,
					height: 1,
					depth: 1
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680
				} ],
				animations: [
					{
						uuid: 'anim-1',
						name: 'Walk',
						duration: 1,
						tracks: [
							{
								name: '.position',
								type: 'vector',
								times: [ 0, 1 ],
								values: [ 0, 0, 0, 1, 0, 0 ]
							}
						]
					},
					{
						uuid: 'anim-2',
						name: 'Run',
						duration: 0.5,
						tracks: [
							{
								name: '.position',
								type: 'vector',
								times: [ 0, 0.5 ],
								values: [ 0, 0, 0, 2, 0, 0 ]
							}
						]
					}
				],
				object: {
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					animations: [ 'anim-1', 'anim-2' ]
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			assert.strictEqual( mesh.animations.length, 2, 'Has 2 animations' );
			assert.strictEqual( mesh.animations[ 0 ].name, 'Walk', 'First animation name' );
			assert.strictEqual( mesh.animations[ 1 ].name, 'Run', 'Second animation name' );

		} );

		QUnit.test( 'StringKeyframeTrack', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BoxGeometry',
					width: 1,
					height: 1,
					depth: 1
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680
				} ],
				animations: [ {
					uuid: 'anim-1',
					name: 'NameChange',
					duration: 2,
					tracks: [
						{
							name: '.name',
							type: 'string',
							times: [ 0, 1, 2 ],
							values: [ 'First', 'Second', 'Third' ]
						}
					]
				} ],
				object: {
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					animations: [ 'anim-1' ]
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			const track = mesh.animations[ 0 ].tracks[ 0 ];
			assert.strictEqual( track.name, '.name', 'Track name' );
			assert.strictEqual( track.times.length, 3, 'Has 3 keyframes' );

		} );

	} );

} );
