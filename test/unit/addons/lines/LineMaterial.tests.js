import { OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer, WebGLRenderTarget } from 'three';
import { LineMaterial } from '../../../../examples/jsm/lines/LineMaterial.js';
import { LineSegments2 } from '../../../../examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from '../../../../examples/jsm/lines/LineSegmentsGeometry.js';

QUnit.module( 'Addons', () => {

	QUnit.module( 'LineMaterial', () => {

		QUnit.test( 'world-unit extrusion with orthographic cameras', ( assert ) => {

			const renderer = new WebGLRenderer( { antialias: false } );
			const target = new WebGLRenderTarget( 400, 400 );
			renderer.setRenderTarget( target );
			const scene = new Scene();
			const geometry = new LineSegmentsGeometry();
			// Dashes isolate vertex extrusion from the solid-line endcap distance calculation.
			const material = new LineMaterial( { color: 0xffffff, linewidth: 0.1, worldUnits: true, dashed: true, dashSize: 100, gapSize: 0 } );
			const line = new LineSegments2( geometry, material );
			line.frustumCulled = false;
			scene.add( line );
			const camera = new OrthographicCamera( - 10, 10, 10, - 10, 0.1, 100 );
			const pixels = new Uint8Array( 400 * 400 * 4 );

			function render( camera, positions ) {

				geometry.setPositions( positions );
				line.computeLineDistances();
				renderer.render( scene, camera );
				renderer.readRenderTargetPixels( target, 0, 0, 400, 400, pixels );
				let count = 0;
				for ( let i = 0; i < pixels.length; i += 4 ) {

					if ( pixels[ i ] > 0 ) count ++;

				}

				return count;

			}

			try {

				assert.strictEqual( render( camera, [ - 2, 0, - 2, 2, 0, - 2 ] ), 160, 'Centered horizontal line is two pixels wide' );
				assert.strictEqual( render( camera, [ - 2, 8, - 2, 2, 8, - 2 ] ), 160, 'Off-axis horizontal line retains its width' );
				assert.strictEqual( render( camera, [ 8, - 2, - 2, 8, 2, - 2 ] ), 160, 'Off-axis vertical line retains its width' );
				const diagonal = render( camera, [ - 2, - 2, - 2, 2, 2, - 2 ] );
				assert.ok( diagonal > 0, 'Centered diagonal is visible' );
				assert.strictEqual( render( camera, [ - 6, 2, - 2, - 2, 6, - 2 ] ), diagonal, 'Off-axis diagonal retains its width' );

				camera.left = - 2;
				camera.right = 18;
				camera.updateProjectionMatrix();
				assert.strictEqual( render( camera, [ 8, - 2, - 2, 8, 2, - 2 ] ), 160, 'Asymmetric frustum retains the width' );

				const perspective = new PerspectiveCamera( 90, 1, 0.1, 100 );
				assert.ok( render( perspective, [ - 2, 0, - 10, 2, 0, - 10 ] ) > 0, 'Same material renders with a perspective camera' );
				assert.strictEqual( render( camera, [ 8, - 2, - 2, 8, 2, - 2 ] ), 160, 'Switching back to orthographic retains the width' );

			} finally {

				geometry.dispose();
				material.dispose();
				target.dispose();
				renderer.dispose();

			}

		} );

	} );

} );
