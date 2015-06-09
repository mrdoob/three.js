/**
 * @author mrdoob / http://mrdoob.com/
 */

var Script = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'script' );
	container.setPosition( 'absolute' );
	container.setBackgroundColor( '#272822' );
	container.setDisplay( 'none' );

	var header = new UI.Panel();
	header.setPadding( '10px' );
	container.add( header );

	var title = new UI.Text().setColor( '#fff' );
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

	var close = new UI.Element( buttonSVG );
	close.setPosition( 'absolute' );
	close.setTop( '3px' );
	close.setRight( '1px' );
	close.setCursor( 'pointer' );
	close.onClick( function () {

		container.setDisplay( 'none' );

	} );
	header.add( close );

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

		clearTimeout( delay );
		delay = setTimeout( function () {

			var value = codemirror.getValue();

			if ( ! validate( value ) ) return;

			if ( typeof( currentScript ) === 'object' ) {

				currentScript.source = value;
				signals.scriptChanged.dispatch( currentScript );
				return;
			}

			switch ( currentScript ) {

				case 'vertexShader':

					currentObject.vertexShader = value;
					break;

				case 'fragmentShader':

					currentObject.fragmentShader = value;
					break;

				case 'programInfo':

					var json = JSON.parse( value );
					currentObject.defines = json.defines;
					currentObject.uniforms = json.uniforms;
					currentObject.attributes = json.attributes;

			}

			currentObject.needsUpdate = true;
			signals.materialChanged.dispatch( currentObject );

		}, 200 );

	});

	// prevent backspace from deleting objects
	var wrapper = codemirror.getWrapperElement();
	wrapper.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

	} );

	// validate

	var errorLines = [];
	var widgets = [];

	var validate = function ( string ) {

		var errors;

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

						errors = [

							{ lineNumber: error.lineNumber,message: error.message }
						];

					}

					for ( var i = 0; i < errors.length; i ++ ) {

						var error = errors[ i ];
						error.message = error.message.replace(/Line [0-9]+: /, '');

					}

					break;

				case 'json':

					errors = [];

					jsonlint.parseError = function ( message, info ) {

						message = message.split('\n')[3];

						errors.push({
							lineNumber: info.loc.first_line,
							message: message
						});

					};

					try {

						jsonlint.parse( string );

					} catch ( error ) {

						// ignore failed error recovery

					}

					break;

				case 'glsl':

					// TODO validate GLSL (compiling shader?)

				default:

					errors = [];

			}

			for ( var i = 0; i < errors.length; i ++ ) {

				var error = errors[ i ];

				var message = document.createElement( 'div' );
				message.className = 'esprima-error';
				message.textContent = error.message;

				var lineNumber = error.lineNumber - 1;
				errorLines.push( lineNumber );

				codemirror.addLineClass( lineNumber, 'background', 'errorLine' );

				var widget = codemirror.addLineWidget( lineNumber, message );

				widgets.push( widget );

			}

			return errorLines.length === 0;

		});

	};

	// tern js autocomplete

	var server = new CodeMirror.TernServer( {
		caseInsensitive: true,
		plugins: { threejs: null }
	} );

	codemirror.setOption( 'extraKeys', {
		'Ctrl-Space': function(cm) { server.complete(cm); },
		'Ctrl-I': function(cm) { server.showType(cm); },
		'Ctrl-O': function(cm) { server.showDocs(cm); },
		'Alt-.': function(cm) { server.jumpToDef(cm); },
		'Alt-,': function(cm) { server.jumpBack(cm); },
		'Ctrl-Q': function(cm) { server.rename(cm); },
		'Ctrl-.': function(cm) { server.selectName(cm); }
	} );

	codemirror.on( 'cursorActivity', function( cm ) {

		if ( currentMode !== 'javascript' ) return;
		server.updateArgHints( cm );

	} );

	codemirror.on( 'keypress', function( cm, kb ) {

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

		if ( typeof( script ) === 'object' ) {

			mode = 'javascript';
			name = script.name;
			source = script.source;

		} else {

			switch ( script ) {

				case 'vertexShader':

					mode = 'glsl';
					name = 'Vertex Shader';
					source = object.vertexShader || "";

					break;

				case 'fragmentShader':

					mode = 'glsl';
					name = 'Fragment Shader';
					source = object.fragmentShader || "";

					break;

				case 'programInfo':

					mode = 'json';
					name = 'Program Properties';
					var json = {
						defines: object.defines,
						uniforms: object.uniforms,
						attributes: object.attributes
					};
					source = JSON.stringify( json, null, '\t' );

			}

		}

		currentMode = mode;
		currentScript = script;
		currentObject = object;

		title.setValue( object.name + ' / ' + name );
		container.setDisplay( '' );
		codemirror.setValue( source );
		if (mode === 'json' ) mode = { name: 'javascript', json: true };
		codemirror.setOption( 'mode', mode );

	} );

	return container;

};
