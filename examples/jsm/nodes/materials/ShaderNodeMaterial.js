import * as Nodes from '../Nodes.js';
import { NodeMaterial, addNodeMaterial } from '../Nodes.js';
//import NodeMaterial, { addNodeMaterial } from '../nodes/materials/NodeMaterial.js'; // @TODO: issue importing before of Nodes.js

import Transpiler from '../../transpiler/Transpiler.js';
import GLSLDecoder from '../../transpiler/GLSLDecoder.js';
import TSLEncoder from '../../transpiler/TSLEncoder.js';
import { Return, VariableDeclaration, Accessor } from '../../transpiler/AST.js';

class ClassicShaderDecoder extends GLSLDecoder {

	constructor() {

		super();

		this.addPolyfill( 'vUv', 'vec2 vUv = uv();' );

	}

	parseFunction() {

		const node = super.parseFunction();

		if ( node.name === 'main' ) {

			node.type = 'vec4';
			node.layout = false;

			const fragColor = new Accessor( 'gl_FragColor' );

			node.body.unshift( new VariableDeclaration( 'vec4', 'gl_FragColor' ) );
			node.body.push( new Return( fragColor ) );

		}

		return node;

	}

}

class ShaderNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isShaderNodeMaterial = true;

		this.lights = false;

		this.colorSpace = false; // @TODO: rename

		this.setValues( parameters );

	}

	_parse( glsl ) {

		const decoder = new ClassicShaderDecoder();

		const encoder = new TSLEncoder();
		encoder.iife = true;
		encoder.uniqueNames = false;
		encoder.reference = true;

		const jsCode = new Transpiler( decoder, encoder ).parse( glsl );

		const tslPackage = eval( jsCode )( Nodes, this.uniforms );

		return tslPackage.main();

	}

	setup( builder ) {

		//const vertexShader = this.vertexShader;
		const fragmentShader = this.fragmentShader;

		this.colorNode = this._parse( fragmentShader );

		super.setup( builder );

	}

}

export default ShaderNodeMaterial;

addNodeMaterial( 'ShaderNodeMaterial', ShaderNodeMaterial );
