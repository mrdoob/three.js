import WGSLNodeBuilder from '../../../src/renderers/webgpu/nodes/WGSLNodeBuilder.js';
import GLSLNodeBuilder from '../../../src/renderers/webgl-fallback/nodes/GLSLNodeBuilder.js';
import { BufferAttribute } from '../../../src/core/BufferAttribute.js';
import { BufferGeometry } from '../../../src/core/BufferGeometry.js';

export const builders = {
	wgsl: WGSLNodeBuilder,
	glsl: GLSLNodeBuilder
};

export function generateCode( createNode, language ) {

	// These cases exercise node code generation without a GPU or renderer init.
	const renderer = { backend: {}, debug: { diagnostics: { keywords: false } } };
	const geometry = new BufferGeometry();
	geometry.setAttribute( 'uv', new BufferAttribute( new Float32Array( 2 ), 2 ) );
	const builder = new builders[ language ]( { geometry }, renderer );
	builder.setShaderStage( 'fragment' );

	const flow = builder.flowStagesNode( createNode() );

	return normalizeCode( [
		builder.getCodes( 'fragment' ),
		flow.vars.replace( /^\t/gm, '' ),
		flow.code.replace( /^\t/gm, '' ),
		flow.result
	].filter( Boolean ).join( '\n' ) );

}

export function normalizeCode( code ) {

	return code
		.replace( /\r\n/g, '\n' )
		.replace( /[ \t]+$/gm, '' )
		.replace( /\n(?:[ \t]*\n)+/g, '\n\n' )
		.trim() + '\n';

}
