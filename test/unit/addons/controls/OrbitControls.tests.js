import { PerspectiveCamera } from 'three';
import { OrbitControls } from '../../../../examples/jsm/controls/OrbitControls.js';

export default QUnit.module( 'Controls', () => {

	QUnit.module( 'OrbitControls', () => {

		QUnit.test( 'ends a pen gesture released with a different mouse pointerId', ( assert ) => {

			const element = document.createElement( 'div' );
			const capturedPointers = new Set();
			element.setPointerCapture = id => capturedPointers.add( id );
			element.hasPointerCapture = id => capturedPointers.has( id );
			element.releasePointerCapture = id => capturedPointers.delete( id );
			const controls = new OrbitControls( new PerspectiveCamera(), element );
			let endCount = 0;
			controls.addEventListener( 'end', () => endCount ++ );

			element.dispatchEvent( new PointerEvent( 'pointerdown', { pointerId: 2, pointerType: 'pen', button: 0 } ) );
			document.dispatchEvent( new PointerEvent( 'pointerup', { pointerId: 1, pointerType: 'mouse' } ) );

			assert.deepEqual( controls._pointers, [], 'pen pointer is removed' );
			assert.strictEqual( endCount, 1, 'gesture ends' );
			assert.notOk( capturedPointers.has( 2 ), 'pen pointer capture is released' );
			controls.dispose();

		} );

	} );

} );
