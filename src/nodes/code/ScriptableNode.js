import Node from '../core/Node.js';
import { scriptableValue } from './ScriptableValueNode.js';
import { nodeProxy, float } from '../tsl/TSLBase.js';
import { hashArray, hashString } from '../core/NodeUtils.js';

/** @module ScriptableNode **/

/**
 * A Map-like data structure for managing resources of scriptable nodes.
 *
 * @augments Map
 */
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

/**
 * Defines the resources (e.g. namespaces) of scriptable nodes.
 *
 * @type {Resources}
 */
export const ScriptableNodeResources = new Resources();

/**
 * This type of node allows to implement nodes with custom scripts. The script
 * section is represented as an instance of `CodeNode` written with JavaScript.
 * The script itself must adhere to a specific structure.
 *
 * - main(): Executed once by default and every time `node.needsUpdate` is set.
 * - layout: The layout object defines the script's interface (inputs and outputs).
 *
 * ```js
 * ScriptableNodeResources.set( 'TSL', TSL );
 *
 * const scriptableNode = scriptable( js( `
 * 	layout = {
 * 		outputType: 'node',
 * 		elements: [
 * 			{ name: 'source', inputType: 'node' },
 * 		]
 * 	};
 *
 * 	const { mul, oscSine } = TSL;
 *
 * 	function main() {
 * 		const source = parameters.get( 'source' ) || float();
 * 		return mul( source, oscSine() ) );
 * 	}
 *
 * ` ) );
 *
 * scriptableNode.setParameter( 'source', color( 1, 0, 0 ) );
 *
 * const material = new THREE.MeshBasicNodeMaterial();
 * material.colorNode = scriptableNode;
 * ```
 *
 * @augments Node
 */
class ScriptableNode extends Node {

	static get type() {

		return 'ScriptableNode';

	}

	/**
	 * Constructs a new scriptable node.
	 *
	 * @param {CodeNode?} [codeNode=null] - The code node.
	 * @param {Object} [parameters={}] - The parameters definition.
	 */
	constructor( codeNode = null, parameters = {} ) {

		super();

		/**
		 * The code node.
		 *
		 * @type {CodeNode?}
		 * @default null
		 */
		this.codeNode = codeNode;

		/**
		 * The parameters definition.
		 *
		 * @type {Object}
		 * @default {}
		 */
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

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isScriptableNode = true;

	}

	/**
	 * The source code of the scriptable node.
	 *
	 * @type {String}
	 */
	get source() {

		return this.codeNode ? this.codeNode.code : '';

	}

	/**
	 * Sets the reference of a local script variable.
	 *
	 * @param {String} name - The variable name.
	 * @param {Object} value - The reference to set.
	 * @return {Resources} The resource map
	 */
	setLocal( name, value ) {

		return this._local.set( name, value );

	}

	/**
	 * Gets the value of a local script variable.
	 *
	 * @param {String} name - The variable name.
	 * @return {Object} The value.
	 */
	getLocal( name ) {

		return this._local.get( name );

	}

	/**
	 * Event listener for the `refresh` event.
	 */
	onRefresh() {

		this._refresh();

	}

	/**
	 * Returns an input from the layout with the given id/name.
	 *
	 * @param {String} id - The id/name of the input.
	 * @return {Object} The element entry.
	 */
	getInputLayout( id ) {

		for ( const element of this.getLayout() ) {

			if ( element.inputType && ( element.id === id || element.name === id ) ) {

				return element;

			}

		}

	}

	/**
	 * Returns an output from the layout with the given id/name.
	 *
	 * @param {String} id - The id/name of the output.
	 * @return {Object} The element entry.
	 */
	getOutputLayout( id ) {

		for ( const element of this.getLayout() ) {

			if ( element.outputType && ( element.id === id || element.name === id ) ) {

				return element;

			}

		}

	}

	/**
	 * Defines a script output for the given name and value.
	 *
	 * @param {String} name - The name of the output.
	 * @param {Node} value - The node value.
	 * @return {ScriptableNode} A reference to this node.
	 */
	setOutput( name, value ) {

		const outputs = this._outputs;

		if ( outputs[ name ] === undefined ) {

			outputs[ name ] = scriptableValue( value );

		} else {

			outputs[ name ].value = value;

		}

		return this;

	}

	/**
	 * Returns a script output for the given name.
	 *
	 * @param {String} name - The name of the output.
	 * @return {ScriptableValueNode} The node value.
	 */
	getOutput( name ) {

		return this._outputs[ name ];

	}

	/**
	 * Returns a parameter for the given name
	 *
	 * @param {String} name - The name of the parameter.
	 * @return {ScriptableValueNode} The node value.
	 */
	getParameter( name ) {

		return this.parameters[ name ];

	}

	/**
	 * Sets a value for the given parameter name.
	 *
	 * @param {String} name - The parameter name.
	 * @param {Any} value - The parameter value.
	 * @return {ScriptableNode} A reference to this node.
	 */
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

	/**
	 * Returns the value of this node which is the value of
	 * the default output.
	 *
	 * @return {Node} The value.
	 */
	getValue() {

		return this.getDefaultOutput().getValue();

	}

	/**
	 * Deletes a parameter from the script.
	 *
	 * @param {String} name - The parameter to remove.
	 * @return {ScriptableNode} A reference to this node.
	 */
	deleteParameter( name ) {

		let valueNode = this.parameters[ name ];

		if ( valueNode ) {

			if ( valueNode.isScriptableNode ) valueNode = valueNode.getDefaultOutput();

			valueNode.events.removeEventListener( 'refresh', this.onRefresh );

		}

		return this;

	}

	/**
	 * Deletes all parameters from the script.
	 *
	 * @return {ScriptableNode} A reference to this node.
	 */
	clearParameters() {

		for ( const name of Object.keys( this.parameters ) ) {

			this.deleteParameter( name );

		}

		this.needsUpdate = true;

		return this;

	}

	/**
	 * Calls a function from the script.
	 *
	 * @param {String} name - The function name.
	 * @param {...Any} params - A list of parameters.
	 * @return {Any} The result of the function call.
	 */
	call( name, ...params ) {

		const object = this.getObject();
		const method = object[ name ];

		if ( typeof method === 'function' ) {

			return method( ...params );

		}

	}

	/**
	 * Asynchronously calls a function from the script.
	 *
	 * @param {String} name - The function name.
	 * @param {...Any} params - A list of parameters.
	 * @return {Promise<Any>} The result of the function call.
	 */
	async callAsync( name, ...params ) {

		const object = this.getObject();
		const method = object[ name ];

		if ( typeof method === 'function' ) {

			return method.constructor.name === 'AsyncFunction' ? await method( ...params ) : method( ...params );

		}

	}

	/**
	 * Overwritten since the node types is inferred from the script's output.
	 *
	 * @param {NodeBuilder} builder - The current node builder
	 * @return {String} The node type.
	 */
	getNodeType( builder ) {

		return this.getDefaultOutputNode().getNodeType( builder );

	}

	/**
	 * Refreshes the script node.
	 *
	 * @param {String?} [output=null] - An optional output.
	 */
	refresh( output = null ) {

		if ( output !== null ) {

			this.getOutput( output ).refresh();

		} else {

			this._refresh();

		}

	}

	/**
	 * Returns an object representation of the script.
	 *
	 * @return {Object} The result object.
	 */
	getObject() {

		if ( this.needsUpdate ) this.dispose();
		if ( this._object !== null ) return this._object;

		//

		const refresh = () => this.refresh();
		const setOutput = ( id, value ) => this.setOutput( id, value );

		const parameters = new Parameters( this );

		const THREE = ScriptableNodeResources.get( 'THREE' );
		const TSL = ScriptableNodeResources.get( 'TSL' );

		const method = this.getMethod();
		const params = [ parameters, this._local, ScriptableNodeResources, refresh, setOutput, THREE, TSL ];

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

	/**
	 * Returns the layout of the script.
	 *
	 * @return {Object} The script's layout.
	 */
	getLayout() {

		return this.getObject().layout;

	}

	/**
	 * Returns default node output of the script.
	 *
	 * @return {Node} The default node output.
	 */
	getDefaultOutputNode() {

		const output = this.getDefaultOutput().value;

		if ( output && output.isNode ) {

			return output;

		}

		return float();

	}

	/**
	 * Returns default output of the script.
	 *
	 * @return {ScriptableValueNode} The default output.
	 */
	getDefaultOutput()	{

		return this._exec()._output;

	}

	/**
	 * Returns a function created from the node's script.
	 *
	 * @return {Function} The function representing the node's code.
	 */
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

	/**
	 * Frees all internal resources.
	 */
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

	getCacheKey( force ) {

		const values = [ hashString( this.source ), this.getDefaultOutputNode().getCacheKey( force ) ];

		for ( const param in this.parameters ) {

			values.push( this.parameters[ param ].getCacheKey( force ) );

		}

		return hashArray( values );

	}

	set needsUpdate( value ) {

		if ( value === true ) this.dispose();

	}

	get needsUpdate() {

		return this.source !== this._source;

	}

	/**
	 * Executes the `main` function of the script.
	 *
	 * @private
	 * @return {ScriptableNode} A reference to this node.
	 */
	_exec()	{

		if ( this.codeNode === null ) return this;

		if ( this._needsOutputUpdate === true ) {

			this._value = this.call( 'main' );

			this._needsOutputUpdate = false;

		}

		this._output.value = this._value;

		return this;

	}

	/**
	 * Executes the refresh.
	 *
	 * @private
	 */
	_refresh() {

		this.needsUpdate = true;

		this._exec();

		this._output.refresh();

	}

}

export default ScriptableNode;

/**
 * TSL function for creating a scriptable node.
 *
 * @function
 * @param {CodeNode?} [codeNode=null] - The code node.
 * @param {Object} [parameters={}] - The parameters definition.
 * @returns {ScriptableNode}
 */
export const scriptable = /*@__PURE__*/ nodeProxy( ScriptableNode );
