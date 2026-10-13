import * as THREE from 'three';

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const _box = new THREE.Box3();
const _vector = new THREE.Vector3();
const _deltaMatrix = new THREE.Matrix4();
const _objectMatrix = new THREE.Matrix4();
const _parentMatrixInverse = new THREE.Matrix4();

class Selector {

	constructor( editor ) {

		const signals = editor.signals;

		this.editor = editor;
		this.signals = signals;

		this.selection = [];

		// an intermediate group used as pivot when transforming multiple objects

		this.group = new THREE.Group();

		this._groupMatrixWorldInverse = new THREE.Matrix4();
		this._memberStates = [];

		// signals

		signals.intersectionsDetected.add( ( intersects, shiftKey ) => {

			if ( intersects.length > 0 ) {

				// Resolve helpers to their actual objects

				const objects = [];

				for ( let i = 0; i < intersects.length; i ++ ) {

					let object = intersects[ i ].object;

					if ( object.userData.object !== undefined ) {

						object = object.userData.object;

					}

					if ( objects.indexOf( object ) === - 1 ) {

						objects.push( object );

					}

				}

				if ( shiftKey === true && this.selection.length > 0 && editor.selected !== editor.scene && editor.selected !== editor.camera ) {

					// Shift-click toggles membership in the current selection

					this.toggle( objects[ 0 ] );

				} else {

					// Cycle through objects if the first one is already selected

					const index = objects.indexOf( editor.selected );

					if ( index !== - 1 && index < objects.length - 1 ) {

						this.select( objects[ index + 1 ] );

					} else {

						this.select( objects[ 0 ] );

					}

				}

			} else {

				if ( shiftKey !== true ) this.select( null ); // keep the selection when shift-clicking empty space

			}

		} );

		signals.objectChanged.add( ( object ) => {

			if ( this.selection.length < 2 ) return;

			if ( object === this.group ) {

				// the group has been transformed (e.g. via TransformControls), sync its members

				this.applyGroupTransform();

			} else if ( this.selection.indexOf( object ) !== - 1 ) {

				// a member has been changed independently (e.g. via undo/redo), re-anchor the pivot

				this.updateGroup();

			}

		} );

	}

	getIntersects( raycaster ) {

		const objects = [];

		this.editor.scene.traverseVisible( function ( child ) {

			objects.push( child );

		} );

		this.editor.sceneHelpers.traverseVisible( function ( child ) {

			if ( child.name === 'picker' || child.userData.object !== undefined ) objects.push( child );

		} );

		return raycaster.intersectObjects( objects, false );

	}

	getPointerIntersects( point, camera ) {

		mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

		raycaster.setFromCamera( mouse, camera );

		return this.getIntersects( raycaster );

	}

	getSelectionBox( target ) {

		target.makeEmpty();

		for ( let i = 0; i < this.selection.length; i ++ ) {

			const object = this.selection[ i ];

			target.expandByObject( object, true );
			target.expandByPoint( object.getWorldPosition( _vector ) ); // objects without geometry (e.g. lights)

		}

		return target;

	}

	select( object ) {

		this.setSelection( object === null ? [] : [ object ] );

	}

	toggle( object ) {

		const selection = this.selection.slice();

		const index = selection.indexOf( object );

		if ( index === - 1 ) {

			selection.push( object );

		} else {

			selection.splice( index, 1 );

		}

		this.setSelection( selection );

	}

	setSelection( objects ) {

		const editor = this.editor;

		const hadGroupSelection = this.group.parent !== null;

		this.selection = objects.slice();

		if ( objects.length > 1 ) {

			editor.sceneHelpers.add( this.group );
			this.updateGroup();

			editor.selected = null;
			editor.config.setKey( 'selected', null );

			this.signals.objectSelected.dispatch( null );

		} else {

			const object = ( objects.length === 1 ) ? objects[ 0 ] : null;

			editor.sceneHelpers.remove( this.group );

			if ( editor.selected === object && hadGroupSelection === false ) return;

			editor.selected = object;
			editor.config.setKey( 'selected', ( object !== null ) ? object.uuid : null );

			this.signals.objectSelected.dispatch( object );

		}

	}

	updateGroup() {

		const group = this.group;

		// use the center of the selection's AABB as pivot point

		this.getSelectionBox( _box ).getCenter( group.position );
		group.quaternion.identity();
		group.scale.set( 1, 1, 1 );
		group.updateWorldMatrix();

		this._groupMatrixWorldInverse.copy( group.matrixWorld ).invert();

		// members with a selected ancestor are updated by that ancestor's transform

		const members = this.selection.filter( ( object ) => hasSelectedAncestor( object, this.selection ) === false );

		this._memberStates = members.map( ( object ) => ( { object: object, matrixWorld: object.matrixWorld.clone() } ) );

	}

	applyGroupTransform() {

		const group = this.group;

		group.updateWorldMatrix();

		_deltaMatrix.multiplyMatrices( group.matrixWorld, this._groupMatrixWorldInverse );

		const states = this._memberStates;

		for ( let i = 0; i < states.length; i ++ ) {

			const object = states[ i ].object;
			const parent = object.parent;

			_objectMatrix.multiplyMatrices( _deltaMatrix, states[ i ].matrixWorld );
			_parentMatrixInverse.copy( parent.matrixWorld ).invert();
			_objectMatrix.premultiply( _parentMatrixInverse );
			_objectMatrix.decompose( object.position, object.quaternion, object.scale );

			object.updateWorldMatrix( false, true );

			const helper = this.editor.helpers[ object.id ];

			if ( helper !== undefined && helper.isSkeletonHelper !== true ) helper.update();

		}

	}

	deselect() {

		this.select( null );

	}

}

function hasSelectedAncestor( object, selection ) {

	let parent = object.parent;

	while ( parent !== null ) {

		if ( selection.indexOf( parent ) !== - 1 ) return true;

		parent = parent.parent;

	}

	return false;

}

export { Selector };
