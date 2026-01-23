import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'JSON4 Format', () => {

	QUnit.module( 'Objects', () => {

		QUnit.test( 'Mesh with geometry + material', ( assert ) => {

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

			assert.ok( mesh.isMesh, 'Is Mesh' );
			assert.ok( mesh.geometry.isBufferGeometry, 'Has geometry' );
			assert.ok( mesh.material.isMaterial, 'Has material' );

		} );

		QUnit.test( 'Mesh with material array (multi-material)', ( assert ) => {

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
								array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0 ],
								normalized: false
							}
						},
						groups: [
							{ start: 0, count: 3, materialIndex: 0 },
							{ start: 3, count: 3, materialIndex: 1 }
						]
					}
				} ],
				materials: [
					{ uuid: 'mat-1', type: 'MeshBasicMaterial', color: 16711680 },
					{ uuid: 'mat-2', type: 'MeshBasicMaterial', color: 65280 }
				],
				object: {
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: [ 'mat-1', 'mat-2' ],
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			assert.ok( Array.isArray( mesh.material ), 'Material is array' );
			assert.strictEqual( mesh.material.length, 2, 'Has 2 materials' );
			assert.strictEqual( mesh.material[ 0 ].color.getHex(), 0xff0000, 'First material is red' );
			assert.strictEqual( mesh.material[ 1 ].color.getHex(), 0x00ff00, 'Second material is green' );

		} );

		QUnit.test( 'Group container', ( assert ) => {

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
					uuid: 'group-1',
					type: 'Group',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					children: [
						{
							uuid: 'mesh-1',
							type: 'Mesh',
							geometry: 'geom-1',
							material: 'mat-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const group = loader.parse( json );

			assert.ok( group.isGroup, 'Is Group' );
			assert.strictEqual( group.children.length, 1, 'Has 1 child' );
			assert.ok( group.children[ 0 ].isMesh, 'Child is Mesh' );

		} );

		QUnit.test( 'Object3D transforms (position, rotation, scale via matrix)', ( assert ) => {

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
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 5, 10, 15, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			assert.strictEqual( mesh.position.x, 5, 'Position.x is 5' );
			assert.strictEqual( mesh.position.y, 10, 'Position.y is 10' );
			assert.strictEqual( mesh.position.z, 15, 'Position.z is 15' );
			assert.strictEqual( mesh.scale.x, 2, 'Scale.x is 2' );
			assert.strictEqual( mesh.scale.y, 2, 'Scale.y is 2' );
			assert.strictEqual( mesh.scale.z, 2, 'Scale.z is 2' );

		} );

		QUnit.test( 'Visibility, frustumCulled, renderOrder, layers', ( assert ) => {

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
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					visible: false,
					frustumCulled: false,
					renderOrder: 5,
					layers: 3
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			assert.strictEqual( mesh.visible, false, 'Visible is false' );
			assert.strictEqual( mesh.frustumCulled, false, 'FrustumCulled is false' );
			assert.strictEqual( mesh.renderOrder, 5, 'RenderOrder is 5' );
			assert.strictEqual( mesh.layers.mask, 3, 'Layers mask is 3' );

		} );

		QUnit.test( 'castShadow, receiveShadow', ( assert ) => {

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
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					castShadow: true,
					receiveShadow: true
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			assert.strictEqual( mesh.castShadow, true, 'CastShadow is true' );
			assert.strictEqual( mesh.receiveShadow, true, 'ReceiveShadow is true' );

		} );

		QUnit.test( 'userData preservation', ( assert ) => {

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
					uuid: 'mesh-1',
					type: 'Mesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					userData: {
						customString: 'hello',
						customNumber: 42,
						customArray: [ 1, 2, 3 ],
						customObject: { nested: true }
					}
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			assert.strictEqual( mesh.userData.customString, 'hello', 'userData string' );
			assert.strictEqual( mesh.userData.customNumber, 42, 'userData number' );
			assert.deepEqual( mesh.userData.customArray, [ 1, 2, 3 ], 'userData array' );
			assert.deepEqual( mesh.userData.customObject, { nested: true }, 'userData object' );

		} );

		QUnit.test( 'Points with PointsMaterial', ( assert ) => {

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
								array: [ 0, 0, 0, 1, 1, 1, 2, 2, 2 ],
								normalized: false
							}
						}
					}
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'PointsMaterial',
					color: 16711680,
					size: 5
				} ],
				object: {
					uuid: 'points-1',
					type: 'Points',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const points = loader.parse( json );

			assert.ok( points.isPoints, 'Is Points' );
			assert.ok( points.material.isPointsMaterial, 'Has PointsMaterial' );

		} );

		QUnit.test( 'Line', ( assert ) => {

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
								array: [ 0, 0, 0, 1, 1, 0, 2, 0, 0 ],
								normalized: false
							}
						}
					}
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'LineBasicMaterial',
					color: 65280
				} ],
				object: {
					uuid: 'line-1',
					type: 'Line',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const line = loader.parse( json );

			assert.ok( line.isLine, 'Is Line' );
			assert.ok( line.material.isLineBasicMaterial, 'Has LineBasicMaterial' );

		} );

		QUnit.test( 'LineSegments', ( assert ) => {

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
								array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0 ],
								normalized: false
							}
						}
					}
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'LineBasicMaterial',
					color: 65280
				} ],
				object: {
					uuid: 'lines-1',
					type: 'LineSegments',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const lines = loader.parse( json );

			assert.ok( lines.isLineSegments, 'Is LineSegments' );

		} );

		QUnit.test( 'LineLoop', ( assert ) => {

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
								array: [ 0, 0, 0, 1, 0, 0, 0.5, 1, 0 ],
								normalized: false
							}
						}
					}
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'LineBasicMaterial',
					color: 65280
				} ],
				object: {
					uuid: 'loop-1',
					type: 'LineLoop',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const loop = loader.parse( json );

			assert.ok( loop.isLineLoop, 'Is LineLoop' );

		} );

		QUnit.test( 'Sprite', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				materials: [ {
					uuid: 'mat-1',
					type: 'SpriteMaterial',
					color: 16711680
				} ],
				object: {
					uuid: 'sprite-1',
					type: 'Sprite',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const sprite = loader.parse( json );

			assert.ok( sprite.isSprite, 'Is Sprite' );
			assert.ok( sprite.material.isSpriteMaterial, 'Has SpriteMaterial' );

		} );

		QUnit.test( 'Object name', ( assert ) => {

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
					uuid: 'mesh-1',
					type: 'Mesh',
					name: 'MyMesh',
					geometry: 'geom-1',
					material: 'mat-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const mesh = loader.parse( json );

			assert.strictEqual( mesh.name, 'MyMesh', 'Object name' );

		} );

	} );

} );
