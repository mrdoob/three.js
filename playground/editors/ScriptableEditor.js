import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { CodeEditorElement } from '../elements/CodeEditorElement.js';
import { disposeScene, resetScene, createElementFromJSON, isGPUNode, onValidType } from '../NodeEditorUtils.js';
import { global, scriptable, js, scriptableValue } from 'three/tsl';
import { getColorFromType, setInputAestheticsFromType, setOutputAestheticsFromType } from '../DataTypeLib.js';

const defaultTitle = 'Scriptable';
const defaultWidth = 500;

export class ScriptableEditor extends BaseNodeEditor {

	constructor( source = null, enableEditor = true ) {

		let codeNode = null;
		let scriptableNode = null;

		if ( source && source.isCodeNode ) {

			codeNode = source;

		} else {

			codeNode = js( source || '' );

		}

		scriptableNode = scriptable( codeNode );

		super( defaultTitle, scriptableNode, defaultWidth );

		this.scriptableNode = scriptableNode;
		this.editorCodeNode = codeNode;
		this.editorOutput = null;
		this.editorOutputAdded = null;

		this.layout = null;
		this.editorElement = null;

		this.layoutJSON = '';
		this.initCacheKey = '';
		this.initId = 0;
		this.waitToLayoutJSON = null;

		this.hasInternalEditor = false;

		this._updating = false;

		this.onValidElement = () => {};

		if ( enableEditor ) {

			this.title.setSerializable( true );

			this._initExternalConnection();

			this._toInternal();

		}

		const defaultOutput = this.scriptableNode.getDefaultOutput();
		defaultOutput.events.addEventListener( 'refresh', () => {

			this.update();

		} );

		this.update();

	}

	getColor() {

		const color = getColorFromType( this.layout ? this.layout.outputType : null );

		return color ? color + 'BB' : null;

	}

	hasJSON() {

		return true;

	}

	exportJSON() {

		return this.scriptableNode.toJSON();

	}

	setSource( source ) {

		this.editorCodeNode.code = source;

		this.update();

		return this;

	}

	update( force = false ) {

		if ( this._updating === true ) return;

		this._updating = true;

		this.scriptableNode.codeNode = this.codeNode;
		this.scriptableNode.needsUpdate = true;

		let layout = null;
		let scriptableValueOutput = null;

		try {

			const object = this.scriptableNode.getObject();

			layout = this.scriptableNode.getLayout();

			this.updateLayout( layout, force );

			scriptableValueOutput = this.scriptableNode.getDefaultOutput();

			const initCacheKey = typeof object.init === 'function' ? object.init.toString() : '';

			if ( initCacheKey !== this.initCacheKey ) {

				this.initCacheKey = initCacheKey;

				const initId = ++ this.initId;

				this.scriptableNode.callAsync( 'init' ).then( () => {

					if ( initId === this.initId ) {

						this.update();

						if ( this.editor ) this.editor.tips.message( 'ScriptEditor: Initialized.' );

					}

				} );

			}

		} catch ( e ) {

			console.error( e );

			if ( this.editor ) this.editor.tips.error( e.message );

		}

		const editorOutput = scriptableValueOutput ? scriptableValueOutput.value : null;

		this.value = isGPUNode( editorOutput ) ? this.scriptableNode : scriptableValueOutput;
		this.layout = layout;
		this.editorOutput = editorOutput;

		this.updateOutputInEditor();
		this.updateOutputConnection();

		this.invalidate();

		this._updating = false;

	}

	updateOutputConnection() {

		const layout = this.layout;

		if ( layout ) {

			const outputType = layout.outputType;

			setOutputAestheticsFromType( this.title, outputType );

		} else {

			this.title.setOutput( 0 );

		}

	}

	updateOutputInEditor() {

		const { editor, editorOutput, editorOutputAdded } = this;

		if ( editor && editorOutput === editorOutputAdded ) return;

		const scene = global.get( 'scene' );
		const composer = global.get( 'composer' );

		if ( editor ) {

			if ( editorOutputAdded && editorOutputAdded.isObject3D === true ) {

				editorOutputAdded.removeFromParent();

				disposeScene( editorOutputAdded );

				resetScene( scene );

			} else if ( composer && editorOutputAdded && editorOutputAdded.isPass === true ) {

				composer.removePass( editorOutputAdded );

			}

			if ( editorOutput && editorOutput.isObject3D === true ) {

				scene.add( editorOutput );

			} else if ( composer && editorOutput && editorOutput.isPass === true ) {

				composer.addPass( editorOutput );

			}

			this.editorOutputAdded = editorOutput;

		} else {

			if ( editorOutputAdded && editorOutputAdded.isObject3D === true ) {

				editorOutputAdded.removeFromParent();

				disposeScene( editorOutputAdded );

				resetScene( scene );

			} else if ( composer && editorOutputAdded && editorOutputAdded.isPass === true ) {

				composer.removePass( editorOutputAdded );

			}

			this.editorOutputAdded = null;

		}

	}

	setEditor( editor ) {

		super.setEditor( editor );

		this.updateOutputInEditor();

	}

	clearParameters() {

		this.layoutJSON = '';

		this.scriptableNode.clearParameters();

		for ( const element of this.elements.concat() ) {

			if ( element !== this.editorElement && element !== this.title ) {

				this.remove( element );

			}

		}

	}

	addElementFromJSON( json ) {

		const { id, element, inputNode, outputType } = createElementFromJSON( json );

		this.add( element );

		this.scriptableNode.setParameter( id, inputNode );

		if ( outputType ) {

			element.setObjectCallback( () => {

				return this.scriptableNode.getOutput( id );

			} );

		}

		//

		const onUpdate = () => {

			const value = element.value;
			const paramValue = value && value.isScriptableValueNode ? value : scriptableValue( value );

			this.scriptableNode.setParameter( id, paramValue );

			this.update();

		};

		element.addEventListener( 'changeInput', onUpdate );
		element.onConnect( onUpdate, true );

		//element.onConnect( () => this.getScriptable().call( 'onDeepChange' ), true );

		return element;

	}

	updateLayout( layout = null, force = false ) {

		const needsUpdateWidth = this.hasExternalEditor || this.editorElement === null;

		if ( this.waitToLayoutJSON !== null ) {

			if ( this.waitToLayoutJSON === JSON.stringify( layout || '{}' ) ) {

				this.waitToLayoutJSON = null;

				if ( needsUpdateWidth ) this.setWidth( layout.width );

			} else {

				return;

			}

		}

		if ( layout ) {

			const layoutCacheKey = JSON.stringify( layout );

			if ( this.layoutJSON !== layoutCacheKey || force === true ) {

				this.clearParameters();

				if ( layout.name ) {

					this.setName( layout.name );

				}


				if ( layout.icon ) {

					this.setIcon( layout.icon );

				}

				if ( needsUpdateWidth ) {

					if ( layout.width !== undefined ) {

                		this.setWidth( layout.width );

					} else {

						this.setWidth( defaultWidth );

					}

				}

				if ( layout.elements ) {

					for ( const element of layout.elements ) {

						this.addElementFromJSON( element );

					}

					if ( this.editorElement ) {

						this.remove( this.editorElement );
						this.add( this.editorElement );

					}

				}

				this.layoutJSON = layoutCacheKey;

			}

		} else {

			this.setName( defaultTitle );
			this.setIcon( null );
			this.setWidth( defaultWidth );

			this.clearParameters();

		}

		this.updateOutputConnection();

	}

	get hasExternalEditor() {

		return this.title.getLinkedObject() !== null;

	}

	get codeNode() {

		return this.hasExternalEditor ? this.title.getLinkedObject() : this.editorCodeNode;

	}

	_initExternalConnection() {

		setInputAestheticsFromType( this.title, 'CodeNode' ).onValid( onValidType( 'CodeNode' ) ).onConnect( () => {

			this.hasExternalEditor ? this._toExternal() : this._toInternal();

			this.update();

		}, true );

	}

	_toInternal() {

		if ( this.hasInternalEditor === true ) return;

		if ( this.editorElement === null ) {

			this.editorElement = new CodeEditorElement( this.editorCodeNode.code );
			this.editorElement.addEventListener( 'change', () => {

				this.setSource( this.editorElement.source );

				this.editorElement.focus();

			} );

			this.add( this.editorElement );

		}

		this.setResizable( true );

		this.editorElement.setVisible( true );

		this.hasInternalEditor = true;

		this.update( /*true*/ );

	}

	_toExternal() {

		if ( this.hasInternalEditor === false ) return;

		this.editorElement.setVisible( false );

		this.setResizable( false );

		this.hasInternalEditor = false;

		this.update( /*true*/ );

	}

	serialize( data ) {

		super.serialize( data );

		data.layoutJSON = this.layoutJSON;

	}

	deserialize( data ) {

		this.updateLayout( JSON.parse( data.layoutJSON || '{}' ), true );

		this.waitToLayoutJSON = data.layoutJSON;

		super.deserialize( data );

	}

}
