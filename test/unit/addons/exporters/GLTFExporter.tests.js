import { OrthographicCamera, PerspectiveCamera, Scene } from 'three';
import { GLTFExporter } from '../../../../examples/jsm/exporters/GLTFExporter.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Exporters', () => {

		QUnit.module( 'GLTFExporter', () => {

			QUnit.test( 'camera names', async ( assert ) => {

				const scene = new Scene();

				const perspective = new PerspectiveCamera();
				perspective.name = 'Main';
				scene.add( perspective );

				const orthographic = new OrthographicCamera();
				orthographic.name = 'Top';
				scene.add( orthographic );

				const json = await new GLTFExporter().parseAsync( scene );

				assert.deepEqual( json.cameras.map( camera => camera.name ), [ 'Main', 'Top' ], 'cameras keep their names' );

			} );

		} );

	} );

} );
