import * as THREE from 'three';

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

class Selector {

	constructor( editor ) {

		const signals = editor.signals;

		this.editor = editor;
		this.signals = signals;

		let readyForMultipleSelect = false;
		// signals

		signals.readyForMultipleSelect.add( ( isReady ) => {

			readyForMultipleSelect = isReady;

		} );

		signals.intersectionsDetected.add( ( intersects ) => {

			if ( intersects.length > 0 ) {

				const object = intersects[ 0 ].object;

				if ( object.userData.object !== undefined ) {

					// helper
					if ( readyForMultipleSelect ) {

						this.selectMultiple( object.userData.object );

					} else {

						this.select( object.userData.object );

					}


				} else {

					if ( readyForMultipleSelect ) {

						this.selectMultiple( object );

					} else {

						this.select( object );

					}

				}

			} else {

				this.select( null );

			}

		} );

	}

	getIntersects( raycaster ) {

		const objects = [];

		this.editor.scene.traverseVisible( function ( child ) {

			objects.push( child );

		} );

		this.editor.sceneHelpers.traverseVisible( function ( child ) {

			if ( child.name === 'picker' ) objects.push( child );

		} );

		return raycaster.intersectObjects( objects, false );

	}

	getPointerIntersects( point, camera ) {

		mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

		raycaster.setFromCamera( mouse, camera );

		return this.getIntersects( raycaster );

	}

	selectMultiple( object ) {

		if ( object === null ) {

			this.editor.selectedObjects = [];
			this.editor.config.setKey( 'selectedObjects', [] );
			this.signals.objectsMultipleSelected.dispatch( [] );
			this.editor.selected = null;
			return;

		}

		const selectedObjects = [ ...this.editor.selectedObjects.filter( itm => itm !== object ), object ];
		this.editor.selectedObjects = selectedObjects;
		this.editor.config.setKey( 'selectedObjects', selectedObjects );
		this.signals.objectsMultipleSelected.dispatch( selectedObjects );
		this.editor.selected = object;

	}

	select( object ) {

		if ( this.editor.selected === object ) return;

		let uuid = null;

		if ( object !== null ) {

			uuid = object.uuid;
			this.editor.selectedObjects = [ object ];

		} else {

			this.editor.selectedObjects = [];

		}

		this.editor.selected = object;

		this.editor.config.setKey( 'selected', uuid );
		this.signals.objectSelected.dispatch( object );


	}

	deselect() {

		this.select( null );
		this.signals.objectsMultipleSelected.dispatch( null );

	}

}

export { Selector };
