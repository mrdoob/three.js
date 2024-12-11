import { UVMapping } from '../../constants.js';
import { Euler } from '../../math/Euler.js';
import { Matrix4 } from '../../math/Matrix4.js';
import Node from '../core/Node.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { nodeImmutable, uniform } from '../tsl/TSLBase.js';
import { reference } from './ReferenceNode.js';

const _e1 = /*@__PURE__*/ new Euler();
const _m1 = /*@__PURE__*/ new Matrix4();

class SceneNode extends Node {

	static get type() {

		return 'SceneNode';

	}

	constructor( scope = SceneNode.BACKGROUND_BLURRINESS, scene = null ) {

		super();

		this.scope = scope;
		this.scene = scene;

	}

	setup( builder ) {

		const scope = this.scope;
		const scene = this.scene !== null ? this.scene : builder.scene;

		let output;

		if ( scope === SceneNode.BACKGROUND_BLURRINESS ) {

			output = reference( 'backgroundBlurriness', 'float', scene );

		} else if ( scope === SceneNode.BACKGROUND_INTENSITY ) {

			output = reference( 'backgroundIntensity', 'float', scene );

		} else if ( scope === SceneNode.BACKGROUND_ROTATION ) {

			output = uniform( 'mat4' ).label( 'backgroundRotation' ).setGroup( renderGroup ).onRenderUpdate( () => {

				const background = scene.background;

				if ( background !== null && background.isTexture && background.mapping !== UVMapping ) {

					_e1.copy( scene.backgroundRotation );

					// accommodate left-handed frame
					_e1.x *= - 1; _e1.y *= - 1; _e1.z *= - 1;

					_m1.makeRotationFromEuler( _e1 );

				} else {

					_m1.identity();

				}

				return _m1;

			} );

		} else {

			console.error( 'THREE.SceneNode: Unknown scope:', scope );

		}

		return output;

	}

}

SceneNode.BACKGROUND_BLURRINESS = 'backgroundBlurriness';
SceneNode.BACKGROUND_INTENSITY = 'backgroundIntensity';
SceneNode.BACKGROUND_ROTATION = 'backgroundRotation';

export default SceneNode;

export const backgroundBlurriness = /*@__PURE__*/ nodeImmutable( SceneNode, SceneNode.BACKGROUND_BLURRINESS );
export const backgroundIntensity = /*@__PURE__*/ nodeImmutable( SceneNode, SceneNode.BACKGROUND_INTENSITY );
export const backgroundRotation = /*@__PURE__*/ nodeImmutable( SceneNode, SceneNode.BACKGROUND_ROTATION );
