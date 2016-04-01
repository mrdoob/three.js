/**
 * @author mrdoob / http://mrdoob.com/
 *  @author MasterJames / http://master-domain.com
 */

THREE.SpotLightShadow = function ( camera, owner ) {

	THREE.LightShadow.call( this, camera );

	if(owner === undefined) console.log("THREE.SpotLightShadow requires owner to auto-adjust shadow angle");
	else {

		owner._angle = owner.angle;

		delete owner.angle;

		Object.defineProperty( owner, "angle", {

			set: function ( radians ) {

				this._angle = radians;

				this.shadow.camera.fov = ( THREE.Math.radToDeg( radians ) * 2 );

				this.shadow.camera.updateProjectionMatrix();

			},

			get: function () { return this._angle; }

		} );
	}

};

THREE.SpotLightShadow.prototype = Object.create( THREE.LightShadow.prototype );

THREE.SpotLightShadow.prototype.constructor = THREE.SpotLightShadow;


