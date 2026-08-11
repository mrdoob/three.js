/**
 * Tests for ObjectLoader JSON v5 format
 */

import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';

import { Scene } from '../../../../src/scenes/Scene.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import { SphereGeometry } from '../../../../src/geometries/SphereGeometry.js';
import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { Float32BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { InstancedBufferGeometry } from '../../../../src/core/InstancedBufferGeometry.js';
import { InstancedBufferAttribute } from '../../../../src/core/InstancedBufferAttribute.js';
import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer.js';
import { InterleavedBufferAttribute } from '../../../../src/core/InterleavedBufferAttribute.js';
import { InstancedInterleavedBuffer } from '../../../../src/core/InstancedInterleavedBuffer.js';
import { InstancedMesh } from '../../../../src/objects/InstancedMesh.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'ObjectLoader JSON v5 Format', () => {

		// V5 FORMAT (objects keyed by uuid) TESTS

		QUnit.test( 'parse v5 format - geometries as object', ( assert ) => {

			const json = {
				metadata: { version: 5, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: {
					'geom-1': {
						uuid: 'geom-1',
						type: 'BoxGeometry',
						width: 2, height: 2, depth: 2
					},
					'geom-2': {
						uuid: 'geom-2',
						type: 'SphereGeometry',
						radius: 1
					}
				},
				materials: {
					'mat-1': {
						uuid: 'mat-1',
						type: 'MeshBasicMaterial',
						color: 0x0000ff
					}
				},
				object: {
					uuid: 'root',
					type: 'Scene',
					children: [
						{
							uuid: 'mesh-1',
							type: 'Mesh',
							geometry: 'geom-1',
							material: 'mat-1'
						},
						{
							uuid: 'mesh-2',
							type: 'Mesh',
							geometry: 'geom-2',
							material: 'mat-1'
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.ok( scene.isScene, 'Parsed v5 scene correctly' );
			assert.strictEqual( scene.children.length, 2, 'Scene has two children' );
			assert.ok( scene.children[ 0 ].geometry.isBufferGeometry, 'First mesh has geometry' );
			assert.ok( scene.children[ 1 ].geometry.isBufferGeometry, 'Second mesh has geometry' );

		} );

		QUnit.test( 'parse v5 format - materials as object', ( assert ) => {

			const json = {
				metadata: { version: 5, type: 'Object', generator: 'Object3D.toJSON' },
				materials: {
					'mat-1': {
						uuid: 'mat-1',
						type: 'MeshStandardMaterial',
						color: 0xff00ff,
						roughness: 0.8,
						metalness: 0.2
					}
				},
				geometries: {
					'geom-1': {
						uuid: 'geom-1',
						type: 'BoxGeometry',
						width: 1, height: 1, depth: 1
					}
				},
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

			const material = scene.children[ 0 ].material;
			assert.ok( material.isMeshStandardMaterial, 'Material type correct' );
			assert.strictEqual( material.roughness, 0.8, 'Roughness preserved' );
			assert.strictEqual( material.metalness, 0.2, 'Metalness preserved' );

		} );

		QUnit.test( 'parse v5 format - shapes as object', ( assert ) => {

			const json = {
				metadata: { version: 5, type: 'Object', generator: 'Object3D.toJSON' },
				shapes: {
					'shape-1': {
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
								v2: [ 0, 1 ]
							},
							{
								type: 'LineCurve',
								arcLengthDivisions: 200,
								v1: [ 0, 1 ],
								v2: [ 0, 0 ]
							}
						]
					}
				},
				geometries: {
					'geom-1': {
						uuid: 'geom-1',
						type: 'ShapeGeometry',
						shapes: [ 'shape-1' ]
					}
				},
				materials: {
					'mat-1': {
						uuid: 'mat-1',
						type: 'MeshBasicMaterial',
						color: 0xffffff
					}
				},
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

			assert.ok( scene.children[ 0 ].geometry.isBufferGeometry, 'ShapeGeometry parsed from v5 shapes object' );

		} );

		QUnit.test( 'parse v5 format - animations as object', ( assert ) => {

			const json = {
				metadata: { version: 5, type: 'Object', generator: 'Object3D.toJSON' },
				animations: {
					'clip-1': {
						uuid: 'clip-1',
						name: 'FadeIn',
						duration: 2,
						tracks: [
							{
								type: 'number',
								name: '.opacity',
								times: [ 0, 2 ],
								values: [ 0, 1 ]
							}
						]
					}
				},
				geometries: {
					'geom-1': {
						uuid: 'geom-1',
						type: 'BoxGeometry',
						width: 1, height: 1, depth: 1
					}
				},
				materials: {
					'mat-1': {
						uuid: 'mat-1',
						type: 'MeshBasicMaterial',
						color: 0xffffff
					}
				},
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

			assert.strictEqual( scene.animations.length, 1, 'Animation parsed from v5 object' );
			assert.strictEqual( scene.animations[ 0 ].name, 'FadeIn', 'Animation name preserved' );
			assert.strictEqual( scene.animations[ 0 ].duration, 2, 'Animation duration preserved' );

		} );

		// ROUND-TRIP TESTS (serialize then parse)

		QUnit.test( 'round-trip - simple scene', ( assert ) => {

			const scene = new Scene();
			const geometry = new BoxGeometry( 1, 1, 1 );
			const material = new MeshBasicMaterial( { color: 0xff0000 } );
			const mesh = new Mesh( geometry, material );
			mesh.position.set( 1, 2, 3 );
			mesh.updateMatrix(); // Important: update matrix before serialization
			scene.add( mesh );

			const json = scene.toJSON();
			const loader = new ObjectLoader();
			const loadedScene = loader.parse( json );

			assert.ok( loadedScene.isScene, 'Loaded scene is a Scene' );
			assert.strictEqual( loadedScene.children.length, 1, 'Scene has correct number of children' );
			assert.ok( loadedScene.children[ 0 ].isMesh, 'Child is a Mesh' );
			assert.strictEqual( loadedScene.children[ 0 ].position.x, 1, 'Position x preserved' );
			assert.strictEqual( loadedScene.children[ 0 ].position.y, 2, 'Position y preserved' );
			assert.strictEqual( loadedScene.children[ 0 ].position.z, 3, 'Position z preserved' );

		} );

		QUnit.test( 'round-trip - multiple meshes sharing geometry', ( assert ) => {

			const scene = new Scene();
			const geometry = new BoxGeometry( 1, 1, 1 );
			const material1 = new MeshBasicMaterial( { color: 0xff0000 } );
			const material2 = new MeshBasicMaterial( { color: 0x00ff00 } );

			const mesh1 = new Mesh( geometry, material1 );
			const mesh2 = new Mesh( geometry, material2 );

			scene.add( mesh1 );
			scene.add( mesh2 );

			const json = scene.toJSON();

			// Verify geometry deduplication in v5 format
			assert.strictEqual( Object.keys( json.geometries ).length, 1, 'Shared geometry stored once' );

			const loader = new ObjectLoader();
			const loadedScene = loader.parse( json );

			assert.strictEqual( loadedScene.children.length, 2, 'Both meshes loaded' );

			// In loaded scene, geometries are separate instances but have same data
			assert.ok( loadedScene.children[ 0 ].geometry.isBufferGeometry, 'First mesh has geometry' );
			assert.ok( loadedScene.children[ 1 ].geometry.isBufferGeometry, 'Second mesh has geometry' );

		} );

		QUnit.test( 'round-trip - multiple meshes sharing material', ( assert ) => {

			const scene = new Scene();
			const geometry1 = new BoxGeometry( 1, 1, 1 );
			const geometry2 = new SphereGeometry( 0.5 );
			const material = new MeshBasicMaterial( { color: 0xff0000 } );

			const mesh1 = new Mesh( geometry1, material );
			const mesh2 = new Mesh( geometry2, material );

			scene.add( mesh1 );
			scene.add( mesh2 );

			const json = scene.toJSON();

			// Verify material deduplication in v5 format
			assert.strictEqual( Object.keys( json.materials ).length, 1, 'Shared material stored once' );

			const loader = new ObjectLoader();
			const loadedScene = loader.parse( json );

			assert.strictEqual( loadedScene.children.length, 2, 'Both meshes loaded' );

		} );

		// BUFFERS TESTS (InterleavedBuffer)

		QUnit.test( 'parse v5 format - buffers with InterleavedBuffer', ( assert ) => {

			// Create interleaved data: position (3) + uv (2) = stride 5
			const interleavedArray = new Float32Array( [
				// vertex 0: pos + uv
				0, 0, 0, 0, 0,
				// vertex 1: pos + uv
				1, 0, 0, 1, 0,
				// vertex 2: pos + uv
				0, 1, 0, 0, 1
			] );

			const json = {
				metadata: { version: 5, type: 'Object', generator: 'Object3D.toJSON' },
				buffers: {
					'arraybuffer-1': {
						type: 'Float32Array',
						array: Array.from( new Uint32Array( interleavedArray.buffer ) )
					},
					'interleaved-1': {
						type: 'InterleavedBuffer',
						buffer: 'arraybuffer-1',
						arrayType: 'Float32Array',
						stride: 5
					}
				},
				geometries: {
					'geom-1': {
						type: 'BufferGeometry',
						data: {
							attributes: {
								position: {
									type: 'InterleavedBufferAttribute',
									itemSize: 3,
									data: 'interleaved-1',
									offset: 0,
									normalized: false
								},
								uv: {
									type: 'InterleavedBufferAttribute',
									itemSize: 2,
									data: 'interleaved-1',
									offset: 3,
									normalized: false
								}
							}
						}
					}
				},
				materials: {
					'mat-1': {
						type: 'MeshBasicMaterial',
						color: 0xffffff
					}
				},
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

			const geometry = scene.children[ 0 ].geometry;
			assert.ok( geometry.isBufferGeometry, 'Geometry parsed' );

			const position = geometry.getAttribute( 'position' );
			assert.ok( position.isInterleavedBufferAttribute, 'Position is InterleavedBufferAttribute' );
			assert.strictEqual( position.itemSize, 3, 'Position itemSize is 3' );

			const uv = geometry.getAttribute( 'uv' );
			assert.ok( uv.isInterleavedBufferAttribute, 'UV is InterleavedBufferAttribute' );
			assert.strictEqual( uv.itemSize, 2, 'UV itemSize is 2' );

			// Verify they share the same InterleavedBuffer
			assert.strictEqual( position.data, uv.data, 'Position and UV share same InterleavedBuffer' );

		} );

		QUnit.test( 'round-trip - InterleavedBufferAttribute', ( assert ) => {

			const scene = new Scene();

			// Create a geometry with interleaved attributes
			const geometry = new BufferGeometry();

			// Interleaved: position (3) + normal (3) = stride 6
			const interleavedData = new Float32Array( [
				// vertex 0
				0, 0, 0, 0, 0, 1,
				// vertex 1
				1, 0, 0, 0, 0, 1,
				// vertex 2
				0, 1, 0, 0, 0, 1
			] );

			const interleavedBuffer = new InterleavedBuffer( interleavedData, 6 );
			const positionAttr = new InterleavedBufferAttribute( interleavedBuffer, 3, 0 );
			const normalAttr = new InterleavedBufferAttribute( interleavedBuffer, 3, 3 );

			geometry.setAttribute( 'position', positionAttr );
			geometry.setAttribute( 'normal', normalAttr );

			const material = new MeshBasicMaterial( { color: 0xffffff } );
			const mesh = new Mesh( geometry, material );
			scene.add( mesh );

			const json = scene.toJSON();

			// Verify buffers structure exists
			assert.ok( json.buffers, 'Buffers object exists in JSON' );
			assert.ok( Object.keys( json.buffers ).length > 0, 'Buffers contains entries' );

			const loader = new ObjectLoader();
			const loadedScene = loader.parse( json );

			const loadedGeometry = loadedScene.children[ 0 ].geometry;
			const loadedPosition = loadedGeometry.getAttribute( 'position' );
			const loadedNormal = loadedGeometry.getAttribute( 'normal' );

			assert.ok( loadedPosition.isInterleavedBufferAttribute, 'Loaded position is InterleavedBufferAttribute' );
			assert.ok( loadedNormal.isInterleavedBufferAttribute, 'Loaded normal is InterleavedBufferAttribute' );
			assert.strictEqual( loadedPosition.data, loadedNormal.data, 'They share the same InterleavedBuffer' );

			// Verify data integrity
			assert.strictEqual( loadedPosition.getX( 1 ), 1, 'Position data preserved' );
			assert.strictEqual( loadedNormal.getZ( 0 ), 1, 'Normal data preserved' );

		} );

		QUnit.test( 'round-trip - InstancedBufferGeometry with InterleavedBufferAttribute', ( assert ) => {

			const scene = new Scene();

			// Create an instanced geometry with interleaved attributes
			const geometry = new InstancedBufferGeometry();

			// Interleaved: position (3) + uv (2) = stride 5
			const interleavedData = new Float32Array( [
				// vertex 0
				0, 0, 0, 0, 0,
				// vertex 1
				1, 0, 0, 1, 0,
				// vertex 2
				0, 1, 0, 0, 1
			] );

			const interleavedBuffer = new InterleavedBuffer( interleavedData, 5 );
			const positionAttr = new InterleavedBufferAttribute( interleavedBuffer, 3, 0 );
			const uvAttr = new InterleavedBufferAttribute( interleavedBuffer, 2, 3 );

			geometry.setAttribute( 'position', positionAttr );
			geometry.setAttribute( 'uv', uvAttr );
			geometry.instanceCount = 10;

			const material = new MeshBasicMaterial( { color: 0xffffff } );
			const mesh = new InstancedMesh( geometry, material, 10 );
			scene.add( mesh );

			const json = scene.toJSON();

			// Verify buffers structure exists
			assert.ok( json.buffers, 'Buffers object exists in JSON' );
			assert.ok( Object.keys( json.buffers ).length > 0, 'Buffers contains entries' );

			const loader = new ObjectLoader();
			const loadedScene = loader.parse( json );

			const loadedGeometry = loadedScene.children[ 0 ].geometry;
			const loadedPosition = loadedGeometry.getAttribute( 'position' );
			const loadedUv = loadedGeometry.getAttribute( 'uv' );

			assert.ok( loadedGeometry.isInstancedBufferGeometry, 'Loaded geometry is InstancedBufferGeometry' );
			assert.ok( loadedPosition.isInterleavedBufferAttribute, 'Loaded position is InterleavedBufferAttribute' );
			assert.ok( loadedUv.isInterleavedBufferAttribute, 'Loaded uv is InterleavedBufferAttribute' );
			assert.strictEqual( loadedPosition.data, loadedUv.data, 'They share the same InterleavedBuffer' );
			assert.strictEqual( loadedPosition.data.stride, 5, 'Stride is preserved' );

		} );

		QUnit.test( 'round-trip - InstancedBufferAttribute', ( assert ) => {

			const scene = new Scene();

			// Create a geometry with instanced buffer attributes
			const geometry = new InstancedBufferGeometry();

			// Base geometry (a simple triangle)
			const positions = new Float32BufferAttribute( [
				0, 0, 0,
				1, 0, 0,
				0, 1, 0
			], 3 );
			geometry.setAttribute( 'position', positions );

			// Instance offsets with meshPerAttribute = 1
			const offsets = new InstancedBufferAttribute(
				new Float32Array( [
					0, 0, 0,
					2, 0, 0,
					4, 0, 0,
					6, 0, 0
				] ),
				3,
				false,
				1
			);
			geometry.setAttribute( 'offset', offsets );

			// Instance colors with meshPerAttribute = 2 (each color used for 2 instances)
			const colors = new InstancedBufferAttribute(
				new Float32Array( [
					1, 0, 0,
					0, 1, 0
				] ),
				3,
				false,
				2
			);
			geometry.setAttribute( 'color', colors );

			geometry.instanceCount = 4;

			const material = new MeshBasicMaterial( { color: 0xffffff } );
			const mesh = new Mesh( geometry, material );
			scene.add( mesh );

			const json = scene.toJSON();

			const loader = new ObjectLoader();
			const loadedScene = loader.parse( json );

			const loadedGeometry = loadedScene.children[ 0 ].geometry;
			const loadedOffset = loadedGeometry.getAttribute( 'offset' );
			const loadedColor = loadedGeometry.getAttribute( 'color' );

			assert.ok( loadedGeometry.isInstancedBufferGeometry, 'Loaded geometry is InstancedBufferGeometry' );
			assert.ok( loadedOffset.isInstancedBufferAttribute, 'Loaded offset is InstancedBufferAttribute' );
			assert.ok( loadedColor.isInstancedBufferAttribute, 'Loaded color is InstancedBufferAttribute' );
			assert.strictEqual( loadedOffset.meshPerAttribute, 1, 'Offset meshPerAttribute preserved' );
			assert.strictEqual( loadedColor.meshPerAttribute, 2, 'Color meshPerAttribute preserved' );

			// Verify data integrity
			assert.strictEqual( loadedOffset.getX( 2 ), 4, 'Offset data preserved' );
			assert.strictEqual( loadedColor.getY( 1 ), 1, 'Color data preserved' );

		} );

		QUnit.test( 'round-trip - InstancedInterleavedBuffer', ( assert ) => {

			const scene = new Scene();

			// Create a geometry with instanced interleaved buffer
			const geometry = new InstancedBufferGeometry();

			// Base geometry (a simple triangle)
			const positions = new Float32BufferAttribute( [
				0, 0, 0,
				1, 0, 0,
				0, 1, 0
			], 3 );
			geometry.setAttribute( 'position', positions );

			// Instanced interleaved data: offset (3) + scale (1) = stride 4
			// meshPerAttribute = 1 means each value is for one instance
			const instanceData = new Float32Array( [
				// instance 0: offset + scale
				0, 0, 0, 1,
				// instance 1: offset + scale
				2, 0, 0, 0.5,
				// instance 2: offset + scale
				4, 0, 0, 1.5
			] );

			const instancedInterleavedBuffer = new InstancedInterleavedBuffer( instanceData, 4, 1 );
			const offsetAttr = new InterleavedBufferAttribute( instancedInterleavedBuffer, 3, 0 );
			const scaleAttr = new InterleavedBufferAttribute( instancedInterleavedBuffer, 1, 3 );

			geometry.setAttribute( 'instanceOffset', offsetAttr );
			geometry.setAttribute( 'instanceScale', scaleAttr );
			geometry.instanceCount = 3;

			const material = new MeshBasicMaterial( { color: 0xffffff } );
			const mesh = new Mesh( geometry, material );
			scene.add( mesh );

			const json = scene.toJSON();

			// Verify buffers structure exists
			assert.ok( json.buffers, 'Buffers object exists in JSON' );
			assert.ok( Object.keys( json.buffers ).length > 0, 'Buffers contains entries' );

			const loader = new ObjectLoader();
			const loadedScene = loader.parse( json );

			const loadedGeometry = loadedScene.children[ 0 ].geometry;
			const loadedOffset = loadedGeometry.getAttribute( 'instanceOffset' );
			const loadedScale = loadedGeometry.getAttribute( 'instanceScale' );

			assert.ok( loadedOffset.isInterleavedBufferAttribute, 'Loaded instanceOffset is InterleavedBufferAttribute' );
			assert.ok( loadedScale.isInterleavedBufferAttribute, 'Loaded instanceScale is InterleavedBufferAttribute' );
			assert.strictEqual( loadedOffset.data, loadedScale.data, 'They share the same InterleavedBuffer' );
			assert.ok( loadedOffset.data.isInstancedInterleavedBuffer, 'Buffer is InstancedInterleavedBuffer' );
			assert.strictEqual( loadedOffset.data.meshPerAttribute, 1, 'meshPerAttribute preserved' );
			assert.strictEqual( loadedOffset.data.stride, 4, 'Stride preserved' );

			// Verify data integrity
			assert.strictEqual( loadedOffset.getX( 1 ), 2, 'Offset data preserved' );
			assert.strictEqual( loadedScale.getX( 1 ), 0.5, 'Scale data preserved' );

		} );

		// VERSION CHECK TESTS

		QUnit.test( 'toJSON produces version 5', ( assert ) => {

			const scene = new Scene();
			const json = scene.toJSON();

			assert.strictEqual( json.metadata.version, 5, 'Version is 5' );

		} );

		QUnit.test( 'toJSON produces object-keyed collections', ( assert ) => {

			const scene = new Scene();
			const geometry = new BoxGeometry( 1, 1, 1 );
			const material = new MeshBasicMaterial( { color: 0xff0000 } );
			const mesh = new Mesh( geometry, material );
			scene.add( mesh );

			const json = scene.toJSON();

			assert.ok( ! Array.isArray( json.geometries ), 'Geometries is not an array' );
			assert.ok( ! Array.isArray( json.materials ), 'Materials is not an array' );
			assert.strictEqual( typeof json.geometries, 'object', 'Geometries is an object' );
			assert.strictEqual( typeof json.materials, 'object', 'Materials is an object' );

		} );

	} );

} );
