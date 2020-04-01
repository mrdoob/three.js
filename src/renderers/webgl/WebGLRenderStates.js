/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { WebGLLights } from './WebGLLights.js';

class WebGLRenderState {

	constructor() {

		this.lights = new WebGLLights();

		this.lightsArray = [];
		this.shadowsArray = [];

		this.state = {
			lightsArray: this.lightsArray,
			shadowsArray: this.shadowsArray,

			lights: this.lights
		};

	}

	init() {

		this.lightsArray.length = 0;
		this.shadowsArray.length = 0;

	}

	pushLight( light ) {

		this.lightsArray.push( light );

	}

	pushShadow( shadowLight ) {

		this.shadowsArray.push( shadowLight );

	}

	setupLights( camera ) {

		this.lights.setup( this.lightsArray, this.shadowsArray, camera );

	}

}

class WebGLRenderStates {

	constructor() {

		this.renderStates = new WeakMap();

	}

	onSceneDispose( event ) {

		var scene = event.target;

		scene.removeEventListener( 'dispose', this.onSceneDispose );

		this.renderStates.delete( scene );

	}

	get( scene, camera ) {

		var renderState;

		if ( this.renderStates.has( scene ) === false ) {

			renderState = new WebGLRenderState();
			this.renderStates.set( scene, new WeakMap() );
			this.renderStates.get( scene ).set( camera, renderState );

			scene.addEventListener( 'dispose', this.onSceneDispose );

		} else {

			if ( this.renderStates.get( scene ).has( camera ) === false ) {

				renderState = new WebGLRenderState();
				this.renderStates.get( scene ).set( camera, renderState );

			} else {

				renderState = this.renderStates.get( scene ).get( camera );

			}

		}

		return renderState;

	}

	dispose() {

		this.renderStates = new WeakMap();

	}

}


export { WebGLRenderStates };
