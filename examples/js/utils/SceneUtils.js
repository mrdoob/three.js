/**
 * Generated from 'examples\modules\utils\SceneUtils.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE));
}(this, (function (exports,THREE) { 'use strict';

/**
 * @author alteredq / http://alteredqualia.com/
 */



exports.SceneUtils = {

	createMultiMaterialObject: function ( geometry, materials ) {

		var group = new THREE.Group();

		for ( var i = 0, l = materials.length; i < l; i ++ ) {

			group.add( new THREE.Mesh( geometry, materials[ i ] ) );

		}

		return group;

	},

	detach: function ( child, parent, scene ) {

		child.applyMatrix( parent.matrixWorld );
		parent.remove( child );
		scene.add( child );

	},

	attach: function ( child, scene, parent ) {

		child.applyMatrix( new THREE.Matrix4().getInverse( parent.matrixWorld ) );

		scene.remove( child );
		parent.add( child );

	}

};

Object.defineProperty(exports, '__esModule', { value: true });

})));
