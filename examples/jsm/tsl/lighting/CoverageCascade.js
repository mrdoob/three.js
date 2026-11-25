import { clearcoat, select, vec3, vec4 } from 'three/tsl';

/**
 * A source of a coverage cascade. It answers the query of an indirect light provider with
 * a `vec4`: RGB is the light, premultiplied by alpha, and alpha is how much of what is
 * behind the source it hides. An alpha of one replaces what is behind, an alpha of zero
 * adds to it.
 *
 * A source is a function of the query and the builder, which can return `null` to sit a
 * material out. A source that holds one answer per pixel, such as a screen-space pass, can
 * be a `vec4` node. For indirect specular, such a node only answers the outermost lobe: the
 * clearcoat where the material is coated and the base lobe elsewhere. It has to be computed
 * from the normal and the roughness of that lobe, see `OutermostLobe.js`.
 *
 * @typedef {(Node<vec4>|function(Object, NodeBuilder): ?Node<vec4>)} CoverageCascadeSource
 */

/**
 * Returns a provider of indirect light, for `builtinIndirectContext()`, that answers from
 * an ordered list of sources. Each source fills what the sources before it left open, and
 * the last provider fills the rest.
 *
 * ```js
 * beautyPass.contextNode = builtinIndirectContext( {
 * 	specular: coverageCascade( [ ssrNode.getSpecularSource() ], defaultIndirectSpecular ),
 * 	diffuse: coverageCascade( [ giPass.getDiffuseSource() ], defaultIndirectDiffuse )
 * } );
 * ```
 *
 * @tsl
 * @function
 * @param {Array<CoverageCascadeSource>} sources - The sources, in order.
 * @param {?Function} [last=null] - The provider that fills what the sources leave open, usually `defaultIndirectSpecular` or `defaultIndirectDiffuse`.
 * @return {Function} The provider.
 */
export const coverageCascade = ( sources, last = null ) => ( query, builder ) => {

	const perPixel = isOutermostLobe( query, builder );

	let light = null, remaining = null;

	for ( const source of sources ) {

		let value = null;

		if ( typeof source === 'function' ) value = source( query, builder );
		else if ( perPixel === true ) value = source;
		else if ( perPixel !== false ) value = select( perPixel, vec4( source ), vec4( 0 ) );

		if ( value === null ) continue;

		value = vec4( value ).toVar();

		light = light === null ? value.rgb : light.add( value.rgb.mul( remaining ) );
		remaining = ( remaining === null ? value.a.oneMinus() : remaining.mul( value.a.oneMinus() ) ).toVar();

	}

	if ( last === null ) return light === null ? vec3( 0 ) : light;

	const behind = vec3( last( query, builder ) );

	return light === null ? behind : light.add( behind.mul( remaining ) );

};

// Whether the query is for the lobe that per-pixel sources hold the answer for. An indirect diffuse query has no lobe.
const isOutermostLobe = ( { lobe }, { material } ) => {

	if ( lobe === undefined ) return true;

	const coated = material.useClearcoat === true ? clearcoat.greaterThan( 0 ) : false;

	if ( lobe === 'clearcoat' ) return coated;
	if ( lobe === 'base' ) return coated === false ? true : coated.not();

	return false;

};
