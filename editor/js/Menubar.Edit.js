import { Box3, Vector3 } from '../../build/three.module.js';

import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';
import { RemoveObjectCommand } from './commands/RemoveObjectCommand.js';
import { SetPositionCommand } from './commands/SetPositionCommand.js';

function MenubarEdit( editor ) {

	var strings = editor.strings;

	var container = new UIPanel();
	container.setClass( 'menu' );

	var title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/edit' ) );
	container.add( title );

	var options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// Undo

	var undo = new UIRow();
	undo.setClass( 'option' );
	undo.setTextContent( strings.getKey( 'menubar/edit/undo' ) );
	undo.onClick( function () {

		editor.undo();

	} );
	options.add( undo );

	// Redo

	var redo = new UIRow();
	redo.setClass( 'option' );
	redo.setTextContent( strings.getKey( 'menubar/edit/redo' ) );
	redo.onClick( function () {

		editor.redo();

	} );
	options.add( redo );

	// Clear History

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/clear_history' ) );
	option.onClick( function () {

		if ( confirm( 'The Undo/Redo History will be cleared. Are you sure?' ) ) {

			editor.history.clear();

		}

	} );
	options.add( option );


	editor.signals.historyChanged.add( function () {

		var history = editor.history;

		undo.setClass( 'option' );
		redo.setClass( 'option' );

		if ( history.undos.length == 0 ) {

			undo.setClass( 'inactive' );

		}

		if ( history.redos.length == 0 ) {

			redo.setClass( 'inactive' );

		}

	} );

	// ---

	options.add( new UIHorizontalRule() );

	// Center

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/center' ) );
	option.onClick( function () {

		var object = editor.selected;

		if ( object === null || object.parent === null ) return; // avoid centering the camera or scene

		const aabb = new Box3().setFromObject( object );
		const center = aabb.getCenter( new Vector3() );
		const newPosition = new Vector3();

		newPosition.x = object.position.x + ( object.position.x - center.x );
		newPosition.y = object.position.y + ( object.position.y - center.y );
		newPosition.z = object.position.z + ( object.position.z - center.z );

		editor.execute( new SetPositionCommand( editor, object, newPosition ) );

	} );
	options.add( option );

	// Clone

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/clone' ) );
	option.onClick( function () {

		var object = editor.selected;

		if ( object === null || object.parent === null ) return; // avoid cloning the camera or scene

		object = object.clone();

		editor.execute( new AddObjectCommand( editor, object ) );

	} );
	options.add( option );

	// Delete

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/delete' ) );
	option.onClick( function () {

		var object = editor.selected;

		if ( object !== null && object.parent !== null ) {

			editor.execute( new RemoveObjectCommand( editor, object ) );

		}

	} );
	options.add( option );

	//

	options.add( new UIHorizontalRule() );

	// Set textures to sRGB. See #15903

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/fixcolormaps' ) );
	option.onClick( function () {

		editor.scene.traverse( fixColorMap );

	} );
	options.add( option );

	var colorMaps = [ 'map', 'envMap', 'emissiveMap' ];

	function fixColorMap( obj ) {

		var material = obj.material;

		if ( material !== undefined ) {

			if ( Array.isArray( material ) === true ) {

				for ( var i = 0; i < material.length; i ++ ) {

					fixMaterial( material[ i ] );

				}

			} else {

				fixMaterial( material );

			}

			editor.signals.sceneGraphChanged.dispatch();

		}

	}

	function fixMaterial( material ) {

		var needsUpdate = material.needsUpdate;

		for ( var i = 0; i < colorMaps.length; i ++ ) {

			var map = material[ colorMaps[ i ] ];

			if ( map ) {

				map.encoding = THREE.sRGBEncoding;
				needsUpdate = true;

			}

		}

		material.needsUpdate = needsUpdate;

	}

	return container;

}

export { MenubarEdit };
