import { Texture } from 'three/webgpu';
import { texture } from 'three/tsl';
import { denoise } from '../../../../examples/jsm/tsl/display/DenoiseNode.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'DenoiseNode', () => {

			QUnit.test( 'Keeps the coverage of a texture in alpha', assert => {

				const guides = { position: texture( new Texture() ), normal: texture( new Texture() ) };

				// in texture space, coverage marks the texels without data, and alpha is not a second signal

				const node = denoise( texture( new Texture() ), { ...guides, coverage: true } );

				assert.strictEqual( node.coverage, true );
				assert.strictEqual( node.alpha, false );
				node.dispose();

				assert.throws( () => denoise( texture( new Texture() ), { ...guides, alpha: true } ), /neither alpha nor temporal/ );

			} );

		} );

	} );

} );
