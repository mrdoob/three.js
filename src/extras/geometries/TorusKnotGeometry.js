/**
 * @author oosmoxiecode
 */

THREE.TorusKnotGeometry = function ( radius, tube, tubularSegments, radialSegments, p, q, heightScale ) {

	THREE.Geometry.call( this );

	this.type = 'TorusKnotGeometry';

	this.parameters = {
		radius: radius,
		tube: tube,
		tubularSegments: tubularSegments,
		radialSegments: radialSegments,
		p: p,
		q: q
	};

	if( heightScale !== undefined ) console.warn( 'THREE.TorusKnotGeometry: heightScale has been deprecated. Use .scale( x, y, z ) instead.' );

	this.fromBufferGeometry( new THREE.TorusKnotBufferGeometry( radius, tube, tubularSegments, radialSegments, p, q ) );
	this.mergeVertices();

};

THREE.TorusKnotGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.TorusKnotGeometry.prototype.constructor = THREE.TorusKnotGeometry;
