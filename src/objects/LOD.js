/**
 * @author mikael emtinger / http://gomo.se/
 */

THREE.LOD = function() {

	THREE.Object3D.call( this );

	this.LODs = [];

};

THREE.LOD.prototype = new THREE.Object3D();
THREE.LOD.prototype.constructor = THREE.LOD;
THREE.LOD.prototype.supr = THREE.Object3D.prototype;

/*
 * Add
 */

THREE.LOD.prototype.add = function ( object3D, visibleAtDistance ) {

	if ( visibleAtDistance === undefined ) {

		visibleAtDistance = 0;

	}

	visibleAtDistance = Math.abs( visibleAtDistance );

	for ( var l = 0; l < this.LODs.length; l++ ) {

		if ( visibleAtDistance < this.LODs[ l ].visibleAtDistance ) {

			break;

		}

	}

	this.LODs.splice( l, 0, { visibleAtDistance: visibleAtDistance, object3D: object3D } );
	this.addChild( object3D );

};


/*
 * Update
 */

THREE.LOD.prototype.update = function ( parentMatrixWorld, forceUpdate, camera ) {

	// update local

	if ( this.matrixAutoUpdate ) {

		forceUpdate |= this.updateMatrix();

	}

	// update global

	if ( forceUpdate || this.matrixWorldNeedsUpdate ) {

		if ( parentMatrixWorld ) {

			this.matrixWorld.multiply( parentMatrixWorld, this.matrix );

		} else {

			this.matrixWorld.copy( this.matrix );

		}

		this.matrixWorldNeedsUpdate = false;
		forceUpdate = true;

	}


	// update LODs

	if ( this.LODs.length > 1 ) {


		var inverse  = camera.matrixWorldInverse;
		var radius   = this.boundRadius * this.boundRadiusScale;
		var distance = -( inverse.n31 * this.position.x + inverse.n32 * this.position.y + inverse.n33 * this.position.z + inverse.n34 );

		this.LODs[ 0 ].object3D.visible = true;

		for ( var l = 1; l < this.LODs.length; l++ ) {

			if( distance >= this.LODs[ l ].visibleAtDistance ) {

				this.LODs[ l - 1 ].object3D.visible = false;
				this.LODs[ l     ].object3D.visible = true;

			} else {

				break;

			}

		}

		for( ; l < this.LODs.length; l++ ) {

			this.LODs[ l ].object3D.visible = false;

		}

	}

	// update children

	for ( var c = 0; c < this.children.length; c++ ) {

		this.children[ c ].update( this.matrixWorld, forceUpdate, camera );

	}


};
