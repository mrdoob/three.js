/**
 * Tests for ObjectLoader JSON v4 format backwards compatibility
 */

import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'ObjectLoader JSON v4 Format', () => {

		QUnit.test( 'parse v4 format - geometries as array', ( assert ) => {

			const json = {
				metadata: { version: 4.6, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [
					{
						uuid: 'geom-1',
						type: 'BoxGeometry',
						width: 1, height: 1, depth: 1
					},
					{
						uuid: 'geom-2',
						type: 'SphereGeometry',
						radius: 0.5
					}
				],
				materials: [
					{
						uuid: 'mat-1',
						type: 'MeshBasicMaterial',
						color: 0xff0000
					}
				],
				object: {
					uuid: 'root',
					type: 'Scene',
					children: [
						{
							uuid: 'mesh-1',
							type: 'Mesh',
							geometry: 'geom-1',
							material: 'mat-1'
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.ok( scene.isScene, 'Parsed scene correctly' );
			assert.strictEqual( scene.children.length, 1, 'Scene has one child' );
			assert.ok( scene.children[ 0 ].isMesh, 'Child is a mesh' );
			assert.ok( scene.children[ 0 ].geometry.isBufferGeometry, 'Mesh has geometry' );
			assert.ok( scene.children[ 0 ].material.isMeshBasicMaterial, 'Mesh has material' );

		} );

		QUnit.test( 'parse v4 format - materials as array', ( assert ) => {

			const json = {
				metadata: { version: 4.6, type: 'Object', generator: 'Object3D.toJSON' },
				materials: [
					{
						uuid: 'mat-basic',
						type: 'MeshBasicMaterial',
						color: 0xff0000
					},
					{
						uuid: 'mat-standard',
						type: 'MeshStandardMaterial',
						color: 0x00ff00,
						roughness: 0.5,
						metalness: 0.5
					}
				],
				geometries: [
					{
						uuid: 'geom-1',
						type: 'BoxGeometry',
						width: 1, height: 1, depth: 1
					}
				],
				object: {
					uuid: 'root',
					type: 'Scene',
					children: [
						{
							uuid: 'mesh-1',
							type: 'Mesh',
							geometry: 'geom-1',
							material: 'mat-standard'
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.ok( scene.children[ 0 ].material.isMeshStandardMaterial, 'Material parsed correctly' );
			assert.strictEqual( scene.children[ 0 ].material.roughness, 0.5, 'Material properties preserved' );

		} );

		QUnit.test( 'parse v4 format - shapes as array', ( assert ) => {

			const json = {
				metadata: { version: 4.6, type: 'Object', generator: 'Object3D.toJSON' },
				shapes: [
					{
						uuid: 'shape-1',
						type: 'Shape',
						arcLengthDivisions: 200,
						autoClose: false,
						currentPoint: [ 0, 0 ],
						holes: [],
						curves: [
							{
								type: 'LineCurve',
								arcLengthDivisions: 200,
								v1: [ 0, 0 ],
								v2: [ 1, 0 ]
							},
							{
								type: 'LineCurve',
								arcLengthDivisions: 200,
								v1: [ 1, 0 ],
								v2: [ 1, 1 ]
							},
							{
								type: 'LineCurve',
								arcLengthDivisions: 200,
								v1: [ 1, 1 ],
								v2: [ 0, 0 ]
							}
						]
					}
				],
				geometries: [
					{
						uuid: 'geom-1',
						type: 'ShapeGeometry',
						shapes: [ 'shape-1' ]
					}
				],
				materials: [
					{
						uuid: 'mat-1',
						type: 'MeshBasicMaterial',
						color: 0xffffff
					}
				],
				object: {
					uuid: 'root',
					type: 'Scene',
					children: [
						{
							uuid: 'mesh-1',
							type: 'Mesh',
							geometry: 'geom-1',
							material: 'mat-1'
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.ok( scene.children[ 0 ].geometry.isBufferGeometry, 'ShapeGeometry parsed from v4 shapes array' );

		} );

		QUnit.test( 'parse v4 format - animations as array', ( assert ) => {

			const json = {
				metadata: { version: 4.6, type: 'Object', generator: 'Object3D.toJSON' },
				animations: [
					{
						uuid: 'clip-1',
						name: 'TestAnimation',
						duration: 1,
						tracks: [
							{
								type: 'number',
								name: '.opacity',
								times: [ 0, 1 ],
								values: [ 0, 1 ]
							}
						]
					}
				],
				geometries: [
					{
						uuid: 'geom-1',
						type: 'BoxGeometry',
						width: 1, height: 1, depth: 1
					}
				],
				materials: [
					{
						uuid: 'mat-1',
						type: 'MeshBasicMaterial',
						color: 0xffffff
					}
				],
				object: {
					uuid: 'root',
					type: 'Scene',
					animations: [ 'clip-1' ],
					children: [
						{
							uuid: 'mesh-1',
							type: 'Mesh',
							geometry: 'geom-1',
							material: 'mat-1'
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.strictEqual( scene.animations.length, 1, 'Animation parsed from v4 array' );
			assert.strictEqual( scene.animations[ 0 ].name, 'TestAnimation', 'Animation name preserved' );

		} );

	} );

} );
