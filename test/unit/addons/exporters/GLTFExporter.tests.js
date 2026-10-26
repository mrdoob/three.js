import { OrthographicCamera } from 'three';
import { GLTFExporter } from '../../../../examples/jsm/exporters/GLTFExporter.js';
import { GLTFLoader } from '../../../../examples/jsm/loaders/GLTFLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Exporters', () => {

		QUnit.module( 'GLTFExporter', () => {

			QUnit.test( 'orthographic camera', async ( assert ) => {

				const camera = new OrthographicCamera( - 2, 2, 1, - 1, 0.1, 100 );
				const json = await new GLTFExporter().parseAsync( camera );

				assert.strictEqual( json.cameras[ 0 ].orthographic.xmag, 2, 'xmag is half the width' );
				assert.strictEqual( json.cameras[ 0 ].orthographic.ymag, 1, 'ymag is half the height' );

				const gltf = await new GLTFLoader().parseAsync( JSON.stringify( json ), '' );
				const loaded = gltf.cameras[ 0 ];

				assert.deepEqual(
					[ loaded.left, loaded.right, loaded.top, loaded.bottom ],
					[ camera.left, camera.right, camera.top, camera.bottom ],
					'frustum survives a round trip'
				);

			} );

		} );

	} );

} );
