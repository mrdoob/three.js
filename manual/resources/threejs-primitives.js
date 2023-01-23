import * as THREE from 'three';
import { threejsLessonUtils } from './threejs-lesson-utils.js';
import { FontLoader } from '../../examples/jsm/loaders/FontLoader.js';
import { ParametricGeometry } from '../../examples/jsm/geometries/ParametricGeometry.js';
import { TextGeometry } from '../../examples/jsm/geometries/TextGeometry.js';

{

	const darkColors = {
		lines: '#DDD',
	};
	const lightColors = {
		lines: '#000',
	};

	const darkMatcher = window.matchMedia( '(prefers-color-scheme: dark)' );
	const isDarkMode = darkMatcher.matches;
	const colors = isDarkMode ? darkColors : lightColors;

	const fontLoader = new FontLoader();
	const fontPromise = new Promise( ( resolve ) => {

		fontLoader.load( '/examples/fonts/helvetiker_regular.typeface.json', resolve );

	} );

	const diagrams = {
		BoxGeometry: {
			ui: {
				width: { type: 'range', min: 1, max: 10, precision: 1, },
				height: { type: 'range', min: 1, max: 10, precision: 1, },
				depth: { type: 'range', min: 1, max: 10, precision: 1, },
				widthSegments: { type: 'range', min: 1, max: 10, },
				heightSegments: { type: 'range', min: 1, max: 10, },
				depthSegments: { type: 'range', min: 1, max: 10, },
			},
			create( width = 8, height = 8, depth = 8 ) {

				return new THREE.BoxGeometry( width, height, depth );

			},
			create2( width = 8, height = 8, depth = 8, widthSegments = 4, heightSegments = 4, depthSegments = 4 ) {

				return new THREE.BoxGeometry(
					width, height, depth,
					widthSegments, heightSegments, depthSegments );

			},
		},
		CircleGeometry: {
			ui: {
				radius: { type: 'range', min: 1, max: 10, precision: 1, },
				segments: { type: 'range', min: 1, max: 50, },
				thetaStart: { type: 'range', min: 0, max: 2, mult: Math.PI },
				thetaLength: { type: 'range', min: 0, max: 2, mult: Math.PI },
			},
			create( radius = 7, segments = 24 ) {

				return new THREE.CircleGeometry( radius, segments );

			},
			create2( radius = 7, segments = 24, thetaStart = Math.PI * 0.25, thetaLength = Math.PI * 1.5 ) {

				return new THREE.CircleGeometry(
					radius, segments, thetaStart, thetaLength );

			},
		},
		ConeGeometry: {
			ui: {
				radius: { type: 'range', min: 1, max: 10, precision: 1, },
				height: { type: 'range', min: 1, max: 10, precision: 1, },
				radialSegments: { type: 'range', min: 1, max: 50, },
				heightSegments: { type: 'range', min: 1, max: 10, },
				openEnded: { type: 'bool', },
				thetaStart: { type: 'range', min: 0, max: 2, mult: Math.PI },
				thetaLength: { type: 'range', min: 0, max: 2, mult: Math.PI },
			},
			create( radius = 6, height = 8, radialSegments = 16 ) {

				return new THREE.ConeGeometry( radius, height, radialSegments );

			},
			create2( radius = 6, height = 8, radialSegments = 16, heightSegments = 2, openEnded = true, thetaStart = Math.PI * 0.25, thetaLength = Math.PI * 1.5 ) {

				return new THREE.ConeGeometry(
					radius, height,
					radialSegments, heightSegments,
					openEnded,
					thetaStart, thetaLength );

			},
		},
		CylinderGeometry: {
			ui: {
				radiusTop: { type: 'range', min: 0, max: 10, precision: 1, },
				radiusBottom: { type: 'range', min: 0, max: 10, precision: 1, },
				height: { type: 'range', min: 1, max: 10, precision: 1, },
				radialSegments: { type: 'range', min: 1, max: 50, },
				heightSegments: { type: 'range', min: 1, max: 10, },
				openEnded: { type: 'bool', },
				thetaStart: { type: 'range', min: 0, max: 2, mult: Math.PI },
				thetaLength: { type: 'range', min: 0, max: 2, mult: Math.PI },
			},
			create( radiusTop = 4, radiusBottom = 4, height = 8, radialSegments = 12 ) {

				return new THREE.CylinderGeometry(
					radiusTop, radiusBottom, height, radialSegments );

			},
			create2( radiusTop = 4, radiusBottom = 4, height = 8, radialSegments = 12, heightSegments = 2, openEnded = false, thetaStart = Math.PI * 0.25, thetaLength = Math.PI * 1.5 ) {

				return new THREE.CylinderGeometry(
					radiusTop, radiusBottom, height,
					radialSegments, heightSegments,
					openEnded,
					thetaStart, thetaLength );

			},
		},
		DodecahedronGeometry: {
			ui: {
				radius: { type: 'range', min: 1, max: 10, precision: 1, },
				detail: { type: 'range', min: 0, max: 5, precision: 0, },
			},
			create( radius = 7 ) {

				return new THREE.DodecahedronGeometry( radius );

			},
			create2( radius = 7, detail = 2 ) {

				return new THREE.DodecahedronGeometry( radius, detail );

			},
		},
		ExtrudeGeometry: {
			ui: {
				steps: { type: 'range', min: 1, max: 100, },
				depth: { type: 'range', min: 1, max: 20, precision: 1, },
				bevelEnabled: { type: 'bool', },
				bevelThickness: { type: 'range', min: 0.1, max: 3, },
				bevelSize: { type: 'range', min: 0.1, max: 3, },
				bevelSegments: { type: 'range', min: 0, max: 8, },
			},
			addConstCode: false,
			create( steps = 2, depth = 2, bevelEnabled = true, bevelThickness = 1, bevelSize = 1, bevelSegments = 2 ) {

				const shape = new THREE.Shape();
				const x = - 2.5;
				const y = - 5;
				shape.moveTo( x + 2.5, y + 2.5 );
				shape.bezierCurveTo( x + 2.5, y + 2.5, x + 2, y, x, y );
				shape.bezierCurveTo( x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5 );
				shape.bezierCurveTo( x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5 );
				shape.bezierCurveTo( x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5 );
				shape.bezierCurveTo( x + 8, y + 3.5, x + 8, y, x + 5, y );
				shape.bezierCurveTo( x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5 );

				const extrudeSettings = {
					steps,
					depth,
					bevelEnabled,
					bevelThickness,
					bevelSize,
					bevelSegments,
				};

				const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
				return geometry;

			},
			src: `
const shape = new THREE.Shape();
const x = -2.5;
const y = -5;
shape.moveTo(x + 2.5, y + 2.5);
shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

const extrudeSettings = {
  steps: 2,  // ui: steps
  depth: 2,  // ui: depth
  bevelEnabled: true,  // ui: bevelEnabled
  bevelThickness: 1,  // ui: bevelThickness
  bevelSize: 1,  // ui: bevelSize
  bevelSegments: 2,  // ui: bevelSegments
};

const geometry = THREE.ExtrudeGeometry(shape, extrudeSettings);
`,
			create2( steps = 100 ) {

				const outline = new THREE.Shape( [
					[ - 2, - 0.1 ], [ 2, - 0.1 ], [ 2, 0.6 ],
					[ 1.6, 0.6 ], [ 1.6, 0.1 ], [ - 2, 0.1 ],
				].map( p => new THREE.Vector2( ...p ) ) );

				const x = - 2.5;
				const y = - 5;
				const shape = new THREE.CurvePath();
				const points = [
					[ x + 2.5, y + 2.5 ],
					[ x + 2.5, y + 2.5 ], [ x + 2, y ], [ x, y ],
					[ x - 3, y ], [ x - 3, y + 3.5 ], [ x - 3, y + 3.5 ],
					[ x - 3, y + 5.5 ], [ x - 1.5, y + 7.7 ], [ x + 2.5, y + 9.5 ],
					[ x + 6, y + 7.7 ], [ x + 8, y + 4.5 ], [ x + 8, y + 3.5 ],
					[ x + 8, y + 3.5 ], [ x + 8, y ], [ x + 5, y ],
					[ x + 3.5, y ], [ x + 2.5, y + 2.5 ], [ x + 2.5, y + 2.5 ],
				].map( p => new THREE.Vector3( ...p, 0 ) );
				for ( let i = 0; i < points.length; i += 3 ) {

					shape.add( new THREE.CubicBezierCurve3( ...points.slice( i, i + 4 ) ) );

				}

				const extrudeSettings = {
					steps,
					bevelEnabled: false,
					extrudePath: shape,
				};

				const geometry = new THREE.ExtrudeGeometry( outline, extrudeSettings );
				return geometry;

			},
			src2: `
const outline = new THREE.Shape([
  [ -2, -0.1], [  2, -0.1], [ 2,  0.6],
  [1.6,  0.6], [1.6,  0.1], [-2,  0.1],
].map(p => new THREE.Vector2(...p)));

const x = -2.5;
const y = -5;
const shape = new THREE.CurvePath();
const points = [
  [x + 2.5, y + 2.5],
  [x + 2.5, y + 2.5], [x + 2,   y      ], [x,       y      ],
  [x - 3,   y      ], [x - 3,   y + 3.5], [x - 3,   y + 3.5],
  [x - 3,   y + 5.5], [x - 1.5, y + 7.7], [x + 2.5, y + 9.5],
  [x + 6,   y + 7.7], [x + 8,   y + 4.5], [x + 8,   y + 3.5],
  [x + 8,   y + 3.5], [x + 8,   y      ], [x + 5,   y      ],
  [x + 3.5, y      ], [x + 2.5, y + 2.5], [x + 2.5, y + 2.5],
].map(p => new THREE.Vector3(...p, 0));
for (let i = 0; i < points.length; i += 3) {
  shape.add(new THREE.CubicBezierCurve3(...points.slice(i, i + 4)));
}

const extrudeSettings = {
  steps: 100,  // ui: steps
  bevelEnabled: false,
  extrudePath: shape,
};

const geometry =  new THREE.ExtrudeGeometry(outline, extrudeSettings);
return geometry;
      `,
		},
		IcosahedronGeometry: {
			ui: {
				radius: { type: 'range', min: 1, max: 10, precision: 1, },
				detail: { type: 'range', min: 0, max: 5, precision: 0, },
			},
			create( radius = 7 ) {

				return new THREE.IcosahedronGeometry( radius );

			},
			create2( radius = 7, detail = 2 ) {

				return new THREE.IcosahedronGeometry( radius, detail );

			},
		},
		LatheGeometry: {
			ui: {
				segments: { type: 'range', min: 1, max: 50, },
				phiStart: { type: 'range', min: 0, max: 2, mult: Math.PI },
				phiLength: { type: 'range', min: 0, max: 2, mult: Math.PI },
			},
			create() {

				const points = [];
				for ( let i = 0; i < 10; ++ i ) {

					points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 3 + 3, ( i - 5 ) * .8 ) );

				}

				return new THREE.LatheGeometry( points );

			},
			create2( segments = 12, phiStart = Math.PI * 0.25, phiLength = Math.PI * 1.5 ) {

				const points = [];
				for ( let i = 0; i < 10; ++ i ) {

					points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 3 + 3, ( i - 5 ) * .8 ) );

				}

				return new THREE.LatheGeometry(
					points, segments, phiStart, phiLength );

			},
		},
		OctahedronGeometry: {
			ui: {
				radius: { type: 'range', min: 1, max: 10, precision: 1, },
				detail: { type: 'range', min: 0, max: 5, precision: 0, },
			},
			create( radius = 7 ) {

				return new THREE.OctahedronGeometry( radius );

			},
			create2( radius = 7, detail = 2 ) {

				return new THREE.OctahedronGeometry( radius, detail );

			},
		},
		ParametricGeometry: {
			ui: {
				stacks: { type: 'range', min: 1, max: 50, },
				slices: { type: 'range', min: 1, max: 50, },
			},
			/*
      from: https://github.com/mrdoob/three.js/blob/b8d8a8625465bd634aa68e5846354d69f34d2ff5/examples/js/ParametricGeometries.js

      The MIT License

      Copyright © 2010-2018 three.js authors

      Permission is hereby granted, free of charge, to any person obtaining a copy
      of this software and associated documentation files (the "Software"), to deal
      in the Software without restriction, including without limitation the rights
      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
      copies of the Software, and to permit persons to whom the Software is
      furnished to do so, subject to the following conditions:

      The above copyright notice and this permission notice shall be included in
      all copies or substantial portions of the Software.

      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
      THE SOFTWARE.

      */
			create( slices = 25, stacks = 25 ) {

				// from: https://github.com/mrdoob/three.js/blob/b8d8a8625465bd634aa68e5846354d69f34d2ff5/examples/js/ParametricGeometries.js
				function klein( v, u, target ) {

					u *= Math.PI;
					v *= 2 * Math.PI;
					u = u * 2;

					let x;
					let z;

					if ( u < Math.PI ) {

						x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( u ) * Math.cos( v );
						z = - 8 * Math.sin( u ) - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( u ) * Math.cos( v );

					} else {

						x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( v + Math.PI );
						z = - 8 * Math.sin( u );

					}

					const y = - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( v );

					target.set( x, y, z ).multiplyScalar( 0.75 );

				}

				return new ParametricGeometry(
					klein, slices, stacks );

			},
		},
		PlaneGeometry: {
			ui: {
				width: { type: 'range', min: 1, max: 10, precision: 1, },
				height: { type: 'range', min: 1, max: 10, precision: 1, },
				widthSegments: { type: 'range', min: 1, max: 10, },
				heightSegments: { type: 'range', min: 1, max: 10, },
			},
			create( width = 9, height = 9 ) {

				return new THREE.PlaneGeometry( width, height );

			},
			create2( width = 9, height = 9, widthSegments = 2, heightSegments = 2 ) {

				return new THREE.PlaneGeometry(
					width, height,
					widthSegments, heightSegments );

			},
		},
		PolyhedronGeometry: {
			ui: {
				radius: { type: 'range', min: 1, max: 10, precision: 1, },
				detail: { type: 'range', min: 0, max: 5, precision: 0, },
			},
			create( radius = 7, detail = 2 ) {

				const verticesOfCube = [
					- 1, - 1, - 1, 1, - 1, - 1, 1, 1, - 1, - 1, 1, - 1,
					- 1, - 1, 1, 1, - 1, 1, 1, 1, 1, - 1, 1, 1,
				];
				const indicesOfFaces = [
					2, 1, 0, 0, 3, 2,
					0, 4, 7, 7, 3, 0,
					0, 1, 5, 5, 4, 0,
					1, 2, 6, 6, 5, 1,
					2, 3, 7, 7, 6, 2,
					4, 5, 6, 6, 7, 4,
				];
				return new THREE.PolyhedronGeometry(
					verticesOfCube, indicesOfFaces, radius, detail );

			},
		},
		RingGeometry: {
			ui: {
				innerRadius: { type: 'range', min: 1, max: 10, precision: 1, },
				outerRadius: { type: 'range', min: 1, max: 10, precision: 1, },
				thetaSegments: { type: 'range', min: 1, max: 30, },
				phiSegments: { type: 'range', min: 1, max: 10, },
				thetaStart: { type: 'range', min: 0, max: 2, mult: Math.PI },
				thetaLength: { type: 'range', min: 0, max: 2, mult: Math.PI },
			},
			create( innerRadius = 2, outerRadius = 7, thetaSegments = 18 ) {

				return new THREE.RingGeometry(
					innerRadius, outerRadius, thetaSegments );

			},
			create2( innerRadius = 2, outerRadius = 7, thetaSegments = 18, phiSegments = 2, thetaStart = Math.PI * 0.25, thetaLength = Math.PI * 1.5 ) {

				return new THREE.RingGeometry(
					innerRadius, outerRadius,
					thetaSegments, phiSegments,
					thetaStart, thetaLength );

			},
		},
		ShapeGeometry: {
			ui: {
				curveSegments: { type: 'range', min: 1, max: 30, },
			},
			create() {

				const shape = new THREE.Shape();
				const x = - 2.5;
				const y = - 5;
				shape.moveTo( x + 2.5, y + 2.5 );
				shape.bezierCurveTo( x + 2.5, y + 2.5, x + 2, y, x, y );
				shape.bezierCurveTo( x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5 );
				shape.bezierCurveTo( x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5 );
				shape.bezierCurveTo( x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5 );
				shape.bezierCurveTo( x + 8, y + 3.5, x + 8, y, x + 5, y );
				shape.bezierCurveTo( x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5 );
				return new THREE.ShapeGeometry( shape );

			},
			create2( curveSegments = 5 ) {

				const shape = new THREE.Shape();
				const x = - 2.5;
				const y = - 5;
				shape.moveTo( x + 2.5, y + 2.5 );
				shape.bezierCurveTo( x + 2.5, y + 2.5, x + 2, y, x, y );
				shape.bezierCurveTo( x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5 );
				shape.bezierCurveTo( x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5 );
				shape.bezierCurveTo( x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5 );
				shape.bezierCurveTo( x + 8, y + 3.5, x + 8, y, x + 5, y );
				shape.bezierCurveTo( x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5 );
				return new THREE.ShapeGeometry( shape, curveSegments );

			},
		},
		SphereGeometry: {
			ui: {
				radius: { type: 'range', min: 1, max: 10, precision: 1, },
				widthSegments: { type: 'range', min: 1, max: 30, },
				heightSegments: { type: 'range', min: 1, max: 30, },
				phiStart: { type: 'range', min: 0, max: 2, mult: Math.PI },
				phiLength: { type: 'range', min: 0, max: 2, mult: Math.PI },
				thetaStart: { type: 'range', min: 0, max: 1, mult: Math.PI },
				thetaLength: { type: 'range', min: 0, max: 1, mult: Math.PI },
			},
			create( radius = 7, widthSegments = 12, heightSegments = 8 ) {

				return new THREE.SphereGeometry( radius, widthSegments, heightSegments );

			},
			create2( radius = 7, widthSegments = 12, heightSegments = 8, phiStart = Math.PI * 0.25, phiLength = Math.PI * 1.5, thetaStart = Math.PI * 0.25, thetaLength = Math.PI * 0.5 ) {

				return new THREE.SphereGeometry(
					radius,
					widthSegments, heightSegments,
					phiStart, phiLength,
					thetaStart, thetaLength );

			},
		},
		TetrahedronGeometry: {
			ui: {
				radius: { type: 'range', min: 1, max: 10, precision: 1, },
				detail: { type: 'range', min: 0, max: 5, precision: 0, },
			},
			create( radius = 7 ) {

				return new THREE.TetrahedronGeometry( radius );

			},
			create2( radius = 7, detail = 2 ) {

				return new THREE.TetrahedronGeometry( radius, detail );

			},
		},
		TextGeometry: {
			ui: {
				text: { type: 'text', maxLength: 30, },
				size: { type: 'range', min: 1, max: 10, precision: 1, },
				height: { type: 'range', min: 1, max: 10, precision: 1, },
				curveSegments: { type: 'range', min: 1, max: 20, },
				// font', fonts ).onChange( generateGeometry );
				// weight', weights ).onChange( generateGeometry );
				bevelEnabled: { type: 'bool', },
				bevelThickness: { type: 'range', min: 0.1, max: 3, },
				bevelSize: { type: 'range', min: 0.1, max: 3, },
				bevelSegments: { type: 'range', min: 0, max: 8, },
			},
			addConstCode: false,
			create( text = 'three.js', size = 3, height = 0.2, curveSegments = 12, bevelEnabled = true, bevelThickness = 0.15, bevelSize = 0.3, bevelSegments = 5 ) {

				return new Promise( ( resolve ) => {

					fontPromise.then( ( font ) => {

						resolve( new TextGeometry( text, {
							font: font,
							size,
							height,
							curveSegments,
							bevelEnabled,
							bevelThickness,
							bevelSize,
							bevelSegments,
						} ) );

					} );

				} );

			},
			src: `
const loader = new THREE.FontLoader();

loader.load('../resources/threejs/fonts/helvetiker_regular.typeface.json', (font) => {
  const text = 'three.js';  // ui: text
  const geometry = new THREE.TextGeometry(text, {
    font: font,
    size: 3,  // ui: size
    height: 0.2,  // ui: height
    curveSegments: 12,  // ui: curveSegments
    bevelEnabled: true,  // ui: bevelEnabled
    bevelThickness: 0.15,  // ui: bevelThickness
    bevelSize: 0.3,  // ui: bevelSize
    bevelSegments: 5,  // ui: bevelSegments
  });
  ...
});
      `,
		},
		TorusGeometry: {
			ui: {
				radius: { type: 'range', min: 1, max: 10, precision: 1, },
				tubeRadius: { type: 'range', min: 1, max: 10, precision: 1, },
				radialSegments: { type: 'range', min: 1, max: 30, },
				tubularSegments: { type: 'range', min: 1, max: 100, },
			},
			create( radius = 5, tubeRadius = 2, radialSegments = 8, tubularSegments = 24 ) {

				return new THREE.TorusGeometry(
					radius, tubeRadius,
					radialSegments, tubularSegments );

			},
		},
		TorusKnotGeometry: {
			ui: {
				radius: { type: 'range', min: 1, max: 10, precision: 1, },
				tubeRadius: { type: 'range', min: 1, max: 10, precision: 1, },
				radialSegments: { type: 'range', min: 1, max: 30, },
				tubularSegments: { type: 'range', min: 1, max: 100, },
				p: { type: 'range', min: 1, max: 20, },
				q: { type: 'range', min: 1, max: 20, },
			},
			create( radius = 3.5, tubeRadius = 1.5, radialSegments = 8, tubularSegments = 64, p = 2, q = 3 ) {

				return new THREE.TorusKnotGeometry(
					radius, tubeRadius, tubularSegments, radialSegments, p, q );

			},
		},
		TubeGeometry: {
			ui: {
				tubularSegments: { type: 'range', min: 1, max: 100, },
				radius: { type: 'range', min: 1, max: 10, precision: 1, },
				radialSegments: { type: 'range', min: 1, max: 30, },
				closed: { type: 'bool', },
			},
			create( tubularSegments = 20, radius = 1, radialSegments = 8, closed = false ) {

				class CustomSinCurve extends THREE.Curve {

					constructor( scale ) {

						super();
						this.scale = scale;

					}
					getPoint( t ) {

						const tx = t * 3 - 1.5;
						const ty = Math.sin( 2 * Math.PI * t );
						const tz = 0;
						return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );

					}

				}

				const path = new CustomSinCurve( 4 );
				return new THREE.TubeGeometry(
					path, tubularSegments, radius, radialSegments, closed );

			},
		},
		EdgesGeometry: {
			ui: {
				thresholdAngle: { type: 'range', min: 1, max: 180, },
			},
			create() {

				return {
					lineGeometry: new THREE.EdgesGeometry(
						new THREE.BoxGeometry( 8, 8, 8 ) ),
				};

			},
			create2( thresholdAngle = 1 ) {

				return {
					lineGeometry: new THREE.EdgesGeometry(
						new THREE.SphereGeometry( 7, 6, 3 ), thresholdAngle ),
				};

			},
			addConstCode: false,
			src: `
const size = 8;
const widthSegments = 2;
const heightSegments = 2;
const depthSegments = 2;
const boxGeometry = new THREE.BoxGeometry(
    size, size, size,
    widthSegments, heightSegments, depthSegments);
const geometry = new THREE.EdgesGeometry(boxGeometry);
`,
			src2: `
const radius = 7;
const widthSegments = 6;
const heightSegments = 3;
const sphereGeometry = new THREE.SphereGeometry(
    radius, widthSegments, heightSegments);
const thresholdAngle = 1;  // ui: thresholdAngle
const geometry = new THREE.EdgesGeometry(sphereGeometry, thresholdAngle);
`,
		},
		WireframeGeometry: {
			ui: {
				widthSegments: { type: 'range', min: 1, max: 10, },
				heightSegments: { type: 'range', min: 1, max: 10, },
				depthSegments: { type: 'range', min: 1, max: 10, },
			},
			create( widthSegments = 2, heightSegments = 2, depthSegments = 2 ) {

				const size = 8;
				return {
					lineGeometry: new THREE.WireframeGeometry( new THREE.BoxGeometry(
						size, size, size,
						widthSegments, heightSegments, depthSegments ) ),
				};

			},
			addConstCode: false,
			src: `
const size = 8;
const widthSegments = 2;  // ui: widthSegments
const heightSegments = 2;  // ui: heightSegments
const depthSegments = 2;  // ui: depthSegments
const geometry = new THREE.WireframeGeometry(
    new THREE.BoxGeometry(
      size, size, size,
      widthSegments, heightSegments, depthSegments));
`,
		},
		Points: {
			create() {

				const radius = 7;
				const widthSegments = 12;
				const heightSegments = 8;
				const geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
				const material = new THREE.PointsMaterial( {
					color: 'red',
					size: 0.2,
				} );
				const points = new THREE.Points( geometry, material );
				return {
					showLines: false,
					mesh: points,
				};

			},
		},
		PointsUniformSize: {
			create() {

				const radius = 7;
				const widthSegments = 12;
				const heightSegments = 8;
				const geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
				const material = new THREE.PointsMaterial( {
					color: 'red',
					size: 3 * window.devicePixelRatio,
					sizeAttenuation: false,
				} );
				const points = new THREE.Points( geometry, material );
				return {
					showLines: false,
					mesh: points,
				};

			},
		},
		SphereGeometryLow: {
			create( radius = 7, widthSegments = 5, heightSegments = 3 ) {

				return new THREE.SphereGeometry( radius, widthSegments, heightSegments );

			},
		},
		SphereGeometryMedium: {
			create( radius = 7, widthSegments = 24, heightSegments = 10 ) {

				return new THREE.SphereGeometry( radius, widthSegments, heightSegments );

			},
		},
		SphereGeometryHigh: {
			create( radius = 7, widthSegments = 50, heightSegments = 50 ) {

				return new THREE.SphereGeometry( radius, widthSegments, heightSegments );

			},
		},
		SphereGeometryLowSmooth: {
			create( radius = 7, widthSegments = 5, heightSegments = 3 ) {

				return new THREE.SphereGeometry( radius, widthSegments, heightSegments );

			},
			showLines: false,
			flatShading: false,
		},
		SphereGeometryMediumSmooth: {
			create( radius = 7, widthSegments = 24, heightSegments = 10 ) {

				return new THREE.SphereGeometry( radius, widthSegments, heightSegments );

			},
			showLines: false,
			flatShading: false,
		},
		SphereGeometryHighSmooth: {
			create( radius = 7, widthSegments = 50, heightSegments = 50 ) {

				return new THREE.SphereGeometry( radius, widthSegments, heightSegments );

			},
			showLines: false,
			flatShading: false,
		},
		PlaneGeometryLow: {
			create( width = 9, height = 9, widthSegments = 1, heightSegments = 1 ) {

				return new THREE.PlaneGeometry( width, height, widthSegments, heightSegments );

			},
		},
		PlaneGeometryHigh: {
			create( width = 9, height = 9, widthSegments = 10, heightSegments = 10 ) {

				return new THREE.PlaneGeometry( width, height, widthSegments, heightSegments );

			},
		},
	};

	function addLink( parent, name, href ) {

		const a = document.createElement( 'a' );
		a.setAttribute( 'target', '_blank' );
		a.href = href || `https://threejs.org/docs/#api/geometries/${name}`;
		const code = document.createElement( 'code' );
		code.textContent = name;
		a.appendChild( code );
		parent.appendChild( a );
		return a;

	}

	function addDeepLink( parent, name, href ) {

		const a = document.createElement( 'a' );
		a.href = href || `https://threejs.org/docs/#api/geometries/${name}`;
		a.textContent = name;
		a.className = 'deep-link';
		parent.appendChild( a );
		return a;

	}

	function addElem( parent, type, className, text ) {

		const elem = document.createElement( type );
		elem.className = className;
		if ( text ) {

			elem.textContent = text;

		}

		parent.appendChild( elem );
		return elem;

	}

	function addDiv( parent, className ) {

		return addElem( parent, 'div', className );

	}

	function createPrimitiveDOM( base ) {

		const name = base.dataset.primitive;
		const info = diagrams[ name ];
		if ( ! info ) {

			throw new Error( `no primitive ${name}` );

		}

		const text = base.innerHTML;
		base.innerHTML = '';

		const pair = addDiv( base, 'pair' );
		const elem = addDiv( pair, 'shape' );

		const right = addDiv( pair, 'desc' );
		addDeepLink( right, '#', `#${base.id}` );
		addLink( right, name );
		addDiv( right, '.note' ).innerHTML = text;

		// I get that this is super brittle. I think I'd have to
		// work through a bunch more examples to come up with a better
		// structure. Also, I don't want to generate actual code and
		// use eval. (maybe a bad striction)

		function makeExample( elem, createFn, src ) {

			const rawLines = createFn.toString().replace( /return (new THREE\.[a-zA-Z]+Geometry)/, 'const geometry = $1' ).split( /\n/ );
			const createRE = /^ *(?:function *)*create\d*\((.*?)\)/;
			const indentRE = /^( *)[^ ]/;
			const m = indentRE.exec( rawLines[ 1 ] );
			const prefixLen = m[ 1 ].length;
			const m2 = createRE.exec( rawLines[ 0 ] );
			const argString = m2[ 1 ].trim();
			const trimmedLines = src
				? src.split( '\n' ).slice( 1, - 1 )
				: rawLines.slice( 1, rawLines.length - 1 ).map( line => line.substring( prefixLen ) );
			if ( info.addConstCode !== false && argString ) {

				const lines = argString.split( ',' ).map( ( arg ) => {

					return `const ${arg.trim()};  // ui: ${arg.trim().split( ' ' )[ 0 ]}`;

				} );
				const lineNdx = trimmedLines.findIndex( l => l.indexOf( 'const geometry' ) >= 0 );
				trimmedLines.splice( lineNdx < 0 ? 0 : lineNdx, 0, ...lines );

			}

			addElem( base, 'pre', 'prettyprint showmods', trimmedLines.join( '\n' ) );

			createLiveImage( elem, { ...info, create: createFn }, name );

		}

		makeExample( elem, info.create, info.src );

		{

			let i = 2;
			for ( ;; ) {

				const createFn = info[ `create${i}` ];
				if ( ! createFn ) {

					break;

				}

				const shapeElem = addDiv( base, 'shape' );
				makeExample( shapeElem, createFn, info[ `src${i}` ] );
				++ i;

			}

		}

	}

	function createDiagram( base ) {

		const name = base.dataset.diagram;
		const info = diagrams[ name ];
		if ( ! info ) {

			throw new Error( `no primitive ${name}` );

		}

		createLiveImage( base, info, name );

	}

	async function addGeometry( root, info, args = [] ) {

		const result = info.create( ...args );
		const promise = ( result instanceof Promise ) ? result : Promise.resolve( result );

		let diagramInfo = await promise;
		if ( diagramInfo instanceof THREE.BufferGeometry ) {

			const geometry = diagramInfo;
			diagramInfo = {
				geometry,
			};

		}

		const geometry = diagramInfo.geometry || diagramInfo.lineGeometry || diagramInfo.mesh.geometry;
		geometry.computeBoundingBox();
		const centerOffset = new THREE.Vector3();
		geometry.boundingBox.getCenter( centerOffset ).multiplyScalar( - 1 );

		let mesh = diagramInfo.mesh;
		if ( diagramInfo.geometry ) {

			if ( ! info.material ) {

				const material = new THREE.MeshPhongMaterial( {
					flatShading: info.flatShading === false ? false : true,
					side: THREE.DoubleSide,
				} );
				material.color.setHSL( Math.random(), .5, .5 );
				info.material = material;

			}

			mesh = new THREE.Mesh( diagramInfo.geometry, info.material );

		}

		if ( mesh ) {

			mesh.position.copy( centerOffset );
			root.add( mesh );

		}

		if ( info.showLines !== false ) {

			const lineMesh = new THREE.LineSegments(
				diagramInfo.lineGeometry || diagramInfo.geometry,
				new THREE.LineBasicMaterial( {
					color: diagramInfo.geometry ? 0xffffff : colors.lines,
					transparent: true,
					opacity: 0.5,
				} ) );
			lineMesh.position.copy( centerOffset );
			root.add( lineMesh );

		}

	}

	async function updateGeometry( root, info, params ) {

		const oldChildren = root.children.slice();
		await addGeometry( root, info, Object.values( params ) );
		oldChildren.forEach( ( child ) => {

			root.remove( child );
			child.geometry.dispose();

		} );

	}

	const primitives = {};

	async function createLiveImage( elem, info, name ) {

		const root = new THREE.Object3D();

		primitives[ name ] = primitives[ name ] || [];
		primitives[ name ].push( {
			root,
			info,
		} );

		await addGeometry( root, info );
		threejsLessonUtils.addDiagram( elem, { create: () => root } );

	}

	function getValueElem( commentElem ) {

		return commentElem.previousElementSibling &&
           commentElem.previousElementSibling.previousElementSibling &&
           commentElem.previousElementSibling.previousElementSibling.previousElementSibling;

	}

	threejsLessonUtils.onAfterPrettify( () => {

		document.querySelectorAll( '[data-primitive]' ).forEach( ( base ) => {

			const primitiveName = base.dataset.primitive;
			const infos = primitives[ primitiveName ];
			base.querySelectorAll( 'pre.prettyprint' ).forEach( ( shape, ndx ) => {

				const { root, info } = infos[ ndx ];
				const params = {};
				[ ...shape.querySelectorAll( 'span.com' ) ]
					.filter( span => span.textContent.indexOf( '// ui:' ) >= 0 )
					.forEach( ( span ) => {

						const nameRE = /ui: ([a-zA-Z0-9_]+) *$/;
						const name = nameRE.exec( span.textContent )[ 1 ];
						span.textContent = '';
						if ( ! info.ui ) {

            console.error(`no ui for ${primitiveName}:${ndx}`);  // eslint-disable-line
							return;
							// throw new Error(`no ui for ${primitiveName}:${ndx}`);

						}

						const ui = info.ui[ name ];
						if ( ! ui ) {

							throw new Error( `no ui for ${primitiveName}:${ndx} param: ${name}` );

						}

						const valueElem = getValueElem( span );
						if ( ! valueElem ) {

            console.error(`no value element for ${primitiveName}:${ndx} param: ${name}`);  // eslint-disable-line
							return;

						}

						const inputHolderHolder = document.createElement( 'div' );
						inputHolderHolder.className = 'input';
						const inputHolder = document.createElement( 'div' );
						span.appendChild( inputHolderHolder );
						inputHolderHolder.appendChild( inputHolder );
						switch ( ui.type ) {

							case 'range': {

								const valueRange = ui.max - ui.min;
								const input = document.createElement( 'input' );
								const inputMax = 100;
								input.type = 'range';
								input.min = 0;
								input.max = inputMax;
								const value = parseFloat( valueElem.textContent );
								params[ name ] = value * ( ui.mult || 1 );
								input.value = ( value - ui.min ) / valueRange * inputMax;
								inputHolder.appendChild( input );
								const precision = ui.precision === undefined ? ( valueRange > 4 ? 0 : 2 ) : ui.precision;
								const padding = ui.max.toFixed( precision ).length;
								input.addEventListener( 'input', () => {

									let newValue = input.value * valueRange / inputMax + ui.min;
									if ( precision === 0 ) {

										newValue = Math.round( newValue );

									}

									params[ name ] = newValue * ( ui.mult || 1 );
									valueElem.textContent = newValue.toFixed( precision ).padStart( padding, ' ' );
									updateGeometry( root, info, params );

								} );
								break;

							}

							case 'bool': {

								const input = document.createElement( 'input' );
								input.type = 'checkbox';
								params[ name ] = valueElem.textContent === 'true';
								input.checked = params[ name ];
								inputHolder.appendChild( input );
								input.addEventListener( 'change', () => {

									params[ name ] = input.checked;
									valueElem.textContent = params[ name ] ? 'true' : 'false';
									updateGeometry( root, info, params );

								} );
								break;

							}

							case 'text': {

								const input = document.createElement( 'input' );
								input.type = 'text';
								params[ name ] = valueElem.textContent.slice( 1, - 1 );
								input.value = params[ name ];
								input.maxlength = ui.maxLength || 50;
								inputHolder.appendChild( input );
								input.addEventListener( 'input', () => {

									params[ name ] = input.value;
									valueElem.textContent = `'${input.value}'`;
									updateGeometry( root, info, params );

								} );
								break;

							}

							default:
								throw new Error( `unknown type for ${primitiveName}:${ndx} param: ${name}` );

						}

					} );

			} );

		} );

	} );

	document.querySelectorAll( '[data-diagram]' ).forEach( createDiagram );
	document.querySelectorAll( '[data-primitive]' ).forEach( createPrimitiveDOM );

}
