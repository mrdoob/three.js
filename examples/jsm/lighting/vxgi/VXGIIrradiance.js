import { Fn, Loop, PI, abs, cos, cross, float, fract, interleavedGradientNoise, luminance, normalize, screenCoordinate, select, sin, sqrt, vec2, vec3 } from 'three/tsl';
import { createConeTracer } from './VXGIConeTracer.js';

/**
 * Creates a world-space diffuse irradiance sampler for a prepared {@link VXGIVolume}.
 * Call `volume.update( renderer, scene )` before baking. The sampler traces cosine-weighted
 * cones through the volume's radiance, including cached bounces, and the sky for cones that
 * leave the volume, see {@link VXGIVolume#skyRadiance}.
 * It can be passed directly to {@link LightMapper}, without a screen-space pass.
 * The cones are rotated per pixel with interleaved gradient noise like `VXGINode`. When baking, the
 * pixel is the light map texel. The optional sample index shifts the noise so that accumulated
 * samples, or a temporal filter like TRAA, converge. The sampler adds the luminance-weighted cone
 * directions to its optional fourth argument, for the directional light maps of {@link LightMapper}.
 *
 * @param {VXGIVolume} volume - The prepared voxel volume.
 * @param {Object} [options] - Options.
 * @param {number} [options.coneCount=8] - The number of cones per sample. Fewer cones are faster but coarser.
 * @return {function(Node<vec3>, Node<vec3>, ?Node<float>, ?Node<vec3>): Node<vec3>} The irradiance sampler.
 */
function vxgiIrradiance( volume, { coneCount = 8 } = {} ) {

	const trace = createConeTracer( volume, {
		radianceNode: volume.radianceNode,
		directionalNode: volume.directionalRadiance ? volume.directionalNode : null
	} );

	return ( position, normal, sample = float( 0 ), directionNode = null ) => Fn( () => {

		// interleaved gradient noise offsets of the stratified cone set, see VXGINode

		const shift = screenCoordinate.add( sample.mul( 5.588238 ) ).toConst();
		const elevation = interleavedGradientNoise( shift.add( vec2( 5.588238, 3.14159 ) ) ).toConst();
		const rotation = interleavedGradientNoise( shift ).toConst();

		const up = select( abs( normal.y ).lessThan( 0.99 ), vec3( 0, 1, 0 ), vec3( 1, 0, 0 ) );
		const tangent = normalize( cross( normal, up ) ).toConst();
		const bitangent = cross( normal, tangent ).toConst();
		const origin = position.add( normal.mul( volume.voxelSizeNode.mul( 1.5 ) ) ).toConst();
		const irradiance = vec3( 0 ).toVar();
		const directionSum = directionNode !== null ? vec3( 0 ).toVar() : null;

		Loop( coneCount, ( { i } ) => {

			const u = float( i ).add( elevation ).div( coneCount ).toConst();
			const phi = fract( float( i ).mul( 0.618034 ).add( rotation ) ).mul( PI.mul( 2 ) ).toConst();
			const radius = sqrt( u ).toConst();
			const direction = normalize( tangent.mul( cos( phi ).mul( radius ) ).add( bitangent.mul( sin( phi ).mul( radius ) ) ).add( normal.mul( sqrt( u.oneMinus() ) ) ) ).toConst();
			const cone = trace( origin, direction, float( Math.tan( Math.PI / 9 ) ), volume.traceDistanceNode );
			const sky = volume.skyRadiance( direction );
			const radiance = ( sky !== null ? cone.color.add( sky.mul( cone.visibility ) ) : cone.color ).toConst();

			irradiance.addAssign( radiance );

			if ( directionSum !== null ) directionSum.addAssign( direction.mul( luminance( radiance ) ) );

		} );

		if ( directionNode !== null ) directionNode.addAssign( directionSum.mul( PI.div( coneCount ) ) );

		return irradiance.mul( PI.div( coneCount ) );

	} )();

}

export { vxgiIrradiance };
