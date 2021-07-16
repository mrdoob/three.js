import NodeBuilder from '../../nodes/core/NodeBuilder.js';
import NodeSlot from '../../nodes/core/NodeSlot.js';

class WebGLNodeBuilder extends NodeBuilder {

	constructor( material, renderer, properties ) {

		super( material, renderer );

		this.properties = properties;

		this._parseMaterial();

	}

	_parseMaterial() {

		const material = this.material;

		// parse inputs

		if ( material.colorNode !== undefined ) {

			this.addSlot( 'fragment', new NodeSlot( material.colorNode, 'COLOR', 'vec4' ) );

		}

	}

	getVaryFromNode( node, type ) {

		const vary = super.getVaryFromNode( node, type );

		if ( node.isUVNode ) {

			vary.name = 'vUv';

		}

		return vary;

	}

	getTexture( textureProperty, uvSnippet ) {

		return `sRGBToLinear( texture2D( ${textureProperty}, ${uvSnippet} ) )`;

	}

	getUniformsHeaderSnippet( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		let snippet = '';

		for ( const uniform of uniforms ) {

			if ( uniform.type === 'texture' ) {

				snippet += `uniform sampler2D ${uniform.name};`;

			} else {

				const vectorType = this.getVectorType( uniform.type );

				snippet += `uniform ${vectorType} ${uniform.name};`;

			}

		}

		return snippet;

	}

	getAttributesHeaderSnippet( /*shaderStage*/ ) {

	}

	getVarsHeaderSnippet( /*shaderStage*/ ) {

	}

	getVarsBodySnippet( /*shaderStage*/ ) {

	}

	getVarysHeaderSnippet( /*shaderStage*/ ) {

	}

	getVarysBodySnippet( /*shaderStage*/ ) {

	}

	composeUniforms() {

		const uniforms = this.uniforms[ 'fragment' ];

		for ( const uniform of uniforms ) {

			this.properties.uniforms[ uniform.name ] = uniform;

		}

	}

	build() {

		super.build();

		this.properties.defines[ 'NODE_HEADER_UNIFORMS' ] = this.defines[ 'fragment' ][ 'NODE_HEADER_UNIFORMS' ];
		this.properties.defines[ 'NODE_COLOR' ] = this.defines[ 'fragment' ][ 'NODE_COLOR' ];

		this.composeUniforms();

		return this;

	}

}

export { WebGLNodeBuilder };
