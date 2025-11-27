import { Tab } from '../ui/Tab.js';
import { List } from '../ui/List.js';
import { Item } from '../ui/Item.js';
import { createValueSpan, setText } from '../ui/utils.js';
import { ValueNumber, ValueCheckbox } from '../ui/Values.js';
import { BoxHelper, MathUtils } from 'three';

class Hierarchy extends Tab {

	constructor( options = {} ) {

		super( 'Hierarchy', options );

		// Create hierarchy list
		const hierarchyList = new List( 'Name', 'Type', 'Visible' );
		hierarchyList.setGridStyle( 'minmax(200px, 2fr) 100px 60px' );
		hierarchyList.domElement.style.minWidth = '400px';

		const scrollWrapper = document.createElement( 'div' );
		scrollWrapper.className = 'list-scroll-wrapper';
		scrollWrapper.appendChild( hierarchyList.domElement );

		// Create property panel container
		const propertyPanel = this.createPropertyPanel();

		// Add both to content
		this.content.appendChild( scrollWrapper );
		this.content.appendChild( propertyPanel );

		// Data structures
		this.hierarchyList = hierarchyList;
		this.itemMap = new Map(); // uuid -> Item
		this.sceneItems = new Map(); // scene uuid -> root Item
		this.scenes = []; // Array of scene references

		// Selection state
		this.selectedObject = null;
		this.selectedItem = null;
		this.boxHelper = null;
		this.currentScene = null;

		// Property panel references
		this.propertyPanel = propertyPanel;

	}

	createPropertyPanel() {

		const panel = document.createElement( 'div' );
		panel.className = 'hierarchy-property-panel';
		panel.style.cssText = 'padding: 10px; border-top: 1px solid var(--border-color, #333); display: none;';

		// Transform section
		const transformHeader = document.createElement( 'div' );
		transformHeader.className = 'property-section-header';
		transformHeader.textContent = '▼ Transform';
		transformHeader.style.cssText = 'font-weight: bold; margin-bottom: 8px; cursor: pointer;';
		panel.appendChild( transformHeader );

		const transformSection = document.createElement( 'div' );
		transformSection.className = 'transform-section';
		transformSection.style.cssText = 'display: grid; grid-template-columns: 70px 1fr 1fr 1fr; gap: 4px; align-items: center;';

		// Position
		const posLabel = document.createElement( 'span' );
		posLabel.textContent = 'Position';
		transformSection.appendChild( posLabel );

		this.posX = new ValueNumber( { value: 0, step: 0.1 } );
		this.posY = new ValueNumber( { value: 0, step: 0.1 } );
		this.posZ = new ValueNumber( { value: 0, step: 0.1 } );

		this.posX.addEventListener( 'change', () => this.onPositionChange() );
		this.posY.addEventListener( 'change', () => this.onPositionChange() );
		this.posZ.addEventListener( 'change', () => this.onPositionChange() );

		transformSection.appendChild( this.posX.domElement );
		transformSection.appendChild( this.posY.domElement );
		transformSection.appendChild( this.posZ.domElement );

		// Rotation (in degrees)
		const rotLabel = document.createElement( 'span' );
		rotLabel.textContent = 'Rotation';
		transformSection.appendChild( rotLabel );

		this.rotX = new ValueNumber( { value: 0, step: 1 } );
		this.rotY = new ValueNumber( { value: 0, step: 1 } );
		this.rotZ = new ValueNumber( { value: 0, step: 1 } );

		this.rotX.addEventListener( 'change', () => this.onRotationChange() );
		this.rotY.addEventListener( 'change', () => this.onRotationChange() );
		this.rotZ.addEventListener( 'change', () => this.onRotationChange() );

		transformSection.appendChild( this.rotX.domElement );
		transformSection.appendChild( this.rotY.domElement );
		transformSection.appendChild( this.rotZ.domElement );

		// Scale
		const scaleLabel = document.createElement( 'span' );
		scaleLabel.textContent = 'Scale';
		transformSection.appendChild( scaleLabel );

		this.scaleX = new ValueNumber( { value: 1, step: 0.01 } );
		this.scaleY = new ValueNumber( { value: 1, step: 0.01 } );
		this.scaleZ = new ValueNumber( { value: 1, step: 0.01 } );

		this.scaleX.addEventListener( 'change', () => this.onScaleChange() );
		this.scaleY.addEventListener( 'change', () => this.onScaleChange() );
		this.scaleZ.addEventListener( 'change', () => this.onScaleChange() );

		transformSection.appendChild( this.scaleX.domElement );
		transformSection.appendChild( this.scaleY.domElement );
		transformSection.appendChild( this.scaleZ.domElement );

		panel.appendChild( transformSection );

		// Object Info section
		const infoHeader = document.createElement( 'div' );
		infoHeader.className = 'property-section-header';
		infoHeader.textContent = '▼ Object Info';
		infoHeader.style.cssText = 'font-weight: bold; margin: 12px 0 8px 0; cursor: pointer;';
		panel.appendChild( infoHeader );

		const infoSection = document.createElement( 'div' );
		infoSection.className = 'info-section';
		infoSection.style.cssText = 'display: grid; grid-template-columns: 70px 1fr; gap: 4px; align-items: center;';

		// Name (editable)
		const nameLabel = document.createElement( 'span' );
		nameLabel.textContent = 'Name';
		infoSection.appendChild( nameLabel );

		this.nameInput = document.createElement( 'input' );
		this.nameInput.type = 'text';
		this.nameInput.style.cssText = 'width: 100%; padding: 2px 4px; background: var(--input-bg, #222); border: 1px solid var(--border-color, #444); color: inherit;';
		this.nameInput.addEventListener( 'change', () => this.onNameChange() );
		infoSection.appendChild( this.nameInput );

		// Type (read-only)
		const typeLabel = document.createElement( 'span' );
		typeLabel.textContent = 'Type';
		infoSection.appendChild( typeLabel );

		this.typeDisplay = document.createElement( 'span' );
		this.typeDisplay.style.cssText = 'color: var(--text-secondary, #888);';
		infoSection.appendChild( this.typeDisplay );

		// Visible (checkbox)
		const visibleLabel = document.createElement( 'span' );
		visibleLabel.textContent = 'Visible';
		infoSection.appendChild( visibleLabel );

		this.visibleCheckbox = new ValueCheckbox( { value: true } );
		this.visibleCheckbox.addEventListener( 'change', () => this.onVisibleChange() );
		infoSection.appendChild( this.visibleCheckbox.domElement );

		panel.appendChild( infoSection );

		return panel;

	}

	onPositionChange() {

		if ( ! this.selectedObject ) return;

		this.selectedObject.position.set(
			this.posX.getValue(),
			this.posY.getValue(),
			this.posZ.getValue()
		);

		this.updateBoxHelper();

	}

	onRotationChange() {

		if ( ! this.selectedObject ) return;

		this.selectedObject.rotation.set(
			MathUtils.degToRad( this.rotX.getValue() ),
			MathUtils.degToRad( this.rotY.getValue() ),
			MathUtils.degToRad( this.rotZ.getValue() )
		);

		this.updateBoxHelper();

	}

	onScaleChange() {

		if ( ! this.selectedObject ) return;

		this.selectedObject.scale.set(
			this.scaleX.getValue(),
			this.scaleY.getValue(),
			this.scaleZ.getValue()
		);

		this.updateBoxHelper();

	}

	onNameChange() {

		if ( ! this.selectedObject ) return;

		this.selectedObject.name = this.nameInput.value;

		// Update the tree item
		const item = this.itemMap.get( this.selectedObject.uuid );

		if ( item && item.userData.nameSpan ) {

			setText( item.userData.nameSpan, this.selectedObject.name || '(unnamed)' );

		}

	}

	onVisibleChange() {

		if ( ! this.selectedObject ) return;

		this.selectedObject.visible = this.visibleCheckbox.getValue();

		// Update the tree item
		const item = this.itemMap.get( this.selectedObject.uuid );

		if ( item && item.userData.visibleSpan ) {

			setText( item.userData.visibleSpan, this.selectedObject.visible ? 'yes' : 'no' );

		}

	}

	updatePropertyPanel() {

		if ( ! this.selectedObject ) {

			this.propertyPanel.style.display = 'none';
			return;

		}

		this.propertyPanel.style.display = 'block';

		const obj = this.selectedObject;

		// Position
		this.posX.setValue( obj.position.x );
		this.posY.setValue( obj.position.y );
		this.posZ.setValue( obj.position.z );

		// Rotation (convert to degrees)
		this.rotX.setValue( MathUtils.radToDeg( obj.rotation.x ) );
		this.rotY.setValue( MathUtils.radToDeg( obj.rotation.y ) );
		this.rotZ.setValue( MathUtils.radToDeg( obj.rotation.z ) );

		// Scale
		this.scaleX.setValue( obj.scale.x );
		this.scaleY.setValue( obj.scale.y );
		this.scaleZ.setValue( obj.scale.z );

		// Info
		this.nameInput.value = obj.name || '';
		this.typeDisplay.textContent = obj.type;
		this.visibleCheckbox.setValue( obj.visible );

	}

	selectObject( object3D, scene ) {

		// Deselect previous
		if ( this.selectedItem ) {

			this.selectedItem.itemRow.classList.remove( 'selected' );

		}

		// Remove previous BoxHelper
		if ( this.boxHelper && this.currentScene ) {

			this.currentScene.remove( this.boxHelper );
			this.boxHelper.dispose();
			this.boxHelper = null;

		}

		this.selectedObject = object3D;
		this.currentScene = scene;

		if ( object3D ) {

			// Highlight tree item
			const item = this.itemMap.get( object3D.uuid );

			if ( item ) {

				item.itemRow.classList.add( 'selected' );
				this.selectedItem = item;

			}

			// Create BoxHelper (only for objects with geometry or children)
			if ( object3D.isObject3D && ! object3D.isScene ) {

				this.boxHelper = new BoxHelper( object3D, 0x00aaff );
				this.boxHelper.name = '__inspector_selection__';

				if ( scene ) {

					scene.add( this.boxHelper );

				}

			}

		} else {

			this.selectedItem = null;

		}

		this.updatePropertyPanel();

	}

	updateBoxHelper() {

		if ( this.boxHelper && this.selectedObject ) {

			this.boxHelper.update();

		}

	}

	updateFromScenes( scenes ) {

		this.scenes = scenes;

		const currentUuids = new Set();

		for ( const scene of scenes ) {

			currentUuids.add( scene.uuid );
			this.updateSceneHierarchy( scene );

		}

		// Remove scenes no longer being rendered
		for ( const [ uuid, item ] of this.sceneItems ) {

			if ( ! currentUuids.has( uuid ) ) {

				this.hierarchyList.remove( item );
				this.sceneItems.delete( uuid );
				this.removeItemAndDescendants( item );

			}

		}

		// Update BoxHelper position
		this.updateBoxHelper();

		// Update property panel values (for live transform updates)
		if ( this.selectedObject ) {

			this.updatePropertyPanelValues();

		}

	}

	updatePropertyPanelValues() {

		// Only update if not focused (avoid overwriting user input)
		const activeElement = document.activeElement;
		const isInputFocused = activeElement && ( activeElement.tagName === 'INPUT' );

		if ( isInputFocused ) return;

		const obj = this.selectedObject;

		// Check if values changed
		if ( this.posX.getValue() !== obj.position.x ) this.posX.setValue( obj.position.x );
		if ( this.posY.getValue() !== obj.position.y ) this.posY.setValue( obj.position.y );
		if ( this.posZ.getValue() !== obj.position.z ) this.posZ.setValue( obj.position.z );

		const rotXDeg = MathUtils.radToDeg( obj.rotation.x );
		const rotYDeg = MathUtils.radToDeg( obj.rotation.y );
		const rotZDeg = MathUtils.radToDeg( obj.rotation.z );

		if ( Math.abs( this.rotX.getValue() - rotXDeg ) > 0.01 ) this.rotX.setValue( rotXDeg );
		if ( Math.abs( this.rotY.getValue() - rotYDeg ) > 0.01 ) this.rotY.setValue( rotYDeg );
		if ( Math.abs( this.rotZ.getValue() - rotZDeg ) > 0.01 ) this.rotZ.setValue( rotZDeg );

		if ( this.scaleX.getValue() !== obj.scale.x ) this.scaleX.setValue( obj.scale.x );
		if ( this.scaleY.getValue() !== obj.scale.y ) this.scaleY.setValue( obj.scale.y );
		if ( this.scaleZ.getValue() !== obj.scale.z ) this.scaleZ.setValue( obj.scale.z );

	}

	updateSceneHierarchy( scene ) {

		let rootItem = this.sceneItems.get( scene.uuid );

		if ( ! rootItem ) {

			rootItem = this.createObjectItem( scene );
			this.hierarchyList.add( rootItem );
			this.sceneItems.set( scene.uuid, rootItem );

		} else {

			this.updateObjectItem( rootItem, scene );

		}

		this.syncChildren( scene, rootItem, scene );

	}

	createObjectItem( object3D ) {

		const nameSpan = createValueSpan();
		nameSpan.textContent = object3D.name || '(unnamed)';

		const typeSpan = createValueSpan();
		typeSpan.textContent = object3D.type;

		const visibleSpan = createValueSpan();
		visibleSpan.textContent = object3D.visible ? 'yes' : 'no';

		const item = new Item( nameSpan, typeSpan, visibleSpan );
		item.userData.uuid = object3D.uuid;
		item.userData.object3D = object3D;
		item.userData.nameSpan = nameSpan;
		item.userData.typeSpan = typeSpan;
		item.userData.visibleSpan = visibleSpan;

		// Add click handler for selection
		item.itemRow.addEventListener( 'click', ( e ) => {

			// Don't select when clicking expand/collapse toggle
			if ( e.target.classList.contains( 'item-toggler' ) ) return;

			// Find the scene this object belongs to
			let scene = null;

			for ( const s of this.scenes ) {

				if ( s.uuid === object3D.uuid || this.isDescendantOf( object3D, s ) ) {

					scene = s;
					break;

				}

			}

			this.selectObject( object3D, scene );

		} );

		// Style for selection
		item.itemRow.style.cursor = 'pointer';

		this.itemMap.set( object3D.uuid, item );

		return item;

	}

	isDescendantOf( object3D, potentialAncestor ) {

		let current = object3D.parent;

		while ( current ) {

			if ( current === potentialAncestor ) return true;
			current = current.parent;

		}

		return false;

	}

	updateObjectItem( item, object3D ) {

		setText( item.userData.nameSpan, object3D.name || '(unnamed)' );
		setText( item.userData.typeSpan, object3D.type );
		setText( item.userData.visibleSpan, object3D.visible ? 'yes' : 'no' );

	}

	syncChildren( object3D, parentItem, scene ) {

		const existingChildren = new Map();

		for ( const childItem of parentItem.children ) {

			existingChildren.set( childItem.userData.uuid, childItem );

		}

		const currentChildUuids = new Set();

		for ( let i = 0; i < object3D.children.length; i ++ ) {

			const child = object3D.children[ i ];

			// Skip inspector helpers
			if ( child.name === '__inspector_selection__' ) continue;

			currentChildUuids.add( child.uuid );

			let childItem = existingChildren.get( child.uuid );

			if ( ! childItem ) {

				childItem = this.createObjectItem( child );
				parentItem.add( childItem, i );

			} else {

				this.updateObjectItem( childItem, child );

				const currentIndex = parentItem.children.indexOf( childItem );

				if ( currentIndex !== i ) {

					parentItem.add( childItem, i );

				}

			}

			this.syncChildren( child, childItem, scene );

		}

		// Remove children that no longer exist
		for ( const [ uuid, childItem ] of existingChildren ) {

			if ( ! currentChildUuids.has( uuid ) ) {

				parentItem.remove( childItem );
				this.removeItemAndDescendants( childItem );

				// Clear selection if removed object was selected
				if ( this.selectedObject && this.selectedObject.uuid === uuid ) {

					this.selectObject( null, null );

				}

			}

		}

	}

	removeItemAndDescendants( item ) {

		this.itemMap.delete( item.userData.uuid );

		for ( const child of item.children ) {

			this.removeItemAndDescendants( child );

		}

	}

}

export { Hierarchy };
