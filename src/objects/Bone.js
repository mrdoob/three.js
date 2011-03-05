/**
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Bone = function( belongsToSkin ) {

	THREE.Object3D.call( this );

	this.skin = belongsToSkin;
	this.skinMatrix = new THREE.Matrix4();
	this.hasNoneBoneChildren = false;

};

THREE.Bone.prototype = new THREE.Object3D();
THREE.Bone.prototype.constructor = THREE.Bone;
THREE.Bone.prototype.supr = THREE.Object3D.prototype;


/*
 * Update
 */

THREE.Bone.prototype.update = function( parentSkinMatrix, forceUpdate, camera ) {

	// update local

	if ( this.matrixAutoUpdate ) {

		forceUpdate |= this.updateMatrix();

	}

	// update skin matrix

	if ( forceUpdate || this.matrixWorldNeedsUpdate ) {

		if( parentSkinMatrix ) {

			this.skinMatrix.multiply( parentSkinMatrix, this.matrix );

		} else {

			this.skinMatrix.copy( this.matrix );

		}

		this.matrixWorldNeedsUpdate = false;
		forceUpdate = true;

	}

	// update children

	var child, i, l = this.children.length;

	if ( this.hasNoneBoneChildren ) {

		this.matrixWorld.multiply( this.skin.matrixWorld, this.skinMatrix );


		for ( i = 0; i < l; i++ ) {

			child = this.children[ i ];

			if ( ! ( child instanceof THREE.Bone ) ) {

				child.update( this.matrixWorld, true, camera );

			} else {

				child.update( this.skinMatrix, forceUpdate, camera );

			}

		}

	} else {

		for ( i = 0; i < l; i++ ) {

			this.children[ i ].update( this.skinMatrix, forceUpdate, camera );

		}

	}

};


/*
 * Add child
 */

THREE.Bone.prototype.addChild = function( child ) {

	if ( this.children.indexOf( child ) === - 1 ) {

		if ( child.parent !== undefined ) {

			child.parent.removeChild( child );

		}

		child.parent = this;
		this.children.push( child );

		if ( ! ( child instanceof THREE.Bone ) ) {

			this.hasNoneBoneChildren = true;

		}

	}

};

/*
 * TODO: Remove Children: see if any remaining are none-Bone
 */
