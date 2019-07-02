/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UISpan, UIDiv, UIText } from './libs/ui.js';

import { SidebarObject } from './Sidebar.Object.js';
import { SidebarGeometry } from './Sidebar.Geometry.js';
import { SidebarMaterial } from './Sidebar.Material.js';

var SidebarProperties = function ( editor ) {

	var strings = editor.strings;

	var container = new UISpan();

	var objectTab = new UIText( strings.getKey( 'sidebar/properties/object' ) ).setTextTransform( 'uppercase' );
	objectTab.onClick( function () {

		select( 'OBJECT' );

	} );

	var geometryTab = new UIText( strings.getKey( 'sidebar/properties/geometry' ) ).setTextTransform( 'uppercase' );
	geometryTab.onClick( function () {

		select( 'GEOMETRY' );

	} );

	var materialTab = new UIText( strings.getKey( 'sidebar/properties/material' ) ).setTextTransform( 'uppercase' );
	materialTab.onClick( function () {

		select( 'MATERIAL' );

	} );

	var tabs = new UIDiv();
	tabs.setId( 'tabs' );
	tabs.add( objectTab, geometryTab, materialTab );
	container.add( tabs );

	//

	var object = new UISpan().add(
		new SidebarObject( editor )
	);
	container.add( object );

	var geometry = new UISpan().add(
		new SidebarGeometry( editor )
	);
	container.add( geometry );

	var material = new UISpan().add(
		new SidebarMaterial( editor )
	);
	container.add( material );

	//

	function select( section ) {

		objectTab.setClass( '' );
		geometryTab.setClass( '' );
		materialTab.setClass( '' );

		object.setDisplay( 'none' );
		geometry.setDisplay( 'none' );
		material.setDisplay( 'none' );

		switch ( section ) {

			case 'OBJECT':
				objectTab.setClass( 'selected' );
				object.setDisplay( '' );
				break;
			case 'GEOMETRY':
				geometryTab.setClass( 'selected' );
				geometry.setDisplay( '' );
				break;
			case 'MATERIAL':
				materialTab.setClass( 'selected' );
				material.setDisplay( '' );
				break;

		}

	}

	select( 'OBJECT' );

	return container;

};

export { SidebarProperties };
