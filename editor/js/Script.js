/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UIElement, UIPanel, UIText } from './libs/ui.js';

import { SetScriptValueCommand } from './commands/SetScriptValueCommand.js';
import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';

function Script( editor ) {

	var signals = editor.signals;

	var container = new UIPanel();
	container.setId( 'script' );
	container.setPosition( 'absolute' );
	container.setBackgroundColor( '#272822' );
	container.setDisplay( 'none' );

	var header = new UIPanel();
	header.setPadding( '10px' );
	container.add( header );

	var title = new UIText().setColor( '#fff' );
	header.add( title );

	var buttonSVG = ( function () {

		var svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		svg.setAttribute( 'width', 32 );
		svg.setAttribute( 'height', 32 );
		var path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
		path.setAttribute( 'd', 'M 12,12 L 22,22 M 22,12 12,22' );
		path.setAttribute( 'stroke', '#fff' );
		svg.appendChild( path );
		return svg;

	} )();

	var close = new UIElement( buttonSVG );
	close.setPosition( 'absolute' );
	close.setTop( '3px' );
	close.setRight( '1px' );
	close.setCursor( 'pointer' );
	close.onClick( function () {

		container.setDisplay( 'none' );

	} );
	header.add( close );


	var renderer;

	signals.rendererChanged.add( function ( newRenderer ) {

		renderer = newRenderer;

	} );


	var delay;
	var currentMode;
	var currentScript;
	var currentObject;

	var codemirror = CodeMirror( container.dom, {
		value: '',
		lineNumbers: true,
		matchBrackets: true,
		indentWithTabs: true,
		tabSize: 4,
		indentUnit: 4,
		hintOptions: {
			completeSingle: false
		}
	} );
	codemirror.setOption( 'theme', 'monokai' );
	codemirror.on( 'change', function () {

		if ( codemirror.state.focused === false ) return;

		clearTimeout( delay );
		delay = setTimeout( function () {

			var value = codemirror.getValue();

			if ( ! validate( value ) ) return;

			if ( typeof ( currentScript ) === 'object' ) {

				if ( value !== currentScript.source ) {

					editor.execute( new SetScriptValueCommand( editor, currentObject, currentScript, 'source', value ) );

				}
				return;

			}

			if ( currentScript !== 'programInfo' ) return;

			var json = JSON.parse( value );

			if ( JSON.stringify( currentObject.material.defines ) !== JSON.stringify( json.defines ) ) {

				var cmd = new SetMaterialValueCommand( editor, currentObject, 'defines', json.defines );
				cmd.updatable = false;
				editor.execute( cmd );

			}
			if ( JSON.stringify( currentObject.material.uniforms ) !== JSON.stringify( json.uniforms ) ) {

				var cmd = new SetMaterialValueCommand( editor, currentObject, 'uniforms', json.uniforms );
				cmd.updatable = false;
				editor.execute( cmd );

			}
			if ( JSON.stringify( currentObject.material.attributes ) !== JSON.stringify( json.attributes ) ) {

				var cmd = new SetMaterialValueCommand( editor, currentObject, 'attributes', json.attributes );
				cmd.updatable = false;
				editor.execute( cmd );

			}

		}, 300 );

	} );

	// prevent backspace from deleting objects
	var wrapper = codemirror.getWrapperElement();
	wrapper.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

	} );

	// validate

	var errorLines = [];
	var widgets = [];

	var validate = function ( string ) {

		var valid;
		var errors = [];

		return codemirror.operation( function () {

			while ( errorLines.length > 0 ) {

				codemirror.removeLineClass( errorLines.shift(), 'background', 'errorLine' );

			}

			while ( widgets.length > 0 ) {

				codemirror.removeLineWidget( widgets.shift() );

			}

			//

			switch ( currentMode ) {

				case 'javascript':

					try {

						var syntax = esprima.parse( string, { tolerant: true } );
						errors = syntax.errors;

					} catch ( error ) {

						errors.push( {

							lineNumber: error.lineNumber - 1,
							message: error.message

						} );

					}

					for ( var i = 0; i < errors.length; i ++ ) {

						var error = errors[ i ];
						error.message = error.message.replace( /Line [0-9]+: /, '' );

					}

					break;

				case 'json':

					errors = [];

					jsonlint.parseError = function ( message, info ) {

						message = message.split( '\n' )[ 3 ];

						errors.push( {

							lineNumber: info.loc.first_line - 1,
							message: message

						} );

					};

					try {

						jsonlint.parse( string );

					} catch ( error ) {

						// ignore failed error recovery

					}

					break;

				case 'glsl':

					try {

						var shaderType = currentScript === 'vertexShader' ?
							glslprep.Shader.VERTEX : glslprep.Shader.FRAGMENT;

						glslprep.parseGlsl( string, shaderType );

					} catch ( error ) {

						if ( error instanceof glslprep.SyntaxError ) {

							errors.push( {

								lineNumber: error.line,
								message: "Syntax Error: " + error.message

							} );

						} else {

							console.error( error.stack || error );

						}

					}

					if ( errors.length !== 0 ) break;
					if ( renderer instanceof THREE.WebGLRenderer === false ) break;

					currentObject.material[ currentScript ] = string;
					currentObject.material.needsUpdate = true;
					signals.materialChanged.dispatch( currentObject.material );

					var programs = renderer.info.programs;

					valid = true;
					var parseMessage = /^(?:ERROR|WARNING): \d+:(\d+): (.*)/g;

					for ( var i = 0, n = programs.length; i !== n; ++ i ) {

						var diagnostics = programs[ i ].diagnostics;

						if ( diagnostics === undefined ||
								diagnostics.material !== currentObject.material ) continue;

						if ( ! diagnostics.runnable ) valid = false;

						var shaderInfo = diagnostics[ currentScript ];
						var lineOffset = shaderInfo.prefix.split( /\r\n|\r|\n/ ).length;

						while ( true ) {

							var parseResult = parseMessage.exec( shaderInfo.log );
							if ( parseResult === null ) break;

							errors.push( {

								lineNumber: parseResult[ 1 ] - lineOffset,
								message: parseResult[ 2 ]

							} );

						} // messages

						break;

					} // programs

			} // mode switch

			for ( var i = 0; i < errors.length; i ++ ) {

				var error = errors[ i ];

				var message = document.createElement( 'div' );
				message.className = 'esprima-error';
				message.textContent = error.message;

				var lineNumber = Math.max( error.lineNumber, 0 );
				errorLines.push( lineNumber );

				codemirror.addLineClass( lineNumber, 'background', 'errorLine' );

				var widget = codemirror.addLineWidget( lineNumber, message );

				widgets.push( widget );

			}

			return valid !== undefined ? valid : errors.length === 0;

		} );

	};

	// tern js autocomplete

	var server = new CodeMirror.TernServer( {
		caseInsensitive: true,
		plugins: { threejs: null }
	} );

	codemirror.setOption( 'extraKeys', {
		'Ctrl-Space': function ( cm ) {

			server.complete( cm );

		},
		'Ctrl-I': function ( cm ) {

			server.showType( cm );

		},
		'Ctrl-O': function ( cm ) {

			server.showDocs( cm );

		},
		'Alt-.': function ( cm ) {

			server.jumpToDef( cm );

		},
		'Alt-,': function ( cm ) {

			server.jumpBack( cm );

		},
		'Ctrl-Q': function ( cm ) {

			server.rename( cm );

		},
		'Ctrl-.': function ( cm ) {

			server.selectName( cm );

		}
	} );

	codemirror.on( 'cursorActivity', function ( cm ) {

		if ( currentMode !== 'javascript' ) return;
		server.updateArgHints( cm );

	} );

	codemirror.on( 'keypress', function ( cm, kb ) {

		if ( currentMode !== 'javascript' ) return;
		var typed = String.fromCharCode( kb.which || kb.keyCode );
		if ( /[\w\.]/.exec( typed ) ) {

			server.complete( cm );

		}

	} );


	//

	signals.editorCleared.add( function () {

		container.setDisplay( 'none' );

	} );

	signals.editScript.add( function ( object, script ) {

		var mode, name, source;

		if ( typeof ( script ) === 'object' ) {

			mode = 'javascript';
			name = script.name;
			source = script.source;
			title.setValue( object.name + ' / ' + name );

		} else {

			switch ( script ) {

				case 'vertexShader':

					mode = 'glsl';
					name = 'Vertex Shader';
					source = object.material.vertexShader || "";

					break;

				case 'fragmentShader':

					mode = 'glsl';
					name = 'Fragment Shader';
					source = object.material.fragmentShader || "";

					break;

				case 'programInfo':

					mode = 'json';
					name = 'Program Properties';
					var json = {
						defines: object.material.defines,
						uniforms: object.material.uniforms,
						attributes: object.material.attributes
					};
					source = JSON.stringify( json, null, '\t' );

			}
			title.setValue( object.material.name + ' / ' + name );

		}

		currentMode = mode;
		currentScript = script;
		currentObject = object;

		container.setDisplay( '' );
		codemirror.setValue( source );
		codemirror.clearHistory();
		if ( mode === 'json' ) mode = { name: 'javascript', json: true };
		codemirror.setOption( 'mode', mode );

	} );

	signals.scriptRemoved.add( function ( script ) {

		if ( currentScript === script ) {

			container.setDisplay( 'none' );

		}

	} );

	return container;

}

export { Script };
