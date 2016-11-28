/**
 * @author Bart McLeod, mcleod@spaceweb.nl
 * @since September 20, 2016
 *
 * Conversion of a VRML 97 NavigationInfo node to a ThreeJs camera
 */

VrmlParser.Renderer.ThreeJs.VrmlNode[ 'NavigationInfo' ] = function (originalNode, debug) {
	this.debug    = debug;
	this.node     = originalNode;
	this.node.has = function (property) {
		return ('undefined' !== typeof this[ property ] && null !== this[ property ]);
	};
	this.controls = null;
};

VrmlParser.Renderer.ThreeJs.VrmlNode.NavigationInfo.prototype = {
	/**
	 * Utility to easily switch logging on and off with the debug flag.
	 * @param obj
	 */
	log: function (obj) {
		if ( this.debug ) {
			console.log(obj);
		}
	},

	/**
	 * Uses the NavigationInfo from the original VRML to determine the best
	 * match for controls in ThreeJs.
	 *
	 * @todo: Figure out of support for avatarSize is possible
	 * @todo: Support for headlight
	 * @todo: Figure out if visibilityLimit can be implemented, could this be the 'far' property of the camera?
	 * @todo: Create controls that mimic the original design of VRML better.
	 * @param scene
	 */
	parse: function (scene) {
		this.log('From NavigationInfo');
		var speed = undefined !== this.node.speed ? this.node.speed : 1;

		if ( undefined !== this.node.type ) {
			switch ( this.node.type.toLowerCase() ) {
				case 'fly': // fly
					this.log('fly!');
					// use global controls and camera, no better solution at hand
					controls               = new THREE.FlyControls(camera);
					controls.movementSpeed = speed;
					break;
			}
		} else {
			this.log('fly!');
			// use global controls and camera, no better solution at hand
			controls               = new THREE.FlyControls(camera);
			controls.movementSpeed = speed;
		}

		/** Example of originalNode
		 *    avatarSize       [ 0.1, 1.6, 0.2,]
		 *    headlight        FALSE
		 *    speed            4
		 *    type    "FLY"
		 *    visibilityLimit  0.0
		 */

	}
}
