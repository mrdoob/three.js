/**
 * @author mrdoob / http://mrdoob.com/
 */

import * as THREE from '../../build/three.module.js';

import { UIPanel, UIRow, UIText, UIInput, UIButton, UISpan } from './libs/ui.js';

import { SetGeometryValueCommand } from './commands/SetGeometryValueCommand.js';

import { SidebarGeometryGeometry } from './Sidebar.Geometry.Geometry.js';
import { SidebarGeometryBufferGeometry } from './Sidebar.Geometry.BufferGeometry.js';
import { SidebarGeometryModifiers } from './Sidebar.Geometry.Modifiers.js';

import { SidebarGeometryBoxGeometry } from './Sidebar.Geometry.BoxGeometry.js';
import { SidebarGeometryCircleGeometry } from './Sidebar.Geometry.CircleGeometry.js';
import { SidebarGeometryCylinderGeometry } from './Sidebar.Geometry.CylinderGeometry.js';
import { SidebarGeometryDodecahedronGeometry } from './Sidebar.Geometry.DodecahedronGeometry.js';
import { SidebarGeometryExtrudeGeometry } from './Sidebar.Geometry.ExtrudeGeometry.js';
import { SidebarGeometryIcosahedronGeometry } from './Sidebar.Geometry.IcosahedronGeometry.js';
import { SidebarGeometryLatheGeometry } from './Sidebar.Geometry.LatheGeometry.js';
import { SidebarGeometryOctahedronGeometry } from './Sidebar.Geometry.OctahedronGeometry.js';
import { SidebarGeometryPlaneGeometry } from './Sidebar.Geometry.PlaneGeometry.js';
import { SidebarGeometryRingGeometry } from './Sidebar.Geometry.RingGeometry.js';
import { SidebarGeometryShapeGeometry } from './Sidebar.Geometry.ShapeGeometry.js';
import { SidebarGeometrySphereGeometry } from './Sidebar.Geometry.SphereGeometry.js';
import { SidebarGeometryTeapotBufferGeometry } from './Sidebar.Geometry.TeapotBufferGeometry.js';
import { SidebarGeometryTetrahedronGeometry } from './Sidebar.Geometry.TetrahedronGeometry.js';
import { SidebarGeometryTorusGeometry } from './Sidebar.Geometry.TorusGeometry.js';
import { SidebarGeometryTorusKnotGeometry } from './Sidebar.Geometry.TorusKnotGeometry.js';
import { SidebarGeometryTubeGeometry } from './Sidebar.Geometry.TubeGeometry.js';

var geometryUIClasses = {
	'BoxBufferGeometry': SidebarGeometryBoxGeometry,
	'CircleBufferGeometry': SidebarGeometryCircleGeometry,
	'CylinderBufferGeometry': SidebarGeometryCylinderGeometry,
	'DodecahedronBufferGeometry': SidebarGeometryDodecahedronGeometry,
	'ExtrudeBufferGeometry': SidebarGeometryExtrudeGeometry,
	'IcosahedronBufferGeometry': SidebarGeometryIcosahedronGeometry,
	'LatheBufferGeometry': SidebarGeometryLatheGeometry,
	'OctahedronBufferGeometry': SidebarGeometryOctahedronGeometry,
	'PlaneBufferGeometry': SidebarGeometryPlaneGeometry,
	'RingBufferGeometry': SidebarGeometryRingGeometry,
	'ShapeBufferGeometry': SidebarGeometryShapeGeometry,
	'SphereBufferGeometry': SidebarGeometrySphereGeometry,
	'TeapotBufferGeometry': SidebarGeometryTeapotBufferGeometry,
	'TetrahedronBufferGeometry': SidebarGeometryTetrahedronGeometry,
	'TorusBufferGeometry': SidebarGeometryTorusGeometry,
	'TorusKnotBufferGeometry': SidebarGeometryTorusKnotGeometry,
	'TubeBufferGeometry': SidebarGeometryTubeGeometry
};

var SidebarGeometry = function ( editor ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UIPanel();
	container.setBorderTop( '0' );
	container.setDisplay( 'none' );
	container.setPaddingTop( '20px' );

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

		geometryUUID.setValue( THREE.Math.generateUUID() );

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

	// geometry

	container.add( new SidebarGeometryGeometry( editor ) );

	// buffergeometry

	container.add( new SidebarGeometryBufferGeometry( editor ) );

	// size

	var geometryBoundingSphere = new UIText();

	container.add( new UIText( strings.getKey( 'sidebar/geometry/bounds' ) ).setWidth( '90px' ) );
	container.add( geometryBoundingSphere );

	//

	function build() {

		var object = editor.selected;

		if ( object && object.geometry ) {

			var geometry = object.geometry;

			container.setDisplay( 'block' );

			geometryType.setValue( geometry.type );

			geometryUUID.setValue( geometry.uuid );
			geometryName.setValue( geometry.name );

			//

			parameters.clear();

			if ( geometry.type === 'BufferGeometry' || geometry.type === 'Geometry' ) {

				parameters.add( new SidebarGeometryModifiers( editor, object ) );

			} else if ( geometryUIClasses[ geometry.type ] !== undefined ) {

				parameters.add( new geometryUIClasses[ geometry.type ]( editor, object ) );

			}

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			geometryBoundingSphere.setValue( Math.floor( geometry.boundingSphere.radius * 1000 ) / 1000 );

		} else {

			container.setDisplay( 'none' );

		}

	}

	signals.objectSelected.add( build );
	signals.geometryChanged.add( build );

	return container;

};

export { SidebarGeometry };
