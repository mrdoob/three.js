import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'JSON4 Format', () => {

	QUnit.module( 'Instancing', () => {

		QUnit.test( 'InstancedMesh - count, instanceMatrix', ( assert ) => {

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
				object: {
					uuid: 'instanced-1',
					type: 'InstancedMesh',
					geometry: 'geom-1',
					material: 'mat-1',
					count: 3,
					instanceMatrix: {
						type: 'Float32Array',
						array: [
							1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
							1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1,
							1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 0, 0, 1
						]
					},
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			assert.ok( mesh.isInstancedMesh, 'Is InstancedMesh' );
			assert.strictEqual( mesh.count, 3, 'Count is 3' );
			assert.ok( mesh.instanceMatrix, 'Has instanceMatrix' );
			assert.strictEqual( mesh.instanceMatrix.count, 3, 'instanceMatrix count is 3' );

		} );

		QUnit.test( 'InstancedMesh - instanceColor', ( assert ) => {

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
					color: 16777215
				} ],
				object: {
					uuid: 'instanced-1',
					type: 'InstancedMesh',
					geometry: 'geom-1',
					material: 'mat-1',
					count: 3,
					instanceMatrix: {
						type: 'Float32Array',
						array: [
							1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
							1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1,
							1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 0, 0, 1
						]
					},
					instanceColor: {
						itemSize: 3,
						type: 'Float32Array',
						array: [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]
					},
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			assert.ok( mesh.instanceColor, 'Has instanceColor' );
			assert.strictEqual( mesh.instanceColor.count, 3, 'instanceColor count is 3' );
			assert.strictEqual( mesh.instanceColor.itemSize, 3, 'instanceColor itemSize is 3' );

		} );

		QUnit.test( 'InstancedBufferGeometry', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'InstancedBufferGeometry',
					isInstancedBufferGeometry: true,
					data: {
						attributes: {
							position: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 0, 1, 0, 0, 0.5, 1, 0 ],
								normalized: false
							},
							instanceOffset: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 0, 2, 0, 0, 4, 0, 0, 0, 2, 0 ],
								normalized: false,
								isInstancedBufferAttribute: true,
								meshPerAttribute: 1
							}
						}
					}
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680
				} ],
				object: {
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			assert.ok( mesh.geometry.isInstancedBufferGeometry, 'Is InstancedBufferGeometry' );

		} );

		QUnit.test( 'InstancedBufferAttribute', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'InstancedBufferGeometry',
					isInstancedBufferGeometry: true,
					data: {
						attributes: {
							position: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 0, 1, 0, 0, 0.5, 1, 0 ],
								normalized: false
							},
							instanceColor: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ],
								normalized: false,
								isInstancedBufferAttribute: true,
								meshPerAttribute: 1
							}
						}
					}
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16777215,
					vertexColors: true
				} ],
				object: {
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			const attr = mesh.geometry.attributes.instanceColor;
			assert.ok( attr.isInstancedBufferAttribute, 'Is InstancedBufferAttribute' );
			assert.strictEqual( attr.meshPerAttribute, 1, 'meshPerAttribute is 1' );

		} );

		QUnit.test( 'InstancedInterleavedBuffer', ( assert ) => {

			// Create Float32Array data and convert to Uint32 representation for arrayBuffers
			const floatData = new Float32Array( [
				0, 0, 0, 1, 0, 0,
				2, 0, 0, 0, 1, 0,
				4, 0, 0, 0, 0, 1
			] );
			const arrayBufferData = Array.from( new Uint32Array( floatData.buffer ) );

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'InstancedBufferGeometry',
					isInstancedBufferGeometry: true,
					data: {
						attributes: {
							position: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 0, 1, 0, 0, 0.5, 1, 0 ],
								normalized: false
							},
							instanceOffset: {
								isInterleavedBufferAttribute: true,
								itemSize: 3,
								data: 'buffer-1',
								offset: 0,
								normalized: false
							},
							instanceColor: {
								isInterleavedBufferAttribute: true,
								itemSize: 3,
								data: 'buffer-1',
								offset: 3,
								normalized: false
							}
						},
						arrayBuffers: {
							'arraybuffer-1': arrayBufferData
						},
						interleavedBuffers: {
							'buffer-1': {
								uuid: 'buffer-1',
								buffer: 'arraybuffer-1',
								type: 'Float32Array',
								stride: 6,
								isInstancedInterleavedBuffer: true,
								meshPerAttribute: 1
							}
						}
					}
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680
				} ],
				object: {
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			assert.ok( mesh.geometry.isInstancedBufferGeometry, 'Is InstancedBufferGeometry' );

		} );

		QUnit.test( 'InstancedMesh matrix verification', ( assert ) => {

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
				object: {
					uuid: 'instanced-1',
					type: 'InstancedMesh',
					geometry: 'geom-1',
					material: 'mat-1',
					count: 2,
					instanceMatrix: {
						type: 'Float32Array',
						array: [
							2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 2, 3, 1,
							0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0.5, 0, 10, 20, 30, 1
						]
					},
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			const matrix = mesh.instanceMatrix.array;

			// First instance: scale 2, translate (1, 2, 3)
			assert.strictEqual( matrix[ 0 ], 2, 'First instance scale x' );
			assert.strictEqual( matrix[ 12 ], 1, 'First instance translate x' );
			assert.strictEqual( matrix[ 13 ], 2, 'First instance translate y' );
			assert.strictEqual( matrix[ 14 ], 3, 'First instance translate z' );

			// Second instance: scale 0.5, translate (10, 20, 30)
			assert.strictEqual( matrix[ 16 ], 0.5, 'Second instance scale x' );
			assert.strictEqual( matrix[ 28 ], 10, 'Second instance translate x' );
			assert.strictEqual( matrix[ 29 ], 20, 'Second instance translate y' );
			assert.strictEqual( matrix[ 30 ], 30, 'Second instance translate z' );

		} );

	} );

} );
