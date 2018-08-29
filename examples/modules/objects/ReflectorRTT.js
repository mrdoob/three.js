import * as THREE from '../../../build/three.module.js';
import { Reflector } from '../../modules/objects/Reflector.js';var __ReflectorRTT;__ReflectorRTT = function ( geometry, options ) {

	Reflector.call( this, geometry, options );

	this.geometry.setDrawRange( 0, 0 ); // avoid rendering geometry

};

__ReflectorRTT.prototype = Object.create( Reflector.prototype );

export { __ReflectorRTT as ReflectorRTT };
