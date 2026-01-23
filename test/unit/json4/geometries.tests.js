import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'JSON4 Format', () => {

	QUnit.module( 'Geometries', () => {

		QUnit.test( 'BufferGeometry with position attribute', ( assert ) => {

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
					uuid: 'scene-1',
					type: 'Scene',
					children: [ {
						uuid: 'mesh-1',
						type: 'Mesh',
						geometry: 'geom-1',
						material: 'mat-1',
						matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
						layers: 1
					} ]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.ok( scene.isScene, 'Parsed Scene' );
			const mesh = scene.children[ 0 ];
			assert.ok( mesh.isMesh, 'Child is Mesh' );
			assert.ok( mesh.geometry.isBufferGeometry, 'Has BufferGeometry' );
			assert.strictEqual(
				mesh.geometry.attributes.position.count,
				3,
				'Position has 3 vertices'
			);

		} );

		QUnit.test( 'BufferGeometry with position, normal, uv attributes', ( assert ) => {

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
							normal: {
								itemSize: 3,
								type: 'Float32Array',
								array: [ 0, 0, 1, 0, 0, 1, 0, 0, 1 ],
								normalized: false
							},
							uv: {
								itemSize: 2,
								type: 'Float32Array',
								array: [ 0, 0, 1, 0, 0.5, 1 ],
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

			assert.ok( mesh.isMesh, 'Parsed Mesh' );
			assert.ok( mesh.geometry.attributes.position, 'Has position attribute' );
			assert.ok( mesh.geometry.attributes.normal, 'Has normal attribute' );
			assert.ok( mesh.geometry.attributes.uv, 'Has uv attribute' );
			assert.strictEqual( mesh.geometry.attributes.position.itemSize, 3, 'Position itemSize is 3' );
			assert.strictEqual( mesh.geometry.attributes.normal.itemSize, 3, 'Normal itemSize is 3' );
			assert.strictEqual( mesh.geometry.attributes.uv.itemSize, 2, 'UV itemSize is 2' );

		} );

		QUnit.test( 'Indexed BufferGeometry', ( assert ) => {

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
								array: [ 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0 ],
								normalized: false
							}
						},
						index: {
							type: 'Uint16Array',
							array: [ 0, 1, 2, 0, 2, 3 ]
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

			assert.ok( mesh.isMesh, 'Parsed Mesh' );
			assert.ok( mesh.geometry.index, 'Has index buffer' );
			assert.strictEqual( mesh.geometry.index.count, 6, 'Index count is 6' );
			assert.strictEqual( mesh.geometry.attributes.position.count, 4, 'Position has 4 vertices' );

		} );

		QUnit.test( 'Geometry groups (materialIndex)', ( assert ) => {

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

			assert.ok( mesh.isMesh, 'Parsed Mesh' );
			assert.strictEqual( mesh.geometry.groups.length, 2, 'Has 2 groups' );
			assert.strictEqual( mesh.geometry.groups[ 0 ].materialIndex, 0, 'First group materialIndex is 0' );
			assert.strictEqual( mesh.geometry.groups[ 1 ].materialIndex, 1, 'Second group materialIndex is 1' );
			assert.ok( Array.isArray( mesh.material ), 'Material is an array' );
			assert.strictEqual( mesh.material.length, 2, 'Has 2 materials' );

		} );

		QUnit.test( 'BoundingSphere preservation', ( assert ) => {

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
						},
						boundingSphere: {
							center: [ 0.5, 0.5, 0 ],
							radius: 0.7071067811865476
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

			assert.ok( mesh.geometry.boundingSphere, 'Has boundingSphere' );
			assert.strictEqual( mesh.geometry.boundingSphere.center.x, 0.5, 'BoundingSphere center.x' );
			assert.strictEqual( mesh.geometry.boundingSphere.center.y, 0.5, 'BoundingSphere center.y' );
			assert.ok( Math.abs( mesh.geometry.boundingSphere.radius - 0.7071067811865476 ) < 0.0001, 'BoundingSphere radius' );

		} );

		QUnit.test( 'BoxGeometry via parameters', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BoxGeometry',
					width: 2,
					height: 3,
					depth: 4,
					widthSegments: 2,
					heightSegments: 3,
					depthSegments: 4
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

			assert.ok( mesh.isMesh, 'Parsed Mesh' );
			assert.strictEqual( mesh.geometry.type, 'BoxGeometry', 'Geometry type is BoxGeometry' );
			assert.strictEqual( mesh.geometry.parameters.width, 2, 'Width parameter' );
			assert.strictEqual( mesh.geometry.parameters.height, 3, 'Height parameter' );
			assert.strictEqual( mesh.geometry.parameters.depth, 4, 'Depth parameter' );

		} );

		QUnit.test( 'SphereGeometry via parameters', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'SphereGeometry',
					radius: 5,
					widthSegments: 32,
					heightSegments: 16,
					phiStart: 0,
					phiLength: Math.PI * 2,
					thetaStart: 0,
					thetaLength: Math.PI
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

			assert.ok( mesh.isMesh, 'Parsed Mesh' );
			assert.strictEqual( mesh.geometry.type, 'SphereGeometry', 'Geometry type is SphereGeometry' );
			assert.strictEqual( mesh.geometry.parameters.radius, 5, 'Radius parameter' );
			assert.strictEqual( mesh.geometry.parameters.widthSegments, 32, 'widthSegments parameter' );
			assert.strictEqual( mesh.geometry.parameters.heightSegments, 16, 'heightSegments parameter' );

		} );

		QUnit.test( 'PlaneGeometry via parameters', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'PlaneGeometry',
					width: 10,
					height: 20,
					widthSegments: 5,
					heightSegments: 10
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

			assert.ok( mesh.isMesh, 'Parsed Mesh' );
			assert.strictEqual( mesh.geometry.type, 'PlaneGeometry', 'Geometry type is PlaneGeometry' );
			assert.strictEqual( mesh.geometry.parameters.width, 10, 'Width parameter' );
			assert.strictEqual( mesh.geometry.parameters.height, 20, 'Height parameter' );

		} );

		QUnit.test( 'CylinderGeometry via parameters', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'CylinderGeometry',
					radiusTop: 1,
					radiusBottom: 2,
					height: 5,
					radialSegments: 16,
					heightSegments: 4,
					openEnded: false,
					thetaStart: 0,
					thetaLength: Math.PI * 2
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

			assert.ok( mesh.isMesh, 'Parsed Mesh' );
			assert.strictEqual( mesh.geometry.type, 'CylinderGeometry', 'Geometry type is CylinderGeometry' );
			assert.strictEqual( mesh.geometry.parameters.radiusTop, 1, 'radiusTop parameter' );
			assert.strictEqual( mesh.geometry.parameters.radiusBottom, 2, 'radiusBottom parameter' );
			assert.strictEqual( mesh.geometry.parameters.height, 5, 'height parameter' );

		} );

		QUnit.test( 'TorusGeometry via parameters', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'TorusGeometry',
					radius: 10,
					tube: 3,
					radialSegments: 16,
					tubularSegments: 100,
					arc: Math.PI * 2
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

			assert.ok( mesh.isMesh, 'Parsed Mesh' );
			assert.strictEqual( mesh.geometry.type, 'TorusGeometry', 'Geometry type is TorusGeometry' );
			assert.strictEqual( mesh.geometry.parameters.radius, 10, 'radius parameter' );
			assert.strictEqual( mesh.geometry.parameters.tube, 3, 'tube parameter' );

		} );

		QUnit.test( 'Geometry name and userData', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BufferGeometry',
					name: 'MyGeometry',
					userData: { customProp: 'customValue' },
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

			assert.strictEqual( mesh.geometry.name, 'MyGeometry', 'Geometry name' );
			assert.strictEqual( mesh.geometry.userData.customProp, 'customValue', 'Geometry userData' );

		} );

	} );

} );
