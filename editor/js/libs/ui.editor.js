// CodeEditor

UI.CodeEditor = function ( mode ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'div' );
	dom.className = 'CodeEditor';

	var editor = CodeMirror( dom, { mode: mode, indentWithTabs: true, lineWrapping: true, matchBrackets: true } );
	editor.on( 'change', function () {

		if ( scope.onChangeCallback !== undefined ) {

			scope.onChangeCallback();

		}

	});

	this.dom = dom;
	this.editor = editor;

	return this;

};

UI.CodeEditor.prototype = Object.create( UI.Element.prototype );

UI.CodeEditor.prototype.setWidth = function ( value ) {

	UI.Element.prototype.setWidth.call( this, value );

	this.editor.setSize( this.dom.style.width, this.dom.style.height );

	return this;

};

UI.CodeEditor.prototype.setHeight = function ( value ) {

	UI.Element.prototype.setHeight.call( this, value );

	this.editor.setSize( this.dom.style.width, this.dom.style.height );

	return this;

};

UI.CodeEditor.prototype.getValue = function () {

	return this.editor.getValue();

};

UI.CodeEditor.prototype.setValue = function ( value ) {

	this.editor.setValue( value );

	return this;

};

UI.CodeEditor.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};