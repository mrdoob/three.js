/**
 * Abstract class for implementing lighting models. The module defines
 * multiple methods that concrete lighting models can implement. These
 * methods are executed at different points during the light evaluation
 * process.
 */
class LightingModel {

	/**
	 * This method is intended for setting up lighting model and context data
	 * which are later used in the evaluation process.
	 *
	 * @abstract
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	start( builder ) {

		// lights ( direct )

		builder.lightsNode.setupLights( builder, builder.lightsNode.getLightNodes( builder ) );

		// indirect

		this.indirect( builder );

	}

	/**
	 * This method is intended for executing final tasks like final updates
	 * to the outgoing light.
	 *
	 * @abstract
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	finish( /*builder*/ ) { }

	/**
	 * This method is intended for implementing the direct light term and
	 * executed during the build process of directional, point and spot light nodes.
	 *
	 * @abstract
	 * @param {Object} lightData - The light data.
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	direct( /*lightData, builder*/ ) { }

	/**
	 * This method is intended for implementing the direct light term for
	 * rect area light nodes.
	 *
	 * @abstract
	 * @param {Object} lightData - The light data.
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	directRectArea( /*lightData, builder*/ ) {}

	/**
	 * This method is intended for implementing the indirect light term.
	 *
	 * @abstract
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	indirect( /*builder*/ ) { }

	/**
	 * This method is intended for reflecting ambient and hemisphere lights as a distant
	 * environment. It is called by the light nodes while they are set up.
	 *
	 * @abstract
	 * @param {function(Node<vec3>, Node<float>, Node<vec3>):Node<vec3>} radianceAt - Returns the light's prefiltered radiance for a world space direction, roughness and surface normal.
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	indirectRadiance( /*radianceAt, builder*/ ) { }

	/**
	 * This method is intended for implementing the ambient occlusion term.
	 * Unlike other methods, this method must be called manually by the lighting
	 * model in its indirect term.
	 *
	 * @abstract
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	ambientOcclusion( /*input, stack, builder*/ ) { }

}

export default LightingModel;
