import { uniform } from '../core/UniformNode.js';
import { Vector3 } from 'three';

export const cameraNear = /*#__PURE__*/ uniform( 'float' ).onRenderUpdate( ( { camera } ) => camera.near );
export const cameraFar = /*#__PURE__*/ uniform( 'float' ).onRenderUpdate( ( { camera } ) => camera.far );
export const cameraLogDepth = /*#__PURE__*/ uniform( 'float' ).onRenderUpdate( ( { camera } ) => 2.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 ) );
export const cameraProjectionMatrix = /*#__PURE__*/ uniform( 'mat4' ).onRenderUpdate( ( { camera } ) => camera.projectionMatrix );
export const cameraProjectionMatrixInverse = /*#__PURE__*/ uniform( 'mat4' ).onRenderUpdate( ( { camera } ) => camera.projectionMatrixInverse );
export const cameraViewMatrix = /*#__PURE__*/ uniform( 'mat4' ).onRenderUpdate( ( { camera } ) => camera.matrixWorldInverse );
export const cameraWorldMatrix = /*#__PURE__*/ uniform( 'mat4' ).onRenderUpdate( ( { camera } ) => camera.matrixWorld );
export const cameraNormalMatrix = /*#__PURE__*/ uniform( 'mat3' ).onRenderUpdate( ( { camera } ) => camera.normalMatrix );
export const cameraPosition = /*#__PURE__*/ uniform( new Vector3() ).onRenderUpdate( ( { camera }, self ) => self.value.setFromMatrixPosition( camera.matrixWorld ) );
