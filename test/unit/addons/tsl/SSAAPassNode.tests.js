import { PerspectiveCamera, Scene } from 'three';
import { ssaaPass } from '../../../../examples/jsm/tsl/display/SSAAPassNode.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'SSAAPassNode', () => {

			QUnit.test( 'single-sample render targets', ( assert ) => {

				const pass = ssaaPass( new Scene(), new PerspectiveCamera() );

				assert.strictEqual( pass.options.samples, 0, 'disables inherited renderer multisampling' );

				pass.dispose();

			} );

		} );

	} );

} );
