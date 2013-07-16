/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.RenderableParticle = function () {

	this.id = 0;

	this.object = null;

	this.x = 0;
	this.y = 0;
	this.z = 0;

	this.rotation = null;
	this.scale = new THREE.Vector2();

	this.material = null;

};
