import { Matrix4 } from '../math/Matrix4';
import { Mesh } from '../objects/Mesh';
import { Group } from '../objects/Group';

var SceneUtils;

/**
 * @author alteredq / http://alteredqualia.com/
 */

SceneUtils = {

	createMultiMaterialObject: function ( geometry, materials ) {

		var group = new Group();

		for ( var i = 0, l = materials.length; i < l; i ++ ) {

			group.add( new Mesh( geometry, materials[ i ] ) );

		}

		return group;

	},


	updateWorldMatrixHard: function ( obj ) {

		var a_matrix = new Matrix4();

		obj.matrixWorld.identity();

		for ( var a = obj; a !== null; a = a.parent){

			a_matrix.compose( a.position, a.quaternion, a.scale );

			obj.matrixWorld.premultiply( a_matrix );

		}

	},

	detach: function ( child ) {

		if (child.parent == null) return;

		SceneUtils.updateWorldMatrixHard( child );
		
		child.matrix.copy( child.matrixWorld );

		child.matrix.decompose( child.position, child.quaternion, child.scale );

		child.parent.remove( child )
	
	},

	attach: function ( child, parent ) {

		SceneUtils.updateWorldMatrixHard( child );

		SceneUtils.updateWorldMatrixHard( parent );

		child.matrix.getInverse( parent.matrixWorld ).multiply( child.matrixWorld  );
		 
		child.matrix.decompose( child.position, child.quaternion, child.scale );

		parent.add( child )

	}

}

export { SceneUtils };