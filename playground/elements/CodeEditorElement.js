import { Element, LoaderLib } from 'flow';

export class CodeEditorElement extends Element {

	constructor( source = '' ) {

		super();

		this.updateInterval = 500;

		this._source = source;

		this.dom.style[ 'z-index' ] = - 1;
		this.dom.classList.add( 'no-zoom' );

		this.setHeight( 500 );

		const editorDOM = document.createElement( 'div' );
		editorDOM.style.width = '100%';
		editorDOM.style.height = '100%';
		this.dom.appendChild( editorDOM );

		this.editor = null; // async

		window.require.config( { paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.48.0/min/vs' } } );

		require( [ 'vs/editor/editor.main' ], () => {

			this.editor = window.monaco.editor.create( editorDOM, {
				value: this.source,
				language: 'javascript',
				theme: 'vs-dark',
				automaticLayout: true,
				minimap: { enabled: false }
			} );

			let timeout = null;

			this.editor.getModel().onDidChangeContent( () => {

				this._source = this.editor.getValue();

				if ( timeout ) clearTimeout( timeout );

				timeout = setTimeout( () => {

					this.dispatchEvent( new Event( 'change' ) );

				}, this.updateInterval );

			} );

		} );

	}

	set source( value ) {

		if ( this._source === value ) return;

		this._source = value;

		if ( this.editor ) this.editor.setValue( value );

		this.dispatchEvent( new Event( 'change' ) );

	}

	get source() {

		return this._source;

	}

	focus() {

		if ( this.editor ) this.editor.focus();

	}

	serialize( data ) {

		super.serialize( data );

		data.source = this.source;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.source = data.source || '';

	}

}

LoaderLib[ 'CodeEditorElement' ] = CodeEditorElement;
