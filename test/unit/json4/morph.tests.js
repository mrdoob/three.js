import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'JSON4 Format', () => {

	QUnit.module( 'Morph Targets', () => {

		QUnit.test( 'morphAttributes on geometry', ( assert ) => {

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
						morphAttributes: {
							position: [
								{
									itemSize: 3,
									type: 'Float32Array',
									array: [ 0, 0, 0, 2, 0, 0, 0, 2, 0 ],
									normalized: false
								}
							]
						}
					}
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680,
					morphTargets: true
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

			assert.ok( mesh.geometry.morphAttributes.position, 'Has morphAttributes.position' );
			assert.strictEqual( mesh.geometry.morphAttributes.position.length, 1, 'Has 1 morph target' );
			assert.strictEqual( mesh.geometry.morphAttributes.position[ 0 ].count, 3, 'Morph target has 3 vertices' );

		} );

		QUnit.test( 'morphTargetsRelative flag', ( assert ) => {

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
						morphAttributes: {
							position: [
								{
									itemSize: 3,
									type: 'Float32Array',
									array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
									normalized: false
								}
							]
						},
						morphTargetsRelative: true
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

			assert.strictEqual( mesh.geometry.morphTargetsRelative, true, 'morphTargetsRelative is true' );

		} );

		QUnit.test( 'Multiple morph targets per attribute', ( assert ) => {

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
						morphAttributes: {
							position: [
								{
									name: 'smile',
									itemSize: 3,
									type: 'Float32Array',
									array: [ 0, 0, 0, 1.5, 0, 0, 0, 1.5, 0 ],
									normalized: false
								},
								{
									name: 'frown',
									itemSize: 3,
									type: 'Float32Array',
									array: [ 0, 0, 0, 0.5, 0, 0, 0, 0.5, 0 ],
									normalized: false
								},
								{
									name: 'blink',
									itemSize: 3,
									type: 'Float32Array',
									array: [ 0, - 0.1, 0, 1, - 0.1, 0, 0, 0.9, 0 ],
									normalized: false
								}
							]
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

			assert.strictEqual( mesh.geometry.morphAttributes.position.length, 3, 'Has 3 morph targets' );
			assert.strictEqual( mesh.geometry.morphAttributes.position[ 0 ].name, 'smile', 'First target name' );
			assert.strictEqual( mesh.geometry.morphAttributes.position[ 1 ].name, 'frown', 'Second target name' );
			assert.strictEqual( mesh.geometry.morphAttributes.position[ 2 ].name, 'blink', 'Third target name' );

		} );

		QUnit.test( 'Morph targets for normal attribute', ( assert ) => {

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
							}
						},
						morphAttributes: {
							position: [
								{
									itemSize: 3,
									type: 'Float32Array',
									array: [ 0, 0, 0.5, 1, 0, 0.5, 0, 1, 0.5 ],
									normalized: false
								}
							],
							normal: [
								{
									itemSize: 3,
									type: 'Float32Array',
									array: [ 0.5, 0, 0.866, 0.5, 0, 0.866, 0.5, 0, 0.866 ],
									normalized: false
								}
							]
						}
					}
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshStandardMaterial',
					color: 16711680,
					morphTargets: true,
					morphNormals: true
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

			assert.ok( mesh.geometry.morphAttributes.position, 'Has morphAttributes.position' );
			assert.ok( mesh.geometry.morphAttributes.normal, 'Has morphAttributes.normal' );
			assert.strictEqual( mesh.geometry.morphAttributes.normal.length, 1, 'Has 1 normal morph target' );

		} );

		QUnit.test( 'Morph targets for color attribute', ( assert ) => {

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
								type: 'Float32Array',
								array: [ 1, 0, 0, 1, 0, 0, 1, 0, 0 ],
								normalized: false
							}
						},
						morphAttributes: {
							position: [
								{
									itemSize: 3,
									type: 'Float32Array',
									array: [ 0, 0, 0, 2, 0, 0, 0, 2, 0 ],
									normalized: false
								}
							],
							color: [
								{
									itemSize: 3,
									type: 'Float32Array',
									array: [ 0, 1, 0, 0, 1, 0, 0, 1, 0 ],
									normalized: false
								}
							]
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

			assert.ok( mesh.geometry.morphAttributes.color, 'Has morphAttributes.color' );
			assert.strictEqual( mesh.geometry.morphAttributes.color.length, 1, 'Has 1 color morph target' );

		} );

	} );

} );
