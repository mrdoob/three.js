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
	var currentScript;

	var codemirror = CodeMirror( container.dom, {
		value: '',
		lineNumbers: true,
		matchBrackets: true,
		indentWithTabs: true,
		tabSize: 4,
		indentUnit: 4
	} );
	codemirror.setOption( 'theme', 'monokai' );
	codemirror.on( 'change', function () {

		clearTimeout( delay );
		delay = setTimeout( function () {

			var value = codemirror.getValue();

			if ( validate( value ) ) {

				currentScript.source = value;
				signals.scriptChanged.dispatch( currentScript );

			}

		}, 300 );

	});

	// validate

	var errorLines = [];
	var widgets = [];

	var validate = function ( string ) {

		var syntax, errors;

		return codemirror.operation( function () {

			while ( errorLines.length > 0 ) {

				codemirror.removeLineClass( errorLines.shift(), 'background', 'errorLine' );

			}

			while ( widgets.length > 0 ) {

				codemirror.removeLineWidget( widgets.shift() );

			}

			//

			try {

				syntax = esprima.parse( string, { tolerant: true } );
				errors = syntax.errors;

				for ( var i = 0; i < errors.length; i ++ ) {

					var error = errors[ i ];

					var message = document.createElement( 'div' );
					message.className = 'esprima-error';
					message.textContent = error.message.replace(/Line [0-9]+: /, '');

					var lineNumber = error.lineNumber - 1;
					errorLines.push( lineNumber );

					codemirror.addLineClass( lineNumber, 'background', 'errorLine' );

					var widget = codemirror.addLineWidget(
						lineNumber,
						message
					);

					widgets.push( widget );

				}

			} catch ( error ) {

				var message = document.createElement( 'div' );
				message.className = 'esprima-error';
				message.textContent = error.message.replace(/Line [0-9]+: /, '');

				var lineNumber = error.lineNumber - 1;
				errorLines.push( lineNumber );

				codemirror.addLineClass( lineNumber, 'background', 'errorLine' );

				var widget = codemirror.addLineWidget(
					lineNumber,
					message
				);

				widgets.push( widget );

			}

			return errorLines.length === 0;

		});

	};

	//

	signals.editorCleared.add( function () {

		container.setDisplay( 'none' );

	} );

	signals.editScript.add( function ( object, script ) {

		container.setDisplay( '' );

		currentScript = script;

		title.setValue( object.name + ' / ' + script.name );
		codemirror.setValue( script.source );

	} );

	return container;

};
