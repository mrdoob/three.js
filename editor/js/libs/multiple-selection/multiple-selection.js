import { Object3D } from 'three';
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
		this._selectedMeshes = [];
		this._pointerUpCustomCallback = null;
		this._pointerDownCustomCallback = null;
		this._pointerMoveCustomCallback = null;

	}

	set renderer( renderer ) {

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

	addEventListener( event, callback ) {

		switch ( event ) {

			case 'pointerup':
				this._pointerUpCustomCallback = callback;
				break;
			case 'pointerdown':
				this._pointerDownCustomCallback = callback;
				break;
			case 'pointermove':
				this._pointerMoveCustomCallback = callback;
				break;
			default:
				break;

		}

	}

	_keepOnlyMeshes( sceneObjects ) {

		return sceneObjects.filter( object => object instanceof Object3D && object.isMesh );

	}

	_pointerDown = ( event ) => {

		this._selectionDrawer.onPointerDown( event );

		this._selectionBox.startPoint.set(
			( event.clientX / window.innerWidth ) * 2 - 1,
			- ( event.clientY / window.innerHeight ) * 2 + 1,
			0.5 );

		if ( this._pointerDownCustomCallback ) {

			this._pointerDownCustomCallback( event );

		}

		document.addEventListener( 'pointermove', this._pointerMove );

	};

	_pointerMove = ( event ) => {

		this._selectionDrawer.onPointerMove( event );

		this._selectionBox.endPoint.set(
			( event.clientX / window.innerWidth ) * 2 - 1,
			- ( event.clientY / window.innerHeight ) * 2 + 1,
			0.5 );

		this._selectedMeshes = this._keepOnlyMeshes( this._selectionBox.select() );

		if ( this._pointerMoveCustomCallback ) {

			this._pointerMoveCustomCallback( this._selectedMeshes );

		}

	};

	_pointerUp = ( event ) => {

		this._selectionDrawer.onPointerUp();

		this._selectionBox.endPoint.set(
			( event.clientX / window.innerWidth ) * 2 - 1,
			- ( event.clientY / window.innerHeight ) * 2 + 1,
			0.5 );

		this._selectedMeshes = this._keepOnlyMeshes( this._selectionBox.select() );

		if ( this._pointerUpCustomCallback ) {

			this._pointerUpCustomCallback( this._selectedMeshes );

		}

		document.removeEventListener( 'pointermove', this._pointerMove );

	};

}

export { MultipleSelection };
