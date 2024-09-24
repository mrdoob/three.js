import TempNode from '../core/TempNode.js';
import { float, nodeObject, normalize, vec4 } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';
import { Color } from '../../math/Color.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import { cameraProjectionMatrix } from '../../nodes/accessors/Camera.js';
import { modelViewMatrix } from '../../nodes/accessors/ModelNode.js';
import { positionLocal } from '../../nodes/accessors/Position.js';
import { normalLocal } from '../../nodes/accessors/Normal.js';
import { BackSide } from '../../constants.js';

class ToonOutlineNode extends TempNode {

	static get type() {

		return 'ToonOutlineNode';

	}

	constructor( scenePassNode, colorNode, thicknessNode, alphaNode ) {

		super( 'vec4' );

		this.scenePassNode = scenePassNode;
		this.colorNode = colorNode;
		this.thicknessNode = thicknessNode;
		this.alphaNode = alphaNode;

		//

		this._camera = this.scenePassNode.camera;
		this._scene = this.scenePassNode.scene;

		this._traverseCallbackPrepare = this._prepare.bind( this );
		this._traverseCallbackRestore = this._restore.bind( this );

		this._originalMaterials = new Map();
		this._materialCache = new WeakMap();
		this._visibilityCache = new WeakMap();


		//

		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	dispose() {

		this._scene = null;

		this._originalMaterials.clear();
		this._materialCache = new WeakMap();
		this._visibilityCache = new WeakMap();

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const camera = this._camera;
		const scene = this._scene;

		const currentAutoClear = renderer.autoClear;
		const currentSceneAutoUpdate = scene.matrixWorldAutoUpdate;
		const currentSceneBackground = scene.background;
		const currentShadowMapEnabled = renderer.shadowMap.enabled;
		const currentRenderTarget = renderer.getRenderTarget();

		scene.matrixWorldAutoUpdate = false;
		scene.background = null;
		renderer.autoClear = false;
		renderer.shadowMap.enabled = false;

		scene.traverse( this._traverseCallbackPrepare );

		renderer.setRenderTarget( this.scenePassNode.renderTarget );
		renderer.render( scene, camera );

		scene.traverse( this._traverseCallbackRestore );

		this._cleanup();

		scene.matrixWorldAutoUpdate = currentSceneAutoUpdate;
		scene.background = currentSceneBackground;
		renderer.autoClear = currentAutoClear;
		renderer.shadowMap.enabled = currentShadowMapEnabled;
		renderer.setRenderTarget( currentRenderTarget );

	}

	setup() {

		return this.scenePassNode;

	}

	_cleanup() {

		this._originalMaterials.clear();

	}

	_createMaterial() {

		const material = new NodeMaterial();
		material.isMeshToonOutlineMaterial = true;
		material.name = 'Toon_Outline';
		material.side = BackSide;

		// vertex node

		const outlineNormal = normalLocal.negate();
		const mvp = cameraProjectionMatrix.mul( modelViewMatrix );

		const ratio = float( 1.0 ); // TODO: support outline thickness ratio for each vertex
		const pos = mvp.mul( vec4( positionLocal, 1.0 ) );
		const pos2 = mvp.mul( vec4( positionLocal.add( outlineNormal ), 1.0 ) );
		const norm = normalize( pos.sub( pos2 ) ); // NOTE: subtract pos2 from pos because BackSide objectNormal is negative

		material.vertexNode = pos.add( norm.mul( this.thicknessNode ).mul( pos.w ).mul( ratio ) );

		// fragment node

		material.fragmentNode = vec4( this.colorNode, this.alphaNode );

		return material;

	}

	_getOutlineMaterial( originalMaterial ) {

		const outlineMaterial = this._getOutlineMaterialFromCache( originalMaterial );

		this._originalMaterials.set( outlineMaterial.uuid, originalMaterial );

		this._updateOutlineMaterial( outlineMaterial, originalMaterial );

		return outlineMaterial;

	}

	_getOutlineMaterialFromCache( originalMaterial ) {

		let data = this._materialCache.get( originalMaterial );

		if ( data === undefined ) {

			data = {
				material: this._createMaterial(),
				used: true,
				count: 0
			};

			this._materialCache.set( originalMaterial, data );

		}

		data.used = true;

		return data.material;

	}

	_isCompatible( object ) {

		const hasMaterial = !! object.material;
		const hasNormals = ( object.geometry !== undefined ) && ( object.geometry.hasAttribute( 'normal' ) === true );

		return ( object.isMesh === true && hasMaterial === true && hasNormals === true );

	}

	_prepare( object ) {

		if ( this._isCompatible( object ) === true ) {

			const material = object.material;

			if ( Array.isArray( material ) ) {

				for ( let i = 0, il = material.length; i < il; i ++ ) {

					if ( material[ i ].isMeshToonMaterial || material[ i ].isMeshToonNodeMaterial ) {

						object.material[ i ] = this._getOutlineMaterial( material[ i ] );

					}

				}

			} else {

				if ( material.isMeshToonMaterial || material.isMeshToonNodeMaterial ) {

					object.material = this._getOutlineMaterial( material );

				}

			}

		} else {

			if ( object.material ) {

				this._visibilityCache.set( object, object.material.visible );

				object.material.visible = false;

			}

		}

	}

	_restore( object ) {

		if ( this._isCompatible( object ) === true ) {

			if ( Array.isArray( object.material ) ) {

				for ( let i = 0, il = object.material.length; i < il; i ++ ) {

					if ( object.material[ i ].isMeshToonOutlineMaterial ) {

						object.material[ i ] = this._originalMaterials.get( object.material[ i ].uuid );

					}

				}

			} else {

				if ( object.material.isMeshToonOutlineMaterial ) {

					object.material = this._originalMaterials.get( object.material.uuid );

				}

			}

		} else {

			if ( object.material ) {

				object.material.visible = this._visibilityCache.get( object );

			}

		}

	}

	_updateOutlineMaterial( material, originalMaterial ) {

		material.visible = originalMaterial.visible;

	}

}

export default ToonOutlineNode;

export const toonOutline = ( node, color = new Color( 0, 0, 0 ), thickness = 0.003, alpha = 1 ) => nodeObject( new ToonOutlineNode( nodeObject( node ), nodeObject( color ), nodeObject( thickness ), nodeObject( alpha ) ) );
