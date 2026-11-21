import { LoaderUtils } from '../../../../src/loaders/LoaderUtils.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'LoaderUtils', () => {

		// STATIC

		QUnit.test( 'extractUrlBase', ( assert ) => {

			assert.equal( '/path/to/', LoaderUtils.extractUrlBase( '/path/to/model.glb' ) );
			assert.equal( './', LoaderUtils.extractUrlBase( 'model.glb' ) );
			assert.equal( '/', LoaderUtils.extractUrlBase( '/model.glb' ) );

		} );

		QUnit.test( 'extractUrlBase with query strings and fragments', ( assert ) => {

			const cases = [
				[ 'https://example.com/models/model.glb?token=a/b', 'https://example.com/models/' ],
				[ 'https://example.com/models/model.glb#mesh/0', 'https://example.com/models/' ],
				[ 'models/model.glb?token=a/b#mesh/0', 'models/' ],
				[ 'models/model.glb#mesh/0?token=a/b', 'models/' ],
				[ '/model.glb?redirect=https://example.com/models/', '/' ],
				[ 'model.glb?token=a/b', './' ],
				[ 'model.glb#mesh/0', './' ],
				[ 'models/?token=a/b', 'models/' ],
				[ 'models%3Fv1%23part/model.glb?token=a/b', 'models%3Fv1%23part/' ]
			];

			for ( const [ url, expected ] of cases ) {

				assert.strictEqual( LoaderUtils.extractUrlBase( url ), expected, url );

			}

		} );

	} );

} );
