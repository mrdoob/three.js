import { WebGLNodeBuilder } from './WebGLNodeBuilder.js';

import { Material } from '../../../../../build/three.module.js';

function addCodeAfterSnippet( source, snippet, code ) {

	const index = source.indexOf( snippet );

	if ( index !== - 1 ) {

		const start = source.substring( 0, index + snippet.length );
		const end = source.substring( index + snippet.length );

		return `${start}\n${code}\n${end}`;

	}

	return source;

}

Material.prototype.onBuild = function ( parameters, renderer ) {

	new WebGLNodeBuilder( this, renderer, parameters ).build();

	let fragmentShader = parameters.fragmentShader;

	fragmentShader = addCodeAfterSnippet( fragmentShader, '#include <color_pars_fragment>',
		`#ifdef NODE_HEADER_UNIFORMS

			NODE_HEADER_UNIFORMS

		#endif` );

	fragmentShader = addCodeAfterSnippet( fragmentShader, '#include <color_fragment>',
		`#ifdef NODE_COLOR

			diffuseColor = NODE_COLOR;

		#endif` );

	parameters.fragmentShader = fragmentShader;

};
