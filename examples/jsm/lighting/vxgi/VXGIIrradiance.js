import { Fn, PI, float, interleavedGradientNoise, luminance, screenCoordinate, vec2, vec3 } from 'three/tsl';
import { createConeTracer, gather } from './VXGIConeTracer.js';

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

		const origin = position.add( normal.mul( volume.voxelSizeNode.mul( 1.5 ) ) ).toConst();
		const directionSum = directionNode !== null ? vec3( 0 ).toVar() : null;

		// cones that leave the volume see the sky, and the directions are weighted by the luminance of each cone

		const radiance = ( direction, cone ) => {

			const sky = volume.skyRadiance( direction );
			const value = ( sky !== null ? cone.color.add( sky.mul( cone.visibility ) ) : cone.color ).toConst();

			if ( directionSum !== null ) directionSum.addAssign( direction.mul( luminance( value ) ) );

			return value;

		};

		const { color } = gather( trace, origin, normal, coneCount, float( Math.tan( Math.PI / 9 ) ), volume.traceDistanceNode, rotation, elevation, null, radiance );

		if ( directionNode !== null ) directionNode.addAssign( directionSum.mul( PI.div( coneCount ) ) );

		return color.mul( PI );

	} )();

}

export { vxgiIrradiance };
