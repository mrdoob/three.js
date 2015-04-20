/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneUtils = {

	createMultiMaterialObject: function ( geometry, materials ) {

		var group = new THREE.Object3D();

		for ( var i = 0, l = materials.length; i < l; i ++ ) {

			group.add( new THREE.Mesh( geometry, materials[ i ] ) );

		}

		return group;

	},

	detach: function ( child, scene ) {

		var topParent = child.parent;
		
		while ( topParent.parent !== undefined ) {
			
			topParent = topParent.parent;
			
		}
		
		topParent.updateMatrixWorld( true );

		child.applyMatrix( child.parent.matrixWorld );
		child.parent.remove( child );
		scene.add( child );

	},

	attach: function ( child, parent ) {

		var topParent = child.parent;
		
		while ( topParent.parent !== undefined ) {
			
			topParent = topParent.parent;
			
		}
		
		if ( topParent !== undefined ) {
			
			topParent.updateMatrixWorld( true );
		
			var matrixWorldInverse = new THREE.Matrix4();
			matrixWorldInverse.getInverse( child.parent.matrixWorld );
			child.applyMatrix( matrixWorldInverse );

			child.parent.remove( child );
			
		}
		
		parent.add( child );

	}

};
