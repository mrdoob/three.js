import * as THREE from '../../build/three.module.js';

import { UIPanel, UIRow, UIText, UIInput, UIButton, UISpan } from './libs/ui.js';

import { SetGeometryValueCommand } from './commands/SetGeometryValueCommand.js';

import { SidebarGeometryBufferGeometry } from './Sidebar.Geometry.BufferGeometry.js';
import { SidebarGeometryModifiers } from './Sidebar.Geometry.Modifiers.js';

import { VertexNormalsHelper } from '../../examples/jsm/helpers/VertexNormalsHelper.js';

function SidebarGeometry( editor ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UIPanel();
	container.setBorderTop( '0' );
	container.setDisplay( 'none' );
	container.setPaddingTop( '20px' );

	var currentGeometryType = null;

	// Actions

	/*
	var objectActions = new UISelect().setPosition( 'absolute' ).setRight( '8px' ).setFontSize( '11px' );
	objectActions.setOptions( {

		'Actions': 'Actions',
		'Center': 'Center',
		'Convert': 'Convert',
		'Flatten': 'Flatten'

	} );
	objectActions.onClick( function ( event ) {

		event.stopPropagation(); // Avoid panel collapsing

	} );
	objectActions.onChange( function ( event ) {

		var action = this.getValue();

		var object = editor.selected;
		var geometry = object.geometry;

		if ( confirm( action + ' ' + object.name + '?' ) === false ) return;

		switch ( action ) {

			case 'Center':

				var offset = geometry.center();

				var newPosition = object.position.clone();
				newPosition.sub( offset );
				editor.execute( new SetPositionCommand( editor, object, newPosition ) );

				editor.signals.geometryChanged.dispatch( object );

				break;

			case 'Convert':

				if ( geometry && geometry.isGeometry ) {

					editor.execute( new SetGeometryCommand( editor, object, new THREE.BufferGeometry().fromGeometry( geometry ) ) );

				}

				break;

			case 'Flatten':

				var newGeometry = geometry.clone();
				newGeometry.uuid = geometry.uuid;
				newGeometry.applyMatrix( object.matrix );

				var cmds = [ new SetGeometryCommand( editor, object, newGeometry ),
					new SetPositionCommand( editor, object, new THREE.Vector3( 0, 0, 0 ) ),
					new SetRotationCommand( editor, object, new THREE.Euler( 0, 0, 0 ) ),
					new SetScaleCommand( editor, object, new THREE.Vector3( 1, 1, 1 ) ) ];

				editor.execute( new MultiCmdsCommand( editor, cmds ), 'Flatten Geometry' );

				break;

		}

		this.setValue( 'Actions' );

	} );
	container.addStatic( objectActions );
	*/

	// type

	var geometryTypeRow = new UIRow();
	var geometryType = new UIText();

	geometryTypeRow.add( new UIText( strings.getKey( 'sidebar/geometry/type' ) ).setWidth( '90px' ) );
	geometryTypeRow.add( geometryType );

	container.add( geometryTypeRow );

	// uuid

	var geometryUUIDRow = new UIRow();
	var geometryUUID = new UIInput().setWidth( '102px' ).setFontSize( '12px' ).setDisabled( true );
	var geometryUUIDRenew = new UIButton( strings.getKey( 'sidebar/geometry/new' ) ).setMarginLeft( '7px' ).onClick( function () {

		geometryUUID.setValue( THREE.MathUtils.generateUUID() );

		editor.execute( new SetGeometryValueCommand( editor, editor.selected, 'uuid', geometryUUID.getValue() ) );

	} );

	geometryUUIDRow.add( new UIText( strings.getKey( 'sidebar/geometry/uuid' ) ).setWidth( '90px' ) );
	geometryUUIDRow.add( geometryUUID );
	geometryUUIDRow.add( geometryUUIDRenew );

	container.add( geometryUUIDRow );

	// name

	var geometryNameRow = new UIRow();
	var geometryName = new UIInput().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

		editor.execute( new SetGeometryValueCommand( editor, editor.selected, 'name', geometryName.getValue() ) );

	} );

	geometryNameRow.add( new UIText( strings.getKey( 'sidebar/geometry/name' ) ).setWidth( '90px' ) );
	geometryNameRow.add( geometryName );

	container.add( geometryNameRow );

	// parameters

	var parameters = new UISpan();
	container.add( parameters );

	// buffergeometry

	container.add( new SidebarGeometryBufferGeometry( editor ) );

	// size

	var geometryBoundingSphere = new UIText();

	container.add( new UIText( strings.getKey( 'sidebar/geometry/bounds' ) ).setWidth( '90px' ) );
	container.add( geometryBoundingSphere );

	// Helpers

	var helpersRow = new UIRow().setMarginTop( '16px' ).setPaddingLeft( '90px' );
	container.add( helpersRow );

	var vertexNormalsButton = new UIButton( strings.getKey( 'sidebar/geometry/show_vertex_normals' ) );
	vertexNormalsButton.onClick( function () {

		var object = editor.selected;

		if ( editor.helpers[ object.id ] === undefined ) {

			var helper = new VertexNormalsHelper( object );
			editor.addHelper( object, helper );

		} else {

			editor.removeHelper( object );

		}

		signals.sceneGraphChanged.dispatch();

	} );
	helpersRow.add( vertexNormalsButton );

	async function build() {

		var object = editor.selected;

		if ( object && object.geometry ) {

			var geometry = object.geometry;

			container.setDisplay( 'block' );

			geometryType.setValue( geometry.type );

			geometryUUID.setValue( geometry.uuid );
			geometryName.setValue( geometry.name );

			//

			if ( currentGeometryType !== geometry.type ) {

				parameters.clear();

				if ( geometry.type === 'BufferGeometry' ) {

					parameters.add( new SidebarGeometryModifiers( editor, object ) );

				} else {

					var { GeometryParametersPanel } = await import( `./Sidebar.Geometry.${ geometry.type }.js` );

					parameters.add( new GeometryParametersPanel( editor, object ) );

				}

				currentGeometryType = geometry.type;

			}

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			geometryBoundingSphere.setValue( Math.floor( geometry.boundingSphere.radius * 1000 ) / 1000 );

		} else {

			container.setDisplay( 'none' );

		}

	}

	signals.objectSelected.add( function () {

		currentGeometryType = null;

		build();

	} );

	signals.geometryChanged.add( build );

	return container;

}

export { SidebarGeometry };
