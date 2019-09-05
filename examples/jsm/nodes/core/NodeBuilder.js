/**
 * @author sunag / http://www.sunag.com.br/
 */

import {
	CubeReflectionMapping,
	CubeRefractionMapping,
	CubeUVReflectionMapping,
	CubeUVRefractionMapping,
	LinearEncoding,
	GammaEncoding
} from '../../../../build/three.module.js';

import { NodeUniform } from './NodeUniform.js';
import { NodeUtils } from './NodeUtils.js';
import { NodeLib } from './NodeLib.js';
import { FunctionNode } from './FunctionNode.js';
import { ExpressionNode } from './ExpressionNode.js';
import { ConstNode } from './ConstNode.js';
import { StructNode } from './StructNode.js';
import { NodeContext } from './NodeContext.js';
import { ReflectNode } from '../accessors/ReflectNode.js';
import { BoolNode } from '../inputs/BoolNode.js';
import { FloatNode } from '../inputs/FloatNode.js';
import { ColorNode } from '../inputs/ColorNode.js';
import { Vector2Node } from '../inputs/Vector2Node.js';
import { Vector3Node } from '../inputs/Vector3Node.js';
import { Vector4Node } from '../inputs/Vector4Node.js';
import { TextureNode } from '../inputs/TextureNode.js';
import { CubeTextureNode } from '../inputs/CubeTextureNode.js';
import { TextureCubeNode } from '../misc/TextureCubeNode.js';


var elements = NodeUtils.elements,
	constructors = [ 'float', 'vec2', 'vec3', 'vec4' ],
	convertFormatToType = {
		float: 'f',
		vec2: 'v2',
		vec3: 'v3',
		vec4: 'v4',
		mat4: 'v4',
		int: 'i',
		bool: 'b'
	},
	convertTypeToFormat = {
		t: 'sampler2D',
		tc: 'samplerCube',
		b: 'bool',
		i: 'int',
		f: 'float',
		c: 'vec3',
		v2: 'vec2',
		v3: 'vec3',
		v4: 'vec4',
		m3: 'mat3',
		m4: 'mat4'
	};

export class NodeBuilder {

	constructor() {

		this.slots = [];
		this.caches = [];
		this.contextsData = [];

		this.keywords = {};

		this.nodeData = {};

		this.varyNodeCode = {};
		this.vertexParsNodeCode = {};
		this.vertexFinalNodeCode = {};
		this.fragmentParsNodeCode = {};
		this.fragmentFinalNodeCode = {};

		this.requires = {
			uv: [],
			color: [],
			lights: false,
			fog: false
		};

		this.includes = {
			consts: [],
			functions: [],
			structs: []
		};

		this.attributes = {};

		this.prefixCode = [
			"#ifdef TEXTURE_LOD_EXT",

			"	#define texCube(a, b) textureCube(a, b)",
			"	#define texCubeBias(a, b, c) textureCubeLodEXT(a, b, c)",

			"	#define tex2D(a, b) texture2D(a, b)",
			"	#define tex2DBias(a, b, c) texture2DLodEXT(a, b, c)",

			"#else",

			"	#define texCube(a, b) textureCube(a, b)",
			"	#define texCubeBias(a, b, c) textureCube(a, b, c)",

			"	#define tex2D(a, b) texture2D(a, b)",
			"	#define tex2DBias(a, b, c) texture2D(a, b, c)",

			"#endif",

			"#include <packing>",
			"#include <common>"

		].join( "\n" );

		this.parsCode = {
			vertex: '',
			fragment: ''
		};

		this.code = {
			vertex: '',
			fragment: ''
		};

		this.nodeCode = {
			vertex: '',
			fragment: ''
		};

		this.resultCode = {
			vertex: '',
			fragment: ''
		};

		this.finalCode = {
			vertex: '',
			fragment: ''
		};

		this.inputs = {
			uniforms: {
				list: [],
				vertex: [],
				fragment: []
			},
			vars: {
				varying: [],
				vertex: [],
				fragment: []
			}
		};

		// send to material

		this.defines = {};

		this.uniforms = {};

		this.extensions = {};

		this.updaters = [];

		this.nodes = [];

		// --

		this.analyzing = false;

	}

	build( vertex, fragment ) {

		this.buildShader( 'vertex', vertex );
		this.buildShader( 'fragment', fragment );

		if ( this.requires.uv[ 0 ] ) {

			this.addVaryCode( 'varying vec2 vUv;' );

			this.addVertexFinalCode( 'vUv = uv;' );

		}

		if ( this.requires.uv[ 1 ] ) {

			this.addVaryCode( 'varying vec2 vUv2;' );
			this.addVertexParsCode( 'attribute vec2 uv2;' );

			this.addVertexFinalCode( 'vUv2 = uv2;' );

		}

		if ( this.requires.color[ 0 ] ) {

			this.addVaryCode( 'varying vec4 vColor;' );
			this.addVertexParsCode( 'attribute vec4 color;' );

			this.addVertexFinalCode( 'vColor = color;' );

		}

		if ( this.requires.color[ 1 ] ) {

			this.addVaryCode( 'varying vec4 vColor2;' );
			this.addVertexParsCode( 'attribute vec4 color2;' );

			this.addVertexFinalCode( 'vColor2 = color2;' );

		}

		if ( this.requires.position ) {

			this.addVaryCode( 'varying vec3 vPosition;' );

			this.addVertexFinalCode( 'vPosition = transformed;' );

		}

		if ( this.requires.worldPosition ) {

			this.addVaryCode( 'varying vec3 vWPosition;' );

			this.addVertexFinalCode( 'vWPosition = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;' );

		}

		return this;

	}

	buildShader( shader, node ) {

		this.resultCode[ shader ] = node.build( this.setShader( shader ), 'v4' );

	}

	setMaterial( material, renderer ) {

		this.material = material;
		this.renderer = renderer;

		this.requires.lights = material.lights;
		this.requires.fog = material.fog;

		this.mergeDefines( material.defines );

		return this;

	}

	addContext( context ) {

		context = context || new NodeContext();

		return this.addSlot( context.slot ).addCache( context.cache ).addContextData( context.data );

	}

	removeContext() {

		return this.removeSlot().removeCache().removeContextData();

	}

	addCache( name ) {

		this.cache = name || '';
		this.caches.push( this.cache );

		return this;

	}

	removeCache() {

		this.caches.pop();
		this.cache = this.caches[ this.caches.length - 1 ] || '';

		return this;

	}

	addContextData( context ) {

		this.contextData = Object.assign( {}, this.contextData, context || {} );
		this.contextsData.push( this.contextData );

		return this;

	}

	removeContextData() {

		this.contextsData.pop();
		this.contextData = this.contextsData[ this.contextsData.length - 1 ] || {};

		return this;

	}

	addSlot( name ) {

		this.slot = name || '';
		this.slots.push( this.slot );

		return this;

	}

	removeSlot() {

		this.slots.pop();
		this.slot = this.slots[ this.slots.length - 1 ] || '';

		return this;

	}

	addVertexCode( code ) {

		this.addCode( code, 'vertex' );

	}

	addFragmentCode( code ) {

		this.addCode( code, 'fragment' );

	}

	addCode( code, shader ) {

		this.code[ shader || this.shader ] += code + '\n';

	}

	addVertexNodeCode( code ) {

		this.addNodeCode( code, 'vertex' );

	}

	addFragmentNodeCode( code ) {

		this.addNodeCode( code, 'fragment' );

	}

	addNodeCode( code, shader ) {

		this.nodeCode[ shader || this.shader ] += code + '\n';

	}

	clearNodeCode( shader ) {

		shader = shader || this.shader;

		var code = this.nodeCode[ shader ];

		this.nodeCode[ shader ] = '';

		return code;

	}

	clearVertexNodeCode( ) {

		return this.clearNodeCode( 'vertex' );

	}

	clearFragmentNodeCode( ) {

		return this.clearNodeCode( 'fragment' );

	}

	addVertexFinalCode( code ) {

		this.addFinalCode( code, 'vertex' );

	}

	addVertexFinalNodeCode( node, code ) {

		if ( ! this.vertexFinalNodeCode[ node.uuid ] ) {

			this.addFinalCode( code, 'vertex' );

			this.vertexFinalNodeCode[ node.uuid ] = true;

		}

	}

	addFragmentFinalCode( code ) {

		this.addFinalCode( code, 'fragment' );

	}

	addFragmentFinalNodeCode( node, code ) {

		if ( ! this.fragmentFinalNodeCode[ node.uuid ] ) {

			this.addFinalCode( code, 'fragment' );

			this.fragmentFinalNodeCode[ node.uuid ] = true;

		}

	}

	addFinalCode( code, shader ) {

		this.finalCode[ shader || this.shader ] += code + '\n';

	}

	addVertexParsCode( code ) {

		this.addParsCode( code, 'vertex' );

	}

	addVertexParsNodeCode( node, code ) {

		if ( ! this.vertexParsNodeCode[ node.uuid ] ) {

			this.addParsCode( code, 'vertex' );

			this.vertexParsNodeCode[ node.uuid ] = true;

		}

	}

	addFragmentParsCode( code ) {

		this.addParsCode( code, 'fragment' );

	}

	addFragmentParsNodeCode( node, code ) {

		if ( ! this.fragmentParsNodeCode[ node.uuid ] ) {

			this.addParsCode( code, 'fragment' );

			this.fragmentParsNodeCode[ node.uuid ] = true;

		}

	}

	addParsCode( code, shader ) {

		this.parsCode[ shader || this.shader ] += code + '\n';

	}

	addVaryCode( code ) {

		this.addVertexParsCode( code );
		this.addFragmentParsCode( code );

	}

	addVaryNodeCode( node, code ) {

		if ( ! this.varyNodeCode[ node.uuid ] ) {

			this.addVertexParsCode( code );
			this.addFragmentParsCode( code );

			this.varyNodeCode[ node.uuid ] = true;

		}

	}

	isCache( name ) {

		return this.caches.indexOf( name ) !== - 1;

	}

	isSlot( name ) {

		return this.slots.indexOf( name ) !== - 1;

	}

	define( name, value ) {

		this.defines[ name ] = value === undefined ? 1 : value;

	}

	require( name ) {

		this.requires[ name ] = true;

	}

	isDefined( name ) {

		return this.defines[ name ] !== undefined;

	}

	getVar( uuid, type, ns, shader = 'varying', prefix = 'V', label = '' ) {

		var vars = this.getVars( shader ),
			data = vars[ uuid ];

		if ( ! data ) {

			var index = vars.length,
				name = ns ? ns : 'node' + prefix + index + ( label ? '_' + label : '' );

			data = { name: name, type: type };

			vars.push( data );
			vars[ uuid ] = data;

		}

		return data;

	}

	getTempVar( uuid, type, ns, label ) {

		return this.getVar( uuid, type, ns, this.shader, 'T', label );

	}

	getAttribute( name, type ) {

		if ( ! this.attributes[ name ] ) {

			var varying = this.getVar( name, type );

			this.addVertexParsCode( 'attribute ' + type + ' ' + name + ';' );
			this.addVertexFinalCode( varying.name + ' = ' + name + ';' );

			this.attributes[ name ] = { varying: varying, name: name, type: type };

		}

		return this.attributes[ name ];

	}

	getCode( shader ) {

		return [
			this.prefixCode,
			this.parsCode[ shader ],
			this.getVarListCode( this.getVars( 'varying' ), 'varying' ),
			this.getVarListCode( this.inputs.uniforms[ shader ], 'uniform' ),
			this.getIncludesCode( 'consts', shader ),
			this.getIncludesCode( 'structs', shader ),
			this.getIncludesCode( 'functions', shader ),
			'void main() {',
			this.getVarListCode( this.getVars( shader ) ),
			this.code[ shader ],
			this.resultCode[ shader ],
			this.finalCode[ shader ],
			'}'
		].join( "\n" );

	}

	getVarListCode( vars, prefix ) {

		prefix = prefix || '';

		var code = '';

		for ( var i = 0, l = vars.length; i < l; ++ i ) {

			var nVar = vars[ i ],
				type = nVar.type,
				name = nVar.name;

			var formatType = this.getFormatByType( type );

			if ( formatType === undefined ) {

				throw new Error( "Node pars " + formatType + " not found." );

			}

			code += prefix + ' ' + formatType + ' ' + name + ';\n';

		}

		return code;

	}

	getVars( shader ) {

		return this.inputs.vars[ shader || this.shader ];

	}

	getNodeData( node ) {

		var uuid = node.isNode ? node.uuid : node;

		return this.nodeData[ uuid ] = this.nodeData[ uuid ] || {};

	}

	createUniform( shader, type, node, ns, needsUpdate, label ) {

		var uniforms = this.inputs.uniforms,
			index = uniforms.list.length;

		var uniform = new NodeUniform( {
			type: type,
			name: ns ? ns : 'nodeU' + index + ( label ? '_' + label : '' ),
			node: node,
			needsUpdate: needsUpdate
		} );

		uniforms.list.push( uniform );

		uniforms[ shader ].push( uniform );
		uniforms[ shader ][ uniform.name ] = uniform;

		this.uniforms[ uniform.name ] = uniform;

		return uniform;

	}

	createVertexUniform( type, node, ns, needsUpdate, label ) {

		return this.createUniform( 'vertex', type, node, ns, needsUpdate, label );

	}

	createFragmentUniform( type, node, ns, needsUpdate, label ) {

		return this.createUniform( 'fragment', type, node, ns, needsUpdate, label );

	}

	include( node, parent, source ) {

		var includesFormat;

		node = typeof node === 'string' ? NodeLib.get( node ) : node;

		if ( this.getContextProperty( 'include' ) === false ) {

			return node.name;

		}


		if ( node instanceof FunctionNode ) {

			includesFormat = this.includes.functions;

		} else if ( node instanceof ConstNode ) {

			includesFormat = this.includes.consts;

		} else if ( node instanceof StructNode ) {

			includesFormat = this.includes.structs;

		}

		var includes = includesFormat[ this.shader ] = includesFormat[ this.shader ] || [];

		if ( node ) {

			var included = includes[ node.name ];

			if ( ! included ) {

				included = includes[ node.name ] = {
					node: node,
					deps: []
				};

				included.src = node.build( this, 'source' );

				includes.push( included );

			}

			if ( node instanceof FunctionNode && parent && includes[ parent.name ] && includes[ parent.name ].deps.indexOf( node ) == - 1 ) {

				includes[ parent.name ].deps.push( node );

				if ( node.includes && node.includes.length ) {

					var i = 0;

					do {

						this.include( node.includes[ i ++ ], parent );

					} while ( i < node.includes.length );

				}

			}

			if ( source ) {

				included.src = source;

			}

			return node.name;

		} else {

			throw new Error( "Include not found." );

		}

	}

	colorToVectorProperties( color ) {

		return color.replace( 'r', 'x' ).replace( 'g', 'y' ).replace( 'b', 'z' ).replace( 'a', 'w' );

	}

	colorToVector( color ) {

		return color.replace( /c/g, 'v3' );

	}

	getIncludes( type, shader ) {

		return this.includes[ type ][ shader || this.shader ];

	}

	getIncludesCode( type, shader ) {

		var includes = this.getIncludes( type, shader );

		if ( ! includes ) return '';

		var code = '',
			includes = includes.sort( ( a, b ) => a.deps.length - b.deps.length );

		for ( var i = 0; i < includes.length; i ++ ) {

			if ( includes[ i ].src ) code += includes[ i ].src + '\n';

		}

		return code;

	}

	getContextProperty( name ) {

		return this.contextData[ name ];

	}

	getContextClass( name ) {

		return this.getContextProperty( name + 'Class' );

	}

	getConstructorFromLength( len ) {

		return constructors[ len - 1 ];

	}

	isTypeMatrix( format ) {

		return /^m/.test( format );

	}

	getTypeLength( type ) {

		if ( type === 'f' ) return 1;

		return parseInt( this.colorToVector( type ).substr( 1 ) );

	}

	getTypeFromLength( len ) {

		if ( len === 1 ) return 'f';

		return 'v' + len;

	}

	findNode() {

		for ( var i = 0; i < arguments.length; i ++ ) {

			var nodeCandidate = arguments[ i ];

			if ( nodeCandidate !== undefined && nodeCandidate.isNode ) {

				return nodeCandidate;

			}

		}

	}

	resolve() {

		for ( var i = 0; i < arguments.length; i ++ ) {

			var nodeCandidate = arguments[ i ];
			var resolvedNode = NodeBuilder.resolve( nodeCandidate, false );

			if ( resolvedNode !== undefined && resolvedNode.isNode ) {

				return resolvedNode;

			}

		}

	}

	format( code, from, to ) {

		var typeToType = this.colorToVector( to + ' <- ' + from );

		switch ( typeToType ) {

			case 'f <- v2' : return code + '.x';
			case 'f <- v3' : return code + '.x';
			case 'f <- v4' : return code + '.x';
			case 'f <- i' :
			case 'f <- b' :	return 'float( ' + code + ' )';

			case 'v2 <- f' : return 'vec2( ' + code + ' )';
			case 'v2 <- v3': return code + '.xy';
			case 'v2 <- v4': return code + '.xy';
			case 'v2 <- i' :
			case 'v2 <- b' : return 'vec2( float( ' + code + ' ) )';

			case 'v3 <- f' : return 'vec3( ' + code + ' )';
			case 'v3 <- v2': return 'vec3( ' + code + ', 0.0 )';
			case 'v3 <- v4': return code + '.xyz';
			case 'v3 <- i' :
			case 'v3 <- b' : return 'vec2( float( ' + code + ' ) )';

			case 'v4 <- f' : return 'vec4( ' + code + ' )';
			case 'v4 <- v2': return 'vec4( ' + code + ', 0.0, 1.0 )';
			case 'v4 <- v3': return 'vec4( ' + code + ', 1.0 )';
			case 'v4 <- i' :
			case 'v4 <- b' : return 'vec4( float( ' + code + ' ) )';

			case 'i <- f' :
			case 'i <- b' : return 'int( ' + code + ' )';
			case 'i <- v2' : return 'int( ' + code + '.x )';
			case 'i <- v3' : return 'int( ' + code + '.x )';
			case 'i <- v4' : return 'int( ' + code + '.x )';

			case 'b <- f' : return '( ' + code + ' != 0.0 )';
			case 'b <- v2' : return '( ' + code + ' != vec2( 0.0 ) )';
			case 'b <- v3' : return '( ' + code + ' != vec3( 0.0 ) )';
			case 'b <- v4' : return '( ' + code + ' != vec4( 0.0 ) )';
			case 'b <- i' : return '( ' + code + ' != 0 )';

		}

		return code;

	}

	getTypeByFormat( format ) {

		return convertFormatToType[ format ] || format;

	}

	getFormatByType( type ) {

		return convertTypeToFormat[ type ] || type;

	}

	getUuid( uuid, useCache ) {

		useCache = useCache !== undefined ? useCache : true;

		if ( useCache && this.cache ) uuid = this.cache + '-' + uuid;

		return uuid;

	}

	getElementByIndex( index ) {

		return elements[ index ];

	}

	getIndexByElement( elm ) {

		return elements.indexOf( elm );

	}

	isShader( shader ) {

		return this.shader === shader;

	}

	setShader( shader ) {

		this.shader = shader;

		return this;

	}

	mergeDefines( defines ) {

		for ( var name in defines ) {

			this.defines[ name ] = defines[ name ];

		}

		return this.defines;

	}

	mergeUniform( uniforms ) {

		for ( var name in uniforms ) {

			this.uniforms[ name ] = uniforms[ name ];

		}

		return this.uniforms;

	}

	getTextureEncodingFromMap( map, gammaOverrideLinear ) {

		gammaOverrideLinear = gammaOverrideLinear !== undefined ? gammaOverrideLinear : this.getContextProperty( 'gamma' ) && ( this.renderer ? this.renderer.gammaInput : false );

		var encoding;

		if ( ! map ) {

			encoding = LinearEncoding;

		} else if ( map.isTexture ) {

			encoding = map.encoding;

		} else if ( map.isWebGLRenderTarget ) {

			console.warn( "THREE.WebGLPrograms.getTextureEncodingFromMap: don't use render targets as textures. Use their .texture property instead." );
			encoding = map.texture.encoding;

		}

		// add backwards compatibility for WebGLRenderer.gammaInput/gammaOutput parameter, should probably be removed at some point.
		if ( encoding === LinearEncoding && gammaOverrideLinear ) {

			encoding = GammaEncoding;

		}

		return encoding;

	}

}

NodeBuilder.resolve = ( value, primitives ) => {

	primitives = primitives !== undefined ? primitives : true;

	if ( value !== undefined ) {

		if ( value.isNode ) {

			return value;

		} else if ( value.isTexture ) {

			switch ( value.mapping ) {

				case CubeReflectionMapping:
					return new CubeTextureNode( value );

				case CubeRefractionMapping:
					var uv = new ReflectNode( ReflectNode.CUBE, new FloatNode( 1 ).setConst( true ) );
					return new CubeTextureNode( value, uv );

				case CubeUVReflectionMapping:
					return new TextureCubeNode( new TextureNode( value ) );

				case CubeUVRefractionMapping:
					var uv = new ReflectNode( ReflectNode.VECTOR, new FloatNode( 1 ).setConst( true ) );
					return new TextureCubeNode( new TextureNode( value ), uv );

				default:
					return new TextureNode( value );

			}

		} else if ( value.isVector2 ) {

			return new Vector2Node( value );

		} else if ( value.isVector3 ) {

			return new Vector3Node( value );

		} else if ( value.isVector4 ) {

			return new Vector4Node( value );

		} else if ( primitives ) {

			var type = typeof value;

			if ( type === 'number' ) return new FloatNode( value ).setConst( true );
			else if ( type === 'boolean' ) return new BoolNode( value ).setConst( true );
			else if ( type === 'string' ) {

				if ( value.substr( 0, 1 ) === '#' ) return new ColorNode( parseInt( value.substr( 1 ) ) ).setConst( true );
				else if ( value.substr( 0, 2 ) === '0x' ) return new ColorNode( parseInt( value ) ).setConst( true );

				return NodeLib.get( value ) || NodeLib.getKeyword( value ) || new ExpressionNode( value );

			}



		}

	}
	
}
