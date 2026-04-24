import LightingModel from '../core/LightingModel.js';
import { property } from '../core/PropertyNode.js';
import { float, If, uniform, vec3, vec4 } from '../tsl/TSLBase.js';
import { positionWorld } from '../accessors/Position.js';
import { cameraFar, cameraNear, cameraPosition, cameraViewMatrix } from '../accessors/Camera.js';
import { Loop } from '../utils/LoopNode.js';
import { linearDepth, viewZToPerspectiveDepth } from '../display/ViewportDepthNode.js';
import { modelRadius } from '../accessors/ModelNode.js';
import { LTC_Evaluate_Volume } from './BSDF/LTC.js';

const scatteringDensity = property( 'vec3' );
const linearDepthRay = property( 'vec3' );
const outgoingRayLight = property( 'vec3' );

/**
 * VolumetricLightingModel class extends the LightingModel to implement volumetric lighting effects.
 * This model calculates the scattering and transmittance of light through a volumetric medium.
 * It dynamically adjusts the direction of the ray based on the camera and object positions.
 * The model supports custom scattering and depth nodes to enhance the lighting effects.
 *
 * @augments LightingModel
 */
class VolumetricLightingModel extends LightingModel {

	constructor() {

		super();

	}

	start( builder ) {

		const { material } = builder;

		const startPos = property( 'vec3' );
		const endPos = property( 'vec3' );

		// This approach dynamically changes the direction of the ray,
		// prioritizing the ray from the camera to the object if it is inside the mesh, and from the object to the camera if it is far away.

		If( cameraPosition.sub( positionWorld ).length().greaterThan( modelRadius.mul( 2 ) ), () => {

			startPos.assign( cameraPosition );
			endPos.assign( positionWorld );

		} ).Else( () => {

			startPos.assign( positionWorld );
			endPos.assign( cameraPosition );

		} );

		//

		const viewVector = endPos.sub( startPos );

		const steps = uniform( 'int' ).onRenderUpdate( ( { material } ) => material.steps );
		const stepSize = viewVector.length().div( steps ).toVar();

		const rayDir = viewVector.normalize().toVar(); // TODO: toVar() should be automatic here ( in loop )

		const distTravelled = float( 0.0 ).toVar();
		const transmittance = vec3( 1 ).toVar();

		if ( material.offsetNode ) {

			// reduce banding

			distTravelled.addAssign( material.offsetNode.mul( stepSize ) );

		}

		Loop( steps, () => {

			const positionRay = startPos.add( rayDir.mul( distTravelled ) );
			const positionViewRay = cameraViewMatrix.mul( vec4( positionRay, 1 ) ).xyz;

			if ( material.depthNode !== null ) {

				linearDepthRay.assign( linearDepth( viewZToPerspectiveDepth( positionViewRay.z, cameraNear, cameraFar ) ) );

				builder.context.sceneDepthNode = linearDepth( material.depthNode ).toVar();

			}

			builder.context.positionWorld = positionRay;
			builder.context.shadowPositionWorld = positionRay;
			builder.context.positionView = positionViewRay;

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

	scatteringLight( lightColor, builder ) {

		const sceneDepthNode = builder.context.sceneDepthNode;

		if ( sceneDepthNode ) {

			If( sceneDepthNode.greaterThanEqual( linearDepthRay ), () => {

				scatteringDensity.addAssign( lightColor );

			} );

		} else {

			scatteringDensity.addAssign( lightColor );

		}

	}

	direct( { lightNode, lightColor }, builder ) {

		// Ignore lights with infinite distance

		if ( lightNode.light.distance === undefined ) return;

		// TODO: We need a viewportOpaque*() ( output, depth ) to fit with modern rendering approaches

		const directLight = lightColor.xyz.toVar();
		directLight.mulAssign( lightNode.shadowNode ); // it no should be necessary if used in the same render pass

		this.scatteringLight( directLight, builder );

	}

	directRectArea( { lightColor, lightPosition, halfWidth, halfHeight }, builder ) {

		const p0 = lightPosition.add( halfWidth ).sub( halfHeight ); // counterclockwise; light shines in local neg z direction
		const p1 = lightPosition.sub( halfWidth ).sub( halfHeight );
		const p2 = lightPosition.sub( halfWidth ).add( halfHeight );
		const p3 = lightPosition.add( halfWidth ).add( halfHeight );

		const P = builder.context.positionView;

		const directLight = lightColor.xyz.mul( LTC_Evaluate_Volume( { P, p0, p1, p2, p3 } ) ).pow( 1.5 );

		this.scatteringLight( directLight, builder );

	}

	finish( builder ) {

		builder.context.outgoingLight.assign( outgoingRayLight );

	}

}

export default VolumetricLightingModel;
