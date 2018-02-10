/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { WebGLLights } from './WebGLLights.js';

var count = 0;

function WebGLRenderState() {

	var id = count ++;

	var lights = new WebGLLights( id );

	var lightsArray = [];
	var shadowsArray = [];
	var spritesArray = [];

	function init() {

		lightsArray.length = 0;
		shadowsArray.length = 0;
		spritesArray.length = 0;

	}

	function pushLight( light ) {

		lightsArray.push( light );

	}

	function pushShadow( shadowLight ) {

		shadowsArray.push( shadowLight );

	}

	function pushSprite( shadowLight ) {

		spritesArray.push( shadowLight );

	}

	function setupLights( camera ) {

		lights.setup( lightsArray, shadowsArray, camera );

	}

	var state = {
		lightsArray: lightsArray,
		shadowsArray: shadowsArray,
		spritesArray: spritesArray,

		lights: lights
	};

	return {
		init: init,
		state: state,
		setupLights: setupLights,

		pushLight: pushLight,
		pushShadow: pushShadow,
		pushSprite: pushSprite
	};

}

function WebGLRenderStates() {

	var renderStates = {};

	function get( scene, camera ) {

		var hash = scene.id + ',' + camera.id;

		var renderState = renderStates[ hash ];

		if ( renderState === undefined ) {

			renderState = new WebGLRenderState();
			renderStates[ hash ] = renderState;

		}

		return renderState;

	}

	function dispose() {

		renderStates = {};

	}

	return {
		get: get,
		dispose: dispose
	};

}


export { WebGLRenderStates };
