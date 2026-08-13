import Node from './Node.js';

/**
 * Represents a `switch` statement in TSL. It is constructed by the
 * `Switch()` / `Case()` / `Default()` chaining methods of {@link StackNode}
 * and is therefore not meant to be created directly.
 *
 * On the WebGPU backend it generates a native WGSL `switch` statement. On the
 * WebGL backend it falls back to an equivalent `if` / `else if` / `else` chain.
 *
 * @augments Node
 */
class SwitchNode extends Node {

	static get type() {

		return 'SwitchNode';

	}

	/**
	 * Constructs a new switch node.
	 *
	 * @param {Node} expressionNode - The node that defines the switch expression.
	 */
	constructor( expressionNode ) {

		super();

		/**
		 * The node that defines the switch expression.
		 *
		 * @type {Node}
		 */
		this.expressionNode = expressionNode;

		/**
		 * The list of cases. Each entry holds the case selector value nodes and
		 * the body that is executed when one of the selectors matches.
		 *
		 * @type {Array<{conditions: Array<Node>, body: Node}>}
		 */
		this.cases = [];

		/**
		 * The body of the `default` clause. May be `null` if no default is defined.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.defaultNode = null;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSwitchNode = true;

	}

	/**
	 * Adds a new case to the switch statement.
	 *
	 * @param {Array<Node>} conditions - The case selector value nodes.
	 * @param {Node} body - The body executed when one of the selectors matches.
	 * @return {SwitchNode} A reference to this node.
	 */
	addCase( conditions, body ) {

		this.cases.push( { conditions, body } );

		return this;

	}

	/**
	 * Defines the body of the `default` clause.
	 *
	 * @param {Node} body - The body executed when no case matches.
	 * @return {SwitchNode} A reference to this node.
	 */
	setDefault( body ) {

		this.defaultNode = body;

		return this;

	}

	setup( builder ) {

		const currentNodeBlock = builder.context.nodeBlock;

		const properties = builder.getNodeProperties( this );

		const setupBody = ( node ) => {

			const isolated = node.isolate();

			builder.getDataFromNode( isolated ).parentNodeBlock = currentNodeBlock;

			return isolated.context( { nodeBlock: isolated } );

		};

		properties.expressionNode = this.expressionNode;
		properties.cases = this.cases.map( ( { conditions, body } ) => ( { conditions, body: setupBody( body ) } ) );
		properties.defaultNode = this.defaultNode ? setupBody( this.defaultNode ) : null;

	}

	generate( builder ) {

		const { expressionNode, cases, defaultNode } = builder.getNodeProperties( this );

		// a switch operates on an integer selector, so both the expression and the
		// case selectors are emitted as `int` (or `uint`) regardless of their source type

		const switchType = expressionNode.getNodeType( builder ) === 'uint' ? 'uint' : 'int';

		const expressionSnippet = expressionNode.build( builder, switchType );

		const isWebGPUBackend = builder.renderer.backend.isWebGPUBackend === true;

		const selectorSnippet = ( condition ) => {

			const selector = switchType === 'uint' ? condition.toUint() : condition.toInt();

			return selector.build( builder, switchType );

		};

		// emits `<open><indented body><close>` for a single clause

		const buildClause = ( open, body, close ) => {

			builder.addFlowCode( open ).addFlowTab();

			if ( body !== null ) body.build( builder, 'void' );

			builder.removeFlowTab().addFlowCode( close );

		};

		if ( isWebGPUBackend ) {

			// native WGSL switch statement

			builder.addFlowCode( `\n${ builder.tab }switch ( ${ expressionSnippet } ) {\n\n` ).addFlowTab();

			for ( const { conditions, body } of cases ) {

				const selectors = conditions.map( selectorSnippet ).join( ', ' );

				buildClause( `${ builder.tab }case ${ selectors }: {\n\n`, body, `\n${ builder.tab }}\n\n` );

			}

			// WGSL requires a `default` clause

			buildClause( `${ builder.tab }default: {\n\n`, defaultNode, `\n${ builder.tab }}\n\n` );

			builder.removeFlowTab().addFlowCode( `${ builder.tab }}\n\n` );

		} else {

			// WebGL fallback: if / else if / else chain

			builder.addFlowCode( `\n${ builder.tab }` );

			for ( let i = 0; i < cases.length; i ++ ) {

				const { conditions, body } = cases[ i ];

				const condition = conditions.map( ( c ) => `( ${ expressionSnippet } == ${ selectorSnippet( c ) } )` ).join( ' || ' );

				buildClause( `${ i === 0 ? '' : ' else ' }if ( ${ condition } ) {\n\n`, body, `\n${ builder.tab }}` );

			}

			if ( defaultNode !== null ) {

				buildClause( ' else {\n\n', defaultNode, `\n${ builder.tab }}` );

			}

			builder.addFlowCode( '\n\n' );

		}

		return '';

	}

}

export default SwitchNode;
