import { ShadowMaterial } from './ShadowMaterial.js';
import { SpriteMaterial } from './SpriteMaterial.js';
import { RawShaderMaterial } from './RawShaderMaterial.js';
import { ShaderMaterial } from './ShaderMaterial.js';
import { PointsMaterial } from './PointsMaterial.js';
import { MeshPhysicalMaterial } from './MeshPhysicalMaterial.js';
import { MeshStandardMaterial } from './MeshStandardMaterial.js';
import { MeshPhongMaterial } from './MeshPhongMaterial.js';
import { MeshToonMaterial } from './MeshToonMaterial.js';
import { MeshNormalMaterial } from './MeshNormalMaterial.js';
import { MeshLambertMaterial } from './MeshLambertMaterial.js';
import { MeshDepthMaterial } from './MeshDepthMaterial.js';
import { MeshDistanceMaterial } from './MeshDistanceMaterial.js';
import { MeshBasicMaterial } from './MeshBasicMaterial.js';
import { MeshMatcapMaterial } from './MeshMatcapMaterial.js';
import { LineDashedMaterial } from './LineDashedMaterial.js';
import { LineBasicMaterial } from './LineBasicMaterial.js';
import { Material } from './Material.js';

export {
	ShadowMaterial,
	SpriteMaterial,
	RawShaderMaterial,
	ShaderMaterial,
	PointsMaterial,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	MeshPhongMaterial,
	MeshToonMaterial,
	MeshNormalMaterial,
	MeshLambertMaterial,
	MeshDepthMaterial,
	MeshDistanceMaterial,
	MeshBasicMaterial,
	MeshMatcapMaterial,
	LineDashedMaterial,
	LineBasicMaterial,
	Material
};

const materialLib = {
	ShadowMaterial,
	SpriteMaterial,
	RawShaderMaterial,
	ShaderMaterial,
	PointsMaterial,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	MeshPhongMaterial,
	MeshToonMaterial,
	MeshNormalMaterial,
	MeshLambertMaterial,
	MeshDepthMaterial,
	MeshDistanceMaterial,
	MeshBasicMaterial,
	MeshMatcapMaterial,
	LineDashedMaterial,
	LineBasicMaterial,
	Material
};

Material.fromType = function ( type ) {

	return new materialLib[ type ]();

};
