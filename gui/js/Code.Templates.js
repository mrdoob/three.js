// CubeGeometry

THREE._CubeGeometry = THREE.CubeGeometry;
THREE.CubeGeometry = function ( width, height, depth, segmentsWidth, segmentsHeight, segmentsDepth, materials, flipped, sides ) {

	var geometry = new THREE._CubeGeometry( width, height, depth, segmentsWidth, segmentsHeight, segmentsDepth, materials, flipped, sides );

	geometry.gui = {

		parameters: {

			width: width,
			height: height,
			depth: depth,
			segmentsWidth: segmentsWidth,
			segmentsHeight: segmentsHeight,
			segmentsDepth: segmentsDepth,
			materials: materials,
			flipped: flipped,
			sides: sides

		},

		getCode: function () {

			return 'new THREE.CubeGeometry( ' + [

					geometry.gui.parameters.width,
					geometry.gui.parameters.height,
					geometry.gui.parameters.depth,
					geometry.gui.parameters.segmentsWidth,
					geometry.gui.parameters.segmentsHeight,
					geometry.gui.parameters.segmentsDepth
					// ,
					// geometry.gui.parameters.materials,
					// geometry.gui.parameters.flipped,
					// geometry.gui.parameters.sides

				].join( ', ' ) + ' )';

		}

	}

	return geometry;

};

// SphereGeometry

THREE._SphereGeometry = THREE.SphereGeometry;
THREE.SphereGeometry = function ( radius, segmentsWidth, segmentsHeight ) {

	var geometry = new THREE._SphereGeometry( radius, segmentsWidth, segmentsHeight );

	geometry.gui = {

		parameters: {

			radius: radius,
			segmentsWidth: segmentsWidth,
			segmentsHeight: segmentsHeight

		},

		getCode: function () {

			return 'new THREE.SphereGeometry( ' + [

					geometry.gui.parameters.radius,
					geometry.gui.parameters.segmentsWidth,
					geometry.gui.parameters.segmentsHeight

				].join( ', ' ) + ' )';

		}

	}

	return geometry;

};

// TorusGeometry

THREE._TorusGeometry = THREE.TorusGeometry;
THREE.TorusGeometry = function ( radius, tube, segmentsR, segmentsT, arc ) {

	var geometry = new THREE._TorusGeometry( radius, tube, segmentsR, segmentsT, arc );

	geometry.gui = {

		parameters: {

			radius: radius,
			tube: tube,
			segmentsR: segmentsR,
			segmentsT: segmentsT,
			arc: arc

		},

		getCode: function () {

			return 'new THREE.TorusGeometry( ' + [

					geometry.gui.parameters.radius,
					geometry.gui.parameters.tube,
					geometry.gui.parameters.segmentsR,
					geometry.gui.parameters.segmentsT

				].join( ', ' ) + ' )';

		}

	}

	return geometry;

};

// MeshBasicMaterial

THREE.MeshBasicMaterial.prototype.gui = {

	getCode: function () {

		return 'new THREE.MeshBasicMaterial( { ' + [

				'color: 0x' + material.color.getHex().toString(16)

			].join( ', ' ) + ' } )';

	}

};
