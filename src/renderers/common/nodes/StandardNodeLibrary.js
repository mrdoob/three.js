import NodeLibrary from './NodeLibrary.js';

// Materials
import { MeshPhongMaterial } from '../../../materials/MeshPhongMaterial.js';
import MeshPhongNodeMaterial from '../../../materials/nodes/MeshPhongNodeMaterial.js';
import { MeshStandardMaterial } from '../../../materials/MeshStandardMaterial.js';
import MeshStandardNodeMaterial from '../../../materials/nodes/MeshStandardNodeMaterial.js';
import { MeshPhysicalMaterial } from '../../../materials/MeshPhysicalMaterial.js';
import MeshPhysicalNodeMaterial from '../../../materials/nodes/MeshPhysicalNodeMaterial.js';
import { MeshToonMaterial } from '../../../materials/MeshToonMaterial.js';
import MeshToonNodeMaterial from '../../../materials/nodes/MeshToonNodeMaterial.js';
import { MeshBasicMaterial } from '../../../materials/MeshBasicMaterial.js';
import MeshBasicNodeMaterial from '../../../materials/nodes/MeshBasicNodeMaterial.js';
import { MeshLambertMaterial } from '../../../materials/MeshLambertMaterial.js';
import MeshLambertNodeMaterial from '../../../materials/nodes/MeshLambertNodeMaterial.js';
import { MeshNormalMaterial } from '../../../materials/MeshNormalMaterial.js';
import MeshNormalNodeMaterial from '../../../materials/nodes/MeshNormalNodeMaterial.js';
import { MeshMatcapMaterial } from '../../../materials/MeshMatcapMaterial.js';
import MeshMatcapNodeMaterial from '../../../materials/nodes/MeshMatcapNodeMaterial.js';
import { LineBasicMaterial } from '../../../materials/LineBasicMaterial.js';
import LineBasicNodeMaterial from '../../../materials/nodes/LineBasicNodeMaterial.js';
import { LineDashedMaterial } from '../../../materials/LineDashedMaterial.js';
import LineDashedNodeMaterial from '../../../materials/nodes/LineDashedNodeMaterial.js';
import { PointsMaterial } from '../../../materials/PointsMaterial.js';
import PointsNodeMaterial from '../../../materials/nodes/PointsNodeMaterial.js';
import { SpriteMaterial } from '../../../materials/SpriteMaterial.js';
import SpriteNodeMaterial from '../../../materials/nodes/SpriteNodeMaterial.js';
import { ShadowMaterial } from '../../../materials/ShadowMaterial.js';
import ShadowNodeMaterial from '../../../materials/nodes/ShadowNodeMaterial.js';
//import { MeshDepthMaterial } from '../../../materials/MeshDepthMaterial.js';
//import MeshDepthNodeMaterial from '../../../materials/nodes/MeshDepthNodeMaterial.js';
//import { MeshDistanceMaterial } from '../../../materials/MeshDistanceMaterial.js';
//import MeshDistanceNodeMaterial from '../../../materials/nodes/MeshDistanceNodeMaterial.js';

// Lights
import { PointLight } from '../../../lights/PointLight.js';
import { PointLightNode } from '../../../nodes/Nodes.js';
import { DirectionalLight } from '../../../lights/DirectionalLight.js';
import { DirectionalLightNode } from '../../../nodes/Nodes.js';
import { RectAreaLight } from '../../../lights/RectAreaLight.js';
import { RectAreaLightNode } from '../../../nodes/Nodes.js';
import { SpotLight } from '../../../lights/SpotLight.js';
import { SpotLightNode } from '../../../nodes/Nodes.js';
import { AmbientLight } from '../../../lights/AmbientLight.js';
import { AmbientLightNode } from '../../../nodes/Nodes.js';
import { HemisphereLight } from '../../../lights/HemisphereLight.js';
import { HemisphereLightNode } from '../../../nodes/Nodes.js';
import { LightProbe } from '../../../lights/LightProbe.js';
import { LightProbeNode } from '../../../nodes/Nodes.js';
import IESSpotLight from '../../../lights/webgpu/IESSpotLight.js';
import { IESSpotLightNode } from '../../../nodes/Nodes.js';

// Tone Mapping
import { LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, AgXToneMapping, NeutralToneMapping } from '../../../constants.js';
import * as TMF from '../../../nodes/display/ToneMappingFunctions.js';

// Color Space
import { LinearSRGBColorSpace, SRGBColorSpace } from '../../../constants.js';
import { getColorSpaceMethod } from '../../../nodes/display/ColorSpaceNode.js';
import * as CSF from '../../../nodes/display/ColorSpaceFunctions.js';

class StandardNodeLibrary extends NodeLibrary {

	constructor() {

		super();

		this.addMaterial( MeshPhongNodeMaterial, MeshPhongMaterial );
		this.addMaterial( MeshStandardNodeMaterial, MeshStandardMaterial );
		this.addMaterial( MeshPhysicalNodeMaterial, MeshPhysicalMaterial );
		this.addMaterial( MeshToonNodeMaterial, MeshToonMaterial );
		this.addMaterial( MeshBasicNodeMaterial, MeshBasicMaterial );
		this.addMaterial( MeshLambertNodeMaterial, MeshLambertMaterial );
		this.addMaterial( MeshNormalNodeMaterial, MeshNormalMaterial );
		this.addMaterial( MeshMatcapNodeMaterial, MeshMatcapMaterial );
		this.addMaterial( LineBasicNodeMaterial, LineBasicMaterial );
		this.addMaterial( LineDashedNodeMaterial, LineDashedMaterial );
		this.addMaterial( PointsNodeMaterial, PointsMaterial );
		this.addMaterial( SpriteNodeMaterial, SpriteMaterial );
		this.addMaterial( ShadowNodeMaterial, ShadowMaterial );

		this.addLight( PointLightNode, PointLight );
		this.addLight( DirectionalLightNode, DirectionalLight );
		this.addLight( RectAreaLightNode, RectAreaLight );
		this.addLight( SpotLightNode, SpotLight );
		this.addLight( AmbientLightNode, AmbientLight );
		this.addLight( HemisphereLightNode, HemisphereLight );
		this.addLight( LightProbeNode, LightProbe );
		this.addLight( IESSpotLightNode, IESSpotLight );

		this.addToneMapping( TMF.LinearToneMapping, LinearToneMapping );
		this.addToneMapping( TMF.ReinhardToneMapping, ReinhardToneMapping );
		this.addToneMapping( TMF.CineonToneMapping, CineonToneMapping );
		this.addToneMapping( TMF.ACESFilmicToneMapping, ACESFilmicToneMapping );
		this.addToneMapping( TMF.AgXToneMapping, AgXToneMapping );
		this.addToneMapping( TMF.NeutralToneMapping, NeutralToneMapping );

		this.addColorSpace( CSF.LinearTosRGB, getColorSpaceMethod( LinearSRGBColorSpace, SRGBColorSpace ) );
		this.addColorSpace( CSF.sRGBToLinear, getColorSpaceMethod( SRGBColorSpace, LinearSRGBColorSpace ) );

	}

}

export default StandardNodeLibrary;
