import { SelectionBox } from '../../../../examples/jsm/interactive/SelectionBox.js';
import { SelectionDrawer } from './selection-drawer.js';

class MultipleSelection {

	constructor( camera, scene, renderer ) {

		this.enabled = false;
		this._camera = camera;
		this._scene = scene;
		this._renderer = renderer;
		this._selectionDrawer = null;
		this._selectionBox = null;

		console.log( this.enabled, this._camera, this._scene, this._renderer );

	}

	set renderer( renderer ) {

		console.log( { renderer } );

		this._renderer = renderer;

	}

	toggle() {

		this.enabled = ! this.enabled;

		if ( this.enabled ) {

			this._selectionBox = new SelectionBox( this._camera, this._scene );
			this._selectionDrawer = new SelectionDrawer( this._renderer, 'selectBox' );

			document.addEventListener( 'pointerdown', this._pointerDown );
			document.addEventListener( 'pointerup', this._pointerUp );

		} else {

			this._selectionBox = null;
			this._selectionDrawer = null;

			document.removeEventListener( 'pointerdown', this._pointerDown );
			document.removeEventListener( 'pointerup', this._pointerUp );

		}

	}

	_pointerDown = ( event ) => {

		this._selectionDrawer.onPointerDown( event );

		this._selectionBox.startPoint.set(
			( event.clientX / window.innerWidth ) * 2 - 1,
			- ( event.clientY / window.innerHeight ) * 2 + 1,
			0.5 );

		console.log( 'pointerdown', event );

		document.addEventListener( 'pointermove', this._pointerMove );

	};

	_pointerMove = ( event ) => {

		this._selectionDrawer.onPointerMove( event );

		this._selectionBox.endPoint.set(
			( event.clientX / window.innerWidth ) * 2 - 1,
			- ( event.clientY / window.innerHeight ) * 2 + 1,
			0.5 );

		console.log( 'pointermove', event );

	};

	_pointerUp = ( event ) => {

		this._selectionDrawer.onPointerUp();

		this._selectionBox.endPoint.set(
			( event.clientX / window.innerWidth ) * 2 - 1,
			- ( event.clientY / window.innerHeight ) * 2 + 1,
			0.5 );

		const intersectedMeshes = this._selectionBox.select();

		alert( 'Intersected meshes: ' + ( intersectedMeshes.map( m => m.name ).join( ',' ) || 'Not Found' ) );

		document.removeEventListener( 'pointermove', this._pointerMove );

	};

}

export { MultipleSelection };
