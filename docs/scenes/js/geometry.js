/**
 * @author TatumCreative (Greg Tatum) / http://gregtatum.com/
 */

var constants = {

	combine: {

		"THREE.MultiplyOperation" : THREE.MultiplyOperation,
		"THREE.MixOperation" : THREE.MixOperation,
		"THREE.AddOperation" : THREE.AddOperation

	},

	side : {

		"THREE.FrontSide" : THREE.FrontSide,
		"THREE.BackSide" : THREE.BackSide,
		"THREE.DoubleSide" : THREE.DoubleSide

	},

	shading : {

		"THREE.NoShading" : THREE.NoShading,
		"THREE.FlatShading" : THREE.FlatShading,
		"THREE.SmoothShading" : THREE.SmoothShading

	},

	colors : {

		"THREE.NoColors" : THREE.NoColors,
		"THREE.FaceColors" : THREE.FaceColors,
		"THREE.VertexColors" : THREE.VertexColors

	},

	blendingMode : {

		"THREE.NoBlending" : THREE.NoBlending,
		"THREE.NormalBlending" : THREE.NormalBlending,
		"THREE.AdditiveBlending" : THREE.AdditiveBlending,
		"THREE.SubtractiveBlending" : THREE.SubtractiveBlending,
		"THREE.MultiplyBlending" : THREE.MultiplyBlending,
		"THREE.CustomBlending" : THREE.CustomBlending

	},

	equations : {

		"THREE.AddEquation" : THREE.AddEquation,
		"THREE.SubtractEquation" : THREE.SubtractEquation,
		"THREE.ReverseSubtractEquation" : THREE.ReverseSubtractEquation

	},

	destinationFactors : {

		"THREE.ZeroFactor" : THREE.ZeroFactor,
		"THREE.OneFactor" : THREE.OneFactor,
		"THREE.SrcColorFactor" : THREE.SrcColorFactor,
		"THREE.OneMinusSrcColorFactor" : THREE.OneMinusSrcColorFactor,
		"THREE.SrcAlphaFactor" : THREE.SrcAlphaFactor,
		"THREE.OneMinusSrcAlphaFactor" : THREE.OneMinusSrcAlphaFactor,
		"THREE.DstAlphaFactor" : THREE.DstAlphaFactor,
		"THREE.OneMinusDstAlphaFactor" : THREE.OneMinusDstAlphaFactor

	},

	sourceFactors : {

		"THREE.DstColorFactor" : THREE.DstColorFactor,
		"THREE.OneMinusDstColorFactor" : THREE.OneMinusDstColorFactor,
		"THREE.SrcAlphaSaturateFactor" : THREE.SrcAlphaSaturateFactor

	}

}

function updateGroupGeometry( mesh, geometry ) {
	
	mesh.children[0].geometry = geometry
	mesh.children[1].geometry = geometry.clone()
	
	//these do not update nicely together if shared
}

var guis = {
	
	TorusGeometry : function( mesh ) {

		var data = {
			radius : 10,
			tube : 3,
			radialSegments : 16,
			tubularSegments : 100,
			arc : Math.PI * 2
		};
		
		function generateGeometry() {
			
			updateGroupGeometry( mesh, 
				new THREE.TorusGeometry(
					data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc
				)
			)
			
		}

		var folder = gui.addFolder('THREE.TorusGeometry');
		
		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry )
		folder.add( data, 'tube', 0.1, 10 ).onChange( generateGeometry )
		folder.add( data, 'radialSegments', 2, 30 ).step(1).onChange( generateGeometry )
		folder.add( data, 'tubularSegments', 3, 200 ).step(1).onChange( generateGeometry )
		folder.add( data, 'arc', 0.1, Math.PI * 2 ).onChange( generateGeometry )
		
		generateGeometry()

	},
	
	TorusKnotGeometry : function( mesh ) {

		var data = {
			radius : 10,
			tube : 3,
			radialSegments : 64,
			tubularSegments : 8,
			p : 2,
			q : 3,
			heightScale : 1
		};
		
		function generateGeometry() {
			
			updateGroupGeometry( mesh, 
				new THREE.TorusKnotGeometry(
					data.radius, data.tube, data.radialSegments, data.tubularSegments,
					data.p, data.q, data.heightScale
				)
			)
			
		}

		var folder = gui.addFolder('THREE.TorusGeometry');
		
		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry )
		folder.add( data, 'tube', 0.1, 10 ).onChange( generateGeometry )
		folder.add( data, 'radialSegments', 3, 300 ).step(1).onChange( generateGeometry )
		folder.add( data, 'tubularSegments', 3, 20 ).step(1).onChange( generateGeometry )
		folder.add( data, 'p', 1, 20 ).onChange( generateGeometry )
		folder.add( data, 'q', 1, 20 ).onChange( generateGeometry )
		folder.add( data, 'heightScale', 1, 20 ).onChange( generateGeometry )
		
		generateGeometry()

	},
	
	DodecahedronGeometry : function() {

		var data = {
			radius : 10,
			detail : 0,
		};
		
		function generateGeometry() {
			
			updateGroupGeometry( mesh, 
				new THREE.DodecahedronGeometry(
					data.radius, data.detail
				)
			)
			
		}

		var folder = gui.addFolder('THREE.DodecahedronGeometry');
		
		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry )
		folder.add( data, 'detail', 0, 5 ).step(1).onChange( generateGeometry )
		
		generateGeometry()
		
	},
	
	IcosahedronGeometry : function() {

		var data = {
			radius : 10,
			detail : 0,
		};
		
		function generateGeometry() {
			
			updateGroupGeometry( mesh, 
				new THREE.IcosahedronGeometry(
					data.radius, data.detail
				)
			)
			
		}

		var folder = gui.addFolder('THREE.IcosahedronGeometry');
		
		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry )
		folder.add( data, 'detail', 0, 5 ).step(1).onChange( generateGeometry )
		
		generateGeometry()
		
	},
	
	OctahedronGeometry : function() {

		var data = {
			radius : 10,
			detail : 0,
		};
		
		function generateGeometry() {
			
			updateGroupGeometry( mesh, 
				new THREE.OctahedronGeometry(
					data.radius, data.detail
				)
			)
			
		}

		var folder = gui.addFolder('THREE.OctahedronGeometry');
		
		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry )
		folder.add( data, 'detail', 0, 5 ).step(1).onChange( generateGeometry )
		
		generateGeometry()
		
	},
	
	TetrahedronGeometry : function() {

		var data = {
			radius : 10,
			detail : 0,
		};
		
		function generateGeometry() {
			
			updateGroupGeometry( mesh, 
				new THREE.TetrahedronGeometry(
					data.radius, data.detail
				)
			)
			
		}

		var folder = gui.addFolder('THREE.TetrahedronGeometry');
		
		folder.add( data, 'radius', 1, 20 ).onChange( generateGeometry )
		folder.add( data, 'detail', 0, 5 ).step(1).onChange( generateGeometry )
		
		generateGeometry()
		
	}
	
}

function chooseFromHash ( mesh ) {

	var selectedGeometry = window.location.hash.substring(1) || "TorusGeometry";

	switch (selectedGeometry) {

	case "TorusGeometry" :

		guis.TorusGeometry( mesh )

		break;
		
	case "TorusKnotGeometry" :

		guis.TorusKnotGeometry( mesh )

		break;
		
	case "DodecahedronGeometry" :

		guis.DodecahedronGeometry( mesh )

		break;
		
	case "IcosahedronGeometry" :

		guis.IcosahedronGeometry( mesh )

		break;
		
	case "OctahedronGeometry" :

		guis.OctahedronGeometry( mesh )

		break;
		
	case "TetrahedronGeometry" :

		guis.TetrahedronGeometry( mesh )

		break;
	}

}
