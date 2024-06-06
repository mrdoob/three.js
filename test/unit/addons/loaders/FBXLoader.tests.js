import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'FBXLoader', () => {

			QUnit.test( 'morphAttributes length match geometry position length', ( assert ) => {

				const fbxLoader = new FBXLoader();
				const done = assert.async();
				fbxLoader.load( '/examples/models/fbx/morph_test.fbx', ( fbx ) => {

					const mesh = fbx.children[ 0 ];
					const baseGeometryLength = mesh.geometry.attributes.position.count;
					const morphAttributesLength = mesh.geometry.morphAttributes.position[ 0 ].count;

					assert.ok( baseGeometryLength === morphAttributesLength, 'length is the same' );
					done();

				} );

			} );

		} );

	} );

} );
