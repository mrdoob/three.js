import { PerspectiveCamera } from 'three';
import { float } from 'three/tsl';
import GTAONode from '../../../../examples/jsm/tsl/display/GTAONode.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'GTAONode', () => {

			QUnit.test( 'dispose', ( assert ) => {

				const node = new GTAONode( float( 1 ), null, new PerspectiveCamera() );
				let disposeEventCount = 0;

				node._noiseNode.value.addEventListener( 'dispose', () => disposeEventCount ++ );
				node.dispose();

				assert.strictEqual( disposeEventCount, 1, 'disposes the internal noise texture' );

			} );

		} );

	} );

} );
