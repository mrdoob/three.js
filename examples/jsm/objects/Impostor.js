import {
	BufferAttribute,
	Color,
	DoubleSide,
	Drawer,
	Matrix4,
	HalfFloatType,
	Mesh,
	MeshBasicNodeMaterial,
	MeshLambertNodeMaterial,
	MeshPhongNodeMaterial,
	MeshPhysicalNodeMaterial,
	MeshStandardNodeMaterial,
	Node,
	NodeUpdateType,
	OrthographicCamera,
	PlaneGeometry,
	RenderTarget,
	Scene,
	Vector3
} from 'three/webgpu';

import {
	Fn, If, abs, attribute, cameraPosition, cameraProjectionMatrix, cameraViewMatrix, clamp, context, cross, dot, float, floor, ivec2, mat3, mat4, max,
	modelNormalMatrix, modelPosition, modelWorldMatrix, modelWorldMatrixInverse, mrt, nodeObject, normalLocal, normalViewGeometry,
	normalWorldGeometry, normalize, overrideNodes, positionLocal, positionView, positionViewDirection, positionWorld, positionWorldDirection,
	select, textureLoad, uniform, uv, varyingProperty, vec2, vec3, vec4
} from 'three/tsl';

const _bakeDrawer = /*@__PURE__*/ new Drawer();
const _direction = /*@__PURE__*/ new Vector3();
const _clearColor = /*@__PURE__*/ new Color();

// the maximum number of render targets of the views, the color attachments of a render pass

const MAX_TARGETS = 8;

// node materials of the built-in materials, the impostor evaluates the material of the source per fragment

const NODE_MATERIALS = {
	MeshBasicMaterial: MeshBasicNodeMaterial,
	MeshLambertMaterial: MeshLambertNodeMaterial,
	MeshPhongMaterial: MeshPhongNodeMaterial,
	MeshStandardMaterial: MeshStandardNodeMaterial,
	MeshPhysicalMaterial: MeshPhysicalNodeMaterial
};

// impostors of the same source share their atlas and material

const _cache = new WeakMap();

/**
 * Returns the direction of the given point of an octahedral map in [ 0, 1 ]. Hemispherical maps cover
 * the directions above the horizon, all their texels are used by the upper hemisphere.
 *
 * @private
 * @param {number} u - The horizontal coordinate.
 * @param {number} v - The vertical coordinate.
 * @param {boolean} hemisphere - Whether the map is hemispherical.
 * @param {Vector3} target - The target vector.
 * @return {Vector3} The direction.
 */
function decodeDirection( u, v, hemisphere, target ) {

	const px = u * 2 - 1;
	const py = v * 2 - 1;

	if ( hemisphere ) {

		const x = ( px + py ) * 0.5;
		const z = ( px - py ) * 0.5;

		return target.set( x, 1 - Math.abs( x ) - Math.abs( z ), z ).normalize();

	}

	const y = 1 - Math.abs( px ) - Math.abs( py );

	if ( y < 0 ) {

		return target.set( ( 1 - Math.abs( py ) ) * Math.sign( px ), y, ( 1 - Math.abs( px ) ) * Math.sign( py ) ).normalize();

	}

	return target.set( px, y, py ).normalize();

}

// the same mapping in TSL

const signNotZero = ( value ) => select( value.greaterThanEqual( 0.0 ), float( 1.0 ), float( - 1.0 ) );

const encodeDirectionNode = ( direction, hemisphere ) => Fn( () => {

	if ( hemisphere ) {

		const d = vec3( direction.x, max( direction.y, 0.0 ), direction.z );
		const n = d.div( abs( d.x ).add( abs( d.y ) ).add( abs( d.z ) ) );

		return vec2( n.x.add( n.z ), n.x.sub( n.z ) ).mul( 0.5 ).add( 0.5 );

	}

	const n = direction.div( abs( direction.x ).add( abs( direction.y ) ).add( abs( direction.z ) ) );
	const p = n.xz.toVar();

	If( n.y.lessThan( 0.0 ), () => {

		p.assign( vec2( float( 1.0 ).sub( abs( n.z ) ).mul( signNotZero( n.x ) ), float( 1.0 ).sub( abs( n.x ) ).mul( signNotZero( n.z ) ) ) );

	} );

	return p.mul( 0.5 ).add( 0.5 );

} )();

const decodeDirectionNode = ( uv, hemisphere ) => Fn( () => {

	const p = uv.mul( 2.0 ).sub( 1.0 );

	if ( hemisphere ) {

		const x = p.x.add( p.y ).mul( 0.5 );
		const z = p.x.sub( p.y ).mul( 0.5 );

		return normalize( vec3( x, float( 1.0 ).sub( abs( x ) ).sub( abs( z ) ), z ) );

	}

	const d = vec3( p.x, float( 1.0 ).sub( abs( p.x ) ).sub( abs( p.y ) ), p.y ).toVar();

	If( d.y.lessThan( 0.0 ), () => {

		d.assign( vec3( float( 1.0 ).sub( abs( p.y ) ).mul( signNotZero( p.x ) ), d.y, float( 1.0 ).sub( abs( p.x ) ).mul( signNotZero( p.y ) ) ) );

	} );

	return normalize( d );

} )();

// the axes of a view looking at the object from the given direction, like Matrix4.lookAt()

const viewAxes = ( direction ) => {

	const up = select( abs( direction.y ).greaterThan( 0.999 ), vec3( 0.0, 0.0, 1.0 ), vec3( 0.0, 1.0, 0.0 ) );
	const x = normalize( cross( up, direction ) );
	const y = cross( direction, x );

	return { x, y };

};

/**
 * Renders the views of the source into the atlas the first time the impostor is drawn, and again if the
 * material of the source changed. Wraps the coverage of the impostor, so every pass drawing the impostor
 * renders the views first.
 *
 * @private
 * @augments Node
 */
class ImpostorBakeNode extends Node {

	static get type() {

		return 'ImpostorBakeNode';

	}

	constructor( data, node ) {

		super( 'float' );

		this.data = data;
		this.node = node;

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	updateBefore( frame ) {

		const data = this.data;

		if ( data.version !== data.source.material.version ) bake( data, frame.renderer );

	}

	generate( builder ) {

		return this.node.build( builder, 'float' );

	}

}

/**
 * Renders the views of the source into the atlas: per texel the surface of the source, the position and
 * the normal in the space of the object, the uv and the other attributes of the geometry.
 *
 * @private
 * @param {Object} data - The impostor data.
 * @param {Renderer} renderer - The renderer.
 */
function bake( data, renderer ) {

	data.version = data.source.material.version;

	const { target, camera, scene, frames, size, center, radius, hemisphere } = data;

	const currentRenderTarget = renderer.getRenderTarget();
	const currentActiveCubeFace = renderer.getActiveCubeFace();
	const currentActiveMipmapLevel = renderer.getActiveMipmapLevel();
	const currentMRT = renderer.getMRT();
	const currentAutoClear = renderer.autoClear;
	const currentClearAlpha = renderer.getClearAlpha();
	const currentDrawer = renderer.drawer;

	renderer.getClearColor( _clearColor );

	// the source is drawn as it is, without merging or GPU-driven pipelines

	renderer.drawer = _bakeDrawer;
	renderer.setMRT( data.mrt );
	renderer.setClearColor( 0x000000, 0 );
	renderer.autoClear = false;

	target.viewport.set( 0, 0, target.width, target.height );
	target.scissorTest = false;

	renderer.setRenderTarget( target );
	renderer.clear();

	target.scissorTest = true;

	for ( let y = 0; y < frames; y ++ ) {

		for ( let x = 0; x < frames; x ++ ) {

			decodeDirection( ( x + 0.5 ) / frames, ( y + 0.5 ) / frames, hemisphere, _direction );

			camera.up.set( 0, 1, 0 );
			if ( Math.abs( _direction.y ) > 0.999 ) camera.up.set( 0, 0, 1 );

			camera.position.copy( center ).addScaledVector( _direction, radius * 2 );
			camera.lookAt( center );
			camera.updateMatrixWorld();

			target.viewport.set( x * size, y * size, size, size );
			target.scissor.set( x * size, y * size, size, size );

			renderer.render( scene, camera );

		}

	}

	target.scissorTest = false;
	target.viewport.set( 0, 0, target.width, target.height );

	renderer.setRenderTarget( currentRenderTarget, currentActiveCubeFace, currentActiveMipmapLevel );
	renderer.setMRT( currentMRT );
	renderer.setClearColor( _clearColor, currentClearAlpha );
	renderer.autoClear = currentAutoClear;
	renderer.drawer = currentDrawer;

}

/**
 * Returns the atlas, the geometry and the material shared by the impostors of the given source.
 *
 * @private
 * @param {Mesh} source - The source mesh.
 * @param {number} frames - The number of views per axis of the atlas.
 * @param {number} size - The size of a view in pixels.
 * @param {boolean} hemisphere - Whether the views only cover the upper hemisphere.
 * @return {Object} The impostor data.
 */
function getImpostorData( source, frames, size, hemisphere ) {

	const { geometry, material } = source;

	let byMaterial = _cache.get( geometry );

	if ( byMaterial === undefined ) {

		byMaterial = new WeakMap();
		_cache.set( geometry, byMaterial );

	}

	let byOptions = byMaterial.get( material );

	if ( byOptions === undefined ) {

		byOptions = new Map();
		byMaterial.set( material, byOptions );

	}

	const key = frames + ':' + size + ':' + hemisphere;

	let data = byOptions.get( key );

	if ( data !== undefined ) return data;

	if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();
	if ( geometry.boundingBox === null ) geometry.computeBoundingBox();

	const center = geometry.boundingSphere.center.clone();
	const radius = geometry.boundingSphere.radius;

	// the components stored per texel after the position and the normal: the second uv coordinate and the
	// other attributes of the geometry, packed into vec4 targets

	const components = [ { name: 'uv', component: 1 } ];
	const attributes = [];

	for ( const name in geometry.attributes ) {

		const attribute = geometry.attributes[ name ];

		if ( name === 'position' || name === 'normal' || name === 'uv' || attribute.itemSize > 4 || attribute.isInstancedBufferAttribute === true ) continue;

		if ( 2 + Math.ceil( ( components.length + attribute.itemSize ) / 4 ) > MAX_TARGETS ) {

			console.warn( 'THREE.Impostor: The attribute "' + name + '" exceeds the render targets of the views.' );
			continue;

		}

		attributes.push( { name, itemSize: attribute.itemSize, offset: components.length } );

		for ( let c = 0; c < attribute.itemSize; c ++ ) components.push( { name, component: c } );

	}

	const extraTargets = Math.ceil( components.length / 4 );

	const target = new RenderTarget( frames * size, frames * size, { count: 2 + extraTargets, type: HalfFloatType, depthBuffer: true } );
	target.textures[ 0 ].name = 'position';
	target.textures[ 1 ].name = 'normal';

	for ( let i = 0; i < extraTargets; i ++ ) target.textures[ 2 + i ].name = 'attributes' + i;

	// the bounds are uniforms, so the views and the impostors of all sources with the same material and attributes
	// share their shaders — materials can be large, compiling them per source would stall

	const centerNode = uniform( center );
	const radiusNode = uniform( radius );

	// the outputs of the views, the position relative to the bounding sphere keeps the precision of half floats

	const outputs = {
		position: vec4( positionLocal.sub( centerNode ).div( radiusNode ), 1.0 ),
		normal: vec4( normalLocal, uv().x )
	};

	const values = components.map( ( { name, component } ) => {

		if ( name === 'uv' ) return uv().y;

		const itemSize = geometry.attributes[ name ].itemSize;
		const node = attribute( name, [ 'float', 'vec2', 'vec3', 'vec4' ][ itemSize - 1 ] );

		return itemSize === 1 ? node : node[ 'xyzw'[ component ] ];

	} );

	for ( let i = 0; i < extraTargets; i ++ ) {

		const slot = values.slice( i * 4, i * 4 + 4 );

		while ( slot.length < 4 ) slot.push( float( 0.0 ) );

		outputs[ 'attributes' + i ] = vec4( ...slot );

	}

	const camera = new OrthographicCamera( - radius, radius, radius, - radius, 0, radius * 4 );

	const scene = new Scene();
	scene.add( new Mesh( geometry, material ) );

	data = {
		source,
		target,
		camera,
		scene,
		frames,
		size,
		center,
		radius,
		box: geometry.boundingBox.clone(),
		centerNode,
		radiusNode,
		hemisphere,
		attributes,
		extraTargets,
		version: - 1,
		mrt: mrt( outputs )
	};

	// a quad of the size of the bounding sphere, rotated toward the camera in the vertex stage

	const quad = new PlaneGeometry( radius * 2, radius * 2 );
	quad.translate( center.x, center.y, center.z );
	quad.setAttribute( 'corner', new BufferAttribute( new Float32Array( [ - 1, 1, 1, 1, - 1, - 1, 1, - 1 ] ), 2 ) );

	data.geometry = quad;
	data.material = createImpostorMaterial( data );

	byOptions.set( key, data );

	return data;

}

/**
 * Returns the material of the source as a node material, without sharing it.
 *
 * @private
 * @param {Material} source - The material of the source.
 * @return {NodeMaterial} The node material.
 */
function createNodeMaterial( source ) {

	if ( source.isNodeMaterial === true ) return source.clone();

	const NodeMaterialClass = NODE_MATERIALS[ source.type ] || MeshStandardNodeMaterial;
	const material = new NodeMaterialClass();

	for ( const key in source ) {

		if ( key === '_listeners' || key === 'uuid' || key === 'type' ) continue;

		material[ key ] = source[ key ];

	}

	return material;

}

/**
 * Creates the material drawing the views of the atlas: a quad facing the camera, which evaluates the material
 * of the source per fragment with the surface stored in the closest view. The matrices of the object are read
 * in the vertex stage and passed to the fragments, impostors drawn as instances read them per instance.
 *
 * @private
 * @param {Object} data - The impostor data.
 * @return {NodeMaterial} The material.
 */
function createImpostorMaterial( data ) {

	const { target, frames, size, hemisphere, attributes, extraTargets } = data;

	const center = data.centerNode;
	const radius = data.radiusNode;
	const atlasSize = frames * size;

	// the matrices of the object, distinct from the model matrices, which are replaced in the fragment stage

	const objectWorld = uniform( new Matrix4() ).onObjectUpdate( ( { object }, self ) => self.value.copy( object.matrixWorld ) );
	const objectWorldInverse = uniform( new Matrix4() ).onObjectUpdate( ( { object }, self ) => self.value.copy( object.matrixWorld ).invert() );

	// the direction of the camera in the space of the object, and the quad facing it

	const cameraDirection = () => normalize( objectWorldInverse.mul( vec4( cameraPosition, 1.0 ) ).xyz.sub( center ) );

	// the quad covers the bounding box projected onto the view, thin objects like towers cover a fraction of their
	// bounding sphere. the fragments outside of the source still evaluate its material before they are discarded

	const boxCenter = data.box.getCenter( new Vector3() );
	const boxHalfSize = data.box.getSize( new Vector3() ).multiplyScalar( 0.5 );
	const boxCenterNode = uniform( boxCenter );
	const boxHalfSizeNode = uniform( boxHalfSize );

	const billboard = ( direction ) => {

		const { x, y } = viewAxes( direction );
		const corner = attribute( 'corner', 'vec2' );

		const halfX = dot( abs( x ), boxHalfSizeNode );
		const halfY = dot( abs( y ), boxHalfSizeNode );

		return boxCenterNode.add( x.mul( corner.x.mul( halfX ) ) ).add( y.mul( corner.y.mul( halfY ) ) );

	};

	// the texel of the closest view covering the given point of the quad

	const viewTexel = ( point, direction ) => {

		const frame = clamp( floor( encodeDirectionNode( direction, hemisphere ).mul( frames ) ), 0.0, frames - 1 );
		const frameAxes = viewAxes( decodeDirectionNode( frame.add( 0.5 ).div( frames ), hemisphere ) );

		const offset = point.sub( center );
		const frameUv = vec2( dot( offset, frameAxes.x ), dot( offset, frameAxes.y ) ).div( radius ).mul( 0.5 ).add( 0.5 );
		const inside = frameUv.x.greaterThan( 0.0 ).and( frameUv.x.lessThan( 1.0 ) ).and( frameUv.y.greaterThan( 0.0 ) ).and( frameUv.y.lessThan( 1.0 ) );

		// the views are rendered with the origin at the bottom, the rows of the atlas are loaded from the top

		const viewUv = vec2( clamp( frameUv.x, 0.0, 0.9999 ), clamp( float( 1.0 ).sub( frameUv.y ), 0.0, 0.9999 ) );
		const texel = ivec2( clamp( frame.add( viewUv ).mul( size ), 0.0, atlasSize - 1 ) );

		return { texel, inside };

	};

	// the coverage of a view, which renders the views when it is first drawn

	const coverage = ( point, direction ) => {

		const { texel, inside } = viewTexel( point, direction );

		return inside.and( nodeObject( new ImpostorBakeNode( data, textureLoad( target.textures[ 0 ], texel ).w ) ).greaterThan( 0.5 ) );

	};

	const vPoint = varyingProperty( 'vec3', 'vImpostorPoint' );
	const vDirection = varyingProperty( 'vec3', 'vImpostorDirection' );
	const vWorld = [ 0, 1, 2, 3 ].map( ( i ) => varyingProperty( 'vec4', 'vImpostorWorld' + i ) );
	const vWorldInverse = [ 0, 1, 2, 3 ].map( ( i ) => varyingProperty( 'vec4', 'vImpostorWorldInverse' + i ) );

	const material = createNodeMaterial( data.source.material );

	// shadow passes evaluate the alpha of the color without the surface of the views, the coverage is masked

	if ( material.colorNode !== null && material.colorNode !== undefined ) {

		const sourceColor = material.colorNode;

		material.colorNode = Fn( ( builder ) => typeof builder.context.getAttribute === 'function' ? sourceColor : vec4( 1.0 ) )();

	}

	// the deformations, masks and the transparency of the source are part of the views

	material.positionNode = null;
	material.alphaTest = 0;

	material.vertexNode = Fn( () => {

		const direction = cameraDirection().toVar();
		const point = billboard( direction ).toVar();

		vPoint.assign( point );
		vDirection.assign( direction );

		for ( let i = 0; i < 4; i ++ ) {

			vWorld[ i ].assign( objectWorld.element( i ) );
			vWorldInverse[ i ].assign( objectWorldInverse.element( i ) );

		}

		return cameraProjectionMatrix.mul( cameraViewMatrix ).mul( objectWorld ).mul( vec4( point, 1.0 ) );

	} )();

	material.maskNode = coverage( vPoint, vDirection );

	// shadow passes draw the quad facing the light, shadow materials draw the back faces of front side materials

	material.shadowSide = DoubleSide;

	material.castShadowPositionNode = billboard( cameraDirection() );
	material.maskShadowNode = coverage( positionLocal, cameraDirection() );

	// the surface of the source covering the fragment

	const { texel } = viewTexel( vPoint, vDirection );

	const surfacePosition = textureLoad( target.textures[ 0 ], texel );
	const surfaceNormal = textureLoad( target.textures[ 1 ], texel );
	const surfaceAttributes = [];

	for ( let i = 0; i < extraTargets; i ++ ) surfaceAttributes.push( textureLoad( target.textures[ 2 + i ], texel ) );

	// the fragments outside of the source evaluate the material before they are discarded: they get valid
	// values instead of the cleared texels, materials could otherwise divide by zero or loop without end

	const covered = surfacePosition.w.greaterThan( 0.5 );

	const component = ( index ) => select( covered, surfaceAttributes[ index >> 2 ][ 'xyzw'[ index & 3 ] ], float( 1.0 ) );

	const matrixWorld = mat4( ...vWorld );
	const matrixWorldInverse = mat4( ...vWorldInverse );
	const normalMatrix = mat3( matrixWorldInverse ).transpose();

	const localPosition = select( covered, surfacePosition.xyz.mul( radius ).add( center ), center );
	const localNormal = select( covered, normalize( surfaceNormal.xyz ), vec3( 0.0, 1.0, 0.0 ) );
	const worldPosition = matrixWorld.mul( vec4( localPosition, 1.0 ) ).xyz;
	const worldNormal = normalize( normalMatrix.mul( localNormal ) );
	const viewPosition = cameraViewMatrix.mul( vec4( worldPosition, 1.0 ) ).xyz;

	const getAttribute = ( name ) => {

		if ( name === 'position' ) return localPosition;
		if ( name === 'normal' ) return localNormal;
		if ( name === 'uv' ) return vec2( surfaceNormal.w, component( 0 ) );

		const info = attributes.find( ( attribute ) => attribute.name === name );

		if ( info === undefined ) return null;

		const values = [];

		for ( let c = 0; c < info.itemSize; c ++ ) values.push( component( info.offset + c ) );

		return info.itemSize === 1 ? values[ 0 ] : info.itemSize === 2 ? vec2( ...values ) : info.itemSize === 3 ? vec3( ...values ) : vec4( ...values );

	};

	// the material evaluates the surface per fragment, its varyings included

	material.contextNode = overrideNodes( [
		[ modelWorldMatrix, matrixWorld ],
		[ modelWorldMatrixInverse, matrixWorldInverse ],
		[ modelNormalMatrix, normalMatrix ],
		[ modelPosition, vWorld[ 3 ].xyz ],
		[ positionLocal, localPosition ],
		[ positionWorld, worldPosition ],
		[ positionWorldDirection, normalize( matrixWorld.mul( vec4( localPosition, 0.0 ) ).xyz ) ],
		[ positionView, viewPosition ],
		[ positionViewDirection, viewPosition.negate().normalize() ],
		[ normalLocal, localNormal ],
		[ normalWorldGeometry, worldNormal ],
		[ normalViewGeometry, cameraViewMatrix.mul( vec4( worldNormal, 0.0 ) ).xyz.normalize() ]
	], context( { getAttribute, inlineVaryings: true } ) );

	return material;

}

/**
 * An impostor of a mesh: a quad facing the camera which shows the mesh with views rendered from many
 * directions into an atlas. The views store the surface of the mesh, the position and the normal in the
 * space of the object, the uv and the other attributes of the geometry, and the material of the mesh is
 * evaluated per fragment on it. Effects depending on the position in the world, the view or the lights
 * work like on the mesh. Use it as a far level of a {@link LOD} object.
 *
 * The views are rendered the first time the impostor is drawn. Impostors of the same geometry and material
 * share their atlas and material, so they can be drawn together.
 *
 * ```js
 * const lod = new THREE.LOD();
 * lod.addLevel( tree, 0 );
 * lod.addLevel( new Impostor( tree ), 300 );
 * ```
 *
 * @augments Mesh
 */
class Impostor extends Mesh {

	/**
	 * Constructs a new impostor.
	 *
	 * @param {Mesh} [source] - The mesh to show. The impostor takes its transform.
	 * @param {Object} [parameters] - The configuration parameter.
	 * @param {number} [parameters.frames=8] - The number of views per axis of the atlas.
	 * @param {number} [parameters.size=64] - The size of a view in pixels.
	 * @param {boolean} [parameters.hemisphere=false] - Whether the views only cover the upper hemisphere, for objects which are never seen from below.
	 */
	constructor( source, { frames = 8, size = 64, hemisphere = false } = {} ) {

		if ( source === undefined ) {

			// clones copy the source

			super();

		} else {

			const data = getImpostorData( source, frames, size, hemisphere );

			super( data.geometry, data.material );

			this.position.copy( source.position );
			this.quaternion.copy( source.quaternion );
			this.scale.copy( source.scale );

			this.castShadow = source.castShadow;
			this.receiveShadow = source.receiveShadow;

		}

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isImpostor = true;

		this.type = 'Impostor';

	}

}

export { Impostor };
