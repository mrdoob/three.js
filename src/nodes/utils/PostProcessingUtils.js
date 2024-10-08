import { Fn, vec2, vec3, vec4 } from '../tsl/TSLBase.js';
import { WebGPUCoordinateSystem } from '../../constants.js';

export const getViewPosition = /*@__PURE__*/ Fn( ( [ screenPosition, depth, projectionMatrixInverse ], builder ) => {

	let clipSpacePosition;

	if ( builder.renderer.coordinateSystem === WebGPUCoordinateSystem ) {

		screenPosition = vec2( screenPosition.x, screenPosition.y.oneMinus() ).mul( 2.0 ).sub( 1.0 );
		clipSpacePosition = vec4( vec3( screenPosition, depth ), 1.0 );

	} else {

		clipSpacePosition = vec4( vec3( screenPosition, depth ).mul( 2.0 ).sub( 1.0 ), 1.0 );

	}

	const viewSpacePosition = vec4( projectionMatrixInverse.mul( clipSpacePosition ) );

	return viewSpacePosition.xyz.div( viewSpacePosition.w );

} );

export const getSceneUV = /*@__PURE__*/ Fn( ( [ viewPosition, projectionMatrix ], builder )=> {

	const sampleClipPos = projectionMatrix.mul( vec4( viewPosition, 1.0 ) );
	let sampleUv = sampleClipPos.xy.div( sampleClipPos.w ).mul( 0.5 ).add( 0.5 ).toVar();

	if ( builder.renderer.coordinateSystem === WebGPUCoordinateSystem ) {

		sampleUv = vec2( sampleUv.x, sampleUv.y.oneMinus() );

	}

	return vec2( sampleUv );

} );
