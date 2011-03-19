/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.JSONLoader = function () {

	THREE.Loader.call( this );

};

THREE.JSONLoader.prototype = new THREE.Loader();
THREE.JSONLoader.prototype.constructor = THREE.JSONLoader;
THREE.JSONLoader.prototype.supr = THREE.Loader.prototype;
