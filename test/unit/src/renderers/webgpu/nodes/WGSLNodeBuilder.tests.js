import { PerspectiveCamera } from '../../../../../../src/cameras/PerspectiveCamera.js';
import { LinearFilter } from '../../../../../../src/constants.js';
import { BoxGeometry } from '../../../../../../src/geometries/BoxGeometry.js';
import MeshBasicNodeMaterial from '../../../../../../src/materials/nodes/MeshBasicNodeMaterial.js';
import MaterialNode from '../../../../../../src/nodes/accessors/MaterialNode.js';
import { Mesh } from '../../../../../../src/objects/Mesh.js';
import { Scene } from '../../../../../../src/scenes/Scene.js';
import { DataTexture } from '../../../../../../src/textures/DataTexture.js';
import { getSharedRenderer } from '../../../nodes/tsl/gpu-test-utils.js';

function createTexture( filterable ) {

	const texture = new DataTexture( new Uint8Array( [ 255, 255, 255, 255 ] ), 1, 1 );

	if ( filterable ) {

		texture.minFilter = LinearFilter;
		texture.magFilter = LinearFilter;

	}

	return texture;

}

function getSamplerNames( shader ) {

	const declared = [ ...shader.matchAll( /var (\w+_sampler)\s*:/g ) ].map( ( match ) => match[ 1 ] );
	const referenced = [ ...shader.replace( /var \w+_sampler\s*:/g, '' ).matchAll( /\w+_sampler\b/g ) ].map( ( match ) => match[ 0 ] );

	return { declared: [ ...new Set( declared ) ].sort(), referenced: [ ...new Set( referenced ) ].sort() };

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGPU', () => {

		QUnit.module( 'WGSLNodeBuilder', () => {

			// https://github.com/mrdoob/three.js/issues/35273

			for ( const filterable of [ true, false ] ) {

				QUnit.test( `buildAsync() declares samplers as generated when a shared texture node changes (${ filterable ? 'filterable' : 'unfilterable' } map)`, async ( assert ) => {

					const renderer = await getSharedRenderer( 'webgpu' );

					if ( renderer === null ) {

						assert.ok( true, 'SKIPPED: "webgpu" backend is not available in this environment.' );
						return;

					}

					const material = new MeshBasicNodeMaterial( { map: createTexture( filterable ) } );
					const mesh = new Mesh( new BoxGeometry(), material );

					const builder = renderer.backend.createNodeBuilder( mesh, renderer );
					builder.scene = new Scene();
					builder.camera = new PerspectiveCamera();
					builder.material = material;
					builder.context.material = material;

					// all materials read their map through this shared node

					const mapNode = new MaterialNode( MaterialNode.MAP ).getCache( 'map', 'texture' );
					const otherMap = createTexture( ! filterable );

					// another object is drawn in the last yield, after the fragment code was generated

					await builder.buildAsync( async () => {

						if ( builder.buildStage === 'generate' && builder.shaderStage === 'fragment' ) {

							mapNode.node.value = otherMap;

						}

					} );

					const { declared, referenced } = getSamplerNames( builder.fragmentShader );

					assert.deepEqual( declared, referenced, 'every sampler used by the fragment shader is declared, and vice versa' );

				} );

			}

		} );

	} );

} );
