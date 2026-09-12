import {
	Box3,
	Color,
	FrontSide,
	HalfFloatType,
	Mesh,
	Matrix4,
	NearestFilter,
	NoBlending,
	OrthographicCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Vector2,
	Vector3,
	Vector4,
	WebGLRenderTarget
} from 'three';

const _drawingBufferSize = new Vector2();
const _positionTexelSize = new Vector2();
const _bounds = new Box3();
const _clearColor = new Color();
const _viewport = new Vector4();
const _scissor = new Vector4();

/**
 * GPU-composited polygon and polyline overlays for a heightfield-like mesh.
 *
 * The input coordinates stay in world space. No input vertex is raycast or
 * resampled against the surface: the visible surface position is captured on
 * the GPU every frame and used to project a vector overlay texture.
 */
export class SurfaceOverlayRenderer {

	constructor( renderer, surface ) {

		if ( ! surface?.isMesh ) {

			throw new TypeError( 'SurfaceOverlayRenderer requires a THREE.Mesh surface.' );

		}

		this.renderer = renderer;
		this.surface = surface;
		this.enabled = true;
		this._entries = [];
		this._surfaceMatrixWorld = new Matrix4();

		this._positionScene = new Scene();
		this._fillScene = new Scene();
		this._lineScene = new Scene();
		this._compositeCamera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

		this._positionMaterial = new ShaderMaterial( {
			depthTest: true,
			depthWrite: true,
			side: FrontSide,
			blending: NoBlending,
			toneMapped: false,
			vertexShader: /* glsl */`
				varying vec3 vWorldPosition;
				void main() {
					vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
					vWorldPosition = worldPosition.xyz;
					gl_Position = projectionMatrix * viewMatrix * worldPosition;
				}
			`,
			fragmentShader: /* glsl */`
				precision highp float;
				varying vec3 vWorldPosition;
				void main() {
					gl_FragColor = vec4( vWorldPosition, 1.0 );
				}
			`
		} );

		this._surfaceProxy = new Mesh( surface.geometry, this._positionMaterial );
		this._surfaceProxy.matrixAutoUpdate = false;
		this._surfaceProxy.frustumCulled = false;
		this._positionScene.add( this._surfaceProxy );

		this._positionTarget = new WebGLRenderTarget( 1, 1, {
			type: HalfFloatType,
			depthBuffer: true,
			stencilBuffer: false
		} );
		this._positionTarget.texture.minFilter = NearestFilter;
		this._positionTarget.texture.magFilter = NearestFilter;
		this._positionTarget.texture.generateMipmaps = false;
		this.updateSurfaceBounds();
		this._surfaceMatrixWorld.copy( this.surface.matrixWorld );
		this._lineBatch = new ScreenSpaceLineBatch( this._positionTarget.texture, this._surfaceBoundsSize );
		this._lineScene.add( this._lineBatch.mesh );

	}

	updateSurfaceBounds() {

		this.surface.updateWorldMatrix( true, false );
		_bounds.setFromObject( this.surface );

		if ( _bounds.isEmpty() ) {

			throw new Error( 'The overlay surface has empty bounds.' );

		}

		this._surfaceBounds = _bounds.clone();
		this._surfaceMatrixWorld.copy( this.surface.matrixWorld );
		this._surfaceBoundsSize = new Vector2(
			Math.max( this._surfaceBounds.max.x - this._surfaceBounds.min.x, 0.0001 ),
			Math.max( this._surfaceBounds.max.z - this._surfaceBounds.min.z, 0.0001 )
		);

		if ( this._lineBatch ) this._lineBatch.setSurfaceBoundsSize( this._surfaceBoundsSize );

		for ( const fill of this._fillScene.children ) {

			fill.material.uniforms.worldBoundsSize.value.copy( this._surfaceBoundsSize );

		}

	}

	addPolygon( points, style = {} ) {

		if ( points.length < 3 ) throw new RangeError( 'A polygon requires at least three points.' );

		const normalized = points.map( toVector3 );
		const rings = [ normalized ];

		for ( const hole of style.holes ?? [] ) {

			if ( hole.length < 3 ) throw new RangeError( 'A polygon hole requires at least three points.' );
			rings.push( hole.map( toVector3 ) );

		}

		const material = createScreenSpacePolygonMaterial( rings, style, this._positionTarget.texture, this._surfaceBoundsSize );
		const object = new Mesh( new PlaneGeometry( 2, 2 ), material );
		object.frustumCulled = false;
		object.renderOrder = style.renderOrder ?? 0;
		this._fillScene.add( object );

		return this._registerEntry( object, material, style, normalized, this._fillScene );

	}

	addPolyline( points, style = {} ) {

		if ( points.length < 2 ) throw new RangeError( 'A polyline requires at least two points.' );

		const normalized = points.map( toVector3 );
		const entry = this._lineBatch.add( normalized, style );
		const dispose = entry.dispose;
		entry.dispose = () => {

			const index = this._entries.indexOf( entry );
			if ( index !== - 1 ) this._entries.splice( index, 1 );
			dispose();

		};

		this._entries.push( entry );
		return entry;

	}

	get info() {

		return {
			polygons: this._fillScene.children.length,
			polylines: this._lineBatch.entries.length,
			lineSegments: this._lineBatch.segmentCount
		};

	}

	render( scene, camera ) {

		if ( ! this.enabled ) {

			this.renderer.render( scene, camera );
			return;

		}

		this._updateDrawingBufferSize();
		this._captureSurfacePositions( camera );
		this.renderer.render( scene, camera );

		const autoClear = this.renderer.autoClear;
		try {

			this.renderer.autoClear = false;
			this.renderer.render( this._fillScene, this._compositeCamera );
			this.renderer.render( this._lineScene, this._compositeCamera );

		} finally {

			this.renderer.autoClear = autoClear;

		}

	}

	dispose() {

		for ( const entry of [ ...this._entries ] ) entry.dispose();
		this._positionMaterial.dispose();
		this._positionTarget.dispose();
		this._lineBatch.dispose();

	}

	_registerEntry( object, material, style, points, owner = this._fillScene ) {

		const entry = {
			object,
			material,
			style: { ...style },
			points,
			setStyle: ( patch ) => {

				Object.assign( entry.style, patch );
				if ( patch.map !== undefined && material.uniforms.fillMap ) {

					material.uniforms.fillMap.value = patch.map;
					material.defines.USE_MAP = patch.map ? 1 : 0;
					material.needsUpdate = true;

				}

				if ( patch.mapBounds !== undefined && material.uniforms.mapBounds ) material.uniforms.mapBounds.value.copy( getMapBounds( patch.mapBounds, points ) );
				if ( patch.color !== undefined ) {

					if ( material.color ) material.color.set( patch.color );
					else if ( material.uniforms.lineColor ) material.uniforms.lineColor.value.set( patch.color );
					else material.uniforms.fillColor.value.set( patch.color );

				}

				if ( patch.opacity !== undefined ) {

					if ( 'opacity' in material ) material.opacity = patch.opacity;
					else material.uniforms.opacity.value = patch.opacity;

				}

				if ( patch.width !== undefined && material.uniforms?.lineWidth ) material.uniforms.lineWidth.value = patch.width;
				if ( patch.visible !== undefined ) object.visible = patch.visible;

			},
			dispose: () => {

				const index = this._entries.indexOf( entry );
				if ( index !== - 1 ) this._entries.splice( index, 1 );
				owner.remove( object );
				object.geometry.dispose();
				material.dispose();

			}
		};

		Object.defineProperty( entry, 'visible', {
			get: () => object.visible,
			set: ( value ) => {

				object.visible = value;

			}
		} );

		this._entries.push( entry );
		return entry;

	}

	_updateDrawingBufferSize() {

		this.renderer.getDrawingBufferSize( _drawingBufferSize );
		const width = Math.max( 1, Math.floor( _drawingBufferSize.x ) );
		const height = Math.max( 1, Math.floor( _drawingBufferSize.y ) );

		if ( this._positionTarget.width !== width || this._positionTarget.height !== height ) {

			this._positionTarget.setSize( width, height );

		}

		_positionTexelSize.set( 1 / width, 1 / height );
		this._lineBatch.setPositionTexelSize( _positionTexelSize );

	}

	_captureSurfacePositions( camera ) {

		this.surface.updateWorldMatrix( true, false );
		if ( ! this.surface.matrixWorld.equals( this._surfaceMatrixWorld ) ) this.updateSurfaceBounds();
		this._surfaceProxy.matrix.copy( this.surface.matrixWorld );
		this._surfaceProxy.matrixWorld.copy( this.surface.matrixWorld );

		this._withRenderState( () => {

			this.renderer.setRenderTarget( this._positionTarget );
			this.renderer.setClearColor( 0x000000, 0 );
			this.renderer.clear( true, true, true );
			this.renderer.render( this._positionScene, camera );

		} );

	}

	_withRenderState( callback ) {

		const target = this.renderer.getRenderTarget();
		const autoClear = this.renderer.autoClear;
		const clearAlpha = this.renderer.getClearAlpha();
		this.renderer.getClearColor( _clearColor );
		const viewport = this.renderer.getViewport( _viewport ).clone();
		const scissor = this.renderer.getScissor( _scissor ).clone();
		const scissorTest = this.renderer.getScissorTest();

		try {

			callback();

		} finally {

			this.renderer.setRenderTarget( target );
			this.renderer.setClearColor( _clearColor, clearAlpha );
			this.renderer.autoClear = autoClear;
			this.renderer.setViewport( viewport );
			this.renderer.setScissor( scissor );
			this.renderer.setScissorTest( scissorTest );

		}

	}

}

function createScreenSpacePolygonMaterial( rings, style, positionMap, surfaceBoundsSize ) {

	const maxEdges = 64;
	const edges = Array.from( { length: maxEdges }, () => new Vector4() );
	const mapBounds = getMapBounds( style.mapBounds, rings[ 0 ] );
	let edgeCount = 0;

	for ( const ring of rings ) {

		for ( let index = 0; index < ring.length; index ++ ) {

			if ( edgeCount === maxEdges ) throw new RangeError( `A screen-space polygon supports at most ${maxEdges} outer and hole edges.` );
			const start = ring[ index ];
			const end = ring[ ( index + 1 ) % ring.length ];
			edges[ edgeCount ].set( start.x, start.z, end.x, end.z );
			edgeCount ++;

		}

	}

	return new ShaderMaterial( {
		transparent: true,
		depthTest: false,
		depthWrite: false,
		alphaToCoverage: true,
		toneMapped: false,
		defines: {
			EDGE_COUNT: edgeCount,
			USE_MAP: style.map ? 1 : 0
		},
		uniforms: {
			positionMap: { value: positionMap },
			worldBoundsSize: { value: surfaceBoundsSize },
			fillColor: { value: new Color( style.color ?? 0xf2bd4a ) },
			opacity: { value: style.opacity ?? 0.35 },
			edges: { value: edges },
			fillMap: { value: style.map ?? null },
			mapBounds: { value: mapBounds }
		},
		vertexShader: /* glsl */`
			varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = vec4( position.xy, 0.0, 1.0 );
			}
		`,
		fragmentShader: /* glsl */`
			precision highp float;
			#define MAX_EDGES 64
			uniform sampler2D positionMap;
			uniform vec2 worldBoundsSize;
			uniform vec3 fillColor;
			uniform float opacity;
			uniform vec4 edges[ MAX_EDGES ];
			#if USE_MAP
				uniform sampler2D fillMap;
				uniform vec4 mapBounds;
			#endif
			varying vec2 vUv;

			float distanceToSegment( vec2 point, vec2 start, vec2 end ) {
				vec2 delta = end - start;
				float t = clamp( dot( point - start, delta ) / max( dot( delta, delta ), 0.000001 ), 0.0, 1.0 );
				return length( point - ( start + t * delta ) );
			}

			void main() {
				vec4 surfacePosition = texture2D( positionMap, vUv );
				if ( surfacePosition.a < 0.5 ) discard;
				vec2 point = surfacePosition.xz;
				bool inside = false;
				float edgeDistance = 1e20;
				for ( int index = 0; index < MAX_EDGES; index ++ ) {
					if ( index >= EDGE_COUNT ) break;
					vec2 start = edges[ index ].xy;
					vec2 end = edges[ index ].zw;
					bool crosses = ( start.y > point.y ) != ( end.y > point.y );
					if ( crosses && point.x < ( end.x - start.x ) * ( point.y - start.y ) / ( end.y - start.y ) + start.x ) inside = ! inside;
					edgeDistance = min( edgeDistance, distanceToSegment( point, start, end ) );
				}

				float pixelWorldSize = max( length( fwidth( vUv ) * worldBoundsSize ), 0.00001 );
				float signedDistance = inside ? - edgeDistance : edgeDistance;
				float coverage = 1.0 - smoothstep( - 0.5 * pixelWorldSize, 0.5 * pixelWorldSize, signedDistance );
				if ( coverage < 0.003 ) discard;
				vec3 color = fillColor;
				float alpha = opacity * coverage;
				#if USE_MAP
					vec2 mapUv = ( point - mapBounds.xy ) / max( mapBounds.zw - mapBounds.xy, vec2( 0.00001 ) );
					vec4 mapSample = texture2D( fillMap, mapUv );
					color *= mapSample.rgb;
					alpha *= mapSample.a;
				#endif
				gl_FragColor = vec4( color, alpha );
			}
		`
	} );

}

class ScreenSpaceLineBatch {

	constructor( positionMap, surfaceBoundsSize ) {

		this.positionMap = positionMap;
		this.surfaceBoundsSize = surfaceBoundsSize;
		this.positionTexelSize = new Vector2( 1, 1 );
		this.entries = [];
		this.segmentCount = 0;
		this.geometry = new PlaneGeometry( 2, 2 );
		const initialMaterial = createBatchedLineMaterial( positionMap, surfaceBoundsSize, this.positionTexelSize, [] );
		this.material = initialMaterial.material;
		this.segmentCount = initialMaterial.segmentCount;
		this.mesh = new Mesh( this.geometry, this.material );
		this.mesh.frustumCulled = false;

	}

	add( points, style ) {

		const entry = {
			points,
			style: { ...style },
			_isVisible: style.visible ?? true,
			setStyle: ( patch ) => {

				this._setEntryStyle( entry, patch );

			},
			dispose: () => {

				const index = this.entries.indexOf( entry );
				if ( index !== - 1 ) this.entries.splice( index, 1 );
				this.rebuild();

			}
		};

		Object.defineProperty( entry, 'visible', {
			get: () => entry._isVisible,
			set: ( value ) => {

				this._setEntryStyle( entry, { visible: value } );

			}
		} );

		this.entries.push( entry );
		try {

			this.rebuild();

		} catch ( error ) {

			this.entries.pop();
			throw error;

		}

		return entry;

	}

	_setEntryStyle( entry, patch ) {

		const previousStyle = { ...entry.style };
		const previousVisibility = entry._isVisible;
		Object.assign( entry.style, patch );
		if ( patch.visible !== undefined ) entry._isVisible = patch.visible;

		try {

			this.rebuild();

		} catch ( error ) {

			entry.style = previousStyle;
			entry._isVisible = previousVisibility;
			throw error;

		}

	}

	rebuild() {

		const previousMaterial = this.material;
		const result = createBatchedLineMaterial( this.positionMap, this.surfaceBoundsSize, this.positionTexelSize, this.entries );
		this.material = result.material;
		this.segmentCount = result.segmentCount;
		this.mesh.material = this.material;
		previousMaterial.dispose();

	}

	setSurfaceBoundsSize( surfaceBoundsSize ) {

		this.surfaceBoundsSize.copy( surfaceBoundsSize );
		this.material.uniforms.worldBoundsSize.value.copy( surfaceBoundsSize );

	}

	setPositionTexelSize( positionTexelSize ) {

		this.positionTexelSize.copy( positionTexelSize );
		this.material.uniforms.positionTexelSize.value.copy( positionTexelSize );

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();
		this.entries.length = 0;
		this.segmentCount = 0;

	}

}

function createBatchedLineMaterial( positionMap, surfaceBoundsSize, positionTexelSize, entries ) {

	const maxSegments = 128;
	const segments = Array.from( { length: maxSegments }, () => new Vector4() );
	const startDistances = new Float32Array( maxSegments );
	const colors = Array.from( { length: maxSegments }, () => new Vector4() );
	const parameters = Array.from( { length: maxSegments }, () => new Vector4() );
	const dashOffsets = new Float32Array( maxSegments );
	let segmentCount = 0;

	for ( const entry of entries ) {

		if ( ! entry._isVisible ) continue;
		const color = new Color( entry.style.color ?? 0xd7f076 );
		const opacity = entry.style.opacity ?? 1;
		const width = entry.style.width ?? 1;
		const dashed = entry.style.dashed ? 1 : 0;
		const dashSize = entry.style.dashSize ?? 4;
		const gapSize = entry.style.gapSize ?? 2;
		const dashOffset = entry.style.dashOffset ?? 0;
		let distance = 0;

		for ( let index = 0; index < entry.points.length - 1; index ++ ) {

			if ( segmentCount === maxSegments ) throw new RangeError( `The line batch supports at most ${maxSegments} total segments.` );
			const start = entry.points[ index ];
			const end = entry.points[ index + 1 ];
			const length = Math.hypot( end.x - start.x, end.z - start.z );
			if ( length === 0 ) continue;
			segments[ segmentCount ].set( start.x, start.z, end.x, end.z );
			startDistances[ segmentCount ] = distance;
			colors[ segmentCount ].set( color.r, color.g, color.b, opacity );
			parameters[ segmentCount ].set( width, dashed, dashSize, gapSize );
			dashOffsets[ segmentCount ] = dashOffset;
			distance += length;
			segmentCount ++;

		}

	}

	return {
		segmentCount,
		material: new ShaderMaterial( {
			transparent: true,
			depthTest: false,
			depthWrite: false,
			alphaToCoverage: true,
			toneMapped: false,
			defines: { SEGMENT_COUNT: segmentCount },
			uniforms: {
				positionMap: { value: positionMap },
				worldBoundsSize: { value: surfaceBoundsSize },
				positionTexelSize: { value: positionTexelSize },
				segments: { value: segments },
				startDistances: { value: startDistances },
				colors: { value: colors },
				parameters: { value: parameters },
				dashOffsets: { value: dashOffsets }
			},
			vertexShader: fullscreenVertexShader,
			fragmentShader: /* glsl */`
			precision highp float;
			#define MAX_SEGMENTS 128
			uniform sampler2D positionMap;
			uniform vec2 worldBoundsSize;
			uniform vec2 positionTexelSize;
			uniform vec4 segments[ MAX_SEGMENTS ];
			uniform float startDistances[ MAX_SEGMENTS ];
			uniform vec4 colors[ MAX_SEGMENTS ];
			uniform vec4 parameters[ MAX_SEGMENTS ];
			uniform float dashOffsets[ MAX_SEGMENTS ];
			varying vec2 vUv;

			void main() {
				vec4 surfacePosition = texture2D( positionMap, vUv );
				if ( surfacePosition.a < 0.5 ) discard;
				vec2 point = surfacePosition.xz;
				float stablePixelWorldSize = max( length( fwidth( vUv ) * worldBoundsSize ), 0.00001 );
				vec4 positionLeft = texture2D( positionMap, vUv - vec2( positionTexelSize.x, 0.0 ) );
				vec4 positionRight = texture2D( positionMap, vUv + vec2( positionTexelSize.x, 0.0 ) );
				vec4 positionDown = texture2D( positionMap, vUv - vec2( 0.0, positionTexelSize.y ) );
				vec4 positionUp = texture2D( positionMap, vUv + vec2( 0.0, positionTexelSize.y ) );
				vec2 positionDerivativeX = 0.5 * ( positionRight.xz - positionLeft.xz );
				vec2 positionDerivativeY = 0.5 * ( positionUp.xz - positionDown.xz );
				bool hasContinuousNeighbours = min( min( positionLeft.a, positionRight.a ), min( positionDown.a, positionUp.a ) ) > 0.5;
				hasContinuousNeighbours = hasContinuousNeighbours && max( length( positionDerivativeX ), length( positionDerivativeY ) ) < stablePixelWorldSize * 6.0;
				vec4 result = vec4( 0.0 );

				for ( int index = 0; index < MAX_SEGMENTS; index ++ ) {
					if ( index >= SEGMENT_COUNT ) break;
					vec4 segment = segments[ index ];
					vec2 start = segment.xy;
					vec2 delta = segment.zw - start;
					float lengthSquared = max( dot( delta, delta ), 0.000001 );
					float t = clamp( dot( point - start, delta ) / lengthSquared, 0.0, 1.0 );
					float distanceToSegment = length( point - ( start + delta * t ) );
					vec4 parameter = parameters[ index ];
					vec2 lineNormal = vec2( - delta.y, delta.x ) / sqrt( lengthSquared );
					float localPixelWorldSize = length( vec2( dot( lineNormal, positionDerivativeX ), dot( lineNormal, positionDerivativeY ) ) );
					float pixelWorldSize = stablePixelWorldSize;
					if ( hasContinuousNeighbours ) pixelWorldSize = clamp( localPixelWorldSize, stablePixelWorldSize * 0.35, stablePixelWorldSize * 3.0 );
					float edgeFeather = 0.5 * pixelWorldSize;
					float halfWidth = 0.5 * parameter.x * pixelWorldSize;
					float coverage = 1.0 - smoothstep( halfWidth - edgeFeather, halfWidth + edgeFeather, distanceToSegment );

					if ( parameter.y > 0.5 ) {
						float distanceAlongLine = startDistances[ index ] + t * sqrt( lengthSquared ) + dashOffsets[ index ];
						float phase = mod( distanceAlongLine, parameter.z + parameter.w );
						coverage *= 1.0 - smoothstep( parameter.z - edgeFeather, parameter.z + edgeFeather, phase );
					}

					vec4 color = colors[ index ];
					float alpha = color.a * coverage;
					result.rgb = color.rgb * alpha + result.rgb * ( 1.0 - alpha );
					result.a = alpha + result.a * ( 1.0 - alpha );
				}

				if ( result.a < 0.003 ) discard;
				gl_FragColor = vec4( result.rgb / result.a, result.a );
			}
			`
		} )
	};

}

const fullscreenVertexShader = /* glsl */`
	varying vec2 vUv;
	void main() {
		vUv = uv;
		gl_Position = vec4( position.xy, 0.0, 1.0 );
	}
`;

function toVector3( value ) {

	if ( value?.isVector3 ) return value;
	if ( Array.isArray( value ) && value.length >= 3 ) return new Vector3( value[ 0 ], value[ 1 ], value[ 2 ] );
	throw new TypeError( 'Overlay coordinates must be THREE.Vector3 instances or [ x, y, z ] tuples.' );

}

function getMapBounds( value, ring ) {

	if ( value?.isVector4 ) return value.clone();
	if ( Array.isArray( value ) && value.length === 4 ) return new Vector4().fromArray( value );
	if ( value !== undefined ) throw new TypeError( 'mapBounds must be a THREE.Vector4 or [ minX, minZ, maxX, maxZ ].' );

	const bounds = new Vector4( Infinity, Infinity, - Infinity, - Infinity );
	for ( const point of ring ) {

		bounds.x = Math.min( bounds.x, point.x );
		bounds.y = Math.min( bounds.y, point.z );
		bounds.z = Math.max( bounds.z, point.x );
		bounds.w = Math.max( bounds.w, point.z );

	}

	return bounds;

}


