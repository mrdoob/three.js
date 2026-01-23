import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';
import {
	FrontSide,
	BackSide,
	DoubleSide,
	NormalBlending,
	AdditiveBlending,
	SubtractiveBlending,
	MultiplyBlending,
	CustomBlending,
	SrcAlphaFactor,
	OneMinusSrcAlphaFactor
} from '../../../src/constants.js';

export default QUnit.module( 'JSON4 Format', () => {

	QUnit.module( 'Materials', () => {

		QUnit.test( 'MeshBasicMaterial - color, wireframe, opacity', ( assert ) => {

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
					color: 16711680,
					wireframe: true,
					opacity: 0.5,
					transparent: true
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

			assert.ok( mesh.material.isMeshBasicMaterial, 'Is MeshBasicMaterial' );
			assert.strictEqual( mesh.material.color.getHex(), 0xff0000, 'Color is red' );
			assert.strictEqual( mesh.material.wireframe, true, 'Wireframe is true' );
			assert.strictEqual( mesh.material.opacity, 0.5, 'Opacity is 0.5' );
			assert.strictEqual( mesh.material.transparent, true, 'Transparent is true' );

		} );

		QUnit.test( 'MeshBasicMaterial - side property', ( assert ) => {

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
					color: 16711680,
					side: DoubleSide
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

			assert.strictEqual( mesh.material.side, DoubleSide, 'Side is DoubleSide' );

		} );

		QUnit.test( 'MeshStandardMaterial - roughness, metalness', ( assert ) => {

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
					type: 'MeshStandardMaterial',
					color: 16711680,
					roughness: 0.3,
					metalness: 0.8,
					emissive: 65280,
					emissiveIntensity: 0.5
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

			assert.ok( mesh.material.isMeshStandardMaterial, 'Is MeshStandardMaterial' );
			assert.strictEqual( mesh.material.color.getHex(), 0xff0000, 'Color is red' );
			assert.strictEqual( mesh.material.roughness, 0.3, 'Roughness is 0.3' );
			assert.strictEqual( mesh.material.metalness, 0.8, 'Metalness is 0.8' );
			assert.strictEqual( mesh.material.emissive.getHex(), 0x00ff00, 'Emissive is green' );
			assert.strictEqual( mesh.material.emissiveIntensity, 0.5, 'EmissiveIntensity is 0.5' );

		} );

		QUnit.test( 'MeshPhysicalMaterial - clearcoat, transmission, sheen', ( assert ) => {

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
					type: 'MeshPhysicalMaterial',
					color: 16711680,
					clearcoat: 0.5,
					clearcoatRoughness: 0.1,
					transmission: 0.9,
					ior: 1.5,
					sheen: 0.5,
					sheenRoughness: 0.25,
					sheenColor: 255
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

			assert.ok( mesh.material.isMeshPhysicalMaterial, 'Is MeshPhysicalMaterial' );
			assert.strictEqual( mesh.material.clearcoat, 0.5, 'Clearcoat is 0.5' );
			assert.strictEqual( mesh.material.clearcoatRoughness, 0.1, 'ClearcoatRoughness is 0.1' );
			assert.strictEqual( mesh.material.transmission, 0.9, 'Transmission is 0.9' );
			assert.strictEqual( mesh.material.ior, 1.5, 'IOR is 1.5' );
			assert.strictEqual( mesh.material.sheen, 0.5, 'Sheen is 0.5' );
			assert.strictEqual( mesh.material.sheenRoughness, 0.25, 'SheenRoughness is 0.25' );

		} );

		QUnit.test( 'MeshPhysicalMaterial - iridescence, anisotropy', ( assert ) => {

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
					type: 'MeshPhysicalMaterial',
					color: 16711680,
					iridescence: 1.0,
					iridescenceIOR: 1.3,
					iridescenceThicknessRange: [ 100, 400 ],
					anisotropy: 0.5,
					anisotropyRotation: Math.PI / 4
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

			assert.strictEqual( mesh.material.iridescence, 1.0, 'Iridescence is 1.0' );
			assert.strictEqual( mesh.material.iridescenceIOR, 1.3, 'IridescenceIOR is 1.3' );
			assert.deepEqual( mesh.material.iridescenceThicknessRange, [ 100, 400 ], 'IridescenceThicknessRange' );
			assert.strictEqual( mesh.material.anisotropy, 0.5, 'Anisotropy is 0.5' );
			assert.ok( Math.abs( mesh.material.anisotropyRotation - Math.PI / 4 ) < 0.0001, 'AnisotropyRotation' );

		} );

		QUnit.test( 'MeshPhongMaterial - shininess, specular', ( assert ) => {

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
					type: 'MeshPhongMaterial',
					color: 16711680,
					shininess: 100,
					specular: 16777215
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

			assert.ok( mesh.material.isMeshPhongMaterial, 'Is MeshPhongMaterial' );
			assert.strictEqual( mesh.material.shininess, 100, 'Shininess is 100' );
			assert.strictEqual( mesh.material.specular.getHex(), 0xffffff, 'Specular is white' );

		} );

		QUnit.test( 'MeshLambertMaterial', ( assert ) => {

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
					type: 'MeshLambertMaterial',
					color: 16711680,
					emissive: 65280
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

			assert.ok( mesh.material.isMeshLambertMaterial, 'Is MeshLambertMaterial' );
			assert.strictEqual( mesh.material.color.getHex(), 0xff0000, 'Color is red' );
			assert.strictEqual( mesh.material.emissive.getHex(), 0x00ff00, 'Emissive is green' );

		} );

		QUnit.test( 'MeshToonMaterial', ( assert ) => {

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
					type: 'MeshToonMaterial',
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

			assert.ok( mesh.material.isMeshToonMaterial, 'Is MeshToonMaterial' );
			assert.strictEqual( mesh.material.color.getHex(), 0xff0000, 'Color is red' );

		} );

		QUnit.test( 'LineBasicMaterial - color, linewidth', ( assert ) => {

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
								array: [ 0, 0, 0, 1, 1, 1 ],
								normalized: false
							}
						}
					}
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'LineBasicMaterial',
					color: 65280,
					linewidth: 2
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

			assert.ok( line.material.isLineBasicMaterial, 'Is LineBasicMaterial' );
			assert.strictEqual( line.material.color.getHex(), 0x00ff00, 'Color is green' );
			assert.strictEqual( line.material.linewidth, 2, 'Linewidth is 2' );

		} );

		QUnit.test( 'LineDashedMaterial - dashSize, gapSize', ( assert ) => {

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
								array: [ 0, 0, 0, 1, 1, 1 ],
								normalized: false
							}
						}
					}
				} ],
				materials: [ {
					uuid: 'mat-1',
					type: 'LineDashedMaterial',
					color: 65280,
					dashSize: 3,
					gapSize: 1,
					scale: 2
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

			assert.ok( line.material.isLineDashedMaterial, 'Is LineDashedMaterial' );
			assert.strictEqual( line.material.dashSize, 3, 'DashSize is 3' );
			assert.strictEqual( line.material.gapSize, 1, 'GapSize is 1' );
			assert.strictEqual( line.material.scale, 2, 'Scale is 2' );

		} );

		QUnit.test( 'PointsMaterial - size, sizeAttenuation', ( assert ) => {

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
					color: 255,
					size: 5,
					sizeAttenuation: false
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

			assert.ok( points.material.isPointsMaterial, 'Is PointsMaterial' );
			assert.strictEqual( points.material.color.getHex(), 0x0000ff, 'Color is blue' );
			assert.strictEqual( points.material.size, 5, 'Size is 5' );
			assert.strictEqual( points.material.sizeAttenuation, false, 'SizeAttenuation is false' );

		} );

		QUnit.test( 'SpriteMaterial - rotation', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				materials: [ {
					uuid: 'mat-1',
					type: 'SpriteMaterial',
					color: 16711680,
					rotation: Math.PI / 4,
					sizeAttenuation: true
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

			assert.ok( sprite.material.isSpriteMaterial, 'Is SpriteMaterial' );
			assert.strictEqual( sprite.material.color.getHex(), 0xff0000, 'Color is red' );
			assert.ok( Math.abs( sprite.material.rotation - Math.PI / 4 ) < 0.0001, 'Rotation is PI/4' );

		} );

		QUnit.test( 'Blending modes - Normal, Additive', ( assert ) => {

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
					{
						uuid: 'mat-1',
						type: 'MeshBasicMaterial',
						color: 16711680,
						blending: NormalBlending
					},
					{
						uuid: 'mat-2',
						type: 'MeshBasicMaterial',
						color: 65280,
						blending: AdditiveBlending
					}
				],
				object: {
					uuid: 'scene-1',
					type: 'Scene',
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
							uuid: 'mesh-2',
							type: 'Mesh',
							geometry: 'geom-1',
							material: 'mat-2',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1 ],
							layers: 1
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.strictEqual( scene.children[ 0 ].material.blending, NormalBlending, 'First mesh has NormalBlending' );
			assert.strictEqual( scene.children[ 1 ].material.blending, AdditiveBlending, 'Second mesh has AdditiveBlending' );

		} );

		QUnit.test( 'Blending modes - Subtractive, Multiply', ( assert ) => {

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
					{
						uuid: 'mat-1',
						type: 'MeshBasicMaterial',
						color: 16711680,
						blending: SubtractiveBlending
					},
					{
						uuid: 'mat-2',
						type: 'MeshBasicMaterial',
						color: 65280,
						blending: MultiplyBlending
					}
				],
				object: {
					uuid: 'scene-1',
					type: 'Scene',
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
							uuid: 'mesh-2',
							type: 'Mesh',
							geometry: 'geom-1',
							material: 'mat-2',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1 ],
							layers: 1
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.strictEqual( scene.children[ 0 ].material.blending, SubtractiveBlending, 'First mesh has SubtractiveBlending' );
			assert.strictEqual( scene.children[ 1 ].material.blending, MultiplyBlending, 'Second mesh has MultiplyBlending' );

		} );

		QUnit.test( 'CustomBlending with src/dst factors', ( assert ) => {

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
					color: 16711680,
					blending: CustomBlending,
					blendSrc: SrcAlphaFactor,
					blendDst: OneMinusSrcAlphaFactor
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

			assert.strictEqual( mesh.material.blending, CustomBlending, 'Has CustomBlending' );
			assert.strictEqual( mesh.material.blendSrc, SrcAlphaFactor, 'BlendSrc is SrcAlphaFactor' );
			assert.strictEqual( mesh.material.blendDst, OneMinusSrcAlphaFactor, 'BlendDst is OneMinusSrcAlphaFactor' );

		} );

		QUnit.test( 'Material name and userData', ( assert ) => {

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
					name: 'MyMaterial',
					color: 16711680,
					userData: { customProp: 'customValue' }
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

			assert.strictEqual( mesh.material.name, 'MyMaterial', 'Material name' );
			assert.strictEqual( mesh.material.userData.customProp, 'customValue', 'Material userData' );

		} );

		QUnit.test( 'Material depthTest, depthWrite, depthFunc', ( assert ) => {

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
					color: 16711680,
					depthTest: false,
					depthWrite: false
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

			assert.strictEqual( mesh.material.depthTest, false, 'DepthTest is false' );
			assert.strictEqual( mesh.material.depthWrite, false, 'DepthWrite is false' );

		} );

	} );

} );
