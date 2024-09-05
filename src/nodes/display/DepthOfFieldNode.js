import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UV.js';
import { Fn, nodeObject, vec2, vec4 } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { clamp } from '../math/MathNode.js';
import { convertToTexture } from '../utils/RTTNode.js';

class DepthOfFieldNode extends TempNode {

	static get type() {

		return 'DepthOfFieldNode';

	}

	constructor( textureNode, viewZNode, focusNode, apertureNode, maxblurNode ) {

		super();

		this.textureNode = textureNode;
		this.viewZNode = viewZNode;

		this.focusNode = focusNode;
		this.apertureNode = apertureNode;
		this.maxblurNode = maxblurNode;

		this._aspect = uniform( 0 );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	updateBefore() {

		const map = this.textureNode.value;

		this._aspect.value = map.image.width / map.image.height;

	}

	setup() {

		const textureNode = this.textureNode;
		const uvNode = textureNode.uvNode || uv();

		const sampleTexture = ( uv ) => textureNode.uv( uv );

		const dof = Fn( () => {

			const aspectcorrect = vec2( 1.0, this._aspect );

			const factor = this.focusNode.add( this.viewZNode );

			const dofblur = vec2( clamp( factor.mul( this.apertureNode ), this.maxblurNode.negate(), this.maxblurNode ) );

			const dofblur9 = dofblur.mul( 0.9 );
			const dofblur7 = dofblur.mul( 0.7 );
			const dofblur4 = dofblur.mul( 0.4 );

			let col = vec4( 0.0 );

			col = col.add( sampleTexture( uvNode ) );

			col = col.add( sampleTexture( uvNode.add( vec2( 0.0, 0.4 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.15, 0.37 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.29, 0.29 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.37, 0.15 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.40, 0.0 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.37, - 0.15 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.29, - 0.29 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.15, - 0.37 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.0, - 0.4 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.15, 0.37 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.29, 0.29 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.37, 0.15 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.4, 0.0 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.37, - 0.15 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.29, - 0.29 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.15, - 0.37 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.15, 0.37 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.37, 0.15 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.37, - 0.15 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.15, - 0.37 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.15, 0.37 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.37, 0.15 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.37, - 0.15 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.15, - 0.37 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.29, 0.29 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.40, 0.0 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.29, - 0.29 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.0, - 0.4 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.29, 0.29 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.4, 0.0 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.29, - 0.29 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.0, 0.4 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.29, 0.29 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.4, 0.0 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.29, - 0.29 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.0, - 0.4 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.29, 0.29 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.4, 0.0 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.29, - 0.29 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.0, 0.4 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );

			col = col.div( 41 );
			col.a = 1;

			return vec4( col );


		} );

		const outputNode = dof();

		return outputNode;

	}

}

export default DepthOfFieldNode;

export const dof = ( node, viewZNode, focus = 1, aperture = 0.025, maxblur = 1 ) => nodeObject( new DepthOfFieldNode( convertToTexture( node ), nodeObject( viewZNode ), nodeObject( focus ), nodeObject( aperture ), nodeObject( maxblur ) ) );
