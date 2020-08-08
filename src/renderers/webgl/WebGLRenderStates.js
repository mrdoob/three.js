import { WebGLLights } from './WebGLLights.js';

function WebGLRenderState() {

	const lights = new WebGLLights();

	const lightsArray = [];
	const shadowsArray = [];

	function init() {

		lightsArray.length = 0;
		shadowsArray.length = 0;

	}

	function pushLight( light ) {

		lightsArray.push( light );

	}

	function pushShadow( shadowLight ) {

		shadowsArray.push( shadowLight );

	}

	function setupLights( camera ) {

		lights.setup( lightsArray, shadowsArray, camera );

	}

	const state = {
		lightsArray: lightsArray,
		shadowsArray: shadowsArray,

		lights: lights
	};

	return {
		init: init,
		state: state,
		setupLights: setupLights,

		pushLight: pushLight,
		pushShadow: pushShadow
	};

}

function WebGLRenderStates() {

	let renderStates = new WeakMap();

	function get( scene, camera ) {

		let renderState;

		if ( renderStates.has( scene ) === false ) {

			renderState = new WebGLRenderState();
			renderStates.set( scene, new WeakMap() );
			renderStates.get( scene ).set( camera, renderState );

		} else {

			if ( renderStates.get( scene ).has( camera ) === false ) {

				renderState = new WebGLRenderState();
				renderStates.get( scene ).set( camera, renderState );

			} else {

				renderState = renderStates.get( scene ).get( camera );

			}

		}

		return renderState;

	}

	function dispose() {

		renderStates = new WeakMap();

	}

	return {
		get: get,
		dispose: dispose
	};

}


export { WebGLRenderStates };
