/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Properties = function ( editor ) {

	var strings = editor.strings;

	var container = new UI.TabbedPanel();
	container.setId( 'properties' );

	container.addTab( 'object', strings.getKey( 'sidebar/properties/object' ), new Sidebar.Object( editor ) );
	container.addTab( 'geometry', strings.getKey( 'sidebar/properties/geometry' ), new Sidebar.Geometry( editor ) );
	container.addTab( 'material', strings.getKey( 'sidebar/properties/material' ), new Sidebar.Material( editor ) );
	container.select( 'object' );

	return container;

};
