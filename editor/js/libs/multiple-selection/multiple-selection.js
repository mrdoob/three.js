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
		this._hiddenOriginalMeshes = [];
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

			this._renderer.domElement.parentElement.addEventListener( 'pointerdown', this._pointerDown );
			this._renderer.domElement.parentElement.addEventListener( 'pointerup', this._pointerUp );

		} else {

			this._selectionBox = null;
			this._selectionDrawer = null;

			this._renderer.domElement.parentElement.removeEventListener( 'pointerdown', this._pointerDown );
			this._renderer.domElement.parentElement.removeEventListener( 'pointerup', this._pointerUp );

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

	_displayOriginalMeshes() {

		this._hiddenOriginalMeshes.forEach( mesh => {

			mesh.visible = true;

		} );

		this._hiddenOriginalMeshes = [];

	}

	_hideOriginalMeshes( clonedMeshes ) {

		clonedMeshes.forEach( mesh => {

			mesh._original_mesh.visible = false;
			this._hiddenOriginalMeshes.push( mesh._original_mesh );

		} );

	}

	_cloneMeshes( meshes ) {

		return meshes.map( mesh => {

			const clone = mesh.clone();
			clone._original_mesh = mesh;

			return clone;

		} );

	}

	_keepOnlyMeshes( sceneObjects ) {

		return sceneObjects.filter( object => object instanceof Object3D && object.isMesh );

	}

	_getCursorPosition( event ) {

		const rect = event.target.getBoundingClientRect();

		const x = ( ( event.clientX - rect.x ) / rect.width ) * 2 - 1;
		const y = - ( ( event.clientY - rect.y ) / rect.height ) * 2 + 1;

		return { x, y };

	}

	_pointerDown = ( event ) => {

		this._displayOriginalMeshes();

		this._selectionDrawer.onPointerDown( event );

		const cursorPosition = this._getCursorPosition( event );

		this._selectionBox.startPoint.set( cursorPosition.x, cursorPosition.y, 0.5 );

		if ( this._pointerDownCustomCallback ) {

			this._pointerDownCustomCallback( event );

		}

		this._renderer.domElement.parentElement.addEventListener( 'pointermove', this._pointerMove );

	};

	_pointerMove = ( event ) => {

		this._selectionDrawer.onPointerMove( event );

		const cursorPosition = this._getCursorPosition( event );

		this._selectionBox.endPoint.set( cursorPosition.x, cursorPosition.y, 0.5 );

		if ( this._pointerMoveCustomCallback ) {

			this._pointerMoveCustomCallback( this._selectedMeshes );

		}

	};

	_pointerUp = ( event ) => {

		this._selectionDrawer.onPointerUp();

		const cursorPosition = this._getCursorPosition( event );

		this._selectionBox.endPoint.set( cursorPosition.x, cursorPosition.y, 0.5 );

		this._selectedMeshes = this._cloneMeshes( this._keepOnlyMeshes( this._selectionBox.select() ) );

		this._hideOriginalMeshes( this._selectedMeshes );

		if ( this._pointerUpCustomCallback ) {

			this._pointerUpCustomCallback( this._selectedMeshes );

		}

		this._renderer.domElement.parentElement.removeEventListener( 'pointermove', this._pointerMove );

	};

}

export { MultipleSelection };
