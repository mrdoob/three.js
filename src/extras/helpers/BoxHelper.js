/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BoxHelper = function ( size ) {

	size = size || 1;

	var geometry = new THREE.Geometry();

	//   5____4
	// 1/___0/|
	// | 6__|_7
	// 2/___3/

	var vertices = [
		new THREE.Vector3(   size,   size,   size ),
		new THREE.Vector3( - size,   size,   size ),
		new THREE.Vector3( - size, - size,   size ),
		new THREE.Vector3(   size, - size,   size ),

		new THREE.Vector3(   size,   size, - size ),
		new THREE.Vector3( - size,   size, - size ),
		new THREE.Vector3( - size, - size, - size ),
		new THREE.Vector3(   size, - size, - size )
	];

	// TODO: Wouldn't be nice if Line had .segments?

	geometry.vertices.push(
		vertices[ 0 ], vertices[ 1 ],
		vertices[ 1 ], vertices[ 2 ],
		vertices[ 2 ], vertices[ 3 ],
		vertices[ 3 ], vertices[ 0 ],

		vertices[ 4 ], vertices[ 5 ],
		vertices[ 5 ], vertices[ 6 ],
		vertices[ 6 ], vertices[ 7 ],
		vertices[ 7 ], vertices[ 4 ],

		vertices[ 0 ], vertices[ 4 ],
		vertices[ 1 ], vertices[ 5 ],
		vertices[ 2 ], vertices[ 6 ],
		vertices[ 3 ], vertices[ 7 ]
	);

	this.vertices = vertices;

	THREE.Line.call( this, geometry, new THREE.LineBasicMaterial(), THREE.LinePieces );

};

THREE.BoxHelper.prototype = Object.create( THREE.Line.prototype );

THREE.BoxHelper.prototype.update = function ( object ) {

	var geometry = object.geometry;

	if ( geometry.boundingBox === null ) {

		geometry.computeBoundingBox();

	}

	var min = geometry.boundingBox.min;
	var max = geometry.boundingBox.max;
	var vertices = this.vertices;

	vertices[ 0 ].set( max.x, max.y, max.z );
	vertices[ 1 ].set( min.x, max.y, max.z );
	vertices[ 2 ].set( min.x, min.y, max.z );
	vertices[ 3 ].set( max.x, min.y, max.z );
	vertices[ 4 ].set( max.x, max.y, min.z );
	vertices[ 5 ].set( min.x, max.y, min.z );
	vertices[ 6 ].set( min.x, min.y, min.z );
	vertices[ 7 ].set( max.x, min.y, min.z );

	this.geometry.computeBoundingSphere();
	this.geometry.verticesNeedUpdate = true;

	this.matrixAutoUpdate = false;
	this.matrixWorld = object.matrixWorld;

};
