import { UITabbedPanel } from './libs/ui.js';

import { SidebarObject } from './Sidebar.Object.js';
import { SidebarGeometry } from './Sidebar.Geometry.js';
import { SidebarMaterial } from './Sidebar.Material.js';
import { SidebarScript } from './Sidebar.Script.js';

function SidebarProperties( editor ) {

	const strings = editor.strings;

	const container = new UITabbedPanel();
	container.setId( 'properties' );

	container.addTab( 'objectTab', strings.getKey( 'sidebar/properties/object' ), new SidebarObject( editor ) );
	container.addTab( 'geometryTab', strings.getKey( 'sidebar/properties/geometry' ), new SidebarGeometry( editor, toggleGeometryTab ) );
	container.addTab( 'materialTab', strings.getKey( 'sidebar/properties/material' ), new SidebarMaterial( editor, toggleMaterialTab ) );
	container.addTab( 'scriptTab', strings.getKey( 'sidebar/properties/script' ), new SidebarScript( editor, toggleScriptTab ) );
	container.select( 'objectTab' );

	const geometryTab = getTabByTabId( container.tabs, 'geometryTab' );
	const materialTab = getTabByTabId( container.tabs, 'materialTab' );
	const scriptTab = getTabByTabId( container.tabs, 'scriptTab' );

	function toggleGeometryTab( isShow ) {

		geometryTab.setHidden( ! isShow );

	}

	function toggleMaterialTab( isShow ) {

		materialTab.setHidden( ! isShow );

	}

	function toggleScriptTab( isShow ) {

		scriptTab.setHidden( ! isShow );

	}

	function update( object ) {

		container.setHidden( object === null );

		if ( container.selected === 'goemetryTab' ) {

			container.select( geometryTab.isHidden() ? 'objectTab' : 'geometryTab' );

		} else if ( container.selected === 'materialTab' ) {

			container.select( materialTab.isHidden() ? 'objectTab' : 'materialTab' );

		} else if ( container.selected === 'scriptTab' ) {

			container.select( scriptTab.isHidden() ? 'objectTab' : 'scriptTab' );

		}

	}

	editor.signals.objectSelected.add( update );

	return container;

}

function getTabByTabId( tabs, tabId ) {

	return tabs.find( function ( tab ) {

		return tab.dom.id === tabId;

	} );

}

export { SidebarProperties };
