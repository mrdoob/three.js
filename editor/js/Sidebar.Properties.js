/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Properties = function ( editor ) {

	var strings = editor.strings;

	var container = new UI.TabbedPanel();
	container.setId( 'properties' );

	container.addPanel( 'object', strings.getKey( 'sidebar/properties/object' ), new Sidebar.Object( editor ) );
	container.addPanel( 'geometry', strings.getKey( 'sidebar/properties/geometry' ), new Sidebar.Geometry( editor ) );
	container.addPanel( 'material', strings.getKey( 'sidebar/properties/material' ), new Sidebar.Material( editor ) );

	return container;

};
