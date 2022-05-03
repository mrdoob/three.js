// accessors
import CubeTextureNode from '../accessors/CubeTextureNode.js';
import InstanceNode from '../accessors/InstanceNode.js';
import ReflectNode from '../accessors/ReflectNode.js';
import SkinningNode from '../accessors/SkinningNode.js';

// display
import ColorSpaceNode from '../display/ColorSpaceNode.js';
import NormalMapNode from '../display/NormalMapNode.js';
import ToneMappingNode from '../display/ToneMappingNode.js';

// lights
import LightNode from '../lights/LightNode.js';
import LightsNode from '../lights/LightsNode.js';
import LightContextNode from '../lights/LightContextNode.js';

// utils
import MatcapUVNode from '../utils/MatcapUVNode.js';
import MaxMipLevelNode from '../utils/MaxMipLevelNode.js';
import OscNode from '../utils/OscNode.js';
import SpriteSheetUVNode from '../utils/SpriteSheetUVNode.js';
import TimerNode from '../utils/TimerNode.js';

// procedural
import CheckerNode from '../procedural/CheckerNode.js';

// fog
import FogNode from '../fog/FogNode.js';
import FogRangeNode from '../fog/FogRangeNode.js';

// shader node utils
import { nodeObject, nodeProxy, nodeImmutable } from './ShaderNode.js';

//
// Node Material Shader Syntax
//

// shader node utils

export * from './ShaderNodeBaseElements.js';

// functions

export { default as BRDF_GGX } from '../functions/BSDF/BRDF_GGX.js'; // see https://github.com/tc39/proposal-export-default-from
export { default as BRDF_Lambert } from '../functions/BSDF/BRDF_Lambert.js';
export { default as D_GGX } from '../functions/BSDF/D_GGX.js';
export { default as F_Schlick } from '../functions/BSDF/F_Schlick.js';
export { default as V_GGX_SmithCorrelated } from '../functions/BSDF/V_GGX_SmithCorrelated.js';

export { default as getDistanceAttenuation } from '../functions/light/getDistanceAttenuation.js';

export { default as getGeometryRoughness } from '../functions/material/getGeometryRoughness.js';
export { default as getRoughness } from '../functions/material/getRoughness.js';

export { default as PhysicalLightingModel } from '../functions/PhysicalLightingModel.js';

// accessors

export const cubeTexture = nodeProxy( CubeTextureNode );

export const instance = nodeProxy( InstanceNode );

export const reflectVector = nodeImmutable( ReflectNode, ReflectNode.VECTOR );
export const reflectCube = nodeImmutable( ReflectNode, ReflectNode.CUBE );

export const skinning = nodeProxy( SkinningNode );

// display

export const colorSpace = ( node, encoding ) => nodeObject( new ColorSpaceNode( null, nodeObject( node ) ).fromEncoding( encoding ) );
export const normalMap = nodeProxy( NormalMapNode );
export const toneMapping = ( mapping, exposure, color ) => nodeObject( new ToneMappingNode( mapping, nodeObject( exposure ), nodeObject( color ) ) );

// lights

export const light = nodeProxy( LightNode );
export const fromLights = ( lights ) => nodeObject( new LightsNode().fromLights( lights ) );
export const lightContext = nodeProxy( LightContextNode );

// utils

export const matcapUV = nodeImmutable( MatcapUVNode );
export const maxMipLevel = nodeProxy( MaxMipLevelNode );

export const oscSine = nodeProxy( OscNode, OscNode.SINE );
export const oscSquare = nodeProxy( OscNode, OscNode.SQUARE );
export const oscTriangle = nodeProxy( OscNode, OscNode.TRIANGLE );
export const oscSawtooth = nodeProxy( OscNode, OscNode.SAWTOOTH );

export const spritesheetUV = nodeProxy( SpriteSheetUVNode );

export const timerLocal = nodeImmutable( TimerNode, TimerNode.LOCAL );
export const timerGlobal = nodeImmutable( TimerNode, TimerNode.GLOBAL );
export const timerDelta = nodeImmutable( TimerNode, TimerNode.DELTA );

// procedural

export const checker = nodeProxy( CheckerNode );

// fog

export const fog = nodeProxy( FogNode );
export const rangeFog = nodeProxy( FogRangeNode );
