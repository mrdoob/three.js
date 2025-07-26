import { uniform } from '../core/UniformNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { Vector3 } from '../../math/Vector3.js';
import { cameraViewMatrix } from './Camera.js';
import { positionWorld } from './Position.js';

let uniformsLib;

function getLightData( light ) {

	uniformsLib = uniformsLib || new WeakMap();

	let uniforms = uniformsLib.get( light );

	if ( uniforms === undefined ) uniformsLib.set( light, uniforms = {} );

	return uniforms;

}

/**
 * TSL function for getting a shadow matrix uniform node for the given light.
 *
 * @tsl
 * @function
 * @param {Light} light -The light source.
 * @returns {UniformNode<mat4>} The shadow matrix uniform node.
 */
export function lightShadowMatrix( light ) {

	const data = getLightData( light );

	return data.shadowMatrix || ( data.shadowMatrix = uniform( 'mat4' ).setGroup( renderGroup ).onRenderUpdate( ( frame ) => {

		if ( light.castShadow !== true || frame.renderer.shadowMap.enabled === false ) {

			light.shadow.updateMatrices( light );

		}

		return light.shadow.matrix;

	} ) );

}

/**
 * TSL function for getting projected uv coordinates for the given light.
 * Relevant when using maps with spot lights.
 *
 * @tsl
 * @function
 * @param {Light} light -The light source.
 * @param {Node<vec3>} [position=positionWorld] -The position to project.
 * @returns {Node<vec3>} The projected uvs.
 */
export function lightProjectionUV( light, position = positionWorld ) {

	const spotLightCoord = lightShadowMatrix( light ).mul( position );
	const projectionUV = spotLightCoord.xyz.div( spotLightCoord.w );

	return projectionUV;

}

/**
 * TSL function for getting the position in world space for the given light.
 *
 * @tsl
 * @function
 * @param {Light} light -The light source.
 * @returns {UniformNode<vec3>} The light's position in world space.
 */
export function lightPosition( light ) {

	const data = getLightData( light );

	return data.position || ( data.position = uniform( new Vector3() ).setGroup( renderGroup ).onRenderUpdate( ( _, self ) => self.value.setFromMatrixPosition( light.matrixWorld ) ) );

}

/**
 * TSL function for getting the light target position in world space for the given light.
 *
 * @tsl
 * @function
 * @param {Light} light -The light source.
 * @returns {UniformNode<vec3>} The light target position in world space.
 */
export function lightTargetPosition( light ) {

	const data = getLightData( light );

	return data.targetPosition || ( data.targetPosition = uniform( new Vector3() ).setGroup( renderGroup ).onRenderUpdate( ( _, self ) => self.value.setFromMatrixPosition( light.target.matrixWorld ) ) );

}

/**
 * TSL function for getting the position in view space for the given light.
 *
 * @tsl
 * @function
 * @param {Light} light - The light source.
 * @returns {UniformNode<vec3>} The light's position in view space.
 */
export function lightViewPosition( light ) {

	const data = getLightData( light );

	return data.viewPosition || ( data.viewPosition = uniform( new Vector3() ).setGroup( renderGroup ).onRenderUpdate( ( { camera }, self ) => {

		self.value = self.value || new Vector3();
		self.value.setFromMatrixPosition( light.matrixWorld );

		self.value.applyMatrix4( camera.matrixWorldInverse );

	} ) );

}

/**
 * TSL function for getting the light target direction for the given light.
 *
 * @tsl
 * @function
 * @param {Light} light -The light source.
 * @returns {Node<vec3>} The light's target direction.
 */
export const lightTargetDirection = ( light ) => cameraViewMatrix.transformDirection( lightPosition( light ).sub( lightTargetPosition( light ) ) );
