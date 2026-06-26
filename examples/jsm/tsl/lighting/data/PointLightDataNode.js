import { Color, Node, Vector3, Vector4 } from 'three/webgpu';
import { Loop, NodeUpdateType, getDistanceAttenuation, positionView, renderGroup, uniform, uniformArray, vec3 } from 'three/tsl';

const _position = /*@__PURE__*/ new Vector3();

const warn = ( message ) => {

	console.warn( `THREE.PointLightDataNode: ${ message }` );

};

/**
 * Batched data node for point lights in dynamic lighting mode.
 *
 * @augments Node
 */
class PointLightDataNode extends Node {

	static get type() {

		return 'PointLightDataNode';

	}

	constructor( maxCount = 16 ) {

		super();

		this.maxCount = maxCount;
		this._lights = [];
		this._colors = [];
		this._positionsAndCutoff = [];
		this._decays = [];

		for ( let i = 0; i < maxCount; i ++ ) {

			this._colors.push( new Color() );
			this._positionsAndCutoff.push( new Vector4() );
			this._decays.push( new Vector4() );

		}

		this.colorsNode = uniformArray( this._colors, 'color' ).setGroup( renderGroup );
		this.positionsAndCutoffNode = uniformArray( this._positionsAndCutoff, 'vec4' ).setGroup( renderGroup );
		this.decaysNode = uniformArray( this._decays, 'vec4' ).setGroup( renderGroup );
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

			this._colors[ i ].copy( light.color ).multiplyScalar( light.intensity );

			_position.setFromMatrixPosition( light.matrixWorld );
			_position.applyMatrix4( camera.matrixWorldInverse );

			const positionAndCutoff = this._positionsAndCutoff[ i ];
			positionAndCutoff.x = _position.x;
			positionAndCutoff.y = _position.y;
			positionAndCutoff.z = _position.z;
			positionAndCutoff.w = light.distance;

			this._decays[ i ].x = light.decay;

		}

	}

	setup( builder ) {

		const surfacePosition = builder.context.positionView || positionView;
		const { lightingModel, reflectedLight } = builder.context;
		const dynDiffuse = vec3( 0 ).toVar( 'dynPointDiffuse' );
		const dynSpecular = vec3( 0 ).toVar( 'dynPointSpecular' );

		Loop( this.countNode, ( { i } ) => {

			const positionAndCutoff = this.positionsAndCutoffNode.element( i );
			const lightViewPosition = positionAndCutoff.xyz;
			const cutoffDistance = positionAndCutoff.w;
			const decayExponent = this.decaysNode.element( i ).x;

			const lightVector = lightViewPosition.sub( surfacePosition ).toVar();
			const lightDirection = lightVector.normalize().toVar();
			const lightDistance = lightVector.length();

			const attenuation = getDistanceAttenuation( {
				lightDistance,
				cutoffDistance,
				decayExponent
			} );

			const lightColor = this.colorsNode.element( i ).mul( attenuation ).toVar();

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

export default PointLightDataNode;
