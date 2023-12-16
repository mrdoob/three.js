import UniformsGroup from '../UniformsGroup.js';

let id = 0;

class NodeUniformsGroup extends UniformsGroup {

	constructor( name, groupNode, commonUniformBuffer = null ) {

		super( name );

		this.id = id ++;
		this.groupNode = groupNode;

		this.isNodeUniformsGroup = true;
		this.commonUniformBuffer = commonUniformBuffer;
		this._isCommon = null;

	}

	get shared() {

		return this.groupNode.shared;

	}

	allocateCommon() {

		if ( this._isCommon === null ) {

			this._isCommon = false;

			if ( this.commonUniformBuffer !== null ) {

				const buffer = this.commonUniformBuffer.allocate( this.byteLength );

				if ( buffer ) {

					this._buffer = buffer;
					this._isCommon = true;

				}

			}

		}

		return this._isCommon;

	}

	get buffer() {

		if ( this._buffer === null ) {

			if (  ! this.allocateCommon() ) {

				return super.buffer;

			}

		}

		return this._buffer;

	}

	getNodes() {

		const nodes = [];

		for ( const uniform of this.uniforms ) {

			const node = uniform.nodeUniform.node;

			if ( ! node ) throw new Error( 'NodeUniformsGroup: Uniform has no node.' );

			nodes.push( node );

		}

		return nodes;

	}

}

export default NodeUniformsGroup;
