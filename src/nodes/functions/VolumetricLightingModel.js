import LightingModel from '../core/LightingModel.js';
import { property } from '../core/PropertyNode.js';
import { float, If, uniform, vec3, vec4 } from '../tsl/TSLBase.js';
import { positionWorld } from '../accessors/Position.js';
import { modelViewMatrix } from '../accessors/ModelNode.js';
import { cameraFar, cameraNear, cameraPosition, cameraViewMatrix } from '../accessors/Camera.js';
import { Loop } from '../utils/LoopNode.js';
import { linearDepth, viewZToPerspectiveDepth } from '../display/ViewportDepthNode.js';

const scatteringDensity = property( 'vec3' );
const linearDepthRay = property( 'vec3' );
const outgoingRayLight = property( 'vec3' );

class VolumetricLightingModel extends LightingModel {

	constructor() {

		super();

	}

	start( builder ) {

		const { material, object, context } = builder;

		// TODO: Create a node for this

		const maxDistance = object.geometry.boundingSphere.radius * 2;

		// This approach dynamically changes the direction of the ray,
		// prioritizing the ray from the camera to the object if it is inside the mesh, and from the object to the camera if it is far away.

		const startPos = property( 'vec3' );
		const endPos = property( 'vec3' );

		If( cameraPosition.sub( positionWorld ).length().greaterThan( maxDistance ), () => {

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

			}

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

	direct( { lightNode, lightColor }, builder ) {

		const depthNode = builder.material.depthNode;

		// Ignore lights with infinite distance

		if ( lightNode.light.distance === undefined ) return;

		// TODO: We need a viewportOpaque*() ( output, depth ) to fit with modern rendering approches

		const directLight = lightColor.xyz.toVar();
		directLight.mulAssign( lightNode.shadowNode ); // it no should be necessary if used in the same render pass

		if ( depthNode !== null ) {

			const linearDepthNode = linearDepth( depthNode );

			If( linearDepthNode.greaterThanEqual( linearDepthRay ), () => {

				scatteringDensity.addAssign( directLight );

			} );

		} else {

			scatteringDensity.addAssign( directLight );

		}

	}

	finish( { outgoingLight } ) {

		outgoingLight.assign( outgoingRayLight );

	}

}

export default VolumetricLightingModel;
