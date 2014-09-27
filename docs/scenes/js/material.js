var constants = {
	
	side: {
		"THREE.FrontSide": THREE.FrontSide,
		"THREE.BackSide": THREE.BackSide,
		"THREE.DoubleSide": THREE.DoubleSide
	},
	
	shading: {
		"THREE.NoShading": THREE.NoShading,
		"THREE.FlatShading": THREE.FlatShading,
		"THREE.SmoothShading": THREE.SmoothShading
	},

	colors: {
		"THREE.NoColors": THREE.NoColors,
		"THREE.FaceColors": THREE.FaceColors,
		"THREE.VertexColors": THREE.VertexColors
	},
	
	blendingMode: {
		"THREE.NoBlending": THREE.NoBlending,
		"THREE.NormalBlending": THREE.NormalBlending,
		"THREE.AdditiveBlending": THREE.AdditiveBlending,
		"THREE.SubtractiveBlending": THREE.SubtractiveBlending,
		"THREE.MultiplyBlending": THREE.MultiplyBlending,
		"THREE.CustomBlending": THREE.CustomBlending
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

function handleColorChange( color ) {
	
	return function( value ){
		if(typeof value === "string") {
			value = value.replace('#', '0x');
		}
		color.setHex( value );
    };
	
}

function guiMaterial( gui, material ) {
	var folder = gui.addFolder('THREE.Material');
	
	folder.add( material, 'transparent' );
	folder.add( material, 'opacity', 0, 1 );
	folder.add( material, 'blending', constants.blendingMode );
	folder.add( material, 'blendSrc', constants.destinationFactors );
	folder.add( material, 'blendDst', constants.destinationFactors );
	folder.add( material, 'blendEquation', constants.equations );
	folder.add( material, 'depthTest' );
	folder.add( material, 'depthWrite' );
	folder.add( material, 'polygonOffset' );
	folder.add( material, 'polygonOffsetFactor' );
	folder.add( material, 'polygonOffsetUnits' );
	folder.add( material, 'alphaTest' );
	folder.add( material, 'overdraw' );
	folder.add( material, 'visible' );
	folder.add( material, 'side', constants.side );
}

function guiMeshBasicMaterial( gui, material ) {
	
	var data = {
		color : material.color.getHex()
	};
		
	var folder = gui.addFolder('THREE.MeshBasicMaterial');

	folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
	folder.add( material, 'wireframe' );
	folder.add( material, 'wireframeLinewidth', 0, 10 );
	folder.add( material, 'wireframeLinecap', ["butt", "round", "square"] );
	folder.add( material, 'wireframeLinejoin', ["round", "bevel", "miter"] );
	folder.add( material, 'shading', constants.shading);
	folder.add( material, 'vertexColors', constants.colors);
	folder.add( material, 'fog' );
	
	//folder.add( material, 'lightMap' );
	//folder.add( material, 'specularMap' );
	//folder.add( material, 'alphaMap' );
	//folder.add( material, 'envMap' );
	//folder.add( material, 'skinning' );
	//folder.add( material, 'morphTargets' );
	//folder.add( material, 'map' );
	//folder.add( material, 'combine' );
	//folder.add( material, 'relectivity' );
	//folder.add( material, 'refractionRatio' );
}

function guiMeshDepthMaterial( gui, material ) {
	
	var folder = gui.addFolder('THREE.MeshDepthMaterial');
		
	folder.add( material, 'wireframe' );
	folder.add( material, 'wireframeLinewidth', 0, 10 );
}

function guiMeshNormalMaterial( gui, material ) {
	
	var folder = gui.addFolder('THREE.MeshNormalMaterial');
	
	folder.add( material, 'morphTargets');
	folder.add( material, 'shading', constants.shading);
	folder.add( material, 'wireframe' );
	folder.add( material, 'wireframeLinewidth', 0, 10 );
}

function guiLineBasicMaterial( gui, material ) {
	
	var data = {
		color : material.color.getHex()
	};
		
	var folder = gui.addFolder('THREE.LineBasicMaterial');

	folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
	folder.add( material, 'linewidth', 0, 10 );
	folder.add( material, 'linecap', ["butt", "round", "square"] );
	folder.add( material, 'linejoin', ["round", "bevel", "miter"] );
	folder.add( material, 'vertexColors', constants.colors);
	folder.add( material, 'fog' );
	
}

function guiMeshLambertMaterial( gui, material ) {
	
	var data = {
		color : material.color.getHex(),
		ambient : material.ambient.getHex(),
		emissive : material.emissive.getHex()
	};
		
	var folder = gui.addFolder('THREE.MeshLambertMaterial');

	folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
	folder.addColor( data, 'ambient' ).onChange( handleColorChange( material.ambient ) );
	folder.addColor( data, 'emissive' ).onChange( handleColorChange( material.emissive ) );
	
	folder.add( material, 'shading', constants.shading);
	folder.add( material, 'wireframe' );
	folder.add( material, 'wireframeLinewidth', 0, 10 );
	folder.add( material, 'wireframeLinecap', ["butt", "round", "square"] );
	folder.add( material, 'wireframeLinejoin', ["round", "bevel", "miter"] );
	folder.add( material, 'vertexColors', constants.colors);
	folder.add( material, 'fog' );
	
}

function guiMeshPhongMaterial( gui, material ) {
	
	var data = {
		color : material.color.getHex(),
		ambient : material.ambient.getHex(),
		emissive : material.emissive.getHex(),
		specular : material.specular.getHex()
	};
		
	var folder = gui.addFolder('THREE.MeshPhongMaterial');

	folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
	folder.addColor( data, 'ambient' ).onChange( handleColorChange( material.ambient ) );
	folder.addColor( data, 'emissive' ).onChange( handleColorChange( material.emissive ) );
	folder.addColor( data, 'specular' ).onChange( handleColorChange( material.specular ) );
	folder.add( material, 'shininess', 0, 100);
	
	folder.add( material, 'shading', constants.shading);
	folder.add( material, 'wireframe' );
	folder.add( material, 'wireframeLinewidth', 0, 10 );
	folder.add( material, 'wireframeLinecap', ["butt", "round", "square"] );
	folder.add( material, 'wireframeLinejoin', ["round", "bevel", "miter"] );
	folder.add( material, 'vertexColors', constants.colors);
	folder.add( material, 'fog' );
	
}


function chooseFromHash() {

	var selectedMaterial = window.location.hash.substring(1) || "MeshBasicMaterial";
	var material;
	
	var gui = new dat.GUI();
	switch (selectedMaterial) {
		
	case "MeshBasicMaterial":

		material = new THREE.MeshBasicMaterial({color: 0x00ff00});
		guiMaterial( gui, material );
		guiMeshBasicMaterial( gui, material );

		return material;

		break;
	
	case "MeshLambertMaterial":

		material = new THREE.MeshLambertMaterial({color: 0x00ff00});
		guiMaterial( gui, material );
		guiMeshLambertMaterial( gui, material );

		return material;

		break;
	
	case "MeshPhongMaterial":

		material = new THREE.MeshPhongMaterial({color: 0x00ff00});
		guiMaterial( gui, material );
		guiMeshPhongMaterial( gui, material );

		return material;

		break;
	
	case "MeshDepthMaterial":
		
		material = new THREE.MeshDepthMaterial({color: 0x00ff00});
		guiMaterial( gui, material );
		guiMeshDepthMaterial( gui, material );

		return material;
		
		break;
	
	case "MeshNormalMaterial":
		
		material = new THREE.MeshNormalMaterial();
		guiMaterial( gui, material );
		guiMeshNormalMaterial( gui, material );

		return material;
		
		break;
		
	case "LineBasicMaterial":

		material = new THREE.LineBasicMaterial({color: 0x00ff00});
		guiMaterial( gui, material );
		guiLineBasicMaterial( gui, material );

		return material;

		break;
	}
				
	
}