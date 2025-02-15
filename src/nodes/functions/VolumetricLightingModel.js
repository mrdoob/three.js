import LightingModel from '../core/LightingModel.js';
import { property } from '../core/PropertyNode.js';
import { float, If, uniform, vec3, vec4 } from '../tsl/TSLBase.js';
import { positionWorld } from '../accessors/Position.js';
import { modelViewMatrix } from '../accessors/ModelNode.js';
import { cameraFar, cameraNear, cameraPosition } from '../accessors/Camera.js';
import { Break, Loop } from '../utils/LoopNode.js';
import { linearDepth, viewportLinearDepth, viewZToPerspectiveDepth } from '../display/ViewportDepthNode.js';

const scatteringDensity = property( 'vec3', 'scatteringDensity' );
const lightDepthRay = property( 'vec3', 'lightDepthRay' );
const outgoingRayLight = property( 'vec3', 'outgoingRayLight' );

class VolumetricLightingModel extends LightingModel {

	constructor() {

		super();

	}

	start( builder ) {

		const { material, context } = builder;

		const steps = uniform( 50 ).onRenderUpdate( ( { material } ) => material.steps );
		const stepSize = uniform( .4 ).onRenderUpdate( ( { material } ) => material.stepSize );

		const startPos = positionWorld;
		const viewVector = startPos.sub( cameraPosition );

		const rayDir = viewVector.normalize().toVar(); // TODO: toVar() should be automatic here ( in loop )

		const distTravelled = float( 0.0 ).toVar();
		const transmittance = vec3( 1 ).toVar();

		if ( material.offsetNode ) {

			// reduce banding

			distTravelled.addAssign( material.offsetNode.mul( stepSize ) );

		}

		Loop( steps, () => {

			const positionRay = cameraPosition.add( rayDir.mul( distTravelled ) );
			const positionViewRay = modelViewMatrix.mul( vec4( positionRay, 1 ) ).xyz;

			lightDepthRay.assign( linearDepth( viewZToPerspectiveDepth( positionViewRay.z, cameraNear, cameraFar ) ) );

			context.positionWorld = positionRay;
			context.shadowPositionWorld = positionRay;
			context.positionView = positionViewRay;

			scatteringDensity.assign( 0 );

			let scatteringNode;

			if ( material.scatteringNode ) {

				scatteringNode = material.scatteringNode( {
					positionRay
				} );

			}

			super.start( builder );

			if ( scatteringNode ) {

				scatteringDensity.mulAssign( scatteringNode );

			}

			// beer's law
			const falloff = scatteringDensity.mul( .01 ).negate().mul( stepSize ).exp();
			transmittance.mulAssign( falloff );

			// move along the ray

			distTravelled.addAssign( stepSize );

		} );

		outgoingRayLight.addAssign( transmittance.saturate().oneMinus() );

	}

	direct( { lightNode, lightColor } ) {

		// Ignore lights with infinite distance

		if ( lightNode.light.distance === undefined ) return;

		// TODO: We need a viewportOpaqueLinearDepth() and viewportOpaqueTexture() to fit with modern rendering approche

		scatteringDensity.addAssign( lightColor.xyz );

		/*If( viewportLinearDepth.greaterThanEqual( lightDepthRay ), () => {

			scatteringDensity.addAssign( lightColor.xyz );

		} );*/

	}

	finish( { outgoingLight } ) {

		outgoingLight.assign( outgoingRayLight );

	}

}

export default VolumetricLightingModel;
