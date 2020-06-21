/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';
import { RemoveObjectCommand } from './commands/RemoveObjectCommand.js';
import { MultiCmdsCommand } from './commands/MultiCmdsCommand.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';

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

	// Clone

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/clone' ) );
	option.onClick( function () {

		var object = editor.selected;

		if ( object.parent === null ) return; // avoid cloning the camera or scene

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

	// Minify shaders

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/edit/minify_shaders' ) );
	option.onClick( function () {

		var root = editor.selected || editor.scene;

		var errors = [];
		var nMaterialsChanged = 0;

		var path = [];

		function getPath( object ) {

			path.length = 0;

			var parent = object.parent;
			if ( parent !== undefined ) getPath( parent );

			path.push( object.name || object.uuid );

			return path;

		}

		var cmds = [];
		root.traverse( function ( object ) {

			var material = object.material;

			if ( material !== undefined && material.isShaderMaterial ) {

				try {

					var shader = glslprep.minifyGlsl( [
						material.vertexShader, material.fragmentShader ] );

					cmds.push( new SetMaterialValueCommand( editor, object, 'vertexShader', shader[ 0 ] ) );
					cmds.push( new SetMaterialValueCommand( editor, object, 'fragmentShader', shader[ 1 ] ) );

					++ nMaterialsChanged;

				} catch ( e ) {

					var path = getPath( object ).join( "/" );

					if ( e instanceof glslprep.SyntaxError )

						errors.push( path + ":" +
								e.line + ":" + e.column + ": " + e.message );

					else {

						errors.push( path +
								": Unexpected error (see console for details)." );

						console.error( e.stack || e );

					}

				}

			}

		} );

		if ( nMaterialsChanged > 0 ) {

			editor.execute( new MultiCmdsCommand( editor, cmds ), 'Minify Shaders' );

		}

		window.alert( nMaterialsChanged +
				" material(s) were changed.\n" + errors.join( "\n" ) );

	} );
	options.add( option );

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
