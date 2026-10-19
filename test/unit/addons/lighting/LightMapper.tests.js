import { Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three/webgpu';
import { vec3 } from 'three/tsl';
import { LightMapper } from '../../../../examples/jsm/lighting/LightMapper.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'LightMapper', () => {

			QUnit.test( 'Uses current world transforms without rendering the source scene first', assert => {

				const parent = new Group();
				parent.position.set( 2, 3, 4 );
				const geometry = new PlaneGeometry();
				geometry.setAttribute( 'uv1', geometry.getAttribute( 'uv' ).clone() );
				const material = new MeshBasicMaterial();
				const mesh = new Mesh( geometry, material );
				mesh.position.set( 5, 6, 7 );
				parent.add( mesh );
				let bakedPosition;
				const renderer = {
					autoClear: true,
					getRenderTarget: () => null,
					getActiveCubeFace: () => 0,
					getActiveMipmapLevel: () => 0,
					getRenderObjectFunction: () => null,
					getPixelRatio: () => 1,
					getMRT: () => null,
					getClearColor: value => value.set( 0 ),
					getClearAlpha: () => 1,
					getScissorTest: () => false,
					setRenderTarget: () => {},
					setRenderObjectFunction: () => {},
					setPixelRatio: () => {},
					setMRT: () => {},
					setClearColor: () => {},
					setScissorTest: () => {},
					clear: () => {},
					render: scene => {

						if ( scene.isScene ) bakedPosition = scene.children[ 0 ].matrix.elements.slice( 12, 15 );

					}
				};
				const mapper = new LightMapper( renderer, 32, () => vec3( 1 ) );
				mapper.addObjects( [ mesh ] );
				mapper.update();
				assert.deepEqual( bakedPosition, [ 7, 9, 11 ] );
				mapper.dispose();
				geometry.dispose();
				material.dispose();

			} );

		} );

	} );

} );
