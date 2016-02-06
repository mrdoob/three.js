/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeMaterial = function( vertex, fragment ) {

	THREE.ShaderMaterial.call( this );

	this.vertex = vertex || new THREE.RawNode( new THREE.PositionNode( THREE.PositionNode.PROJECTION ) );
	this.fragment = fragment || new THREE.RawNode( new THREE.ColorNode( 0xFF0000 ) );

};

THREE.NodeMaterial.types = {
	t : 'sampler2D',
	tc : 'samplerCube',
	bv1 : 'bool',
	iv1 : 'int',
	fv1 : 'float',
	c : 'vec3',
	v2 : 'vec2',
	v3 : 'vec3',
	v4 : 'vec4'
};

THREE.NodeMaterial.addShortcuts = function( proto, prop, list ) {

	function applyShortcut( prop, name ) {

		return {
			get: function() {

				return this[ prop ][ name ];

			},
			set: function( val ) {

				this[ prop ][ name ] = val;

			}
		};

	};

	return (function() {

		var shortcuts = {};

		for ( var i = 0; i < list.length; ++ i ) {

			var name = list[ i ];

			shortcuts[ name ] = applyShortcut( prop, name );

		}

		Object.defineProperties( proto, shortcuts );

	})();

};

THREE.NodeMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );
THREE.NodeMaterial.prototype.constructor = THREE.NodeMaterial;

THREE.NodeMaterial.prototype.updateAnimation = function( delta ) {

	for ( var i = 0; i < this.requestUpdate.length; ++ i ) {

		this.requestUpdate[ i ].updateAnimation( delta );

	}

};

THREE.NodeMaterial.prototype.build = function() {

	var vertex, fragment;

	this.defines = {};
	this.uniforms = {};

	this.nodeData = {};

	this.vertexUniform = [];
	this.fragmentUniform = [];

	this.vertexTemps = [];
	this.fragmentTemps = [];

	this.uniformList = [];

	this.consts = [];
	this.functions = [];

	this.requestUpdate = [];

	this.requestAttrib = {
		uv: [],
		color: []
	};

	this.vertexPars = '';
	this.fragmentPars = '';

	this.vertexCode = '';
	this.fragmentCode = '';

	this.vertexNode = '';
	this.fragmentNode = '';

	var builder = new THREE.BuilderNode( this );

	vertex = this.vertex.build( builder.setShader( 'vertex' ), 'v4' );
	fragment = this.fragment.build( builder.setShader( 'fragment' ), 'v4' );

	if ( this.requestAttrib.uv[ 0 ] ) {

		this.addVertexPars( 'varying vec2 vUv;' );
		this.addFragmentPars( 'varying vec2 vUv;' );

		this.addVertexCode( 'vUv = uv;' );

	}

	if ( this.requestAttrib.uv[ 1 ] ) {

		this.addVertexPars( 'varying vec2 vUv2; attribute vec2 uv2;' );
		this.addFragmentPars( 'varying vec2 vUv2;' );

		this.addVertexCode( 'vUv2 = uv2;' );

	}

	if ( this.requestAttrib.color[ 0 ] ) {

		this.addVertexPars( 'varying vec4 vColor; attribute vec4 color;' );
		this.addFragmentPars( 'varying vec4 vColor;' );

		this.addVertexCode( 'vColor = color;' );

	}

	if ( this.requestAttrib.color[ 1 ] ) {

		this.addVertexPars( 'varying vec4 vColor2; attribute vec4 color2;' );
		this.addFragmentPars( 'varying vec4 vColor2;' );

		this.addVertexCode( 'vColor2 = color2;' );

	}

	if ( this.requestAttrib.position ) {

		this.addVertexPars( 'varying vec3 vPosition;' );
		this.addFragmentPars( 'varying vec3 vPosition;' );

		this.addVertexCode( 'vPosition = transformed;' );

	}

	if ( this.requestAttrib.worldPosition ) {

		// for future update replace from the native "varying vec3 vWorldPosition" for optimization

		this.addVertexPars( 'varying vec3 vWPosition;' );
		this.addFragmentPars( 'varying vec3 vWPosition;' );

		this.addVertexCode( 'vWPosition = worldPosition.xyz;' );

	}

	if ( this.requestAttrib.normal ) {

		this.addVertexPars( 'varying vec3 vObjectNormal;' );
		this.addFragmentPars( 'varying vec3 vObjectNormal;' );

		this.addVertexCode( 'vObjectNormal = normal;' );

	}

	if ( this.requestAttrib.worldNormal ) {

		this.addVertexPars( 'varying vec3 vWNormal;' );
		this.addFragmentPars( 'varying vec3 vWNormal;' );

		this.addVertexCode( 'vWNormal = ( modelMatrix * vec4( objectNormal, 0.0 ) ).xyz;' );

	}

	this.lights = this.requestAttrib.light;
	this.transparent = this.requestAttrib.transparent;

	this.vertexShader = [
		this.vertexPars,
		this.getCodePars( this.vertexUniform, 'uniform' ),
		this.getIncludes( this.consts[ 'vertex' ] ),
		this.getIncludes( this.functions[ 'vertex' ] ),
		'void main(){',
		this.getCodePars( this.vertexTemps ),
		vertex,
		this.vertexCode,
		'}'
	].join( "\n" );

	this.fragmentShader = [
		this.fragmentPars,
		this.getCodePars( this.fragmentUniform, 'uniform' ),
		this.getIncludes( this.consts[ 'fragment' ] ),
		this.getIncludes( this.functions[ 'fragment' ] ),
		'void main(){',
		this.getCodePars( this.fragmentTemps ),
		this.fragmentCode,
		fragment,
		'}'
	].join( "\n" );

	this.needsUpdate = true;
	this.dispose(); // force update

	return this;

};

THREE.NodeMaterial.prototype.define = function( name, value ) {

	this.defines[ name ] = value == undefined ? 1 : value;

};

THREE.NodeMaterial.prototype.isDefined = function( name ) {

	return this.defines[ name ] != undefined;

};

THREE.NodeMaterial.prototype.mergeUniform = function( uniforms ) {

	for ( var name in uniforms ) {

		this.uniforms[ name ] = uniforms[ name ];

	}

};

THREE.NodeMaterial.prototype.createUniform = function( value, type, ns, needsUpdate ) {

	var index = this.uniformList.length;

	var uniform = {
		type : type,
		value : value,
		name : ns ? ns : 'nVu' + index,
		needsUpdate : needsUpdate
	};

	this.uniformList.push( uniform );

	return uniform;

};

THREE.NodeMaterial.prototype.getVertexTemp = function( uuid, type, ns ) {

	if ( ! this.vertexTemps[ uuid ] ) {

		var index = this.vertexTemps.length,
			name = ns ? ns : 'nVt' + index,
			data = { name : name, type : type };

		this.vertexTemps.push( data );
		this.vertexTemps[ uuid ] = data;

	}

	return this.vertexTemps[ uuid ];

};

THREE.NodeMaterial.prototype.getFragmentTemp = function( uuid, type, ns ) {

	if ( ! this.fragmentTemps[ uuid ] ) {

		var index = this.fragmentTemps.length,
			name = ns ? ns : 'nVt' + index,
			data = { name : name, type : type };

		this.fragmentTemps.push( data );
		this.fragmentTemps[ uuid ] = data;

	}

	return this.fragmentTemps[ uuid ];

};

THREE.NodeMaterial.prototype.getIncludes = function( incs ) {

	function sortByPosition( a, b ) {

		return b.deps - a.deps;

	}

	return function( incs ) {

		if ( ! incs ) return '';

		var code = '';
		var incs = incs.sort( sortByPosition );

		for ( var i = 0; i < incs.length; i ++ ) {

			code += incs[ i ].node.src + '\n';

		}

		return code;

	}

}();

THREE.NodeMaterial.prototype.addVertexPars = function( code ) {

	this.vertexPars += code + '\n';

};

THREE.NodeMaterial.prototype.addFragmentPars = function( code ) {

	this.fragmentPars += code + '\n';

};

THREE.NodeMaterial.prototype.addVertexCode = function( code ) {

	this.vertexCode += code + '\n';

};

THREE.NodeMaterial.prototype.addFragmentCode = function( code ) {

	this.fragmentCode += code + '\n';

};

THREE.NodeMaterial.prototype.addVertexNode = function( code ) {

	this.vertexNode += code + '\n';

};

THREE.NodeMaterial.prototype.clearVertexNode = function() {

	var code = this.fragmentNode;

	this.fragmentNode = '';

	return code;

};

THREE.NodeMaterial.prototype.addFragmentNode = function( code ) {

	this.fragmentNode += code + '\n';

};

THREE.NodeMaterial.prototype.clearFragmentNode = function() {

	var code = this.fragmentNode;

	this.fragmentNode = '';

	return code;

};

THREE.NodeMaterial.prototype.getCodePars = function( pars, prefix ) {

	prefix = prefix || '';

	var code = '';

	for ( var i = 0, l = pars.length; i < l; ++ i ) {

		var parsType = pars[ i ].type;
		var parsName = pars[ i ].name;
		var parsValue = pars[ i ].value;

		if ( parsType == 't' && parsValue instanceof THREE.CubeTexture ) parsType = 'tc';

		var type = THREE.NodeMaterial.types[ parsType ];

		if ( type == undefined ) throw new Error( "Node pars " + parsType + " not found." );

		code += prefix + ' ' + type + ' ' + parsName + ';\n';

	}

	return code;

};

THREE.NodeMaterial.prototype.getVertexUniform = function( value, type, ns, needsUpdate ) {

	var uniform = this.createUniform( value, type, ns, needsUpdate );

	this.vertexUniform.push( uniform );
	this.vertexUniform[ uniform.name ] = uniform;

	this.uniforms[ uniform.name ] = uniform;

	return uniform;

};

THREE.NodeMaterial.prototype.getFragmentUniform = function( value, type, ns, needsUpdate ) {

	var uniform = this.createUniform( value, type, ns, needsUpdate );

	this.fragmentUniform.push( uniform );
	this.fragmentUniform[ uniform.name ] = uniform;

	this.uniforms[ uniform.name ] = uniform;

	return uniform;

};

THREE.NodeMaterial.prototype.getDataNode = function( uuid ) {

	return this.nodeData[ uuid ] = this.nodeData[ uuid ] || {};

};

THREE.NodeMaterial.prototype.include = function( shader, node ) {

	var includes;

	node = typeof node === 'string' ? THREE.NodeLib.get( node ) : node;

	if ( node instanceof THREE.FunctionNode ) {

		for ( var i = 0; i < node.includes.length; i ++ ) {

			this.include( shader, node.includes[ i ] );

		}

		includes = this.functions[ shader ] = this.functions[ shader ] || [];

	}
	else if ( node instanceof THREE.ConstNode ) {

		includes = this.consts[ shader ] = this.consts[ shader ] || [];

	}

	if ( includes[ node.name ] === undefined ) {

		for ( var ext in node.extensions ) {

			this.extensions[ ext ] = true;

		}

		includes[ node.name ] = {
			node : node,
			deps : 1
		};

		includes.push( includes[ node.name ] );

	}
	else ++ includes[ node.name ].deps;

};
