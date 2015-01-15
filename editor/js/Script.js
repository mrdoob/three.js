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

			currentScript.source = codemirror.getValue();

			signals.scriptChanged.dispatch( currentScript );

		}, 300 );

	});

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
