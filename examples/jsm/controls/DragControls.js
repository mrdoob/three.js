import { Controls } from './Controls.js';

var _intersectedObjects = [];
var _hoveredObjects = {};
var _selectedObjects = {};

class DragControls extends Controls {

	constructor( objects, camera, domElement ) {

		super( camera, domElement );

		this.objects = objects;

		this.transformGroup = false;

		const _onEnabledChanged = ( event ) => {

			if ( !event.value ) this.domElement.style.cursor = '';

		}

		this.addEventListener( 'enabled-changed', _onEnabledChanged );

		// Deprecation warnings

		this.getObjects = function() {

			console.warn( 'THREE.DragControls: getObjects() is deprecated. Use `objects` property instead.' );
			return this.objects;

		}

		this.activate = function() {

			this.enabled = true;
			console.warn( 'THREE.DragControls: activate() is deprecated. Set `enabled` property to `false` instead.' );

		}

		this.deactivate = function() {

			this.enabled = false;
			console.warn( 'THREE.DragControls: activate() is deprecated. Set `enabled` property to `true` instead.' );

		}

	}

	onTrackedPointerHover( pointer ) {

		_intersectedObjects = pointer.intersectObjects( this.objects );

		var _hoveredObject = _hoveredObjects[ pointer.pointerId ];

		if ( _intersectedObjects.length > 0 ) {

			var object = _intersectedObjects[ 0 ].object;

			if ( _hoveredObject !== object ) {

				if ( _hoveredObject ) this.dispatchEvent( { type: 'hoveroff', object: _hoveredObject } );

				this.domElement.style.cursor = 'pointer';

				this.dispatchEvent( { type: 'hoveron', object: object } );

				_hoveredObjects[ pointer.pointerId ] = object;

			}

		} else if ( _hoveredObject ) {

				this.dispatchEvent( { type: 'hoveroff', object: _hoveredObject } );

				this.domElement.style.cursor = 'auto';

				delete _hoveredObjects[ pointer.pointerId ];

		}

	}

	onTrackedPointerDown( pointer ) {

		this.domElement.style.cursor = 'move';

		_intersectedObjects = pointer.intersectObjects( this.objects );

		if ( _intersectedObjects.length > 0 ) {

			var object = ( this.transformGroup === true ) ? this.objects[ 0 ] : _intersectedObjects[ 0 ].object;

			this.target.setFromMatrixPosition( object.matrixWorld )

			this.domElement.style.cursor = 'move';

			this.dispatchEvent( { type: 'dragstart', object: object } );

			_selectedObjects[ pointer.pointerId ] = object

		}

	}

	onTrackedPointerMove( pointer ) {

		var _selectedObject = _selectedObjects[ pointer.pointerId ];

		if ( _selectedObject ) {

			_selectedObject.position.add( pointer.world.movement );

			this.dispatchEvent( { type: 'drag', object: _selectedObject } );

		}

	}

	onTrackedPointerUp( pointer, pointers ) {

		for ( const id in _selectedObjects ) {

			if ( pointer.pointerId === id ) {

				this.dispatchEvent( { type: 'dragend', object: _selectedObjects[ id ] } );

				delete _selectedObjects[ id ];

			}

		}

		for ( const id in _hoveredObjects ) {

			if ( pointer.pointerId === id ) {

				this.dispatchEvent( { type: 'hoveroff', object: _hoveredObjects[ id ] } );

				delete _hoveredObjects[ id ];

			}

		}

		if ( pointers.length === 0 ) this.domElement.style.cursor = Object.keys(_hoveredObjects).length ? 'pointer' : 'auto';

	}

};

export { DragControls };
