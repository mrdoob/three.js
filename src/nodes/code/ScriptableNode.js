import Node, { addNodeClass } from '../core/Node.js';
import { scriptableValue } from './ScriptableValueNode.js';
import { addNodeElement, nodeProxy, float } from '../shadernode/ShaderNode.js';

class Resources extends Map {

	get( key, callback = null, ...params ) {

		if ( this.has( key ) ) return super.get( key );

		if ( callback !== null ) {

			const value = callback( ...params );
			this.set( key, value );
			return value;

		}

	}

}

class Parameters {

	constructor( scriptableNode ) {

		this.scriptableNode = scriptableNode;

	}

	get parameters() {

		return this.scriptableNode.parameters;

	}

	get layout() {

		return this.scriptableNode.getLayout();

	}

	getInputLayout( id ) {

		return this.scriptableNode.getInputLayout( id );

	}

	get( name ) {

		const param = this.parameters[ name ];
		const value = param ? param.getValue() : null;

		return value;

	}

}

export const global = new Resources();

class ScriptableNode extends Node {

	constructor( codeNode = null, parameters = {} ) {

		super();

		this.codeNode = codeNode;
		this.parameters = parameters;

		this._local = new Resources();
		this._output = scriptableValue();
		this._outputs = {};
		this._source = this.source;
		this._method = null;
		this._object = null;
		this._value = null;
		this._needsOutputUpdate = true;

		this.onRefresh = this.onRefresh.bind( this );

		this.isScriptableNode = true;

	}

	get source() {

		return this.codeNode ? this.codeNode.code : '';

	}

	setLocal( name, value ) {

		return this._local.set( name, value );

	}

	getLocal( name ) {

		return this._local.get( name );

	}

	onRefresh() {

		this._refresh();

	}

	getInputLayout( id ) {

		for ( const element of this.getLayout() ) {

			if ( element.inputType && ( element.id === id || element.name === id ) ) {

				return element;

			}

		}

	}

	getOutputLayout( id ) {

		for ( const element of this.getLayout() ) {

			if ( element.outputType && ( element.id === id || element.name === id ) ) {

				return element;

			}

		}

	}

	setOutput( name, value ) {

		const outputs = this._outputs;

		if ( outputs[ name ] === undefined ) {

			outputs[ name ] = scriptableValue( value );

		} else {

			outputs[ name ].value = value;

		}

		return this;

	}

	getOutput( name ) {

		return this._outputs[ name ];

	}

	getParameter( name ) {

		return this.parameters[ name ];

	}

	setParameter( name, value ) {

		const parameters = this.parameters;

		if ( value && value.isScriptableNode ) {

			this.deleteParameter( name );

			parameters[ name ] = value;
			parameters[ name ].getDefaultOutput().events.addEventListener( 'refresh', this.onRefresh );

		} else if ( value && value.isScriptableValueNode ) {

			this.deleteParameter( name );

			parameters[ name ] = value;
			parameters[ name ].events.addEventListener( 'refresh', this.onRefresh );

		} else if ( parameters[ name ] === undefined ) {

			parameters[ name ] = scriptableValue( value );
			parameters[ name ].events.addEventListener( 'refresh', this.onRefresh );

		} else {

			parameters[ name ].value = value;

		}

		return this;

	}

	getValue() {

		return this.getDefaultOutput().getValue();

	}

	deleteParameter( name ) {

		let valueNode = this.parameters[ name ];

		if ( valueNode ) {

			if ( valueNode.isScriptableNode ) valueNode = valueNode.getDefaultOutput();

			valueNode.events.removeEventListener( 'refresh', this.onRefresh );

		}

		return this;

	}

	clearParameters() {

		for ( const name of Object.keys( this.parameters ) ) {

			this.deleteParameter( name );

		}

		this.needsUpdate = true;

		return this;

	}

	call( name, ...params ) {

		const object = this.getObject();
		const method = object[ name ];

		if ( typeof method === 'function' ) {

			return method( ...params );

		}

	}

	async callAsync( name, ...params ) {

		const object = this.getObject();
		const method = object[ name ];

		if ( typeof method === 'function' ) {

			return method.constructor.name === 'AsyncFunction' ? await method( ...params ) : method( ...params );

		}

	}

	getNodeType( builder ) {

		return this.getDefaultOutputNode().getNodeType( builder );

	}

	refresh( output = null ) {

		if ( output !== null ) {

			this.getOutput( output ).refresh();

		} else {

			this._refresh();

		}

	}

	getObject() {

		if ( this.needsUpdate ) this.dispose();
		if ( this._object !== null ) return this._object;

		//

		const refresh = () => this.refresh();
		const setOutput = ( id, value ) => this.setOutput( id, value );

		const parameters = new Parameters( this );

		const THREE = global.get( 'THREE' );
		const TSL = global.get( 'TSL' );

		const method = this.getMethod( this.codeNode );
		const params = [ parameters, this._local, global, refresh, setOutput, THREE, TSL ];

		this._object = method( ...params );

		const layout = this._object.layout;

		if ( layout ) {

			if ( layout.cache === false ) {

				this._local.clear();

			}

			// default output
			this._output.outputType = layout.outputType || null;

			if ( Array.isArray( layout.elements ) ) {

				for ( const element of layout.elements ) {

					const id = element.id || element.name;

					if ( element.inputType ) {

						if ( this.getParameter( id ) === undefined ) this.setParameter( id, null );

						this.getParameter( id ).inputType = element.inputType;

					}

					if ( element.outputType ) {

						if ( this.getOutput( id ) === undefined ) this.setOutput( id, null );

						this.getOutput( id ).outputType = element.outputType;

					}

				}

			}

		}

		return this._object;

	}

	deserialize( data ) {

		super.deserialize( data );

		for ( const name in this.parameters ) {

			let valueNode = this.parameters[ name ];

			if ( valueNode.isScriptableNode ) valueNode = valueNode.getDefaultOutput();

			valueNode.events.addEventListener( 'refresh', this.onRefresh );

		}

	}

	getLayout() {

		return this.getObject().layout;

	}

	getDefaultOutputNode() {

		const output = this.getDefaultOutput().value;

		if ( output && output.isNode ) {

			return output;

		}

		return float();

	}

	getDefaultOutput()	{

		return this._exec()._output;

	}

	getMethod() {

		if ( this.needsUpdate ) this.dispose();
		if ( this._method !== null ) return this._method;

		//

		const parametersProps = [ 'parameters', 'local', 'global', 'refresh', 'setOutput', 'THREE', 'TSL' ];
		const interfaceProps = [ 'layout', 'init', 'main', 'dispose' ];

		const properties = interfaceProps.join( ', ' );
		const declarations = 'var ' + properties + '; var output = {};\n';
		const returns = '\nreturn { ...output, ' + properties + ' };';

		const code = declarations + this.codeNode.code + returns;

		//

		this._method = new Function( ...parametersProps, code );

		return this._method;

	}

	dispose() {

		if ( this._method === null ) return;

		if ( this._object && typeof this._object.dispose === 'function' ) {

			this._object.dispose();

		}

		this._method = null;
		this._object = null;
		this._source = null;
		this._value = null;
		this._needsOutputUpdate = true;
		this._output.value = null;
		this._outputs = {};

	}

	setup() {

		return this.getDefaultOutputNode();

	}

	set needsUpdate( value ) {

		if ( value === true ) this.dispose();

	}

	get needsUpdate() {

		return this.source !== this._source;

	}

	_exec()	{

		if ( this.codeNode === null ) return this;

		if ( this._needsOutputUpdate === true ) {

			this._value = this.call( 'main' );

			this._needsOutputUpdate = false;

		}

		this._output.value = this._value;

		return this;

	}

	_refresh() {

		this.needsUpdate = true;

		this._exec();

		this._output.refresh();

	}

}

export default ScriptableNode;

export const scriptable = nodeProxy( ScriptableNode );

addNodeElement( 'scriptable', scriptable );

addNodeClass( 'ScriptableNode', ScriptableNode );
