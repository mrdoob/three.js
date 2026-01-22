/**
 * Tests for BufferGeometryLoader JSON format compatibility
 */

import { BufferGeometryLoader } from '../../../../src/loaders/BufferGeometryLoader.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer.js';
import { InterleavedBufferAttribute } from '../../../../src/core/InterleavedBufferAttribute.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'BufferGeometryLoader JSON Format', () => {

		// BASIC BUFFER GEOMETRY TESTS

		QUnit.test( 'parse - basic BufferGeometry with position attribute', ( assert ) => {

			const json = {
				uuid: 'test-geom-1',
				type: 'BufferGeometry',
				data: {
					attributes: {
						position: {
							itemSize: 3,
							type: 'Float32Array',
							array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
							normalized: false
						}
					}
				}
			};

			const loader = new BufferGeometryLoader();
			const geometry = loader.parse( json );

			assert.ok( geometry.isBufferGeometry, 'Parsed geometry is BufferGeometry' );
			assert.ok( geometry.uuid, 'Geometry has a UUID' );

			const position = geometry.getAttribute( 'position' );
			assert.ok( position.isBufferAttribute, 'Position attribute exists' );
			assert.strictEqual( position.count, 3, 'Position has 3 vertices' );
			assert.strictEqual( position.itemSize, 3, 'Position itemSize is 3' );

		} );

		QUnit.test( 'parse - BufferGeometry with index', ( assert ) => {

			const json = {
				uuid: 'test-geom-2',
				type: 'BufferGeometry',
				data: {
					attributes: {
						position: {
							itemSize: 3,
							type: 'Float32Array',
							array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0 ],
							normalized: false
						}
					},
					index: {
						type: 'Uint16Array',
						array: [ 0, 1, 2, 1, 3, 2 ]
					}
				}
			};

			const loader = new BufferGeometryLoader();
			const geometry = loader.parse( json );

			const index = geometry.getIndex();
			assert.ok( index, 'Index exists' );
			assert.strictEqual( index.count, 6, 'Index has 6 entries' );
			assert.strictEqual( index.array[ 0 ], 0, 'First index is 0' );
			assert.strictEqual( index.array[ 5 ], 2, 'Last index is 2' );

		} );

		QUnit.test( 'parse - BufferGeometry with groups', ( assert ) => {

			const json = {
				uuid: 'test-geom-3',
				type: 'BufferGeometry',
				data: {
					attributes: {
						position: {
							itemSize: 3,
							type: 'Float32Array',
							array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
							normalized: false
						}
					},
					groups: [
						{ start: 0, count: 3, materialIndex: 0 },
						{ start: 3, count: 3, materialIndex: 1 }
					]
				}
			};

			const loader = new BufferGeometryLoader();
			const geometry = loader.parse( json );

			assert.strictEqual( geometry.groups.length, 2, 'Two groups parsed' );
			assert.strictEqual( geometry.groups[ 0 ].materialIndex, 0, 'First group materialIndex is 0' );
			assert.strictEqual( geometry.groups[ 1 ].materialIndex, 1, 'Second group materialIndex is 1' );

		} );

		QUnit.test( 'parse - BufferGeometry with boundingSphere', ( assert ) => {

			const json = {
				uuid: 'test-geom-4',
				type: 'BufferGeometry',
				data: {
					attributes: {
						position: {
							itemSize: 3,
							type: 'Float32Array',
							array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
							normalized: false
						}
					},
					boundingSphere: {
						center: [ 0.5, 0.5, 0 ],
						radius: 1
					}
				}
			};

			const loader = new BufferGeometryLoader();
			const geometry = loader.parse( json );

			assert.ok( geometry.boundingSphere, 'BoundingSphere exists' );
			assert.strictEqual( geometry.boundingSphere.center.x, 0.5, 'Center x is 0.5' );
			assert.strictEqual( geometry.boundingSphere.center.y, 0.5, 'Center y is 0.5' );
			assert.strictEqual( geometry.boundingSphere.radius, 1, 'Radius is 1' );

		} );

		// INTERLEAVED BUFFER TESTS

		QUnit.test( 'parse - InterleavedBufferAttribute', ( assert ) => {

			// Create interleaved data: position (3) + uv (2) = stride 5
			const interleavedArray = new Float32Array( [
				// vertex 0
				0, 0, 0, 0, 0,
				// vertex 1
				1, 0, 0, 1, 0,
				// vertex 2
				0, 1, 0, 0, 1
			] );

			const arrayBufferUuid = 'ab-1';
			const interleavedBufferUuid = 'ib-1';

			const json = {
				uuid: 'test-geom-interleaved',
				type: 'BufferGeometry',
				data: {
					interleavedBuffers: {
						[ interleavedBufferUuid ]: {
							buffer: arrayBufferUuid,
							type: 'Float32Array',
							stride: 5
						}
					},
					arrayBuffers: {
						[ arrayBufferUuid ]: Array.from( new Uint32Array( interleavedArray.buffer ) )
					},
					attributes: {
						position: {
							type: 'InterleavedBufferAttribute',
							itemSize: 3,
							data: interleavedBufferUuid,
							offset: 0,
							normalized: false
						},
						uv: {
							type: 'InterleavedBufferAttribute',
							itemSize: 2,
							data: interleavedBufferUuid,
							offset: 3,
							normalized: false
						}
					}
				}
			};

			const loader = new BufferGeometryLoader();
			const geometry = loader.parse( json );

			const position = geometry.getAttribute( 'position' );
			const uv = geometry.getAttribute( 'uv' );

			assert.ok( position.isInterleavedBufferAttribute, 'Position is InterleavedBufferAttribute' );
			assert.ok( uv.isInterleavedBufferAttribute, 'UV is InterleavedBufferAttribute' );
			assert.strictEqual( position.itemSize, 3, 'Position itemSize is 3' );
			assert.strictEqual( uv.itemSize, 2, 'UV itemSize is 2' );
			assert.strictEqual( position.offset, 0, 'Position offset is 0' );
			assert.strictEqual( uv.offset, 3, 'UV offset is 3' );

			// They should share the same InterleavedBuffer
			assert.strictEqual( position.data, uv.data, 'Position and UV share same InterleavedBuffer' );
			assert.strictEqual( position.data.stride, 5, 'Stride is 5' );

			// Verify data
			assert.strictEqual( position.getX( 0 ), 0, 'Position[0].x = 0' );
			assert.strictEqual( position.getX( 1 ), 1, 'Position[1].x = 1' );
			assert.strictEqual( uv.getX( 1 ), 1, 'UV[1].x = 1' );
			assert.strictEqual( uv.getY( 2 ), 1, 'UV[2].y = 1' );

		} );

		QUnit.test( 'parse - multiple geometries sharing InterleavedBuffer via external buffers', ( assert ) => {

			// Simulate scene-level buffers injected by ObjectLoader
			const interleavedArray = new Float32Array( [
				0, 0, 0, 1, 0, 0, 0, 1, 0
			] );

			const arrayBufferUuid = 'shared-ab';
			const interleavedBufferUuid = 'shared-ib';

			const externalBuffers = {
				interleaved: {
					[ interleavedBufferUuid ]: {
						buffer: arrayBufferUuid,
						type: 'Float32Array',
						stride: 3
					}
				},
				array: {
					[ arrayBufferUuid ]: Array.from( new Uint32Array( interleavedArray.buffer ) )
				}
			};

			const json1 = {
				uuid: 'geom-1',
				type: 'BufferGeometry',
				data: {
					interleavedBuffers: externalBuffers.interleaved,
					arrayBuffers: externalBuffers.array,
					attributes: {
						position: {
							type: 'InterleavedBufferAttribute',
							itemSize: 3,
							data: interleavedBufferUuid,
							offset: 0,
							normalized: false
						}
					}
				}
			};

			const json2 = {
				uuid: 'geom-2',
				type: 'BufferGeometry',
				data: {
					interleavedBuffers: externalBuffers.interleaved,
					arrayBuffers: externalBuffers.array,
					attributes: {
						position: {
							type: 'InterleavedBufferAttribute',
							itemSize: 3,
							data: interleavedBufferUuid,
							offset: 0,
							normalized: false
						}
					}
				}
			};

			const loader = new BufferGeometryLoader();
			const geometry1 = loader.parse( json1 );
			const geometry2 = loader.parse( json2 );

			const pos1 = geometry1.getAttribute( 'position' );
			const pos2 = geometry2.getAttribute( 'position' );

			assert.ok( pos1.isInterleavedBufferAttribute, 'Geometry 1 position is interleaved' );
			assert.ok( pos2.isInterleavedBufferAttribute, 'Geometry 2 position is interleaved' );

			// Note: They won't share the same InterleavedBuffer instance since
			// BufferGeometryLoader creates new instances for each parse call.
			// But the data should be the same.
			assert.strictEqual( pos1.getX( 1 ), pos2.getX( 1 ), 'Data values match' );

		} );

		// MORPH ATTRIBUTES TESTS

		QUnit.test( 'parse - morphAttributes', ( assert ) => {

			const json = {
				uuid: 'test-geom-morph',
				type: 'BufferGeometry',
				data: {
					attributes: {
						position: {
							itemSize: 3,
							type: 'Float32Array',
							array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
							normalized: false
						}
					},
					morphAttributes: {
						position: [
							{
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 1, 1, 0, 1, 0, 1, 1 ],
								normalized: false,
								name: 'morph1'
							}
						]
					},
					morphTargetsRelative: true
				}
			};

			const loader = new BufferGeometryLoader();
			const geometry = loader.parse( json );

			assert.ok( geometry.morphAttributes.position, 'Morph position exists' );
			assert.strictEqual( geometry.morphAttributes.position.length, 1, 'One morph target' );
			assert.strictEqual( geometry.morphAttributes.position[ 0 ].name, 'morph1', 'Morph name preserved' );
			assert.strictEqual( geometry.morphTargetsRelative, true, 'morphTargetsRelative is true' );

		} );

		// ROUND-TRIP TESTS

		QUnit.test( 'round-trip - basic BufferGeometry', ( assert ) => {

			const geometry = new BufferGeometry();
			const positions = new Float32Array( [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ] );
			const normals = new Float32Array( [ 0, 0, 1, 0, 0, 1, 0, 0, 1 ] );

			geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
			geometry.setAttribute( 'normal', new BufferAttribute( normals, 3 ) );
			geometry.setIndex( [ 0, 1, 2 ] );

			const json = geometry.toJSON();
			const loader = new BufferGeometryLoader();
			const loaded = loader.parse( json );

			const loadedPos = loaded.getAttribute( 'position' );
			const loadedNormal = loaded.getAttribute( 'normal' );

			assert.strictEqual( loadedPos.count, 3, 'Position count matches' );
			assert.strictEqual( loadedNormal.count, 3, 'Normal count matches' );
			assert.strictEqual( loaded.index.count, 3, 'Index count matches' );

			// Verify values
			assert.strictEqual( loadedPos.getX( 1 ), 1, 'Position data preserved' );
			assert.strictEqual( loadedNormal.getZ( 0 ), 1, 'Normal data preserved' );

		} );

		QUnit.test( 'round-trip - InterleavedBufferAttribute', ( assert ) => {

			const geometry = new BufferGeometry();

			// Create interleaved buffer: position (3) + color (3) = stride 6
			const interleavedData = new Float32Array( [
				// vertex 0: position + color
				0, 0, 0, 1, 0, 0,
				// vertex 1: position + color
				1, 0, 0, 0, 1, 0,
				// vertex 2: position + color
				0, 1, 0, 0, 0, 1
			] );

			const interleavedBuffer = new InterleavedBuffer( interleavedData, 6 );
			const positionAttr = new InterleavedBufferAttribute( interleavedBuffer, 3, 0 );
			const colorAttr = new InterleavedBufferAttribute( interleavedBuffer, 3, 3 );

			geometry.setAttribute( 'position', positionAttr );
			geometry.setAttribute( 'color', colorAttr );

			// Note: When calling geometry.toJSON() directly (not through scene.toJSON()),
			// the interleaved attributes get de-interleaved because no meta object is passed.
			// This test verifies that behavior.

			const json = geometry.toJSON();
			const loader = new BufferGeometryLoader();
			const loaded = loader.parse( json );

			const loadedPos = loaded.getAttribute( 'position' );
			const loadedColor = loaded.getAttribute( 'color' );

			// After de-interleaving, they should be regular BufferAttributes
			assert.ok( loadedPos.isBufferAttribute, 'Position is BufferAttribute' );
			assert.ok( loadedColor.isBufferAttribute, 'Color is BufferAttribute' );

			// Verify data integrity
			assert.strictEqual( loadedPos.getX( 1 ), 1, 'Position[1].x = 1' );
			assert.strictEqual( loadedColor.getX( 0 ), 1, 'Color[0].x = 1 (red)' );
			assert.strictEqual( loadedColor.getY( 1 ), 1, 'Color[1].y = 1 (green)' );
			assert.strictEqual( loadedColor.getZ( 2 ), 1, 'Color[2].z = 1 (blue)' );

		} );

		// ATTRIBUTE TYPES TESTS

		QUnit.test( 'parse - various attribute types', ( assert ) => {

			const json = {
				uuid: 'test-geom-types',
				type: 'BufferGeometry',
				data: {
					attributes: {
						position: {
							itemSize: 3,
							type: 'Float32Array',
							array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
							normalized: false
						},
						index8: {
							itemSize: 1,
							type: 'Uint8Array',
							array: [ 0, 1, 2 ],
							normalized: false
						},
						index16: {
							itemSize: 1,
							type: 'Uint16Array',
							array: [ 0, 1, 2 ],
							normalized: false
						},
						index32: {
							itemSize: 1,
							type: 'Uint32Array',
							array: [ 0, 1, 2 ],
							normalized: false
						},
						normalizedColor: {
							itemSize: 3,
							type: 'Uint8Array',
							array: [ 255, 0, 0, 0, 255, 0, 0, 0, 255 ],
							normalized: true
						}
					}
				}
			};

			const loader = new BufferGeometryLoader();
			const geometry = loader.parse( json );

			assert.ok( geometry.getAttribute( 'position' ).array instanceof Float32Array, 'Float32Array' );
			assert.ok( geometry.getAttribute( 'index8' ).array instanceof Uint8Array, 'Uint8Array' );
			assert.ok( geometry.getAttribute( 'index16' ).array instanceof Uint16Array, 'Uint16Array' );
			assert.ok( geometry.getAttribute( 'index32' ).array instanceof Uint32Array, 'Uint32Array' );

			const normalizedColor = geometry.getAttribute( 'normalizedColor' );
			assert.strictEqual( normalizedColor.normalized, true, 'Normalized flag preserved' );

		} );

		// NAME AND USAGE TESTS

		QUnit.test( 'parse - attribute name and usage', ( assert ) => {

			const json = {
				uuid: 'test-geom-usage',
				type: 'BufferGeometry',
				data: {
					attributes: {
						position: {
							itemSize: 3,
							type: 'Float32Array',
							array: [ 0, 0, 0 ],
							normalized: false,
							name: 'customPositionName',
							usage: 35048 // DynamicDrawUsage
						}
					}
				}
			};

			const loader = new BufferGeometryLoader();
			const geometry = loader.parse( json );

			const position = geometry.getAttribute( 'position' );
			assert.strictEqual( position.name, 'customPositionName', 'Attribute name preserved' );
			assert.strictEqual( position.usage, 35048, 'Attribute usage preserved' );

		} );

		// GEOMETRY METADATA TESTS

		QUnit.test( 'parse - geometry name and userData', ( assert ) => {

			const json = {
				uuid: 'test-geom-meta',
				type: 'BufferGeometry',
				name: 'MyCustomGeometry',
				userData: { custom: 'data', number: 42 },
				data: {
					attributes: {
						position: {
							itemSize: 3,
							type: 'Float32Array',
							array: [ 0, 0, 0 ],
							normalized: false
						}
					}
				}
			};

			const loader = new BufferGeometryLoader();
			const geometry = loader.parse( json );

			assert.strictEqual( geometry.name, 'MyCustomGeometry', 'Geometry name preserved' );
			assert.deepEqual( geometry.userData, { custom: 'data', number: 42 }, 'UserData preserved' );

		} );

	} );

} );
