import { MathUtils } from '../../../../build/three.module.js';

import { ShaderPass } from '../../postprocessing/ShaderPass.js';
import { NodeMaterial } from '../materials/NodeMaterial.js';
import { ScreenNode } from '../inputs/ScreenNode.js';

class NodePass extends ShaderPass {

	constructor() {

		super();

		this.name = '';
		this.uuid = MathUtils.generateUUID();

		this.userData = {};

		this.textureID = 'renderTexture';

		this.input = new ScreenNode();

		this.material = new NodeMaterial();

		this.needsUpdate = true;

	}

	render() {

		if ( this.needsUpdate ) {

			this.material.dispose();

			this.material.fragment.value = this.input;

			this.needsUpdate = false;

		}

		this.uniforms = this.material.uniforms;

		super.render( ...arguments );

	}

	copy( source ) {

		this.input = source.input;

		return this;

	}

	toJSON( meta ) {

		var isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( isRootObject ) {

			meta = {
				nodes: {}
			};

		}

		if ( meta && ! meta.passes ) meta.passes = {};

		if ( ! meta.passes[ this.uuid ] ) {

			var data = {};

			data.uuid = this.uuid;
			data.type = 'NodePass';

			meta.passes[ this.uuid ] = data;

			if ( this.name !== '' ) data.name = this.name;

			if ( JSON.stringify( this.userData ) !== '{}' ) data.userData = this.userData;

			data.input = this.input.toJSON( meta ).uuid;

		}

		meta.pass = this.uuid;

		return meta;

	}

}

export { NodePass };
