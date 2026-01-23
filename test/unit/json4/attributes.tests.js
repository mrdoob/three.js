import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'JSON4 Format', () => {

	QUnit.module( 'Attributes', () => {

		QUnit.test( 'Float32BufferAttribute', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
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

			const attr = mesh.geometry.attributes.position;
			assert.ok( attr.array instanceof Float32Array, 'Array is Float32Array' );
			assert.strictEqual( attr.itemSize, 3, 'ItemSize is 3' );
			assert.strictEqual( attr.count, 3, 'Count is 3' );

		} );

		QUnit.test( 'Int8BufferAttribute', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BufferGeometry',
					data: {
						attributes: {
							position: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
								normalized: false
							},
							custom: {
								itemSize: 1,
								type: 'Int8Array',
								array: [ - 128, 0, 127 ],
								normalized: false
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

			const attr = mesh.geometry.attributes.custom;
			assert.ok( attr.array instanceof Int8Array, 'Array is Int8Array' );
			assert.strictEqual( attr.array[ 0 ], - 128, 'First value is -128' );
			assert.strictEqual( attr.array[ 2 ], 127, 'Last value is 127' );

		} );

		QUnit.test( 'Int16BufferAttribute', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BufferGeometry',
					data: {
						attributes: {
							position: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
								normalized: false
							},
							custom: {
								itemSize: 1,
								type: 'Int16Array',
								array: [ - 32768, 0, 32767 ],
								normalized: false
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

			const attr = mesh.geometry.attributes.custom;
			assert.ok( attr.array instanceof Int16Array, 'Array is Int16Array' );
			assert.strictEqual( attr.array[ 0 ], - 32768, 'First value is -32768' );
			assert.strictEqual( attr.array[ 2 ], 32767, 'Last value is 32767' );

		} );

		QUnit.test( 'Int32BufferAttribute', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BufferGeometry',
					data: {
						attributes: {
							position: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
								normalized: false
							},
							custom: {
								itemSize: 1,
								type: 'Int32Array',
								array: [ - 2147483648, 0, 2147483647 ],
								normalized: false
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

			const attr = mesh.geometry.attributes.custom;
			assert.ok( attr.array instanceof Int32Array, 'Array is Int32Array' );
			assert.strictEqual( attr.array[ 0 ], - 2147483648, 'First value' );
			assert.strictEqual( attr.array[ 2 ], 2147483647, 'Last value' );

		} );

		QUnit.test( 'Uint8BufferAttribute', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BufferGeometry',
					data: {
						attributes: {
							position: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
								normalized: false
							},
							custom: {
								itemSize: 1,
								type: 'Uint8Array',
								array: [ 0, 128, 255 ],
								normalized: false
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

			const attr = mesh.geometry.attributes.custom;
			assert.ok( attr.array instanceof Uint8Array, 'Array is Uint8Array' );
			assert.strictEqual( attr.array[ 0 ], 0, 'First value is 0' );
			assert.strictEqual( attr.array[ 2 ], 255, 'Last value is 255' );

		} );

		QUnit.test( 'Uint16BufferAttribute', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BufferGeometry',
					data: {
						attributes: {
							position: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
								normalized: false
							},
							custom: {
								itemSize: 1,
								type: 'Uint16Array',
								array: [ 0, 32768, 65535 ],
								normalized: false
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

			const attr = mesh.geometry.attributes.custom;
			assert.ok( attr.array instanceof Uint16Array, 'Array is Uint16Array' );
			assert.strictEqual( attr.array[ 0 ], 0, 'First value is 0' );
			assert.strictEqual( attr.array[ 2 ], 65535, 'Last value is 65535' );

		} );

		QUnit.test( 'Uint32BufferAttribute', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BufferGeometry',
					data: {
						attributes: {
							position: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
								normalized: false
							},
							custom: {
								itemSize: 1,
								type: 'Uint32Array',
								array: [ 0, 2147483648, 4294967295 ],
								normalized: false
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

			const attr = mesh.geometry.attributes.custom;
			assert.ok( attr.array instanceof Uint32Array, 'Array is Uint32Array' );
			assert.strictEqual( attr.array[ 0 ], 0, 'First value is 0' );
			assert.strictEqual( attr.array[ 2 ], 4294967295, 'Last value is 4294967295' );

		} );

		QUnit.test( 'Normalized attribute', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BufferGeometry',
					data: {
						attributes: {
							position: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
								normalized: false
							},
							color: {
								itemSize: 3,
								type: 'Uint8Array',
								array: [ 255, 0, 0, 0, 255, 0, 0, 0, 255 ],
								normalized: true
							}
						}
					}
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680,
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

			const attr = mesh.geometry.attributes.color;
			assert.ok( attr.array instanceof Uint8Array, 'Array is Uint8Array' );
			assert.strictEqual( attr.normalized, true, 'Attribute is normalized' );

		} );

		QUnit.test( 'InterleavedBuffer + InterleavedBufferAttribute', ( assert ) => {

			// Create Float32Array data and convert to Uint32 representation for arrayBuffers
			const floatData = new Float32Array( [
				0, 0, 0, 0, 0,
				1, 0, 0, 1, 0,
				0, 1, 0, 0.5, 1
			] );
			const arrayBufferData = Array.from( new Uint32Array( floatData.buffer ) );

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BufferGeometry',
					data: {
						arrayBuffers: {
							'arraybuffer-1': arrayBufferData
						},
						interleavedBuffers: {
							'buffer-1': {
								uuid: 'buffer-1',
								buffer: 'arraybuffer-1',
								type: 'Float32Array',
								stride: 5
							}
						},
						attributes: {
							position: {
								isInterleavedBufferAttribute: true,
								itemSize: 3,
								data: 'buffer-1',
								offset: 0,
								normalized: false
							},
							uv: {
								isInterleavedBufferAttribute: true,
								itemSize: 2,
								data: 'buffer-1',
								offset: 3,
								normalized: false
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

			const posAttr = mesh.geometry.attributes.position;
			const uvAttr = mesh.geometry.attributes.uv;

			assert.ok( posAttr.isInterleavedBufferAttribute, 'Position is InterleavedBufferAttribute' );
			assert.ok( uvAttr.isInterleavedBufferAttribute, 'UV is InterleavedBufferAttribute' );
			assert.strictEqual( posAttr.data, uvAttr.data, 'Share same InterleavedBuffer' );
			assert.strictEqual( posAttr.itemSize, 3, 'Position itemSize is 3' );
			assert.strictEqual( uvAttr.itemSize, 2, 'UV itemSize is 2' );
			assert.strictEqual( posAttr.offset, 0, 'Position offset is 0' );
			assert.strictEqual( uvAttr.offset, 3, 'UV offset is 3' );

		} );

		QUnit.test( 'Multiple attributes sharing InterleavedBuffer', ( assert ) => {

			// Create Float32Array data and convert to Uint32 representation for arrayBuffers
			const floatData = new Float32Array( [
				0, 0, 0, 0, 0, 1, 0, 0,
				1, 0, 0, 1, 0, 0, 0, 1,
				0, 1, 0, 0.5, 1, 0, 0, 1
			] );
			const arrayBufferData = Array.from( new Uint32Array( floatData.buffer ) );

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BufferGeometry',
					data: {
						arrayBuffers: {
							'arraybuffer-1': arrayBufferData
						},
						interleavedBuffers: {
							'buffer-1': {
								uuid: 'buffer-1',
								buffer: 'arraybuffer-1',
								type: 'Float32Array',
								stride: 8
							}
						},
						attributes: {
							position: {
								isInterleavedBufferAttribute: true,
								itemSize: 3,
								data: 'buffer-1',
								offset: 0,
								normalized: false
							},
							uv: {
								isInterleavedBufferAttribute: true,
								itemSize: 2,
								data: 'buffer-1',
								offset: 3,
								normalized: false
							},
							normal: {
								isInterleavedBufferAttribute: true,
								itemSize: 3,
								data: 'buffer-1',
								offset: 5,
								normalized: false
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

			const posAttr = mesh.geometry.attributes.position;
			const uvAttr = mesh.geometry.attributes.uv;
			const normalAttr = mesh.geometry.attributes.normal;

			assert.strictEqual( posAttr.data, uvAttr.data, 'Position and UV share same buffer' );
			assert.strictEqual( uvAttr.data, normalAttr.data, 'UV and Normal share same buffer' );
			assert.strictEqual( posAttr.data.stride, 8, 'Buffer stride is 8' );

		} );

		QUnit.test( 'InstancedBufferAttribute with meshPerAttribute', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'InstancedBufferGeometry',
					data: {
						attributes: {
							position: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
								normalized: false
							},
							instanceOffset: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 0, 2, 0, 0, 4, 0, 0 ],
								normalized: false,
								isInstancedBufferAttribute: true,
								meshPerAttribute: 1
							}
						}
					},
					instanceCount: 3
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

			const attr = mesh.geometry.attributes.instanceOffset;
			assert.ok( attr.isInstancedBufferAttribute, 'Is InstancedBufferAttribute' );
			assert.strictEqual( attr.meshPerAttribute, 1, 'meshPerAttribute is 1' );

		} );

	} );

} );
