import {
	Node,
	colorCreate,
	colorCopy,
	colorMultiplyScalar,
	vec3ApplyMatrix4,
	vec3Create,
	vec3SetFromMatrixPosition,
	vec3Sub,
	vec3TransformDirection,
	vec4Create
} from 'three/webgpu';
import { Loop, NodeUpdateType, getDistanceAttenuation, positionView, renderGroup, smoothstep, uniform, uniformArray, vec3 } from 'three/tsl';

const _lightPosition = /*@__PURE__*/ vec3Create();
const _targetPosition = /*@__PURE__*/ vec3Create();

const warn = ( message ) => {

	console.warn( `THREE.SpotLightDataNode: ${ message }` );

};

/**
 * Batched data node for simple spot lights in dynamic lighting mode.
 *
 * Projected spot lights keep the default per-light path.
 *
 * @augments Node
 */
class SpotLightDataNode extends Node {

	static get type() {

		return 'SpotLightDataNode';

	}

	constructor( maxCount = 16 ) {

		super();

		this.maxCount = maxCount;
		this._lights = [];
		this._colors = [];
		this._positionsAndCutoff = [];
		this._directionsAndDecay = [];
		this._cones = [];

		for ( let i = 0; i < maxCount; i ++ ) {

			this._colors.push( colorCreate() );
			this._positionsAndCutoff.push( vec4Create() );
			this._directionsAndDecay.push( vec4Create() );
			this._cones.push( vec4Create() );

		}

		this.colorsNode = uniformArray( this._colors, 'color' ).setGroup( renderGroup );
		this.positionsAndCutoffNode = uniformArray( this._positionsAndCutoff, 'vec4' ).setGroup( renderGroup );
		this.directionsAndDecayNode = uniformArray( this._directionsAndDecay, 'vec4' ).setGroup( renderGroup );
		this.conesNode = uniformArray( this._cones, 'vec4' ).setGroup( renderGroup );
		this.countNode = uniform( 0, 'int' ).setGroup( renderGroup );
		this.updateType = NodeUpdateType.RENDER;

	}

	setLights( lights ) {

		if ( lights.length > this.maxCount ) {

			warn( `${ lights.length } lights exceed the configured max of ${ this.maxCount }. Excess lights are ignored.` );

		}

		this._lights = lights;

		return this;

	}

	update( { camera } ) {

		const count = Math.min( this._lights.length, this.maxCount );

		this.countNode.value = count;

		for ( let i = 0; i < count; i ++ ) {

			const light = this._lights[ i ];

			colorCopy( light.color, this._colors[ i ] );
			colorMultiplyScalar( this._colors[ i ], light.intensity, this._colors[ i ] );

			vec3SetFromMatrixPosition( light.matrixWorld, _lightPosition );
			vec3ApplyMatrix4( _lightPosition, camera.matrixWorldInverse, _lightPosition );

			const positionAndCutoff = this._positionsAndCutoff[ i ];
			positionAndCutoff.x = _lightPosition.x;
			positionAndCutoff.y = _lightPosition.y;
			positionAndCutoff.z = _lightPosition.z;
			positionAndCutoff.w = light.distance;

			vec3SetFromMatrixPosition( light.matrixWorld, _lightPosition );
			vec3SetFromMatrixPosition( light.target.matrixWorld, _targetPosition );
			vec3Sub( _lightPosition, _targetPosition, _lightPosition );
			vec3TransformDirection( _lightPosition, camera.matrixWorldInverse, _lightPosition );

			const directionAndDecay = this._directionsAndDecay[ i ];
			directionAndDecay.x = _lightPosition.x;
			directionAndDecay.y = _lightPosition.y;
			directionAndDecay.z = _lightPosition.z;
			directionAndDecay.w = light.decay;

			const cone = this._cones[ i ];
			cone.x = Math.cos( light.angle );
			cone.y = Math.cos( light.angle * ( 1 - light.penumbra ) );

		}

	}

	setup( builder ) {

		const surfacePosition = builder.context.positionView || positionView;
		const { lightingModel, reflectedLight } = builder.context;
		const dynDiffuse = vec3( 0 ).toVar( 'dynSpotDiffuse' );
		const dynSpecular = vec3( 0 ).toVar( 'dynSpotSpecular' );

		Loop( this.countNode, ( { i } ) => {

			const positionAndCutoff = this.positionsAndCutoffNode.element( i );
			const lightViewPosition = positionAndCutoff.xyz;
			const cutoffDistance = positionAndCutoff.w;

			const directionAndDecay = this.directionsAndDecayNode.element( i );
			const spotDirection = directionAndDecay.xyz;
			const decayExponent = directionAndDecay.w;

			const cone = this.conesNode.element( i );
			const coneCos = cone.x;
			const penumbraCos = cone.y;

			const lightVector = lightViewPosition.sub( surfacePosition ).toVar();
			const lightDirection = lightVector.normalize().toVar();
			const lightDistance = lightVector.length();

			const angleCos = lightDirection.dot( spotDirection );
			const spotAttenuation = smoothstep( coneCos, penumbraCos, angleCos );
			const distanceAttenuation = getDistanceAttenuation( {
				lightDistance,
				cutoffDistance,
				decayExponent
			} );

			const lightColor = this.colorsNode.element( i ).mul( spotAttenuation ).mul( distanceAttenuation ).toVar();

			lightingModel.direct( {
				lightDirection,
				lightColor,
				lightNode: { light: {}, shadowNode: null },
				reflectedLight: { directDiffuse: dynDiffuse, directSpecular: dynSpecular }
			}, builder );

		} );

		reflectedLight.directDiffuse.addAssign( dynDiffuse );
		reflectedLight.directSpecular.addAssign( dynSpecular );

	}

}

export default SpotLightDataNode;
