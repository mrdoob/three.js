import { Uniform } from "../core/Uniform.js";

Object.defineProperties( Uniform.prototype, {

	dynamic: {
		set: function () {

			console.warn( 'THREE.Uniform: .dynamic has been removed. Use object.onBeforeRender() instead.' );

		}
	},
	onUpdate: {
		value: function () {

			console.warn( 'THREE.Uniform: .onUpdate() has been removed. Use object.onBeforeRender() instead.' );
			return this;

		}
	}

} );
