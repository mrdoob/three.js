import TempNode from '../core/TempNode.js';
import { nodeObject, addNodeElement, tslFn, float, vec2, vec3, vec4 } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { mul } from '../math/OperatorNode.js';
import { uv } from '../accessors/UVNode.js';
import { texture } from '../accessors/TextureNode.js';
import { uniform } from '../core/UniformNode.js';
import { Vector2, RenderTarget } from 'three';
import QuadMesh from '../../objects/QuadMesh.js';

const quadMesh = new QuadMesh();

class GaussianBlurNode extends TempNode {

	constructor( textureNode, sigma = 2 ) {

		super( textureNode );

		this.textureNode = textureNode;
		this.sigma = sigma;

		this.directionNode = vec2( 1 );

		this._invSize = uniform( new Vector2() );
		this._passDirection = uniform( new Vector2() );

		this._horizontalRT = new RenderTarget();
		this._verticalRT = new RenderTarget();

		this.updateBeforeType = NodeUpdateType.RENDER;

		this.resolution = new Vector2( 1, 1 );

	}

	setSize( width, height ) {

		width = Math.max( Math.round( width * this.resolution.x ), 1 );
		height = Math.max( Math.round( height * this.resolution.y ), 1 );

		this._invSize.value.set( 1 / width, 1 / height );
		this._horizontalRT.setSize( width, height );
		this._verticalRT.setSize( width, height );

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		const textureNode = this.textureNode;
		const map = textureNode.value;

		const currentRenderTarget = renderer.getRenderTarget();
		const currentTexture = textureNode.value;

		quadMesh.material = this._material;

		this.setSize( map.image.width, map.image.height );

		// horizontal

		renderer.setRenderTarget( this._horizontalRT );

		this._passDirection.value.set( 1, 0 );

		quadMesh.render( renderer );

		// vertical

		textureNode.value = this._horizontalRT.texture;
		renderer.setRenderTarget( this._verticalRT );

		this._passDirection.value.set( 0, 1 );

		quadMesh.render( renderer );

		// restore

		renderer.setRenderTarget( currentRenderTarget );
		textureNode.value = currentTexture;

	}

	setup( builder ) {

		const textureNode = this.textureNode;

		if ( textureNode.isTextureNode !== true ) {

			console.error( 'GaussianBlurNode requires a TextureNode.' );

			return vec4();

		}

		//

		const uvNode = textureNode.uvNode || uv();

		const sampleTexture = ( uv ) => textureNode.cache().context( { getUV: () => uv, forceUVContext: true } );

		const blur = tslFn( () => {

			const kernelSize = 3 + ( 2 * this.sigma );
			const gaussianCoefficients = this._getCoefficients( kernelSize );

			const invSize = this._invSize;
			const direction = vec2( this.directionNode ).mul( this._passDirection );

			const weightSum = float( gaussianCoefficients[ 0 ] ).toVar();
			const diffuseSum = vec3( sampleTexture( uvNode ).mul( weightSum ) ).toVar();

			for ( let i = 1; i < kernelSize; i ++ ) {

				const x = float( i );
				const w = float( gaussianCoefficients[ i ] );

				const uvOffset = vec2( direction.mul( invSize.mul( x ) ) ).toVar();

				const sample1 = vec3( sampleTexture( uvNode.add( uvOffset ) ) );
				const sample2 = vec3( sampleTexture( uvNode.sub( uvOffset ) ) );

				diffuseSum.addAssign( sample1.add( sample2 ).mul( w ) );
				weightSum.addAssign( mul( 2.0, w ) );

			}

			return vec4( diffuseSum.div( weightSum ), 1.0 );

		} );

		//

		const material = this._material || ( this._material = builder.createNodeMaterial( 'MeshBasicNodeMaterial' ) );
		material.fragmentNode = blur();

		//

		const properties = builder.getNodeProperties( this );
		properties.textureNode = textureNode;

		//

		return texture( this._verticalRT.texture );

	}

	_getCoefficients( kernelRadius ) {

		const coefficients = [];

		for ( let i = 0; i < kernelRadius; i ++ ) {

			coefficients.push( 0.39894 * Math.exp( - 0.5 * i * i / ( kernelRadius * kernelRadius ) ) / kernelRadius );

		}

		return coefficients;

	}

}

export const gaussianBlur = ( node, sigma ) => nodeObject( new GaussianBlurNode( nodeObject( node ), sigma ) );

addNodeElement( 'gaussianBlur', gaussianBlur );

export default GaussianBlurNode;

