import LightingNode from './LightingNode.js';
import { roughness, clearcoat, clearcoatRoughness, retroreflectivity } from '../core/PropertyNode.js';
import { cameraWorldMatrix } from '../accessors/Camera.js';
import { normalView, clearcoatNormalView, normalWorld } from '../accessors/Normal.js';
import { positionViewDirection } from '../accessors/Position.js';
import { bentNormalView } from '../accessors/AccessorsUtils.js';
import { vec4, pow4 } from '../tsl/TSLBase.js';
import { select } from '../math/ConditionalNode.js';

/**
 * A source of indirect light. It answers a query with a `vec4`: RGB is the light, premultiplied
 * by the coverage, and alpha is the coverage, the part of the query the source answers.
 * A source with a coverage of zero adds its light to the sources behind it.
 *
 * An indirect specular source returns radiance. Its query is the direction to look in, in world
 * space, and the roughness of the specular lobe. An indirect diffuse source returns irradiance.
 * Its query is the normal of the surface, in world space.
 *
 * A source is a function of the query and the builder, which can return `null` to sit a material
 * out. A source that holds one answer per pixel, such as a screen-space pass, can be a `vec4`
 * node. For indirect specular, such a node only answers the outermost lobe: the clearcoat
 * where the material is coated and the base lobe elsewhere. It has to be computed from the
 * normal and the roughness of that lobe.
 *
 * @typedef {(Node<vec4>|function(Object, NodeBuilder): ?Node<vec4>)} IndirectLightSource
 */

/**
 * Resolves the indirect light of a material: the radiance of each of its specular lobes,
 * which is its indirect specular light, and the irradiance of its surface, which is its
 * indirect diffuse light.
 *
 * Each of the two is resolved from an ordered list of sources. A source fills what the sources
 * before it left open, and the environment and what the lights reflect fill the rest.
 *
 * @augments LightingNode
 */
class IndirectLightingNode extends LightingNode {

	static get type() {

		return 'IndirectLightingNode';

	}

	/**
	 * Constructs a new indirect lighting node.
	 *
	 * @param {Array<IndirectLightSource>} [specular=[]] - The indirect specular sources, in order.
	 * @param {Array<IndirectLightSource>} [diffuse=[]] - The indirect diffuse sources, in order.
	 * @param {?EnvironmentNode} [environmentNode=null] - The environment, the last source of both.
	 */
	constructor( specular = [], diffuse = [], environmentNode = null ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isIndirectLightingNode = true;

		this.specular = specular;
		this.diffuse = diffuse;
		this.environmentNode = environmentNode;

	}

	setup( builder ) {

		const { context, material } = builder;
		const { environmentNode } = this;

		if ( environmentNode !== null ) environmentNode.build( builder );

		// indirect diffuse, the sources hold their own occlusion

		const diffuse = this.resolve( this.diffuse, { normal: normalWorld }, true, builder );

		if ( diffuse.light !== null ) {

			context.irradiance.mulAssign( diffuse.remaining );
			context.occlusionAwareIrradiance.addAssign( diffuse.light );

		}

		if ( environmentNode !== null ) {

			const irradiance = environmentNode.getIndirectDiffuse( { normal: normalWorld } );

			context.irradiance.addAssign( diffuse.light !== null ? irradiance.mul( diffuse.remaining ) : irradiance );

		}

		// indirect specular, one query per lobe

		const useAnisotropy = material.useAnisotropy === true || material.anisotropy > 0;
		const baseNormalView = useAnisotropy ? bentNormalView : normalView;

		// per-pixel sources hold the outermost lobe: the clearcoat where there is one

		const clearcoatRadiance = context.lightingModel.clearcoatRadiance;
		const isCoated = clearcoatRadiance ? clearcoat.greaterThan( 0 ).toVar() : false;

		const base = this.getRadiance( reflect( baseNormalView, roughness ), roughness, isCoated === false ? true : isCoated.not(), builder );

		if ( base.light !== null && ( material.useRetroreflection === true || material.retroreflectivity > 0 ) ) {

			// the retroreflective lobe returns light toward its source, so it looks along the view direction

			const retro = this.getRadiance( toWorld( positionViewDirection, baseNormalView, roughness ), roughness, false, builder );

			if ( retro.light !== null ) base.light = retroreflectivity.clamp().mix( base.light, retro.light );

		}

		add( context.radiance, base );

		if ( clearcoatRadiance ) {

			add( clearcoatRadiance, this.getRadiance( reflect( clearcoatNormalView, clearcoatRoughness ), clearcoatRoughness, isCoated, builder ) );

		}

	}

	/**
	 * Returns the radiance of one specular lobe.
	 *
	 * @param {Node<vec3>} direction - The direction the lobe looks in, in world space.
	 * @param {Node<float>} roughness - The roughness of the lobe.
	 * @param {boolean|Node<bool>} perPixel - Whether this is the lobe that per-pixel sources hold the answer for.
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {{light: ?Node<vec3>, remaining: ?Node<float>}} The radiance of the sources and the environment and the coverage the sources left open, `null` if nothing answers.
	 */
	getRadiance( direction, roughness, perPixel, builder ) {

		const query = { direction, roughness };
		const result = this.resolve( this.specular, query, perPixel, builder );

		if ( this.environmentNode !== null ) {

			const environment = this.environmentNode.getIndirectSpecular( query );

			result.light = result.light !== null ? result.light.add( environment.mul( result.remaining ) ) : environment;

		}

		return result;

	}

	/**
	 * Resolves a list of sources front to back.
	 *
	 * @param {Array<IndirectLightSource>} sources - The sources, in order.
	 * @param {Object} query - The query.
	 * @param {boolean|Node<bool>} perPixel - Whether the sources that are nodes can answer the query.
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {{light: ?Node<vec3>, remaining: ?Node<float>}} The light of the sources and the coverage they left open, `null` if no source answers.
	 */
	resolve( sources, query, perPixel, builder ) {

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

		return { light, remaining };

	}

}

export default IndirectLightingNode;

// Mixing the direction with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
const toWorld = ( directionView, normalViewNode, roughnessNode ) => pow4( roughnessNode ).mix( directionView, normalViewNode ).normalize().transformDirection( cameraWorldMatrix );

const reflect = ( normalViewNode, roughnessNode ) => toWorld( positionViewDirection.negate().reflect( normalViewNode ), normalViewNode, roughnessNode );

// The sources go in front of what the lights have reflected into the target.
const add = ( target, { light, remaining } ) => {

	if ( remaining !== null ) target.mulAssign( remaining );
	if ( light !== null ) target.addAssign( light );

};
