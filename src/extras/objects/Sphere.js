/**
 * This sphere is smooth and faces are evenly spaced in all directions.
 * 
 * To create there does not need to be a geometry, just a radius. eg.
 *   var sphere = new THREE.Sphere(100, new THREE.MeshBasicMaterial());
 * 
 * The number of faces multiplies by 4 for every 1 increase in `detail`.
 * 1 detail = 32 faces
 * 2 detail = 128 faces
 * 3 detail = 512 faces
 * 
 * @author daniel.deady@knectar.com
 * @param radius
 * @param materials
 * @param detail A logarithmic value of fidelity. Defaults to 3.
 */

THREE.Sphere = function ( radius, materials, detail ) {

	var geometry = new THREE.OctahedronGeometry( detail );

	THREE.Mesh.call( this, geometry, materials );

	this.scale.multiplyScalar(radius);

}

THREE.Sphere.prototype = new THREE.Mesh();
THREE.Sphere.prototype.constructor = THREE.Sphere;
THREE.Sphere.prototype.supr = THREE.Mesh.prototype;
