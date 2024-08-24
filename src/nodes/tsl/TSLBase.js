// Non-PURE exports list, side-effects are required here.
// TSL Base Syntax

export * from './TSLCore.js'; // float(), vec2(), vec3(), vec4(), mat3(), mat4(), Fn(), If(), element(), nodeObject(), nodeProxy(), ...
export * from '../core/UniformNode.js'; // uniform()
export * from '../core/PropertyNode.js'; // property()  <-> TODO: Seperate Material Properties in other file
export * from '../core/AssignNode.js'; // .assign()
export * from '../code/FunctionCallNode.js'; // .call()
export * from '../math/OperatorNode.js'; // .add(), .sub(), ...
export * from '../math/MathNode.js'; // abs(), floor(), ...
export * from '../math/ConditionalNode.js'; // select(), ...
export * from '../core/ContextNode.js'; // .context()
export * from '../core/VarNode.js'; // .var() -> TODO: Maybe rename .toVar() -> .var()
export * from '../core/VaryingNode.js'; // varying() -> TODO: Add vertexStage()
export * from '../display/ColorSpaceNode.js'; // .toColorSpace()
export * from '../display/ToneMappingNode.js'; // .toToneMapping()
export * from '../accessors/BufferAttributeNode.js'; // .toAttribute()
export * from '../gpgpu/ComputeNode.js'; // .compute()
export * from '../core/CacheNode.js'; // .cache()
export * from '../core/BypassNode.js'; // .bypass()
export * from '../utils/RemapNode.js'; // .remap(), .remapClamp()
export * from '../code/ExpressionNode.js'; // expression()
export * from '../utils/Discard.js'; // Discard(), Return()
export * from '../display/RenderOutputNode.js'; // .renderOutput()

export function addNodeElement( name/*, nodeElement*/ ) {

	console.warn( 'THREE.TSLBase: AddNodeElement has been removed in favor of tree-shaking. Trying add', name );

}
