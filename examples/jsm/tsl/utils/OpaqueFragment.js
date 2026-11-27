import { Discard, Fn, diffuseColor, step, vec4 } from 'three/tsl';

/**
 * Selects the fragments of transparent materials that a pre-pass keeps, for the attachments
 * that screen-space effects trace. A fragment is kept when its alpha reaches the threshold
 * and discarded otherwise, which leaves the geometry behind it in the buffers. By default
 * only fully opaque fragments are kept. Transparent materials that do not write depth are
 * discarded entirely.
 *
 * ```js
 * prePass.setMRT( mrt( { output: opaqueFragment( packNormalToOctahedral( normalView ) ) } ) );
 * ```
 *
 * @tsl
 * @function
 * @param {Node} node - The node to output.
 * @param {Node<float>|number} [alphaThreshold=1] - The alpha a fragment of a transparent material needs to be kept.
 * @returns {Node}
 */
export const opaqueFragment = ( node, alphaThreshold = 1 ) => Fn( ( { material } ) => {

	if ( material.transparent === true ) {

		if ( material.depthWrite === false ) Discard();
		else diffuseColor.a.lessThan( alphaThreshold ).discard();

	}

	return node;

} )();

/**
 * Limits a per-pixel source of a coverage cascade, like SSR, to the fragments its pre-pass
 * kept with {@link opaqueFragment}. A fragment the pre-pass discarded would read what was
 * traced for the surface behind it, so it gets no light and no coverage and the next
 * source, usually the environment, answers instead.
 *
 * ```js
 * beautyPass.contextNode = builtinIndirectContext( {
 * 	specular: coverageCascade( [ opaqueFragmentSource( ssrNode.getSpecularSource() ) ], defaultIndirectSpecular )
 * } );
 * ```
 *
 * @tsl
 * @function
 * @param {Node<vec4>} source - The light premultiplied by coverage in RGB and the coverage in alpha.
 * @param {Node<float>|number} [alphaThreshold=1] - The threshold the pre-pass uses.
 * @returns {Node<vec4>}
 */
export const opaqueFragmentSource = ( source, alphaThreshold = 1 ) => Fn( ( { material } ) => {

	if ( material.transparent !== true ) return source;
	if ( material.depthWrite === false ) return vec4( 0 );

	return vec4( source ).mul( step( alphaThreshold, diffuseColor.a ) );

} )();
