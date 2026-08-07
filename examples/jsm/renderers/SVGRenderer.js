import {
	Camera,
	Object3D,
	SRGBColorSpace,
	box2Create,
	box2IntersectsBox,
	box2MakeEmpty,
	box2SetFromPoints,
	colorAdd,
	colorAddScalar,
	colorCopy,
	colorCreate,
	colorGetStyle,
	colorMultiply,
	colorMultiplyScalar,
	colorSet,
	mat3Create,
	mat3GetNormalMatrix,
	mat4Copy,
	mat4Create,
	mat4MultiplyMatrices,
	vec2Set,
	vec3Add,
	vec3ApplyMatrix3,
	vec3ApplyMatrix4,
	vec3Copy,
	vec3Create,
	vec3DistanceTo,
	vec3DivideScalar,
	vec3Dot,
	vec3Normalize,
	vec3SetFromMatrixPosition,
	vec3SubVectors
} from 'three';

import {
	Projector,
	RenderableFace,
	RenderableLine,
	RenderableSprite
} from './Projector.js';

/**
 * Can be used to wrap SVG elements into a 3D object.
 *
 * @augments Object3D
 * @three_import import { SVGObject } from 'three/addons/renderers/SVGRenderer.js';
 */
class SVGObject extends Object3D {

	/**
	 * Constructs a new SVG object.
	 *
	 * @param {SVGElement} node - The SVG element.
	 */
	constructor( node ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSVGObject = true;

		/**
		 * This SVG element.
		 *
		 * @type {SVGElement}
		 */
		this.node = node;

	}

}

/**
 * This renderer an be used to render geometric data using SVG. The produced vector
 * graphics are particular useful in the following use cases:
 *
 * - Animated logos or icons.
 * - Interactive 2D/3D diagrams or graphs.
 * - Interactive maps.
 * - Complex or animated user interfaces.
 *
 * `SVGRenderer` has various advantages. It produces crystal-clear and sharp output which
 * is independent of the actual viewport resolution.SVG elements can be styled via CSS.
 * And they have good accessibility since it's possible to add metadata like title or description
 * (useful for search engines or screen readers).
 *
 * There are, however, some important limitations:
 * - No advanced shading.
 * - No texture support.
 * - No shadow support.
 *
 * @three_import import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';
 */
class SVGRenderer {

	/**
	 * Constructs a new SVG renderer.
	 */
	constructor() {

		let _renderData, _elements, _lights,
			_svgWidth, _svgHeight, _svgWidthHalf, _svgHeightHalf,

			_v1, _v2, _v3,

			_svgNode,
			_pathCount = 0,
			_svgObjectCount = 0,
			_renderListCount = 0,

			_precision = null,
			_quality = 1,

			_currentPath, _currentStyle;

		const _this = this,
			_clipBox = box2Create(),
			_elemBox = box2Create(),

			_color = colorCreate(),
			_diffuseColor = colorCreate(),
			_ambientLight = colorCreate(),
			_directionalLights = colorCreate(),
			_pointLights = colorCreate(),
			_clearColor = colorCreate(),

			_vector3 = vec3Create(), // Needed for PointLight
			_centroid = vec3Create(),
			_normal = vec3Create(),
			_normalViewMatrix = mat3Create(),

			_viewMatrix = mat4Create(),
			_viewProjectionMatrix = mat4Create(),

			_svgPathPool = [],
			_svgObjectsPool = [],
			_renderListPool = [],

			_projector = new Projector(),
			_svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );

		/**
		 * The DOM where the renderer appends its child-elements.
		 *
		 * @type {SVGSVGElement}
		 */
		this.domElement = _svg;

		/**
		 * Whether to automatically perform a clear before a render call or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoClear = true;

		/**
		 * Whether to sort 3D objects or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.sortObjects = true;

		/**
		 * Whether to sort elements or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.sortElements = true;

		/**
		 * Number of fractional pixels to enlarge polygons in order to
		 * prevent anti-aliasing gaps. Range is `[0,1]`.
		 *
		 * @type {number}
		 * @default 0.5
		 */
		this.overdraw = 0.5;

		/**
		 * The output color space.
		 *
		 * @type {(SRGBColorSpace|LinearSRGBColorSpace)}
		 * @default SRGBColorSpace
		 */
		this.outputColorSpace = SRGBColorSpace;

		/**
		 * Provides information about the number of
		 * rendered vertices and faces.
		 *
		 * @type {Object}
		 */
		this.info = {

			render: {

				vertices: 0,
				faces: 0

			}

		};

		/**
		 * Sets the render quality. Setting to `high` makes the browser improve SVG quality
		 * over rendering speed and geometric precision.
		 *
		 * @param {('low'|'high')} quality - The quality.
		 */
		this.setQuality = function ( quality ) {

			switch ( quality ) {

				case 'high': _quality = 1; break;
				case 'low': _quality = 0; break;

			}

		};

		/**
		 * Sets the clear color.
		 *
		 * @param {(number|Color|string)} color - The clear color to set.
		 */
		this.setClearColor = function ( color ) {

			colorSet( color, undefined, undefined, _clearColor );

		};

		this.setPixelRatio = function () {};

		/**
		 * Resizes the renderer to the given width and height.
		 *
		 * @param {number} width - The width of the renderer.
		 * @param {number} height - The height of the renderer.
		 */
		this.setSize = function ( width, height ) {

			_svgWidth = width; _svgHeight = height;
			_svgWidthHalf = _svgWidth / 2; _svgHeightHalf = _svgHeight / 2;

			_svg.setAttribute( 'viewBox', ( - _svgWidthHalf ) + ' ' + ( - _svgHeightHalf ) + ' ' + _svgWidth + ' ' + _svgHeight );
			_svg.setAttribute( 'width', _svgWidth );
			_svg.setAttribute( 'height', _svgHeight );

			vec2Set( - _svgWidthHalf, - _svgHeightHalf, _clipBox.min );
			vec2Set( _svgWidthHalf, _svgHeightHalf, _clipBox.max );

		};

		/**
		 * Returns an object containing the width and height of the renderer.
		 *
		 * @return {{width:number,height:number}} The size of the renderer.
		 */
		this.getSize = function () {

			return {
				width: _svgWidth,
				height: _svgHeight
			};

		};

		/**
		 * Sets the precision of the data used to create a paths.
		 *
		 * @param {number} precision - The precision to set.
		 */
		this.setPrecision = function ( precision ) {

			_precision = precision;

		};

		function removeChildNodes() {

			_pathCount = 0;

			while ( _svg.childNodes.length > 0 ) {

				_svg.removeChild( _svg.childNodes[ 0 ] );

			}

		}

		function convert( c ) {

			return _precision !== null ? c.toFixed( _precision ) : c;

		}

		function renderSort( a, b ) {

			const aOrder = a.data.renderOrder !== undefined ? a.data.renderOrder : 0;
			const bOrder = b.data.renderOrder !== undefined ? b.data.renderOrder : 0;

			if ( aOrder !== bOrder ) {

				return aOrder - bOrder;

			} else {

				const aZ = a.data.z !== undefined ? a.data.z : 0;
				const bZ = b.data.z !== undefined ? b.data.z : 0;

				return bZ - aZ; // Painter's algorithm: far to near

			}

		}

		/**
		 * Performs a manual clear with the defined clear color.
		 */
		this.clear = function () {

			removeChildNodes();
			_svg.style.backgroundColor = colorGetStyle( _clearColor, _this.outputColorSpace );

		};

		/**
		 * Renders the given scene using the given camera.
		 *
		 * @param {Object3D} scene - A scene or any other type of 3D object.
		 * @param {Camera} camera - The camera.
		 */
		this.render = function ( scene, camera ) {

			if ( camera instanceof Camera === false ) {

				console.error( 'THREE.SVGRenderer.render: camera is not an instance of Camera.' );
				return;

			}

			const background = scene.background;

			if ( background && background.isColor ) {

				removeChildNodes();
				_svg.style.backgroundColor = colorGetStyle( background, _this.outputColorSpace );

			} else if ( this.autoClear === true ) {

				this.clear();

			}

			_this.info.render.vertices = 0;
			_this.info.render.faces = 0;

			mat4Copy( camera.matrixWorldInverse, _viewMatrix );
			mat4MultiplyMatrices( camera.projectionMatrix, _viewMatrix, _viewProjectionMatrix );

			_renderData = _projector.projectScene( scene, camera, this.sortObjects, this.sortElements );
			_elements = _renderData.elements;
			_lights = _renderData.lights;

			mat3GetNormalMatrix( camera.matrixWorldInverse, _normalViewMatrix );

			calculateLights( _lights );

			_renderListCount = 0;

			for ( let e = 0, el = _elements.length; e < el; e ++ ) {

				const element = _elements[ e ];
				const material = element.material;

				if ( material === undefined || material.opacity === 0 ) continue;

				getRenderItem( _renderListCount ++, 'element', element, material );

			}

			_svgObjectCount = 0;

			scene.traverseVisible( function ( object ) {

				if ( object.isSVGObject ) {

					vec3SetFromMatrixPosition( object.matrixWorld, _vector3 );
					vec3ApplyMatrix4( _vector3, _viewProjectionMatrix, _vector3 );

					if ( _vector3.z < - 1 || _vector3.z > 1 ) return;

					const x = _vector3.x * _svgWidthHalf;
					const y = - _vector3.y * _svgHeightHalf;

					const svgObject = getSVGObjectData( _svgObjectCount ++ );

					svgObject.node = object.node;
					svgObject.x = x;
					svgObject.y = y;
					svgObject.z = _vector3.z;
					svgObject.renderOrder = object.renderOrder;

					getRenderItem( _renderListCount ++, 'svgObject', svgObject, null );

				}

			} );

			_renderListPool.length = _renderListCount;

			if ( this.sortElements && _svgObjectCount > 0 ) {

				// Elements are already sorted by the Projector.
				// Only re-sort when SVGObjects need depth-interleaving.
				_renderListPool.sort( renderSort );

			}

			// Reset accumulated path
			_currentPath = '';
			_currentStyle = '';

			// Render in sorted order
			for ( let i = 0; i < _renderListCount; i ++ ) {

				const item = _renderListPool[ i ];

				if ( item.type === 'svgObject' ) {

					flushPath(); // Flush any accumulated paths before inserting SVG node

					const svgObject = item.data;
					const node = svgObject.node;
					node.setAttribute( 'transform', 'translate(' + svgObject.x + ',' + svgObject.y + ')' );
					_svg.appendChild( node );

				} else {

					const element = item.data;
					const material = item.material;

					box2MakeEmpty( _elemBox );

					if ( element instanceof RenderableSprite ) {

						_v1 = element;
						_v1.x *= _svgWidthHalf; _v1.y *= - _svgHeightHalf;

						renderSprite( _v1, element, material );

					} else if ( element instanceof RenderableLine ) {

						_v1 = element.v1; _v2 = element.v2;

						_v1.positionScreen.x *= _svgWidthHalf; _v1.positionScreen.y *= - _svgHeightHalf;
						_v2.positionScreen.x *= _svgWidthHalf; _v2.positionScreen.y *= - _svgHeightHalf;

						box2SetFromPoints( [ _v1.positionScreen, _v2.positionScreen ], _elemBox );

						if ( box2IntersectsBox( _clipBox, _elemBox ) === true ) {

							renderLine( _v1, _v2, material );

						}

					} else if ( element instanceof RenderableFace ) {

						_v1 = element.v1; _v2 = element.v2; _v3 = element.v3;

						_v1.positionScreen.x *= _svgWidthHalf; _v1.positionScreen.y *= - _svgHeightHalf;
						_v2.positionScreen.x *= _svgWidthHalf; _v2.positionScreen.y *= - _svgHeightHalf;
						_v3.positionScreen.x *= _svgWidthHalf; _v3.positionScreen.y *= - _svgHeightHalf;

						if ( this.overdraw > 0 ) {

							expand( _v1.positionScreen, _v2.positionScreen, this.overdraw );
							expand( _v2.positionScreen, _v3.positionScreen, this.overdraw );
							expand( _v3.positionScreen, _v1.positionScreen, this.overdraw );

						}

						box2SetFromPoints( [
							_v1.positionScreen,
							_v2.positionScreen,
							_v3.positionScreen
						], _elemBox );

						if ( box2IntersectsBox( _clipBox, _elemBox ) === true ) {

							renderFace3( _v1, _v2, _v3, element, material );

						}

					}

				}

			}

			flushPath(); // Flush any remaining paths

		};

		function calculateLights( lights ) {

			colorSet( 0, 0, 0, _ambientLight );
			colorSet( 0, 0, 0, _directionalLights );
			colorSet( 0, 0, 0, _pointLights );

			for ( let l = 0, ll = lights.length; l < ll; l ++ ) {

				const light = lights[ l ];
				const lightColor = light.color;

				if ( light.isAmbientLight ) {

					_ambientLight.r += lightColor.r;
					_ambientLight.g += lightColor.g;
					_ambientLight.b += lightColor.b;

				} else if ( light.isDirectionalLight ) {

					_directionalLights.r += lightColor.r;
					_directionalLights.g += lightColor.g;
					_directionalLights.b += lightColor.b;

				} else if ( light.isPointLight ) {

					_pointLights.r += lightColor.r;
					_pointLights.g += lightColor.g;
					_pointLights.b += lightColor.b;

				}

			}

		}

		function calculateLight( lights, position, normal, color ) {

			for ( let l = 0, ll = lights.length; l < ll; l ++ ) {

				const light = lights[ l ];
				const lightColor = light.color;

				if ( light.isDirectionalLight ) {

					const lightPosition = vec3Normalize( vec3SetFromMatrixPosition( light.matrixWorld, _vector3 ), _vector3 );

					let amount = vec3Dot( normal, lightPosition );

					if ( amount <= 0 ) continue;

					amount *= light.intensity;

					color.r += lightColor.r * amount;
					color.g += lightColor.g * amount;
					color.b += lightColor.b * amount;

				} else if ( light.isPointLight ) {

					const lightPosition = vec3SetFromMatrixPosition( light.matrixWorld, _vector3 );

					let amount = vec3Dot( normal, vec3Normalize( vec3SubVectors( lightPosition, position, _vector3 ), _vector3 ) );

					if ( amount <= 0 ) continue;

					amount *= light.distance == 0 ? 1 : 1 - Math.min( vec3DistanceTo( position, lightPosition ) / light.distance, 1 );

					if ( amount == 0 ) continue;

					amount *= light.intensity;

					color.r += lightColor.r * amount;
					color.g += lightColor.g * amount;
					color.b += lightColor.b * amount;

				}

			}

		}

		function renderSprite( v1, element, material ) {

			let scaleX = element.scale.x * _svgWidthHalf;
			let scaleY = element.scale.y * _svgHeightHalf;

			if ( material.isPointsMaterial ) {

				scaleX *= material.size;
				scaleY *= material.size;

			}

			const path = 'M' + convert( v1.x - scaleX * 0.5 ) + ',' + convert( v1.y - scaleY * 0.5 ) + 'h' + convert( scaleX ) + 'v' + convert( scaleY ) + 'h' + convert( - scaleX ) + 'z';
			let style = '';

			if ( material.isSpriteMaterial || material.isPointsMaterial ) {

				style = 'fill:' + colorGetStyle( material.color, _this.outputColorSpace ) + ';fill-opacity:' + material.opacity;

			}

			addPath( style, path );

		}

		function renderLine( v1, v2, material ) {

			const path = 'M' + convert( v1.positionScreen.x ) + ',' + convert( v1.positionScreen.y ) + 'L' + convert( v2.positionScreen.x ) + ',' + convert( v2.positionScreen.y );

			if ( material.isLineBasicMaterial ) {

				let style = 'fill:none;stroke:' + colorGetStyle( material.color, _this.outputColorSpace ) + ';stroke-opacity:' + material.opacity + ';stroke-width:' + material.linewidth + ';stroke-linecap:' + material.linecap;

				if ( material.isLineDashedMaterial ) {

					style = style + ';stroke-dasharray:' + material.dashSize + ',' + material.gapSize;

				}

				addPath( style, path );

			}

		}

		function renderFace3( v1, v2, v3, element, material ) {

			_this.info.render.vertices += 3;
			_this.info.render.faces ++;

			const path = 'M' + convert( v1.positionScreen.x ) + ',' + convert( v1.positionScreen.y ) + 'L' + convert( v2.positionScreen.x ) + ',' + convert( v2.positionScreen.y ) + 'L' + convert( v3.positionScreen.x ) + ',' + convert( v3.positionScreen.y ) + 'z';
			let style = '';

			if ( material.isMeshBasicMaterial ) {

				colorCopy( material.color, _color );

				if ( material.vertexColors ) {

					colorMultiply( _color, element.color, _color );

				}

			} else if ( material.isMeshLambertMaterial || material.isMeshPhongMaterial || material.isMeshStandardMaterial ) {

				colorCopy( material.color, _diffuseColor );

				if ( material.vertexColors ) {

					colorMultiply( _diffuseColor, element.color, _diffuseColor );

				}

				colorCopy( _ambientLight, _color );

				vec3Copy( v1.positionWorld, _centroid );
				vec3Add( _centroid, v2.positionWorld, _centroid );
				vec3Add( _centroid, v3.positionWorld, _centroid );
				vec3DivideScalar( _centroid, 3, _centroid );

				calculateLight( _lights, _centroid, element.normalModel, _color );

				colorAdd( colorMultiply( _color, _diffuseColor, _color ), material.emissive, _color );

			} else if ( material.isMeshNormalMaterial ) {

				vec3Copy( element.normalModel, _normal );
				vec3ApplyMatrix3( _normal, _normalViewMatrix, _normal );
				vec3Normalize( _normal, _normal );

				colorSet( _normal.x, _normal.y, _normal.z, _color );
				colorMultiplyScalar( _color, 0.5, _color );
				colorAddScalar( _color, 0.5, _color );

			}

			if ( material.wireframe ) {

				style = 'fill:none;stroke:' + colorGetStyle( _color, _this.outputColorSpace ) + ';stroke-opacity:' + material.opacity + ';stroke-width:' + material.wireframeLinewidth + ';stroke-linecap:' + material.wireframeLinecap + ';stroke-linejoin:' + material.wireframeLinejoin;

			} else {

				style = 'fill:' + colorGetStyle( _color, _this.outputColorSpace ) + ';fill-opacity:' + material.opacity;

			}

			addPath( style, path );

		}

		// Hide anti-alias gaps

		function expand( v1, v2, pixels ) {

			let x = v2.x - v1.x, y = v2.y - v1.y;
			const det = x * x + y * y;

			if ( det === 0 ) return;

			const idet = pixels / Math.sqrt( det );

			x *= idet; y *= idet;

			v2.x += x; v2.y += y;
			v1.x -= x; v1.y -= y;

		}

		function addPath( style, path ) {

			if ( _currentStyle === style ) {

				_currentPath += path;

			} else {

				flushPath();

				_currentStyle = style;
				_currentPath = path;

			}

		}

		function flushPath() {

			if ( _currentPath ) {

				_svgNode = getPathNode( _pathCount ++ );
				_svgNode.setAttribute( 'd', _currentPath );
				_svgNode.setAttribute( 'style', _currentStyle );
				_svg.appendChild( _svgNode );

			}

			_currentPath = '';
			_currentStyle = '';

		}

		function getPathNode( id ) {

			let path = _svgPathPool[ id ];

			if ( path === undefined ) {

				path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );

				if ( _quality == 0 ) {

					path.setAttribute( 'shape-rendering', 'crispEdges' ); //optimizeSpeed

				}

				_svgPathPool[ id ] = path;

			}

			return path;

		}

		function getSVGObjectData( id ) {

			let svgObject = _svgObjectsPool[ id ];

			if ( svgObject === undefined ) {

				svgObject = {
					node: null,
					x: 0,
					y: 0,
					z: 0,
					renderOrder: 0
				};

				_svgObjectsPool[ id ] = svgObject;

			}

			return svgObject;

		}

		function getRenderItem( id, type, data, material ) {

			let item = _renderListPool[ id ];

			if ( item === undefined ) {

				item = {
					type: type,
					data: data,
					material: material
				};

				_renderListPool[ id ] = item;

				return item;

			}

			item.type = type;
			item.data = data;
			item.material = material;

			return item;

		}

	}

}

export { SVGObject, SVGRenderer };
