import { Material } from "../materials/Material.js";
import { Color } from "../math/Color.js";
import { FlatShading } from "../constants.js";

Object.defineProperties( Material.prototype, {

	wrapAround: {
		get: function () {

			console.warn( 'THREE.Material: .wrapAround has been removed.' );

		},
		set: function () {

			console.warn( 'THREE.Material: .wrapAround has been removed.' );

		}
	},

	overdraw: {
		get: function () {

			console.warn( 'THREE.Material: .overdraw has been removed.' );

		},
		set: function () {

			console.warn( 'THREE.Material: .overdraw has been removed.' );

		}
	},

	wrapRGB: {
		get: function () {

			console.warn( 'THREE.Material: .wrapRGB has been removed.' );
			return new Color();

		}
	},

	shading: {
		get: function () {

			console.error( 'THREE.' + this.type + ': .shading has been removed. Use the boolean .flatShading instead.' );

		},
		set: function ( value ) {

			console.warn( 'THREE.' + this.type + ': .shading has been removed. Use the boolean .flatShading instead.' );
			this.flatShading = ( value === FlatShading );

		}
	},

	stencilMask: {
		get: function () {

			console.warn( 'THREE.' + this.type + ': .stencilMask has been removed. Use .stencilFuncMask instead.' );
			return this.stencilFuncMask;

		},
		set: function ( value ) {

			console.warn( 'THREE.' + this.type + ': .stencilMask has been removed. Use .stencilFuncMask instead.' );
			this.stencilFuncMask = value;

		}
	}

} );
