import { OrthographicCamera, PerspectiveCamera } from 'three';
import { TrackballControls } from '../../../../examples/jsm/controls/TrackballControls.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Controls', () => {

		QUnit.module( 'TrackballControls', () => {

			QUnit.test( 'mouse wheel updates a perspective camera before change', ( assert ) => {

				const element = document.createElement( 'div' );
				document.body.appendChild( element );

				const camera = new PerspectiveCamera();
				camera.position.set( 0, 0, 10 );

				const controls = new TrackballControls( camera, element );

				const initialPosition = camera.position.clone();
				const events = [];
				let positionAtChange = null;

				controls.addEventListener( 'start', ( event ) => events.push( event.type ) );
				controls.addEventListener( 'change', ( event ) => {

					events.push( event.type );
					positionAtChange = camera.position.clone();

				} );
				controls.addEventListener( 'end', ( event ) => events.push( event.type ) );

				element.dispatchEvent( new WheelEvent( 'wheel', { deltaY: 100, cancelable: true } ) );

				assert.deepEqual( events, [ 'start', 'change', 'end' ], 'emits the complete interaction lifecycle in order' );
				assert.ok( camera.position.distanceToSquared( initialPosition ) > 0, 'updates the camera position' );
				assert.ok( positionAtChange !== null && positionAtChange.equals( camera.position ), 'change observes the updated camera position' );

				controls.dispose();
				element.remove();

			} );

			QUnit.test( 'mouse wheel updates an orthographic camera before change', ( assert ) => {

				const element = document.createElement( 'div' );
				document.body.appendChild( element );

				const camera = new OrthographicCamera( - 1, 1, 1, - 1 );
				camera.position.set( 0, 0, 10 );

				const controls = new TrackballControls( camera, element );

				const initialZoom = camera.zoom;
				const events = [];
				let zoomAtChange = null;

				controls.addEventListener( 'start', ( event ) => events.push( event.type ) );
				controls.addEventListener( 'change', ( event ) => {

					events.push( event.type );
					zoomAtChange = camera.zoom;

				} );
				controls.addEventListener( 'end', ( event ) => events.push( event.type ) );

				element.dispatchEvent( new WheelEvent( 'wheel', { deltaY: 100, cancelable: true } ) );

				assert.deepEqual( events, [ 'start', 'change', 'end' ], 'emits the complete interaction lifecycle in order' );
				assert.notStrictEqual( camera.zoom, initialZoom, 'updates the camera zoom' );
				assert.strictEqual( zoomAtChange, camera.zoom, 'change observes the updated camera zoom' );

				controls.dispose();
				element.remove();

			} );

			QUnit.test( 'mouse wheel does not emit change without a camera change', ( assert ) => {

				const element = document.createElement( 'div' );
				document.body.appendChild( element );

				const camera = new PerspectiveCamera();
				camera.position.set( 0, 0, 10 );

				const controls = new TrackballControls( camera, element );
				const events = [];

				controls.addEventListener( 'start', ( event ) => events.push( event.type ) );
				controls.addEventListener( 'change', ( event ) => events.push( event.type ) );
				controls.addEventListener( 'end', ( event ) => events.push( event.type ) );

				element.dispatchEvent( new WheelEvent( 'wheel', { deltaY: 0, cancelable: true } ) );

				assert.deepEqual( events, [ 'start', 'end' ], 'does not synthesize a change event' );

				controls.dispose();
				element.remove();

			} );

		} );

	} );

} );
