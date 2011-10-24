/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.LOD = function( camera ) {

	THREE.Object3D.call( this );

	this.camera = camera;
	this.LODs = [];

};

THREE.LOD.prototype = new THREE.Object3D();
THREE.LOD.prototype.constructor = THREE.LOD;
THREE.LOD.prototype.supr = THREE.Object3D.prototype;

/*
 * Add
 */

THREE.LOD.prototype.addLevel = function ( object3D, visibleAtDistance ) {

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
	this.add( object3D );

};

THREE.LOD.prototype.updateMatrixWorld = function ( force ) {

	this.matrixAutoUpdate && this.updateMatrix();

	// update matrixWorld

	if ( this.matrixWorldNeedsUpdate || force ) {

		if ( this.parent ) {

			this.matrixWorld.multiply( this.parent.matrixWorld, this.matrix );

		} else {

			this.matrixWorld.copy( this.matrix );

		}

		this.matrixWorldNeedsUpdate = false;

		force = true;

	}

	// update LODs

	var camera = this.camera;

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

	for ( var i = 0, l = this.children.length; i < l; i ++ ) {

		this.children[ i ].updateMatrixWorld( force );

	}

};
