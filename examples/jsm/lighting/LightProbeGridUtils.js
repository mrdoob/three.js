import { Box3, DirectionalLight, Sphere, Vector3 } from 'three';

const _casterBox = /*@__PURE__*/ new Box3();
const _casterSphere = /*@__PURE__*/ new Sphere();
const _sunDirection = /*@__PURE__*/ new Vector3();

// One bake light per SunLight: WebGPU pipelines are keyed by light identity,
// so a fresh light per ranged bake would recompile every material each call.
const _bakeLights = /*@__PURE__*/ new WeakMap();

/**
 * Replaces every visible, shadow-casting `SunLight` in the scene with a
 * directional light fitted to the shadow casters. SunLight shadow cascades are
 * fitted to the active camera every render, which the frozen shadow maps of a
 * bake cannot provide.
 *
 * @param {Scene} scene - The scene to bake.
 * @return {?Array<Object>} The replacements to pass to {@link restoreSunLights}, or `null` if the scene has no such lights.
 */
function replaceSunLights( scene ) {

	const sunLights = [];

	scene.traverse( ( object ) => {

		if ( object.isSunLight === true && object.visible === true && object.castShadow === true ) sunLights.push( object );

	} );

	if ( sunLights.length === 0 ) return null;

	_casterBox.makeEmpty();

	scene.traverse( ( object ) => {

		if ( object.isMesh === true && object.castShadow === true ) _casterBox.expandByObject( object );

	} );

	_casterBox.getBoundingSphere( _casterSphere );

	const center = _casterSphere.center;
	const radius = Math.max( _casterSphere.radius, 1 );

	const replacements = [];

	for ( const sunLight of sunLights ) {

		let bakeLight = _bakeLights.get( sunLight );

		if ( bakeLight === undefined ) {

			bakeLight = new DirectionalLight();
			bakeLight.castShadow = true;
			_bakeLights.set( sunLight, bakeLight );

		}

		bakeLight.color.copy( sunLight.color );
		bakeLight.intensity = sunLight.intensity;
		bakeLight.shadow.mapSize.copy( sunLight.shadow.mapSize );

		const shadowCamera = bakeLight.shadow.camera;
		shadowCamera.left = - radius;
		shadowCamera.right = radius;
		shadowCamera.top = radius;
		shadowCamera.bottom = - radius;
		shadowCamera.near = radius * 0.5;
		shadowCamera.far = radius * 3.5;
		shadowCamera.updateProjectionMatrix();

		_sunDirection.setFromMatrixPosition( sunLight.matrixWorld ).normalize();
		bakeLight.target.position.copy( center );
		bakeLight.position.copy( center ).addScaledVector( _sunDirection, radius * 2 );

		scene.add( bakeLight, bakeLight.target );
		bakeLight.target.updateMatrixWorld();
		bakeLight.updateMatrixWorld();

		sunLight.visible = false;

		replacements.push( { sunLight, bakeLight } );

	}

	return replacements;

}

/**
 * Restores the sun lights replaced by {@link replaceSunLights}.
 *
 * @param {Scene} scene - The baked scene.
 * @param {Array<Object>} replacements - The replacements to undo.
 */
function restoreSunLights( scene, replacements ) {

	for ( const { sunLight, bakeLight } of replacements ) {

		scene.remove( bakeLight, bakeLight.target );
		sunLight.visible = true;

	}

}

export { replaceSunLights, restoreSunLights };
