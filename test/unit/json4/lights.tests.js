import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'JSON4 Format', () => {

	QUnit.module( 'Lights', () => {

		QUnit.test( 'AmbientLight - color, intensity', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'light-1',
					type: 'AmbientLight',
					color: 16777215,
					intensity: 0.5,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const light = loader.parse( json );

			assert.ok( light.isAmbientLight, 'Is AmbientLight' );
			assert.strictEqual( light.color.getHex(), 0xffffff, 'Color is white' );
			assert.strictEqual( light.intensity, 0.5, 'Intensity is 0.5' );

		} );

		QUnit.test( 'DirectionalLight - basic', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'light-1',
					type: 'DirectionalLight',
					color: 16777215,
					intensity: 1,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 10, 5, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const light = loader.parse( json );

			assert.ok( light.isDirectionalLight, 'Is DirectionalLight' );
			assert.strictEqual( light.color.getHex(), 0xffffff, 'Color is white' );
			assert.strictEqual( light.intensity, 1, 'Intensity is 1' );
			assert.strictEqual( light.position.x, 5, 'Position.x is 5' );

		} );

		QUnit.test( 'DirectionalLight with target', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					children: [
						{
							uuid: 'light-1',
							type: 'DirectionalLight',
							color: 16777215,
							intensity: 1,
							target: 'target-1',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 10, 5, 1 ],
							layers: 1
						},
						{
							uuid: 'target-1',
							type: 'Object3D',
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );
			const light = scene.children[ 0 ];

			assert.ok( light.isDirectionalLight, 'Is DirectionalLight' );
			assert.strictEqual( light.target.uuid, 'target-1', 'Target is bound' );

		} );

		QUnit.test( 'DirectionalLight with shadow', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'light-1',
					type: 'DirectionalLight',
					color: 16777215,
					intensity: 1,
					castShadow: true,
					shadow: {
						bias: 0.001,
						normalBias: 0.02,
						radius: 1,
						mapSize: [ 1024, 1024 ]
					},
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const light = loader.parse( json );

			assert.strictEqual( light.castShadow, true, 'CastShadow is true' );
			assert.strictEqual( light.shadow.bias, 0.001, 'Shadow bias' );
			assert.strictEqual( light.shadow.normalBias, 0.02, 'Shadow normalBias' );
			assert.strictEqual( light.shadow.radius, 1, 'Shadow radius' );
			assert.strictEqual( light.shadow.mapSize.x, 1024, 'Shadow mapSize.x' );
			assert.strictEqual( light.shadow.mapSize.y, 1024, 'Shadow mapSize.y' );

		} );

		QUnit.test( 'PointLight - distance, decay', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'light-1',
					type: 'PointLight',
					color: 16776960,
					intensity: 2,
					distance: 50,
					decay: 2,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 5, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const light = loader.parse( json );

			assert.ok( light.isPointLight, 'Is PointLight' );
			assert.strictEqual( light.color.getHex(), 0xffff00, 'Color is yellow' );
			assert.strictEqual( light.intensity, 2, 'Intensity is 2' );
			assert.strictEqual( light.distance, 50, 'Distance is 50' );
			assert.strictEqual( light.decay, 2, 'Decay is 2' );

		} );

		QUnit.test( 'PointLight with shadow', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'light-1',
					type: 'PointLight',
					color: 16777215,
					intensity: 1,
					distance: 0,
					decay: 2,
					castShadow: true,
					shadow: {
						bias: - 0.005,
						normalBias: 0,
						radius: 2,
						mapSize: [ 512, 512 ]
					},
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const light = loader.parse( json );

			assert.strictEqual( light.castShadow, true, 'CastShadow is true' );
			assert.strictEqual( light.shadow.bias, - 0.005, 'Shadow bias' );
			assert.strictEqual( light.shadow.radius, 2, 'Shadow radius' );

		} );

		QUnit.test( 'SpotLight - angle, penumbra', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'light-1',
					type: 'SpotLight',
					color: 16777215,
					intensity: 1,
					distance: 100,
					angle: Math.PI / 6,
					penumbra: 0.2,
					decay: 2,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 10, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const light = loader.parse( json );

			assert.ok( light.isSpotLight, 'Is SpotLight' );
			assert.ok( Math.abs( light.angle - Math.PI / 6 ) < 0.0001, 'Angle is PI/6' );
			assert.strictEqual( light.penumbra, 0.2, 'Penumbra is 0.2' );
			assert.strictEqual( light.distance, 100, 'Distance is 100' );
			assert.strictEqual( light.decay, 2, 'Decay is 2' );

		} );

		QUnit.test( 'SpotLight with shadow', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'light-1',
					type: 'SpotLight',
					color: 16777215,
					intensity: 1,
					distance: 0,
					angle: Math.PI / 4,
					penumbra: 0.1,
					decay: 2,
					castShadow: true,
					shadow: {
						bias: 0,
						normalBias: 0,
						radius: 1,
						mapSize: [ 2048, 2048 ]
					},
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const light = loader.parse( json );

			assert.strictEqual( light.castShadow, true, 'CastShadow is true' );
			assert.strictEqual( light.shadow.mapSize.x, 2048, 'Shadow mapSize.x' );

		} );

		QUnit.test( 'HemisphereLight - groundColor', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'light-1',
					type: 'HemisphereLight',
					color: 8900331,
					groundColor: 4473924,
					intensity: 0.6,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const light = loader.parse( json );

			assert.ok( light.isHemisphereLight, 'Is HemisphereLight' );
			assert.strictEqual( light.color.getHex(), 0x87ceeb, 'Sky color' );
			assert.strictEqual( light.groundColor.getHex(), 0x444444, 'Ground color' );
			assert.strictEqual( light.intensity, 0.6, 'Intensity is 0.6' );

		} );

		QUnit.test( 'RectAreaLight - width, height', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'light-1',
					type: 'RectAreaLight',
					color: 16777215,
					intensity: 5,
					width: 10,
					height: 10,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 5, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const light = loader.parse( json );

			assert.ok( light.isRectAreaLight, 'Is RectAreaLight' );
			assert.strictEqual( light.width, 10, 'Width is 10' );
			assert.strictEqual( light.height, 10, 'Height is 10' );
			assert.strictEqual( light.intensity, 5, 'Intensity is 5' );

		} );

		QUnit.test( 'LightProbe - spherical harmonics', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'light-1',
					type: 'LightProbe',
					intensity: 1,
					sh: [
						0.5, 0.5, 0.5,
						0.1, 0.1, 0.1,
						0.2, 0.2, 0.2,
						0.05, 0.05, 0.05,
						0.05, 0.05, 0.05,
						0.05, 0.05, 0.05,
						0.05, 0.05, 0.05,
						0.05, 0.05, 0.05,
						0.05, 0.05, 0.05
					],
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const light = loader.parse( json );

			assert.ok( light.isLightProbe, 'Is LightProbe' );
			assert.ok( light.sh.isSphericalHarmonics3, 'Has SphericalHarmonics3' );
			assert.strictEqual( light.sh.coefficients[ 0 ].x, 0.5, 'SH coefficient' );

		} );

		QUnit.test( 'Shadow camera properties', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'light-1',
					type: 'DirectionalLight',
					color: 16777215,
					intensity: 1,
					castShadow: true,
					shadow: {
						bias: 0,
						normalBias: 0,
						radius: 1,
						mapSize: [ 1024, 1024 ],
						camera: {
							uuid: 'cam-1',
							type: 'OrthographicCamera',
							left: - 10,
							right: 10,
							top: 10,
							bottom: - 10,
							near: 0.5,
							far: 500,
							zoom: 1,
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							layers: 1
						}
					},
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const light = loader.parse( json );

			assert.ok( light.shadow.camera.isOrthographicCamera, 'Shadow camera is OrthographicCamera' );
			assert.strictEqual( light.shadow.camera.left, - 10, 'Shadow camera left' );
			assert.strictEqual( light.shadow.camera.right, 10, 'Shadow camera right' );
			assert.strictEqual( light.shadow.camera.near, 0.5, 'Shadow camera near' );
			assert.strictEqual( light.shadow.camera.far, 500, 'Shadow camera far' );

		} );

		QUnit.test( 'Shadow intensity', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'light-1',
					type: 'DirectionalLight',
					color: 16777215,
					intensity: 1,
					castShadow: true,
					shadow: {
						intensity: 0.5,
						bias: 0,
						normalBias: 0,
						radius: 1,
						mapSize: [ 1024, 1024 ]
					},
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const light = loader.parse( json );

			assert.strictEqual( light.shadow.intensity, 0.5, 'Shadow intensity' );

		} );

	} );

} );
