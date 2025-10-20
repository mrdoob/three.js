import { TempNode, MeshBasicNodeMaterial, RenderTarget, QuadMesh, Vector2 } from 'three/webgpu';
import { nodeObject, vec4, vec3, float, modelPosition, modelWorldMatrix, Fn, NodeUpdateType, texture, screenUV, fract, vec2, dot, abs, sqrt, mix, saturate, If, Loop, int } from 'three/tsl';

//Source: https://www.jacktollenaar.top/mesh-seam-smoothing-blending#h.50wag6hqg9gh

const _size = /*@__PURE__*/ new Vector2();

class MeshBlendNode extends TempNode {

	constructor( sceneOutputNode, sceneDepthNode, camera, scene ) {

		super( 'vec4' );
		this.sceneOutputNode = sceneOutputNode;
		this.sceneDepthNode = sceneDepthNode;
		this.updateBeforeType = NodeUpdateType.FRAME;
		this.renderTarget = new RenderTarget( 1, 1 );
		this.mainCamera = camera;
		this.mainScene = scene;
		this.blendFactor = float( 1.2 );
		this.kernelSize = float( 5 );
		this.kernelRadius = float( 0.01 * this.blendFactor.value );
		this.depthFalloff = float( 0.001 * this.blendFactor.value );
		this.debugMaterial = new MeshBasicNodeMaterial();
		this._quadMesh = new QuadMesh( this.debugMaterial );

	}

	setup() {

		const CustomHash = Fn( ( [ p ] ) => {

			var lp = fract( p.mul( 0.3183099 ).add( 0.1 ) );
			lp = lp.mul( 17.0 );
			return fract( lp.x.mul( lp.y ).mul( lp.z ).mul( lp.x.add( lp.y ).add( lp.z ) ) );

		} );

		this.hashShader = Fn( () => {

			const p = vec3( modelWorldMatrix.mul( vec3( modelPosition ) ) ).toVar();
			return vec4( CustomHash( p ), 0., 0., 1. );

		} );
		this.hashMaterial = new MeshBasicNodeMaterial();
		this.hashMaterial.colorNode = this.hashShader();

		const uv = screenUV;
		const FinalOutputNode = Fn( ()=>{

			// sampling helpers (capture outside Fn so they can be used with varying UV offsets)
			const sampleRT = ( v ) => texture( this.renderTarget.textures[ 0 ], v );

			const outputPassFunc1 = Fn( ( [ sceneDepthNode, uvNode, kernelSizeNode, kernelRadiusNode ] ) => {

				const sceneDepthVar = sceneDepthNode.toVar();

				// kernelSizeNode is expected to be a numeric node with a .value available at build time
				const kSize = kernelSizeNode.value || 0;

				const seamLocation = vec2( 0., 0. ).toVar();
				var minDist = float( 9999999. ).toVar();

				const objectIDColor = sampleRT( uvNode ).toVar();

				// Use TSL Loop so the iteration becomes shader-side loops
				const k = int( kSize );
				Loop( { start: k.negate(), end: k, type: 'int', condition: '<=', name: 'x' }, ( { x } ) => {

					Loop( { start: k.negate(), end: k, type: 'int', condition: '<=', name: 'y' }, ( { y } ) => {

						const offset = vec2( x.toFloat(), y.toFloat() ).mul( kernelRadiusNode.mul( sceneDepthVar.r.mul( 0.3 ) ).div( float( kSize ) ) ).toVar();
						const SampleUV = uvNode.add( offset ).toVar();
						const sampledObjectIDColor = sampleRT( SampleUV ).toVar();
						If( sampledObjectIDColor.x.notEqual( objectIDColor.x ), () => {

							const dist = dot( offset, offset );
							If( dist.lessThan( minDist ), () => {

								minDist.assign( dist );
								seamLocation.assign( offset );

							} );

						} );

					} );

				} );

				return vec4( seamLocation.x, seamLocation.y, minDist, 1. );

			} );

			const finalPass = Fn( ( [ sceneColor, mirroredColor, kernelRadiusNode, sceneDepth, otherDepth, depthFalloffNode, minDist ] ) => {

				const depthDiff = abs( otherDepth.r.sub( sceneDepth.r ) );

				const maxSearchDistance = kernelRadiusNode.div( sceneDepth.r );
				const weight = saturate( float( 0.5 ).sub( sqrt( minDist ).div( maxSearchDistance ) ) );
				const depthWeight = saturate( float( 1. ).sub( depthDiff.div( depthFalloffNode.mul( kernelRadiusNode ) ) ) );
				const finalWeight = weight.mul( depthWeight );

				return mix( sceneColor, mirroredColor, finalWeight );

			} );

			const pass1 = outputPassFunc1(
				texture( this.sceneDepthNode, uv ),
				uv, this.kernelSize, this.kernelRadius );

			const mirroredColor = texture( this.sceneOutputNode, uv.add( pass1.xy.mul( 2. ) ) );
			const otherDepth = texture( this.sceneDepthNode, uv.add( pass1.xy.mul( 2. ) ) );

			const sceneColor = texture( this.sceneOutputNode, uv );
			const sceneDepth = texture( this.sceneDepthNode, uv );
			return finalPass( sceneColor, mirroredColor, this.kernelRadius, sceneDepth, otherDepth, this.depthFalloff, pass1.z );

		} )();
		return FinalOutputNode;

	}

	setSize( width, height ) {

		this.renderTarget.setSize( width, height );

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const size = renderer.getSize( _size );
		this.setSize( size.width, size.height );

		this.mainScene.overrideMaterial = this.hashMaterial;
		renderer.setRenderTarget( this.renderTarget );
		renderer.render( this.mainScene, this.mainCamera );

		this.mainScene.overrideMaterial = null;
		renderer.setRenderTarget( null );
		this._quadMesh.render( renderer );

	}

	dispose() {

		this.renderTarget.dispose();
		this.hashMaterial.dispose();
		this.debugMaterial.dispose();

	}

}

export const meshblend = ( sceneOutputNode, sceneDepthNode, camera, scene ) => nodeObject( new MeshBlendNode( sceneOutputNode, sceneDepthNode, camera, scene ) );
