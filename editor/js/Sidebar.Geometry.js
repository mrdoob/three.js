import * as THREE from 'three';

import { UIPanel, UIRow, UIText, UIInput, UIButton, UISpan } from './libs/ui.js';

import { SetGeometryValueCommand } from './commands/SetGeometryValueCommand.js';

import { SidebarGeometryBufferGeometry } from './Sidebar.Geometry.BufferGeometry.js';
import { SidebarGeometryModifiers } from './Sidebar.Geometry.Modifiers.js';

import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

function SidebarGeometry( editor ) {

	const strings = editor.strings;

	const signals = editor.signals;

	const container = new UIPanel();
	container.setBorderTop( '0' );
	container.setDisplay( 'none' );
	container.setPaddingTop( '20px' );

	let currentGeometryType = null;

	// Actions

	/*
	let objectActions = new UISelect().setPosition( 'absolute' ).setRight( '8px' ).setFontSize( '11px' );
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

		let action = this.getValue();

		let object = editor.selected;
		let geometry = object.geometry;

		if ( confirm( action + ' ' + object.name + '?' ) === false ) return;

		switch ( action ) {

			case 'Center':

				let offset = geometry.center();

				let newPosition = object.position.clone();
				newPosition.sub( offset );
				editor.execute( new SetPositionCommand( editor, object, newPosition ) );

				editor.signals.geometryChanged.dispatch( object );

				break;

			case 'Flatten':

				let newGeometry = geometry.clone();
				newGeometry.uuid = geometry.uuid;
				newGeometry.applyMatrix( object.matrix );

				let cmds = [ new SetGeometryCommand( editor, object, newGeometry ),
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

	const geometryTypeRow = new UIRow();
	const geometryType = new UIText();

	geometryTypeRow.add( new UIText( strings.getKey( 'sidebar/geometry/type' ) ).setWidth( '90px' ) );
	geometryTypeRow.add( geometryType );

	container.add( geometryTypeRow );

	// uuid

	const geometryUUIDRow = new UIRow();
	const geometryUUID = new UIInput().setWidth( '102px' ).setFontSize( '12px' ).setDisabled( true );
	const geometryUUIDRenew = new UIButton( strings.getKey( 'sidebar/geometry/new' ) ).setMarginLeft( '7px' ).onClick( function () {

		geometryUUID.setValue( THREE.MathUtils.generateUUID() );

		editor.execute( new SetGeometryValueCommand( editor, editor.selected, 'uuid', geometryUUID.getValue() ) );

	} );

	geometryUUIDRow.add( new UIText( strings.getKey( 'sidebar/geometry/uuid' ) ).setWidth( '90px' ) );
	geometryUUIDRow.add( geometryUUID );
	geometryUUIDRow.add( geometryUUIDRenew );

	container.add( geometryUUIDRow );

	// name

	const geometryNameRow = new UIRow();
	const geometryName = new UIInput().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

		editor.execute( new SetGeometryValueCommand( editor, editor.selected, 'name', geometryName.getValue() ) );

	} );

	geometryNameRow.add( new UIText( strings.getKey( 'sidebar/geometry/name' ) ).setWidth( '90px' ) );
	geometryNameRow.add( geometryName );

	container.add( geometryNameRow );

	// parameters

	const parameters = new UISpan();
	container.add( parameters );

	// buffergeometry

	container.add( new SidebarGeometryBufferGeometry( editor ) );

	// Size

	const geometryBoundingBox = new UIText().setFontSize( '12px' );

	const geometryBoundingBoxRow = new UIRow();
	geometryBoundingBoxRow.add( new UIText( strings.getKey( 'sidebar/geometry/bounds' ) ).setWidth( '90px' ) );
	geometryBoundingBoxRow.add( geometryBoundingBox );
	container.add( geometryBoundingBoxRow );

	// Helpers

	const helpersRow = new UIRow().setPaddingLeft( '90px' );
	container.add( helpersRow );

	const vertexNormalsButton = new UIButton( strings.getKey( 'sidebar/geometry/show_vertex_normals' ) );
	vertexNormalsButton.onClick( function () {

		const object = editor.selected;

		if ( editor.helpers[ object.id ] === undefined ) {

			editor.addHelper( object, new VertexNormalsHelper( object ) );

		} else {

			editor.removeHelper( object );

		}

		signals.sceneGraphChanged.dispatch();

	} );
	helpersRow.add( vertexNormalsButton );

	async function build() {

		const object = editor.selected;

		if ( object && object.geometry ) {

			const geometry = object.geometry;

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

					const { GeometryParametersPanel } = await import( `./Sidebar.Geometry.${ geometry.type }.js` );

					parameters.add( new GeometryParametersPanel( editor, object ) );

				}

				currentGeometryType = geometry.type;

			}

			if ( geometry.boundingBox === null ) geometry.computeBoundingBox();

			const boundingBox = geometry.boundingBox;
			const x = Math.floor( ( boundingBox.max.x - boundingBox.min.x ) * 1000 ) / 1000;
			const y = Math.floor( ( boundingBox.max.y - boundingBox.min.y ) * 1000 ) / 1000;
			const z = Math.floor( ( boundingBox.max.z - boundingBox.min.z ) * 1000 ) / 1000;

			geometryBoundingBox.setInnerHTML( `${x}<br/>${y}<br/>${z}` );

			helpersRow.setDisplay( geometry.hasAttribute( 'normal' ) ? '' : 'none' );

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
