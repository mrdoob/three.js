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

};

function getObjectsKeys( obj ) {

	var keys = [];

	for ( var key in obj ) {

		if ( obj.hasOwnProperty( key ) ) {

			keys.push( key );

		}

	}

	return keys;
}

var envMaps = (function () {

	var path = "../../examples/textures/cube/SwedishRoyalCastle/";
	var format = '.jpg';
	var urls = [
		path + 'px' + format, path + 'nx' + format,
		path + 'py' + format, path + 'ny' + format,
		path + 'pz' + format, path + 'nz' + format
	];

	var reflectionCube = new THREE.CubeTextureLoader().load( urls );
	reflectionCube.format = THREE.RGBFormat;

	var refractionCube = new THREE.CubeTextureLoader().load( urls );
	refractionCube.mapping = THREE.CubeRefractionMapping;
	refractionCube.format = THREE.RGBFormat;

	return {
		none : null,
		reflection : reflectionCube,
		refraction : refractionCube
	};

})();

var envMapKeys = getObjectsKeys( envMaps );

var textureMaps = (function () {

	return {
		none : null,
		grass : new THREE.TextureLoader().load( "../../examples/textures/terrain/grasslight-thin.jpg" )
	};

})();

var textureMapKeys = getObjectsKeys( textureMaps );

function generateVertexColors ( geometry ) {

	for ( var i=0, il = geometry.faces.length; i < il; i++ ) {

		geometry.faces[i].vertexColors.push( new THREE.Color().setHSL(
			i / il * Math.random(),
			0.5,
			0.5
		) );
		geometry.faces[i].vertexColors.push( new THREE.Color().setHSL(
			i / il * Math.random(),
			0.5,
			0.5
		) );
		geometry.faces[i].vertexColors.push( new THREE.Color().setHSL(
			i / il * Math.random(),
			0.5,
			0.5
		) );

		geometry.faces[i].color = new THREE.Color().setHSL(
			i / il * Math.random(),
			0.5,
			0.5
		);

	}

}

function generateMorphTargets ( mesh, geometry ) {

	var vertices = [], scale;

	for ( var i = 0; i < geometry.vertices.length; i++ ) {

		vertices.push( geometry.vertices[ i ].clone() );

		scale = 1 + Math.random() * 0.3;

		vertices[ vertices.length - 1 ].x *= scale;
		vertices[ vertices.length - 1 ].y *= scale;
		vertices[ vertices.length - 1 ].z *= scale;

	}

	geometry.morphTargets.push( { name: "target1", vertices: vertices } );

}

function handleColorChange ( color ) {

	return function ( value ){

		if (typeof value === "string") {

			value = value.replace('#', '0x');

		}

		color.setHex( value );

    };

}

function needsUpdate ( material, geometry ) {

	return function () {

		material.shading = +material.shading; //Ensure number
		material.vertexColors = +material.vertexColors; //Ensure number
		material.side = +material.side; //Ensure number
		material.needsUpdate = true;
		geometry.verticesNeedUpdate = true;
		geometry.normalsNeedUpdate = true;
		geometry.colorsNeedUpdate = true;

	};

}

function updateMorphs ( torus, material ) {

	return function () {

		torus.updateMorphTargets();
		material.needsUpdate = true;

	};

}

function updateTexture ( material, materialKey, textures ) {

	return function ( key ) {

		material[materialKey] = textures[key];
		material.needsUpdate = true;

	};

}

function guiScene ( gui, scene ) {

	var folder = gui.addFolder('Scene');

	var data = {
		background : "#000000",
		"ambient light" : ambientLight.color.getHex()
	};

	var color = new THREE.Color();
	var colorConvert = handleColorChange( color );

	folder.addColor( data, "background" ).onChange( function ( value ) {

		colorConvert( value );

		renderer.setClearColor( color.getHex() );

	} );

	folder.addColor( data, "ambient light" ).onChange( handleColorChange( ambientLight.color ) );

	guiSceneFog( folder, scene );

}

function guiSceneFog ( folder, scene ) {

	var fogFolder = folder.addFolder('scene.fog');

	var fog = new THREE.Fog( 0x3f7b9d, 0, 60 );

	var data = {
		fog : {
			"THREE.Fog()" : false,
			"scene.fog.color" : fog.color.getHex()
		}
	};

	fogFolder.add( data.fog, 'THREE.Fog()' ).onChange( function ( useFog ) {

		if ( useFog ) {

			scene.fog = fog;

		} else {

			scene.fog = null;

		}

	} );

	fogFolder.addColor( data.fog, 'scene.fog.color').onChange( handleColorChange( fog.color ) );

}

function guiMaterial ( gui, mesh, material, geometry ) {

	var folder = gui.addFolder('THREE.Material');

	folder.add( material, 'transparent' );
	folder.add( material, 'opacity', 0, 1 );
	// folder.add( material, 'blending', constants.blendingMode );
	// folder.add( material, 'blendSrc', constants.destinationFactors );
	// folder.add( material, 'blendDst', constants.destinationFactors );
	// folder.add( material, 'blendEquation', constants.equations );
	folder.add( material, 'depthTest' );
	folder.add( material, 'depthWrite' );
	// folder.add( material, 'polygonOffset' );
	// folder.add( material, 'polygonOffsetFactor' );
	// folder.add( material, 'polygonOffsetUnits' );
	folder.add( material, 'alphaTest', 0, 1 );
	// folder.add( material, 'overdraw', 0, 5 );
	folder.add( material, 'visible' );
	folder.add( material, 'side', constants.side ).onChange( needsUpdate( material, geometry ) );

}

function guiMeshBasicMaterial ( gui, mesh, material, geometry ) {

	var data = {
		color : material.color.getHex(),
		envMaps : envMapKeys,
		map : textureMapKeys,
		specularMap : textureMapKeys,
		alphaMap : textureMapKeys
	};

	var folder = gui.addFolder('THREE.MeshBasicMaterial');

	folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
	folder.add( material, 'wireframe' );
	folder.add( material, 'wireframeLinewidth', 0, 10 );
	folder.add( material, 'shading', constants.shading);
	folder.add( material, 'vertexColors', constants.colors).onChange( needsUpdate( material, geometry ) );
	folder.add( material, 'fog' );

	folder.add( data, 'envMaps', envMapKeys ).onChange( updateTexture( material, 'envMap', envMaps ) );
	folder.add( data, 'map', textureMapKeys ).onChange( updateTexture( material, 'map', textureMaps ) );
	folder.add( data, 'specularMap', textureMapKeys ).onChange( updateTexture( material, 'specularMap', textureMaps ) );
	folder.add( data, 'alphaMap', textureMapKeys ).onChange( updateTexture( material, 'alphaMap', textureMaps ) );
	folder.add( material, 'morphTargets' ).onChange( updateMorphs( mesh, material ) );
	folder.add( material, 'combine', constants.combine ).onChange( updateMorphs( mesh, material ) );
	folder.add( material, 'reflectivity', 0, 1 );
	folder.add( material, 'refractionRatio', 0, 1 );
	//folder.add( material, 'skinning' );

}

function guiMeshDepthMaterial ( gui, mesh, material, geometry ) {

	var folder = gui.addFolder('THREE.MeshDepthMaterial');

	folder.add( material, 'wireframe' );
	folder.add( material, 'wireframeLinewidth', 0, 10 );
	folder.add( material, 'morphTargets' ).onChange( updateMorphs( mesh, material ) );

}

function guiMeshNormalMaterial ( gui, mesh, material, geometry ) {

	var folder = gui.addFolder('THREE.MeshNormalMaterial');

	folder.add( material, 'wireframe' );
	folder.add( material, 'wireframeLinewidth', 0, 10 );
	folder.add( material, 'morphTargets' ).onChange( updateMorphs( mesh, material ) );

}

function guiLineBasicMaterial ( gui, mesh, material, geometry ) {

	var data = {
		color : material.color.getHex()
	};

	var folder = gui.addFolder('THREE.LineBasicMaterial');

	folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
	folder.add( material, 'linewidth', 0, 10 );
	folder.add( material, 'linecap', ["butt", "round", "square"] );
	folder.add( material, 'linejoin', ["round", "bevel", "miter"] );
	folder.add( material, 'vertexColors', constants.colors).onChange( needsUpdate( material, geometry ) );
	folder.add( material, 'fog' );

}

function guiMeshLambertMaterial ( gui, mesh, material, geometry ) {

	var data = {
		color : material.color.getHex(),
		emissive : material.emissive.getHex(),
		envMaps : envMapKeys,
		map : textureMapKeys,
		specularMap : textureMapKeys,
		alphaMap : textureMapKeys
	};

	var envObj = {};

	var folder = gui.addFolder('THREE.MeshLambertMaterial');

	folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
	folder.addColor( data, 'emissive' ).onChange( handleColorChange( material.emissive ) );

	folder.add( material, 'wireframe' );
	folder.add( material, 'wireframeLinewidth', 0, 10 );
	folder.add( material, 'vertexColors', constants.colors ).onChange( needsUpdate( material, geometry ) );
	folder.add( material, 'fog' );

	folder.add( data, 'envMaps', envMapKeys ).onChange( updateTexture( material, 'envMap', envMaps ) );
	folder.add( data, 'map', textureMapKeys ).onChange( updateTexture( material, 'map', textureMaps ) );
	folder.add( data, 'specularMap', textureMapKeys ).onChange( updateTexture( material, 'specularMap', textureMaps ) );
	folder.add( data, 'alphaMap', textureMapKeys ).onChange( updateTexture( material, 'alphaMap', textureMaps ) );
	folder.add( material, 'morphTargets' ).onChange( updateMorphs( mesh, material ) );
	folder.add( material, 'combine', constants.combine ).onChange( updateMorphs( mesh, material ) );
	folder.add( material, 'reflectivity', 0, 1 );
	folder.add( material, 'refractionRatio', 0, 1 );
	//folder.add( material, 'skinning' );

}

function guiMeshPhongMaterial ( gui, mesh, material, geometry ) {

	var data = {
		color : material.color.getHex(),
		emissive : material.emissive.getHex(),
		specular : material.specular.getHex(),
		envMaps : envMapKeys,
		map : textureMapKeys,
		lightMap : textureMapKeys,
		specularMap : textureMapKeys,
		alphaMap : textureMapKeys
	};

	var folder = gui.addFolder('THREE.MeshPhongMaterial');

	folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
	folder.addColor( data, 'emissive' ).onChange( handleColorChange( material.emissive ) );
	folder.addColor( data, 'specular' ).onChange( handleColorChange( material.specular ) );

	folder.add( material, 'shininess', 0, 100);
	folder.add( material, 'shading', constants.shading).onChange( needsUpdate( material, geometry ) );
	folder.add( material, 'wireframe' );
	folder.add( material, 'wireframeLinewidth', 0, 10 );
	folder.add( material, 'vertexColors', constants.colors);
	folder.add( material, 'fog' );
	folder.add( data, 'envMaps', envMapKeys ).onChange( updateTexture( material, 'envMap', envMaps ) );
	folder.add( data, 'map', textureMapKeys ).onChange( updateTexture( material, 'map', textureMaps ) );
	folder.add( data, 'lightMap', textureMapKeys ).onChange( updateTexture( material, 'lightMap', textureMaps ) );
	folder.add( data, 'specularMap', textureMapKeys ).onChange( updateTexture( material, 'specularMap', textureMaps ) );
	folder.add( data, 'alphaMap', textureMapKeys ).onChange( updateTexture( material, 'alphaMap', textureMaps ) );

}

function guiMeshStandardMaterial ( gui, mesh, material, geometry ) {

	var data = {
		color : material.color.getHex(),
		emissive : material.emissive.getHex(),
		envMaps : envMapKeys,
		map : textureMapKeys,
		lightMap : textureMapKeys,
		specularMap : textureMapKeys,
		alphaMap : textureMapKeys
	};

	var folder = gui.addFolder('THREE.MeshStandardMaterial');

	folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
	folder.addColor( data, 'emissive' ).onChange( handleColorChange( material.emissive ) );

	folder.add( material, 'roughness', 0, 1 );
	folder.add( material, 'metalness', 0, 1 );
	folder.add( material, 'shading', constants.shading).onChange( needsUpdate( material, geometry ) );
	folder.add( material, 'wireframe' );
	folder.add( material, 'wireframeLinewidth', 0, 10 );
	folder.add( material, 'vertexColors', constants.colors);
	folder.add( material, 'fog' );
	folder.add( data, 'envMaps', envMapKeys ).onChange( updateTexture( material, 'envMap', envMaps ) );
	folder.add( data, 'map', textureMapKeys ).onChange( updateTexture( material, 'map', textureMaps ) );
	folder.add( data, 'lightMap', textureMapKeys ).onChange( updateTexture( material, 'lightMap', textureMaps ) );
	folder.add( data, 'alphaMap', textureMapKeys ).onChange( updateTexture( material, 'alphaMap', textureMaps ) );

	// TODO roughnessMap and metalnessMap

}

function chooseFromHash ( gui, mesh, geometry ) {

	var selectedMaterial = window.location.hash.substring(1) || "MeshBasicMaterial";
	var material;

	switch (selectedMaterial) {

	case "MeshBasicMaterial" :

		material = new THREE.MeshBasicMaterial({color: 0x2194CE});
		guiMaterial( gui, mesh, material, geometry );
		guiMeshBasicMaterial( gui, mesh, material, geometry );

		return material;

		break;

	case "MeshLambertMaterial" :

		material = new THREE.MeshLambertMaterial({color: 0x2194CE});
		guiMaterial( gui, mesh, material, geometry );
		guiMeshLambertMaterial( gui, mesh, material, geometry );

		return material;

		break;

	case "MeshPhongMaterial" :

		material = new THREE.MeshPhongMaterial({color: 0x2194CE});
		guiMaterial( gui, mesh, material, geometry );
		guiMeshPhongMaterial( gui, mesh, material, geometry );

		return material;

		break;

	case "MeshStandardMaterial" :

		material = new THREE.MeshStandardMaterial({color: 0x2194CE});
		guiMaterial( gui, mesh, material, geometry );
		guiMeshStandardMaterial( gui, mesh, material, geometry );

		return material;

		break;

	case "MeshDepthMaterial" :

		material = new THREE.MeshDepthMaterial({color: 0x2194CE});
		guiMaterial( gui, mesh, material, geometry );
		guiMeshDepthMaterial( gui, mesh, material, geometry );

		return material;

		break;

	case "MeshNormalMaterial" :

		material = new THREE.MeshNormalMaterial();
		guiMaterial( gui, mesh, material, geometry );
		guiMeshNormalMaterial( gui, mesh, material, geometry );

		return material;

		break;

	case "LineBasicMaterial" :

		material = new THREE.LineBasicMaterial({color: 0x2194CE});
		guiMaterial( gui, mesh, material, geometry );
		guiLineBasicMaterial( gui, mesh, material, geometry );

		return material;

		break;
	}

}
