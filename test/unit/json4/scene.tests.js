import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'JSON4 Format', () => {

	QUnit.module( 'Scene', () => {

		QUnit.test( 'Scene type', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.ok( scene.isScene, 'Is Scene' );
			assert.strictEqual( scene.type, 'Scene', 'Type is Scene' );

		} );

		QUnit.test( 'Background as Color (hex integer)', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					background: 8900331,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.ok( scene.background.isColor, 'Background is Color' );
			assert.strictEqual( scene.background.getHex(), 0x87ceeb, 'Background color value' );

		} );

		QUnit.test( 'Background as Texture reference', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				images: [ {
					uuid: 'image-1',
					url: {
						data: [ 255, 0, 0, 255 ],
						width: 1,
						height: 1,
						type: 'Uint8Array'
					}
				} ],
				textures: [ {
					uuid: 'tex-1',
					image: 'image-1'
				} ],
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					background: 'tex-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.ok( scene.background.isTexture, 'Background is Texture' );

		} );

		QUnit.test( 'Environment texture', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				images: [ {
					uuid: 'image-1',
					url: {
						data: [ 128, 128, 128, 255 ],
						width: 1,
						height: 1,
						type: 'Uint8Array'
					}
				} ],
				textures: [ {
					uuid: 'env-tex-1',
					image: 'image-1'
				} ],
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					environment: 'env-tex-1',
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.ok( scene.environment.isTexture, 'Environment is Texture' );

		} );

		QUnit.test( 'Fog - color, near, far', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					fog: {
						type: 'Fog',
						name: '',
						color: 16777215,
						near: 1,
						far: 100
					},
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.ok( scene.fog.isFog, 'Has Fog' );
			assert.strictEqual( scene.fog.color.getHex(), 0xffffff, 'Fog color' );
			assert.strictEqual( scene.fog.near, 1, 'Fog near' );
			assert.strictEqual( scene.fog.far, 100, 'Fog far' );

		} );

		QUnit.test( 'FogExp2 - color, density', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					fog: {
						type: 'FogExp2',
						name: '',
						color: 8421504,
						density: 0.02
					},
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.ok( scene.fog.isFogExp2, 'Has FogExp2' );
			assert.strictEqual( scene.fog.color.getHex(), 0x808080, 'FogExp2 color' );
			assert.strictEqual( scene.fog.density, 0.02, 'FogExp2 density' );

		} );

		QUnit.test( 'Fog with name', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					fog: {
						type: 'Fog',
						name: 'MyFog',
						color: 16777215,
						near: 10,
						far: 200
					},
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.strictEqual( scene.fog.name, 'MyFog', 'Fog name' );

		} );

		QUnit.test( 'backgroundBlurriness', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					backgroundBlurriness: 0.5,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.strictEqual( scene.backgroundBlurriness, 0.5, 'backgroundBlurriness' );

		} );

		QUnit.test( 'backgroundIntensity', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					backgroundIntensity: 0.8,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.strictEqual( scene.backgroundIntensity, 0.8, 'backgroundIntensity' );

		} );

		QUnit.test( 'backgroundRotation', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					backgroundRotation: [ Math.PI / 4, 0, 0, 'XYZ' ],
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.ok( Math.abs( scene.backgroundRotation.x - Math.PI / 4 ) < 0.0001, 'backgroundRotation.x' );

		} );

		QUnit.test( 'environmentIntensity', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					environmentIntensity: 1.5,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.strictEqual( scene.environmentIntensity, 1.5, 'environmentIntensity' );

		} );

		QUnit.test( 'environmentRotation', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					environmentRotation: [ 0, Math.PI / 2, 0, 'XYZ' ],
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.ok( Math.abs( scene.environmentRotation.y - Math.PI / 2 ) < 0.0001, 'environmentRotation.y' );

		} );

		QUnit.test( 'Scene with children', ( assert ) => {

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
					background: 0,
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
							uuid: 'light-1',
							type: 'AmbientLight',
							color: 16777215,
							intensity: 0.5,
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );

			assert.strictEqual( scene.children.length, 2, 'Has 2 children' );
			assert.ok( scene.children[ 0 ].isMesh, 'First child is Mesh' );
			assert.ok( scene.children[ 1 ].isAmbientLight, 'Second child is AmbientLight' );

		} );

	} );

} );
