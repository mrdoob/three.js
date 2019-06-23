/**
 * @author alteredq / http://alteredqualia.com/
 */

import {
	Group,
	Mesh
} from "../../../build/three.module.js";

var SceneUtils = {

	createMultiMaterialObject: function ( geometry, materials ) {

		var group = new Group();

		for ( var i = 0, l = materials.length; i < l; i ++ ) {

			group.add( new Mesh( geometry, materials[ i ] ) );

		}

		return group;

	},

	detach: function ( child, parent, scene ) {

		console.warn( 'THREE.SceneUtils: detach() has been deprecated. Use scene.attach( child ) instead.' );

		scene.attach( child );

	},

	attach: function ( child, scene, parent ) {

		console.warn( 'THREE.SceneUtils: attach() has been deprecated. Use parent.attach( child ) instead.' );

		parent.attach( child );

	}

};

export { SceneUtils };
