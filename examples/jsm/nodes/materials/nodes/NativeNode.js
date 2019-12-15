/**
 * @author sunag / http://www.sunag.com.br/
 */

import { 
	CubeUVReflectionMapping,
	CubeUVRefractionMapping,
	CubeRefractionMapping,
	EquirectangularRefractionMapping
} from '../../../../../build/three.module.js';

import { 
	Node,
	NodeBuilder,
	NodeMaterial
} from '../../../nodes/Nodes.js';

/*
const envMapTypeDefines = {};
envMapTypeDefines[ CubeUVReflectionMapping ] = 
envMapTypeDefines[ CubeUVRefractionMapping ] = 'ENVMAP_TYPE_CUBE_UV';

const envMapModeDefines  = {};
envMapModeDefines[ CubeRefractionMapping ] = 
envMapModeDefines[ EquirectangularRefractionMapping ] = 'ENVMAP_MODE_REFRACTION';
*/

function NativeNode( shader ) {

	Node.call( this );

	this.shader = shader;

}

NativeNode.prototype = Object.create( Node.prototype );
NativeNode.prototype.constructor = NativeNode;
NativeNode.prototype.nodeType = "Native";

/*NativeNodeMaterial.prototype.getParameters = function( builder, renderer ) {
	
	return {
		map: !! this.map,
		envMap: !! this.envMap,
		envMapMode: this.envMap && this.envMap.mapping,
		envMapEncoding: builder.getTextureEncodingFromMap( this.envMap, renderer.gammaInput ),
		envMapCubeUV: ( !! this.envMap ) && ( ( this.envMap.mapping === CubeUVReflectionMapping ) || ( this.envMap.mapping === CubeUVRefractionMapping ) ),

		vertexUvs: !! this.map || !! this.bumpMap || !! this.normalMap || !! this.specularMap || !! this.alphaMap || !! this.emissiveMap || !! this.roughnessMap || !! this.metalnessMap || !! this.clearcoatNormalMap || !! this.displacementMap,
	};
	
}

NativeNodeMaterial.prototype.getDefines = function( parameters ) {
	
	var defines = [];

	if ( parameters.map ) defines.push( 'USE_MAP' );

	if ( parameters.envMap ) {

		defines.push( 
			'USE_ENVMAP',
			envMapTypeDefines[ parameters.envMapMode ] || 'ENVMAP_TYPE_CUBE',
			envMapModeDefines[ parameters.envMapMode ] || 'ENVMAP_MODE_REFLECTION'
		);

	}

	if ( parameters.vertexUvs ) defines.push( 'USE_UV' );

	return defines;
	
}*/

NativeNode.prototype.getNodeParameters = function( ) {
	
	var nodes = {};
	
	nodes.color = this.color && this.color.isNode && ( this.shader === 'standard' );

	return nodes;
	
}

NativeNode.prototype.build = function ( builder ) {
	
	var material = builder.material;
	var parameters = this.getNodeParameters();
	
	this.flow = {};
	
	var code = '';
	
	if ( builder.isShader( 'vertex' ) ) {
		
	} else {
		
		if ( parameters.color ) {
			
			this.color.analyze( builder );
			
			var color = this.color.flow( builder, 'c' );
			
			code += `${color.code};\ndiffuse = ${color.result};\n`;
			
		}
		
	}
	
	return code;
	
}

export { NativeNode };
