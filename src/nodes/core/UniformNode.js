import InputNode from './InputNode.js';
import { objectGroup } from './UniformGroupNode.js';
import { nodeObject, getConstNodeType } from '../tsl/TSLCore.js';

class UniformNode extends InputNode {

	static get type() {

		return 'UniformNode';

	}

	constructor( value, nodeType = null ) {

		super( value, nodeType );

		this.isUniformNode = true;

		this.name = '';
		this.groupNode = objectGroup;

	}

	label( name ) {

		this.name = name;

		return this;

	}

	setGroup( group ) {

		this.groupNode = group;

		return this;

	}

	getGroup() {

		return this.groupNode;

	}

	getUniformHash( builder ) {

		return this.getHash( builder );

	}

	onUpdate( callback, updateType ) {

		const self = this.getSelf();

		callback = callback.bind( self );

		return super.onUpdate( ( frame ) => {

			const value = callback( frame, self );

			if ( value !== undefined ) {

				this.value = value;

			}

	 	}, updateType );

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		const hash = this.getUniformHash( builder );

		let sharedNode = builder.getNodeFromHash( hash );

		if ( sharedNode === undefined ) {

			builder.setHashNode( this, hash );

			sharedNode = this;

		}

		const sharedNodeType = sharedNode.getInputType( builder );

		const nodeUniform = builder.getUniformFromNode( sharedNode, sharedNodeType, builder.shaderStage, this.name || builder.context.label );
		const propertyName = builder.getPropertyName( nodeUniform );

		if ( builder.context.label !== undefined ) delete builder.context.label;

		return builder.format( propertyName, type, output );

	}

}

export default UniformNode;

export const uniform = ( arg1, arg2 ) => {

	const nodeType = getConstNodeType( arg2 || arg1 );

	// @TODO: get ConstNode from .traverse() in the future
	const value = ( arg1 && arg1.isNode === true ) ? ( arg1.node && arg1.node.value ) || arg1.value : arg1;

	return nodeObject( new UniformNode( value, nodeType ) );

};
