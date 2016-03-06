/**
 * @author oosmoxiecode
 */

THREE.TorusKnotGeometry = function ( radius, tube, radialSegments, tubularSegments, p, q, heightScale, arc ) {

	THREE.Geometry.call( this );

	this.type = 'TorusKnotGeometry';

	this.parameters = {
		radius: radius,
		tube: tube,
		radialSegments: radialSegments,
		tubularSegments: tubularSegments,
		p: p,
		q: q,
		heightScale: heightScale,
		arc: arc
	};

	this.fromBufferGeometry( new THREE.TorusKnotBufferGeometry( radius, tube, radialSegments, tubularSegments, p, q, heightScale, arc ) );
	this.mergeVertices();

};

THREE.TorusKnotGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.TorusKnotGeometry.prototype.constructor = THREE.TorusKnotGeometry;
