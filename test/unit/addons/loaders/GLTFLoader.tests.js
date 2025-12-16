import { GLTFLoader } from '../../../../examples/jsm/loaders/GLTFLoader.js';
import { Group } from '../../../../src/objects/Group.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'GLTFLoader', () => {

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new GLTFLoader();
				assert.ok( loader, 'Can instantiate a GLTFLoader.' );

			} );

			// Issue #27993: Multiple scenes referencing the same nodes
			QUnit.test( 'Multiple scenes with shared nodes', ( assert ) => {

				const done = assert.async();
				assert.timeout( 5000 );

				// Use fetch to load the test file
				const testFileUrl = '/test_27993/duplicatescene.glb';

				fetch( testFileUrl )
					.then( response => response.arrayBuffer() )
					.then( data => {

						const loader = new GLTFLoader();

						loader.parse( data, '', ( gltf ) => {

							assert.ok( gltf.scene instanceof Group, 'Main scene is a Group' );
							assert.ok( gltf.scenes.length === 2, 'Two scenes were loaded' );

							const scene1 = gltf.scenes[ 0 ];
							const scene2 = gltf.scenes[ 1 ];

							// Both scenes should have children (Issue #27993)
							assert.ok( scene1.children.length > 0, 'Scene 1 has children' );
							assert.ok( scene2.children.length > 0, 'Scene 2 has children' );

							// The main scene (which is scene1) should also have children
							assert.ok( gltf.scene.children.length > 0, 'Main scene has children' );

							// The nodes should be different objects (cloned)
							assert.notStrictEqual( scene1.children[ 0 ], scene2.children[ 0 ],
								'Shared node was cloned for the second scene' );

							done();

						}, ( error ) => {

							assert.ok( false, 'GLTFLoader failed: ' + error );
							done();

						} );

					} )
					.catch( error => {

						assert.ok( false, 'Failed to load test file: ' + error );
						done();

					} );

			} );

		} );

	} );

} );
