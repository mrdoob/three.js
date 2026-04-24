import NodeLibrary from '../../common/nodes/NodeLibrary.js';

// Materials
import MeshPhongNodeMaterial from '../../../materials/nodes/MeshPhongNodeMaterial.js';
import MeshStandardNodeMaterial from '../../../materials/nodes/MeshStandardNodeMaterial.js';
import MeshPhysicalNodeMaterial from '../../../materials/nodes/MeshPhysicalNodeMaterial.js';
import MeshToonNodeMaterial from '../../../materials/nodes/MeshToonNodeMaterial.js';
import MeshBasicNodeMaterial from '../../../materials/nodes/MeshBasicNodeMaterial.js';
import MeshLambertNodeMaterial from '../../../materials/nodes/MeshLambertNodeMaterial.js';
import MeshNormalNodeMaterial from '../../../materials/nodes/MeshNormalNodeMaterial.js';
import MeshMatcapNodeMaterial from '../../../materials/nodes/MeshMatcapNodeMaterial.js';
import LineBasicNodeMaterial from '../../../materials/nodes/LineBasicNodeMaterial.js';
import LineDashedNodeMaterial from '../../../materials/nodes/LineDashedNodeMaterial.js';
import PointsNodeMaterial from '../../../materials/nodes/PointsNodeMaterial.js';
import SpriteNodeMaterial from '../../../materials/nodes/SpriteNodeMaterial.js';
import ShadowNodeMaterial from '../../../materials/nodes/ShadowNodeMaterial.js';
//import { MeshDepthMaterial } from '../../../materials/MeshDepthMaterial.js';
//import MeshDepthNodeMaterial from '../../../materials/nodes/MeshDepthNodeMaterial.js';
//import { MeshDistanceMaterial } from '../../../materials/MeshDistanceMaterial.js';
//import MeshDistanceNodeMaterial from '../../../materials/nodes/MeshDistanceNodeMaterial.js';

// Lights
import { PointLight } from '../../../lights/PointLight.js';
import { DirectionalLight } from '../../../lights/DirectionalLight.js';
import { RectAreaLight } from '../../../lights/RectAreaLight.js';
import { SpotLight } from '../../../lights/SpotLight.js';
import { AmbientLight } from '../../../lights/AmbientLight.js';
import { HemisphereLight } from '../../../lights/HemisphereLight.js';
import { LightProbe } from '../../../lights/LightProbe.js';
import IESSpotLight from '../../../lights/webgpu/IESSpotLight.js';
import ProjectorLight from '../../../lights/webgpu/ProjectorLight.js';
import {
	PointLightNode,
	DirectionalLightNode,
	RectAreaLightNode,
	SpotLightNode,
	AmbientLightNode,
	HemisphereLightNode,
	LightProbeNode,
	IESSpotLightNode,
	ProjectorLightNode
} from '../../../nodes/Nodes.js';

// Tone Mapping
import { LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, AgXToneMapping, NeutralToneMapping } from '../../../constants.js';
import { linearToneMapping, reinhardToneMapping, cineonToneMapping, acesFilmicToneMapping, agxToneMapping, neutralToneMapping } from '../../../nodes/display/ToneMappingFunctions.js';

/**
 * This version of a node library represents the standard version
 * used in {@link WebGPURenderer}. It maps lights, tone mapping
 * techniques and materials to node-based implementations.
 *
 * @private
 * @augments NodeLibrary
 */
class StandardNodeLibrary extends NodeLibrary {

	/**
	 * Constructs a new standard node library.
	 */
	constructor() {

		super();

		this.addMaterial( MeshPhongNodeMaterial, 'MeshPhongMaterial' );
		this.addMaterial( MeshStandardNodeMaterial, 'MeshStandardMaterial' );
		this.addMaterial( MeshPhysicalNodeMaterial, 'MeshPhysicalMaterial' );
		this.addMaterial( MeshToonNodeMaterial, 'MeshToonMaterial' );
		this.addMaterial( MeshBasicNodeMaterial, 'MeshBasicMaterial' );
		this.addMaterial( MeshLambertNodeMaterial, 'MeshLambertMaterial' );
		this.addMaterial( MeshNormalNodeMaterial, 'MeshNormalMaterial' );
		this.addMaterial( MeshMatcapNodeMaterial, 'MeshMatcapMaterial' );
		this.addMaterial( LineBasicNodeMaterial, 'LineBasicMaterial' );
		this.addMaterial( LineDashedNodeMaterial, 'LineDashedMaterial' );
		this.addMaterial( PointsNodeMaterial, 'PointsMaterial' );
		this.addMaterial( SpriteNodeMaterial, 'SpriteMaterial' );
		this.addMaterial( ShadowNodeMaterial, 'ShadowMaterial' );

		this.addLight( PointLightNode, PointLight );
		this.addLight( DirectionalLightNode, DirectionalLight );
		this.addLight( RectAreaLightNode, RectAreaLight );
		this.addLight( SpotLightNode, SpotLight );
		this.addLight( AmbientLightNode, AmbientLight );
		this.addLight( HemisphereLightNode, HemisphereLight );
		this.addLight( LightProbeNode, LightProbe );
		this.addLight( IESSpotLightNode, IESSpotLight );
		this.addLight( ProjectorLightNode, ProjectorLight );

		this.addToneMapping( linearToneMapping, LinearToneMapping );
		this.addToneMapping( reinhardToneMapping, ReinhardToneMapping );
		this.addToneMapping( cineonToneMapping, CineonToneMapping );
		this.addToneMapping( acesFilmicToneMapping, ACESFilmicToneMapping );
		this.addToneMapping( agxToneMapping, AgXToneMapping );
		this.addToneMapping( neutralToneMapping, NeutralToneMapping );

	}

}

export default StandardNodeLibrary;
