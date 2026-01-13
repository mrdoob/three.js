import { UIPanel, UIText, UITabbedPanel, UIListbox, UIButton } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';
import { SetMaterialCommand } from './commands/SetMaterialCommand.js';

function SidebarProjectResources( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UITabbedPanel();

	// Geometries

	const geometriesTab = new UIPanel();
	geometriesTab.dom.style.borderTop = 'none';
	const geometriesListbox = new UIListbox();
	geometriesListbox.dom.style.height = '140px';
	geometriesListbox.dom.style.resize = 'vertical';
	geometriesListbox.dom.style.marginBottom = '10px';
	geometriesTab.add( geometriesListbox );

	const geometriesAssign = new UIButton( strings.getKey( 'sidebar/project/Assign' ) );
	geometriesTab.add( geometriesAssign );

	const geometriesInfo = new UIText();
	geometriesInfo.dom.style.float = 'right';
	geometriesTab.add( geometriesInfo );
	geometriesAssign.onClick( function () {

		const selectedObject = editor.selected;

		if ( selectedObject !== null && selectedObject.geometry !== undefined ) {

			const selectedId = geometriesListbox.getValue();
			const geometries = Object.values( editor.geometries );
			const geometry = geometries.find( g => g.id === parseInt( selectedId ) );

			if ( geometry !== undefined ) {

				editor.execute( new SetGeometryCommand( editor, selectedObject, geometry ) );

			}

		}

	} );

	container.addTab( 'geometries', strings.getKey( 'sidebar/project/geometries' ), geometriesTab );

	// Materials

	const materialsTab = new UIPanel();
	materialsTab.dom.style.borderTop = 'none';
	const materialsListbox = new UIListbox();
	materialsListbox.dom.style.height = '140px';
	materialsListbox.dom.style.resize = 'vertical';
	materialsListbox.dom.style.marginBottom = '10px';
	materialsTab.add( materialsListbox );

	const materialsAssign = new UIButton( strings.getKey( 'sidebar/project/Assign' ) );
	materialsTab.add( materialsAssign );

	const materialsInfo = new UIText();
	materialsInfo.dom.style.float = 'right';
	materialsTab.add( materialsInfo );

	materialsAssign.onClick( function () {

		const selectedObject = editor.selected;

		if ( selectedObject !== null && selectedObject.material !== undefined ) {

			const selectedId = materialsListbox.getValue();
			const materials = Object.values( editor.materials );
			const material = materials.find( m => m.id === parseInt( selectedId ) );

			if ( material !== undefined ) {

				editor.execute( new SetMaterialCommand( editor, selectedObject, material ) );

			}

		}

	} );

	container.addTab( 'materials', strings.getKey( 'sidebar/project/materials' ), materialsTab );

	// Textures

	const texturesTab = new UIPanel();
	texturesTab.dom.style.borderTop = 'none';
	const texturesListbox = new UIListbox();
	texturesListbox.dom.style.height = '140px';
	texturesListbox.dom.style.resize = 'vertical';
	texturesListbox.dom.style.marginBottom = '10px';
	texturesTab.add( texturesListbox );

	const texturesInfo = new UIText();
	texturesInfo.dom.style.float = 'right';
	texturesTab.add( texturesInfo );

	container.addTab( 'textures', strings.getKey( 'sidebar/project/textures' ), texturesTab );

	container.select( 'geometries' );

	// Signals

	function refreshGeometriesUI() {

		const geometries = Object.values( editor.geometries );

		geometriesListbox.setItems( geometries );
		geometriesInfo.setValue( geometries.length + ' ' + strings.getKey( 'sidebar/project/geometries' ).toLowerCase() );

	}

	function refreshMaterialsUI() {

		const materials = Object.values( editor.materials );

		materialsListbox.setItems( materials );
		materialsInfo.setValue( materials.length + ' ' + strings.getKey( 'sidebar/project/materials' ).toLowerCase() );

	}

	function refreshTexturesUI() {

		const textures = [];
		const texturesUsed = new Set();

		const materials = Object.values( editor.materials );

		for ( const material of materials ) {

			for ( const property in material ) {

				const value = material[ property ];

				if ( value !== null && value !== undefined && value.isTexture === true ) {

					if ( texturesUsed.has( value.uuid ) === false ) {

						textures.push( value );
						texturesUsed.add( value.uuid );

					}

				}

			}

		}

		texturesListbox.setItems( textures );
		texturesInfo.setValue( textures.length + ' ' + strings.getKey( 'sidebar/project/textures' ).toLowerCase() );

	}

	function refreshUI() {

		refreshGeometriesUI();
		refreshMaterialsUI();
		refreshTexturesUI();

	}

	let timeout;

	function refreshUIDelayed() {

		clearTimeout( timeout );

		timeout = setTimeout( refreshUI, 100 );

	}

	signals.editorCleared.add( refreshUIDelayed );
	signals.sceneGraphChanged.add( refreshUIDelayed );
	signals.geometryChanged.add( refreshUIDelayed );
	signals.materialAdded.add( refreshUIDelayed );
	signals.materialChanged.add( refreshUIDelayed );
	signals.materialRemoved.add( refreshUIDelayed );

	signals.objectSelected.add( function ( object ) {

		if ( object !== null ) {

			const geometries = Object.values( editor.geometries );
			const materials = Object.values( editor.materials );

			if ( object.geometry !== undefined ) {

				const geometryIndex = geometries.indexOf( object.geometry );
				geometriesListbox.selectIndex( geometryIndex );

			}

			if ( object.material !== undefined ) {

				const material = Array.isArray( object.material ) ? object.material[ 0 ] : object.material;
				const materialIndex = materials.indexOf( material );
				materialsListbox.selectIndex( materialIndex );

			}

		} else {

			geometriesListbox.selectIndex( - 1 );
			materialsListbox.selectIndex( - 1 );

		}

	} );

	return container;

}

export { SidebarProjectResources };
