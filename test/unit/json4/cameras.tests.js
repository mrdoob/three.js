import { ObjectLoader } from '../../../src/loaders/ObjectLoader.js';

export default QUnit.module( 'JSON4 Format', () => {

	QUnit.module( 'Cameras', () => {

		QUnit.test( 'PerspectiveCamera - fov, aspect, near, far', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'cam-1',
					type: 'PerspectiveCamera',
					fov: 75,
					aspect: 1.5,
					near: 0.1,
					far: 1000,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 5, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const camera = loader.parse( json );

			assert.ok( camera.isPerspectiveCamera, 'Is PerspectiveCamera' );
			assert.strictEqual( camera.fov, 75, 'FOV is 75' );
			assert.strictEqual( camera.aspect, 1.5, 'Aspect is 1.5' );
			assert.strictEqual( camera.near, 0.1, 'Near is 0.1' );
			assert.strictEqual( camera.far, 1000, 'Far is 1000' );

		} );

		QUnit.test( 'PerspectiveCamera - zoom', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'cam-1',
					type: 'PerspectiveCamera',
					fov: 50,
					aspect: 1,
					near: 0.1,
					far: 100,
					zoom: 2,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const camera = loader.parse( json );

			assert.strictEqual( camera.zoom, 2, 'Zoom is 2' );

		} );

		QUnit.test( 'PerspectiveCamera - focus, filmGauge, filmOffset', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'cam-1',
					type: 'PerspectiveCamera',
					fov: 50,
					aspect: 1,
					near: 0.1,
					far: 100,
					focus: 15,
					filmGauge: 35,
					filmOffset: 5,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const camera = loader.parse( json );

			assert.strictEqual( camera.focus, 15, 'Focus is 15' );
			assert.strictEqual( camera.filmGauge, 35, 'FilmGauge is 35' );
			assert.strictEqual( camera.filmOffset, 5, 'FilmOffset is 5' );

		} );

		QUnit.test( 'OrthographicCamera - left, right, top, bottom, near, far', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'cam-1',
					type: 'OrthographicCamera',
					left: - 10,
					right: 10,
					top: 10,
					bottom: - 10,
					near: 0.1,
					far: 100,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 10, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const camera = loader.parse( json );

			assert.ok( camera.isOrthographicCamera, 'Is OrthographicCamera' );
			assert.strictEqual( camera.left, - 10, 'Left is -10' );
			assert.strictEqual( camera.right, 10, 'Right is 10' );
			assert.strictEqual( camera.top, 10, 'Top is 10' );
			assert.strictEqual( camera.bottom, - 10, 'Bottom is -10' );
			assert.strictEqual( camera.near, 0.1, 'Near is 0.1' );
			assert.strictEqual( camera.far, 100, 'Far is 100' );

		} );

		QUnit.test( 'OrthographicCamera - zoom', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'cam-1',
					type: 'OrthographicCamera',
					left: - 5,
					right: 5,
					top: 5,
					bottom: - 5,
					near: 1,
					far: 50,
					zoom: 0.5,
					matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
					layers: 1
				}
			};

			const loader = new ObjectLoader();
			const camera = loader.parse( json );

			assert.strictEqual( camera.zoom, 0.5, 'Zoom is 0.5' );

		} );

		QUnit.test( 'Camera in scene hierarchy', ( assert ) => {

			const json = {
				metadata: { version: 4.7, type: 'Object', generator: 'Object3D.toJSON' },
				object: {
					uuid: 'scene-1',
					type: 'Scene',
					children: [
						{
							uuid: 'cam-1',
							type: 'PerspectiveCamera',
							name: 'MainCamera',
							fov: 60,
							aspect: 16 / 9,
							near: 0.5,
							far: 500,
							matrix: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 2, 10, 1 ],
							layers: 1
						}
					]
				}
			};

			const loader = new ObjectLoader();
			const scene = loader.parse( json );
			const camera = scene.children[ 0 ];

			assert.ok( scene.isScene, 'Root is Scene' );
			assert.ok( camera.isPerspectiveCamera, 'Child is PerspectiveCamera' );
			assert.strictEqual( camera.name, 'MainCamera', 'Camera name' );
			assert.strictEqual( camera.position.z, 10, 'Camera position.z' );

		} );

	} );

} );
