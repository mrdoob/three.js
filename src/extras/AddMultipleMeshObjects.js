/*
 *	A useful function that will add multiple objects (of the various types available) to a given scene.
 *	@param scene The scene to add these objects to.
 *	@param objects An array of objects that detail what we want to add.
 *	@returns three_objects An array containing the THREE.Mesh objects that were added to the scene (in the order that they were passed in).
 *
 *	Each object takes the following form:
 *		{
 *			arguments: Object // Containing all the relevant arguments for the THREE.*Geometry functiion
 *			material:MaterialObj,
 *			position: { x:Number, y:Number, z:Number },
 *			rotation: Object // The rotation we want the object to have.
 *			type: String // Must match the name given to the Geometry Object.
 *		}
 */
THREE.AddMultipleMeshObjects = function(scene, objects) {
	var three_objects = [];

	for (i=0; i<objects.length; i++) {
		var obj = objects[i];
		var args = obj.arguments,
			material = obj.material || false,
			pos = obj.position,
			rot = obj.rotation,
			type = obj.type;

		switch (type) {
			case 'TorusKnot':
				obj =  new THREE.Mesh(
					new THREE.TorusKnotGeometry(
						args.radius || false,
						args.tube || false,
						args.segmentsR || false,
						args.segmentsT || false,
						args.p || false,
						args.q || false,
						args.heightScale || false
					),
					material
				);
				break;
			case 'Extrude':
				obj = new THREE.Mesh(
					new THREE.ExtrudeGeometry(
						args.shapes || false,
						args.options || false
					),
					material
				);
				break;
			case 'Text':
				obj = new THREE.Mesh(
					new THREE.TextGeometry(
						args.text || false,
						parameters || false
					),
					material
				);
				break;
			case 'Sphere':
				obj = new THREE.Mesh(
					new THREE.SphereGeometry(
						args.radius || false,
						args.segmentsWidth || false,
						args.segmentsHeight || false
					),
					material
				);
				break;
			case 'Cylinder':
				obj = new THREE.Mesh(
					new THREE.CylinderGeometry(
						args.radiusTop || false,
						args.radiusBottom || false,
						args.height || false,
						args.segmentsRadius || false,
						args.segmentsHeight || false,
						args.openEnded || false
					),
					material
				);
				break;
			case 'Plane':
				obj = new THREE.Mesh(
					new THREE.PlaneGeometry(
						args.width || false,
						args.height || false,
						args.segmentsWidth || false,
						args.segmentsHeight || false
					),
					material
				);
				break;
			case 'Octahedron':
				obj = new THREE.Mesh(
					new THREE.OctahedronGeometry(
						args.radius || false,
						args.detail || false
					),
					material
				);
				break;
			case 'Torus':
				obj = new THREE.Mesh(
					new THREE.TorusGeometry(
						args.radius || false,
						args.tube || false,
						args.segmentsR || false,
						args.segmentsT || false,
						args.arc || false
					),
					material
				);
				break;
			case 'Icosahedron':
				obj = new THREE.Mesh(
					new THREE.IcosahedronGeometry(
						args.subdivisions || false
					),
					material
				);
				break;
			case 'Lathe':
				obj = new THREE.Mesh(
					new THREE.LatheGeometry(
						args.points || false,
						args.angle || false
					),
					material
				);
				break;
			case 'Cube':
				obj = new THREE.Mesh(
					new THREE.CubeGeometry(
						args.width || false,
						args.height || false,
						args.depth || false,
						args.segmentsWidth || false,
						args.segmentsHeight || false,
						args.segmentsDepth || false,
						args.materials || false,
						args.sides || false
					),
					material
				);
				break;
		}
	
		if (pos) obj.position = pos;
		if (rot) obj.rotation = rot;
		
		three_objects.push(obj);
		scene.add(obj);
	}

	return three_objects;
};