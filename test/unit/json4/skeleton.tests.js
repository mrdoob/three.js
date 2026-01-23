import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'JSON4 Format', () => {

	QUnit.module( 'Skeleton', () => {

		QUnit.test( 'SkinnedMesh basic', ( assert ) => {

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
								array: [ 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0 ],
								normalized: false
							},
							skinIndex: {
								itemSize: 4,
								type: 'Uint16Array',
								array: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0 ],
								normalized: false
							},
							skinWeight: {
								itemSize: 4,
								type: 'Float32Array',
								array: [ 1, 0, 0, 0, 1, 0, 0, 0, 0.5, 0.5, 0, 0, 1, 0, 0, 0 ],
								normalized: false
							}
						}
					}
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'MeshBasicMaterial',
					color: 16711680,
					skinning: true
				} ],
				skeletons: [ {
					uuid: 'skeleton-1',
					bones: [ 'bone-1', 'bone-2' ],
					boneInverses: [
						[ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
						[ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, - 1, 0, 1 ]
					]
				} ],
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					children: [
						{
							uuid: 'skinned-1',
							type: 'SkinnedMesh',
							geometry: 'geom-1',
							material: 'mat-1',
							bindMode: 'attached',
							bindMatrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							skeleton: 'skeleton-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1,
							children: [
								{
									uuid: 'bone-1',
									type: 'Bone',
									name: 'Root',
									matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
									layers: 1,
									children: [
										{
											uuid: 'bone-2',
											type: 'Bone',
											name: 'Child',
											matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1 ],
											layers: 1
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
			const skinnedMesh = scene.children[ 0 ];

			assert.ok( skinnedMesh.isSkinnedMesh, 'Is SkinnedMesh' );
			assert.ok( skinnedMesh.skeleton, 'Has skeleton' );
			assert.strictEqual( skinnedMesh.bindMode, 'attached', 'BindMode is attached' );

		} );

		QUnit.test( 'Skeleton bones array', ( assert ) => {

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
							skinIndex: {
								itemSize: 4,
								type: 'Uint16Array',
								array: [ 0, 0, 0, 0, 0, 1, 0, 0, 1, 2, 0, 0 ],
								normalized: false
							},
							skinWeight: {
								itemSize: 4,
								type: 'Float32Array',
								array: [ 1, 0, 0, 0, 0.5, 0.5, 0, 0, 0.3, 0.7, 0, 0 ],
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
				skeletons: [ {
					uuid: 'skeleton-1',
					bones: [ 'bone-1', 'bone-2', 'bone-3' ],
					boneInverses: [
						[ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
						[ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, - 1, 0, 1 ],
						[ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, - 2, 0, 1 ]
					]
				} ],
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					children: [
						{
							uuid: 'skinned-1',
							type: 'SkinnedMesh',
							geometry: 'geom-1',
							material: 'mat-1',
							bindMode: 'attached',
							bindMatrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							skeleton: 'skeleton-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1,
							children: [
								{
									uuid: 'bone-1',
									type: 'Bone',
									name: 'Root',
									matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
									layers: 1,
									children: [
										{
											uuid: 'bone-2',
											type: 'Bone',
											name: 'Middle',
											matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1 ],
											layers: 1,
											children: [
												{
													uuid: 'bone-3',
													type: 'Bone',
													name: 'Tip',
													matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1 ],
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
			const skinnedMesh = scene.children[ 0 ];

			assert.strictEqual( skinnedMesh.skeleton.bones.length, 3, 'Skeleton has 3 bones' );
			assert.strictEqual( skinnedMesh.skeleton.bones[ 0 ].name, 'Root', 'First bone name' );
			assert.strictEqual( skinnedMesh.skeleton.bones[ 1 ].name, 'Middle', 'Second bone name' );
			assert.strictEqual( skinnedMesh.skeleton.bones[ 2 ].name, 'Tip', 'Third bone name' );

		} );

		QUnit.test( 'Bone hierarchy (parent-child chain)', ( assert ) => {

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
							skinIndex: {
								itemSize: 4,
								type: 'Uint16Array',
								array: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
								normalized: false
							},
							skinWeight: {
								itemSize: 4,
								type: 'Float32Array',
								array: [ 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0 ],
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
				skeletons: [ {
					uuid: 'skeleton-1',
					bones: [ 'bone-1', 'bone-2' ],
					boneInverses: [
						[ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
						[ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, - 1, 0, 1 ]
					]
				} ],
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					children: [
						{
							uuid: 'skinned-1',
							type: 'SkinnedMesh',
							geometry: 'geom-1',
							material: 'mat-1',
							bindMode: 'attached',
							bindMatrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							skeleton: 'skeleton-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1,
							children: [
								{
									uuid: 'bone-1',
									type: 'Bone',
									name: 'Parent',
									matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
									layers: 1,
									children: [
										{
											uuid: 'bone-2',
											type: 'Bone',
											name: 'Child',
											matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1 ],
											layers: 1
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
			const skinnedMesh = scene.children[ 0 ];
			const bone1 = skinnedMesh.skeleton.bones[ 0 ];
			const bone2 = skinnedMesh.skeleton.bones[ 1 ];

			assert.ok( bone1.isBone, 'First is Bone' );
			assert.ok( bone2.isBone, 'Second is Bone' );
			assert.strictEqual( bone2.parent, bone1, 'Child bone parent is first bone' );
			assert.strictEqual( bone1.children[ 0 ], bone2, 'First bone has child' );

		} );

		QUnit.test( 'Bone type', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'bone-1',
					type: 'Bone',
					name: 'TestBone',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const bone = loader.parse( json );

			assert.ok( bone.isBone, 'Is Bone' );
			assert.strictEqual( bone.type, 'Bone', 'Type is Bone' );
			assert.strictEqual( bone.name, 'TestBone', 'Bone name' );

		} );

		QUnit.test( 'SkinnedMesh bindMatrix', ( assert ) => {

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
							skinIndex: {
								itemSize: 4,
								type: 'Uint16Array',
								array: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
								normalized: false
							},
							skinWeight: {
								itemSize: 4,
								type: 'Float32Array',
								array: [ 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0 ],
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
				skeletons: [ {
					uuid: 'skeleton-1',
					bones: [ 'bone-1' ],
					boneInverses: [
						[ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]
					]
				} ],
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					children: [
						{
							uuid: 'skinned-1',
							type: 'SkinnedMesh',
							geometry: 'geom-1',
							material: 'mat-1',
							bindMode: 'attached',
							bindMatrix: [ 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 2, 3, 1 ],
							skeleton: 'skeleton-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1,
							children: [
								{
									uuid: 'bone-1',
									type: 'Bone',
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
			const skinnedMesh = scene.children[ 0 ];

			const elements = skinnedMesh.bindMatrix.elements;
			assert.strictEqual( elements[ 0 ], 2, 'bindMatrix scale x' );
			assert.strictEqual( elements[ 12 ], 1, 'bindMatrix translate x' );
			assert.strictEqual( elements[ 13 ], 2, 'bindMatrix translate y' );
			assert.strictEqual( elements[ 14 ], 3, 'bindMatrix translate z' );

		} );

		QUnit.test( 'Skeleton boneInverses', ( assert ) => {

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
							skinIndex: {
								itemSize: 4,
								type: 'Uint16Array',
								array: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
								normalized: false
							},
							skinWeight: {
								itemSize: 4,
								type: 'Float32Array',
								array: [ 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0 ],
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
				skeletons: [ {
					uuid: 'skeleton-1',
					bones: [ 'bone-1', 'bone-2' ],
					boneInverses: [
						[ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
						[ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, - 5, 0, 1 ]
					]
				} ],
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					children: [
						{
							uuid: 'skinned-1',
							type: 'SkinnedMesh',
							geometry: 'geom-1',
							material: 'mat-1',
							bindMode: 'attached',
							bindMatrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							skeleton: 'skeleton-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1,
							children: [
								{
									uuid: 'bone-1',
									type: 'Bone',
									matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
									layers: 1,
									children: [
										{
											uuid: 'bone-2',
											type: 'Bone',
											matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 5, 0, 1 ],
											layers: 1
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
			const skinnedMesh = scene.children[ 0 ];

			assert.strictEqual( skinnedMesh.skeleton.boneInverses.length, 2, 'Has 2 boneInverses' );
			assert.strictEqual( skinnedMesh.skeleton.boneInverses[ 1 ].elements[ 13 ], - 5, 'Second boneInverse translate y' );

		} );

	} );

} );
