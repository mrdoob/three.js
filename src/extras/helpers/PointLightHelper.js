/**
 * @author alteredq / http://alteredqualia.com/
 *
 *	- shows point light color, intensity, and position
 */

THREE.PointLightHelper = function ( light, sphereSize ) {

	THREE.Object3D.call( this );

	this.light = light;

	this.position = light.position;

	this.properties.isGizmo = true;

	this.color = light.color.clone();

	this.color.r *= light.intensity;
	this.color.g *= light.intensity;
	this.color.b *= light.intensity;

	var hexColor = this.color.getHex();

	var lightGeo = new THREE.SphereGeometry( sphereSize, 16, 8 );
	var lightMaterial = new THREE.MeshBasicMaterial( { color: hexColor, fog: false } );

	this.lightSphere = new THREE.Mesh( lightGeo, lightMaterial );

	this.add( this.lightSphere );

	this.lightSphere.properties.isGizmo = true;
	this.lightSphere.properties.gizmoSubject = light;
	this.lightSphere.properties.gizmoRoot = this;

	var lineMaterial = new THREE.LineBasicMaterial( { color: hexColor, fog: false } );
	var lineGeometry = new THREE.Geometry();

	var sd = sphereSize * 1.25;
	var ed = sphereSize * 2.25;

	var sd2 = 0.707 * sd;
	var ed2 = 0.707 * ed;

	var rays = [ [ sd, 0, 0 ], [ ed, 0, 0 ], [ -sd, 0, 0 ], [ -ed, 0, 0 ],
				 [ 0, sd, 0 ], [ 0, ed, 0 ], [ 0, -sd, 0 ], [ 0, -ed, 0 ],
				 [ 0, 0, sd ], [ 0, 0, ed ], [ 0, 0, -sd ], [ 0, 0, -ed ],
				 [ sd2, sd2, 0 ], [ ed2, ed2, 0 ], [ -sd2, -sd2, 0 ], [ -ed2, -ed2, 0 ],
				 [ sd2, -sd2, 0 ], [ ed2, -ed2, 0 ], [ -sd2, sd2, 0 ], [ -ed2, ed2, 0 ],
				 [ sd2, 0, sd2 ], [ ed2, 0, ed2 ], [ -sd2, 0, -sd2 ], [ -ed2, 0, -ed2 ],
				 [ sd2, 0, -sd2 ], [ ed2, 0, -ed2 ], [ -sd2, 0, sd2 ], [ -ed2, 0, ed2 ],
				 [ 0, sd2, sd2 ], [ 0, ed2, ed2 ], [ 0, -sd2, -sd2 ], [ 0, -ed2, -ed2 ],
				 [ 0, sd2, -sd2 ], [ 0, ed2, -ed2 ], [ 0, -sd2, sd2 ], [ 0, -ed2, ed2 ]
	];

	for ( var i = 0, il = rays.length; i < il; i ++ ) {

		var x = rays[ i ][ 0 ];
		var y = rays[ i ][ 1 ];
		var z = rays[ i ][ 2 ];

		lineGeometry.vertices.push( new THREE.Vector3( x, y, z ) );

	}

	this.lightLine = new THREE.Line( lineGeometry, lineMaterial, THREE.LinePieces );

	this.add( this.lightLine );

}

THREE.PointLightHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.PointLightHelper.prototype.update = function () {

	// set sphere color to light color * light intensity

	this.color.copy( this.light.color );

	var intensity = THREE.Math.clamp( this.light.intensity, 0, 1 );
	this.color.r *= intensity;
	this.color.g *= intensity;
	this.color.b *= intensity;

	this.lightSphere.material.color.copy( this.color );
	this.lightLine.material.color.copy( this.color );

}

