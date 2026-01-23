import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'JSON4 Format', () => {

	QUnit.module( 'Hierarchy', () => {

		QUnit.test( 'Parent-child relationships', ( assert ) => {

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
					uuid: 'scene-1',
					type: 'Scene',
					children: [
						{
							uuid: 'group-1',
							type: 'Group',
							name: 'Parent',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1,
							children: [
								{
									uuid: 'mesh-1',
									type: 'Mesh',
									name: 'Child',
									geometry: 'geom-1',
									material: 'mat-1',
									matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
									layers: 1
								}
							]
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			const parent = scene.children[ 0 ];
			const child = parent.children[ 0 ];

			assert.strictEqual( child.parent, parent, 'Child parent is correct' );
			assert.strictEqual( parent.children.length, 1, 'Parent has 1 child' );
			assert.strictEqual( child.name, 'Child', 'Child name' );

		} );

		QUnit.test( 'Nested hierarchy (3+ levels)', ( assert ) => {

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
					uuid: 'scene-1',
					type: 'Scene',
					children: [
						{
							uuid: 'level1',
							type: 'Group',
							name: 'Level1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1,
							children: [
								{
									uuid: 'level2',
									type: 'Group',
									name: 'Level2',
									matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1 ],
									layers: 1,
									children: [
										{
											uuid: 'level3',
											type: 'Group',
											name: 'Level3',
											matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1 ],
											layers: 1,
											children: [
												{
													uuid: 'mesh-1',
													type: 'Mesh',
													name: 'DeepMesh',
													geometry: 'geom-1',
													material: 'mat-1',
													matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1 ],
													layers: 1
												}
											]
										}
									]
								}
							]
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			const level1 = scene.children[ 0 ];
			const level2 = level1.children[ 0 ];
			const level3 = level2.children[ 0 ];
			const mesh = level3.children[ 0 ];

			assert.strictEqual( level1.name, 'Level1', 'Level 1 name' );
			assert.strictEqual( level2.name, 'Level2', 'Level 2 name' );
			assert.strictEqual( level3.name, 'Level3', 'Level 3 name' );
			assert.strictEqual( mesh.name, 'DeepMesh', 'Deep mesh name' );
			assert.strictEqual( mesh.parent.parent.parent.parent, scene, 'Deep parent chain' );

		} );

		QUnit.test( 'Multiple meshes sharing same geometry UUID', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'shared-geom',
					type: 'BoxGeometry',
					width: 1,
					height: 1,
					depth: 1
				} ],
				materials: [
					{ uuid: 'mat-1', type: 'MeshBasicMaterial', color: 16711680 },
					{ uuid: 'mat-2', type: 'MeshBasicMaterial', color: 65280 }
				],
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					children: [
						{
							uuid: 'mesh-1',
							type: 'Mesh',
							geometry: 'shared-geom',
							material: 'mat-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1
						},
						{
							uuid: 'mesh-2',
							type: 'Mesh',
							geometry: 'shared-geom',
							material: 'mat-2',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1 ],
							layers: 1
						},
						{
							uuid: 'mesh-3',
							type: 'Mesh',
							geometry: 'shared-geom',
							material: 'mat-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 0, 0, 1 ],
							layers: 1
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			const mesh1 = scene.children[ 0 ];
			const mesh2 = scene.children[ 1 ];
			const mesh3 = scene.children[ 2 ];

			assert.strictEqual( mesh1.geometry, mesh2.geometry, 'Mesh1 and Mesh2 share geometry' );
			assert.strictEqual( mesh2.geometry, mesh3.geometry, 'Mesh2 and Mesh3 share geometry' );

		} );

		QUnit.test( 'Multiple meshes sharing same material UUID', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [
					{ uuid: 'geom-1', type: 'BoxGeometry', width: 1, height: 1, depth: 1 },
					{ uuid: 'geom-2', type: 'SphereGeometry', radius: 0.5, widthSegments: 16, heightSegments: 8 }
				],
				materials: [ {
					uuid: 'shared-mat',
					type: 'MeshBasicMaterial',
					color: 16711680
				} ],
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					children: [
						{
							uuid: 'mesh-1',
							type: 'Mesh',
							geometry: 'geom-1',
							material: 'shared-mat',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1
						},
						{
							uuid: 'mesh-2',
							type: 'Mesh',
							geometry: 'geom-2',
							material: 'shared-mat',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1 ],
							layers: 1
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			const mesh1 = scene.children[ 0 ];
			const mesh2 = scene.children[ 1 ];

			assert.strictEqual( mesh1.material, mesh2.material, 'Meshes share same material' );
			assert.notStrictEqual( mesh1.geometry, mesh2.geometry, 'Meshes have different geometries' );

		} );

		QUnit.test( 'LOD with levels', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [
					{ uuid: 'geom-high', type: 'SphereGeometry', radius: 1, widthSegments: 32, heightSegments: 16 },
					{ uuid: 'geom-med', type: 'SphereGeometry', radius: 1, widthSegments: 16, heightSegments: 8 },
					{ uuid: 'geom-low', type: 'SphereGeometry', radius: 1, widthSegments: 8, heightSegments: 4 }
				],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680
				} ],
				object: {
					uuid: 'lod-1',
					type: 'LOD',
					autoUpdate: true,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					levels: [
						{ object: 'mesh-high', distance: 0, hysteresis: 0 },
						{ object: 'mesh-med', distance: 50, hysteresis: 0 },
						{ object: 'mesh-low', distance: 100, hysteresis: 0 }
					],
					children: [
						{
							uuid: 'mesh-high',
							type: 'Mesh',
							name: 'High',
							geometry: 'geom-high',
							material: 'mat-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1
						},
						{
							uuid: 'mesh-med',
							type: 'Mesh',
							name: 'Medium',
							geometry: 'geom-med',
							material: 'mat-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1
						},
						{
							uuid: 'mesh-low',
							type: 'Mesh',
							name: 'Low',
							geometry: 'geom-low',
							material: 'mat-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const lod = loader.parse( json );

			assert.ok( lod.isLOD, 'Is LOD' );
			assert.strictEqual( lod.levels.length, 3, 'Has 3 levels' );
			assert.strictEqual( lod.levels[ 0 ].distance, 0, 'First level distance' );
			assert.strictEqual( lod.levels[ 1 ].distance, 50, 'Second level distance' );
			assert.strictEqual( lod.levels[ 2 ].distance, 100, 'Third level distance' );
			assert.strictEqual( lod.autoUpdate, true, 'autoUpdate is true' );

		} );

		QUnit.test( 'LOD with hysteresis', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [
					{ uuid: 'geom-high', type: 'BoxGeometry', width: 1, height: 1, depth: 1 },
					{ uuid: 'geom-low', type: 'BoxGeometry', width: 1, height: 1, depth: 1 }
				],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680
				} ],
				object: {
					uuid: 'lod-1',
					type: 'LOD',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1,
					levels: [
						{ object: 'mesh-high', distance: 0, hysteresis: 0.5 },
						{ object: 'mesh-low', distance: 100, hysteresis: 0.5 }
					],
					children: [
						{
							uuid: 'mesh-high',
							type: 'Mesh',
							geometry: 'geom-high',
							material: 'mat-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1
						},
						{
							uuid: 'mesh-low',
							type: 'Mesh',
							geometry: 'geom-low',
							material: 'mat-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const lod = loader.parse( json );

			assert.strictEqual( lod.levels[ 0 ].hysteresis, 0.5, 'First level hysteresis' );
			assert.strictEqual( lod.levels[ 1 ].hysteresis, 0.5, 'Second level hysteresis' );

		} );

		QUnit.test( 'Multiple siblings', ( assert ) => {

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
					uuid: 'scene-1',
					type: 'Scene',
					children: [
						{
							uuid: 'mesh-1',
							type: 'Mesh',
							name: 'First',
							geometry: 'geom-1',
							material: 'mat-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1
						},
						{
							uuid: 'mesh-2',
							type: 'Mesh',
							name: 'Second',
							geometry: 'geom-1',
							material: 'mat-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1 ],
							layers: 1
						},
						{
							uuid: 'mesh-3',
							type: 'Mesh',
							name: 'Third',
							geometry: 'geom-1',
							material: 'mat-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 0, 0, 1 ],
							layers: 1
						},
						{
							uuid: 'mesh-4',
							type: 'Mesh',
							name: 'Fourth',
							geometry: 'geom-1',
							material: 'mat-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 6, 0, 0, 1 ],
							layers: 1
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.strictEqual( scene.children.length, 4, 'Has 4 children' );
			assert.strictEqual( scene.children[ 0 ].name, 'First', 'First child name' );
			assert.strictEqual( scene.children[ 1 ].name, 'Second', 'Second child name' );
			assert.strictEqual( scene.children[ 2 ].name, 'Third', 'Third child name' );
			assert.strictEqual( scene.children[ 3 ].name, 'Fourth', 'Fourth child name' );

		} );

		QUnit.test( 'Mixed object types in hierarchy', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				geometries: [ {
					uuid: 'geom-1',
					type: 'BoxGeometry',
					width: 1,
					height: 1,
					depth: 1
				} ],
				materials: [
					{ uuid: 'mat-1', type: 'MeshBasicMaterial', color: 16711680 },
					{ uuid: 'mat-2', type: 'SpriteMaterial', color: 65280 }
				],
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					children: [
						{
							uuid: 'group-1',
							type: 'Group',
							name: 'Objects',
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
								},
								{
									uuid: 'sprite-1',
									type: 'Sprite',
									material: 'mat-2',
									matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1 ],
									layers: 1
								}
							]
						},
						{
							uuid: 'light-1',
							type: 'AmbientLight',
							color: 16777215,
							intensity: 0.5,
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1
						},
						{
							uuid: 'cam-1',
							type: 'PerspectiveCamera',
							fov: 75,
							aspect: 1,
							near: 0.1,
							far: 1000,
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 5, 1 ],
							layers: 1
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.strictEqual( scene.children.length, 3, 'Scene has 3 children' );
			assert.ok( scene.children[ 0 ].isGroup, 'First child is Group' );
			assert.ok( scene.children[ 1 ].isAmbientLight, 'Second child is AmbientLight' );
			assert.ok( scene.children[ 2 ].isPerspectiveCamera, 'Third child is PerspectiveCamera' );

			const group = scene.children[ 0 ];
			assert.ok( group.children[ 0 ].isMesh, 'Group first child is Mesh' );
			assert.ok( group.children[ 1 ].isSprite, 'Group second child is Sprite' );

		} );

	} );

} );
