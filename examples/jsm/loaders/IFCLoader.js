import {
	IFCRELAGGREGATES,
	IFCRELCONTAINEDINSPATIALSTRUCTURE,
	IFCRELDEFINESBYPROPERTIES,
	IFCRELDEFINESBYTYPE,
	IFCPROJECT,
	IfcAPI,
} from "./ifc/web-ifc-api.js";
import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	Matrix4,
	Color,
	MeshLambertMaterial,
	DoubleSide,
	Group,
	Loader,
	FileLoader,
} from "../../../build/three.module.js";
import { BufferGeometryUtils } from "../utils/BufferGeometryUtils.js";

const IdAttrName = "expressID";
const merge = (geoms, createGroups = false) => {
	return BufferGeometryUtils.mergeBufferGeometries(geoms, createGroups);
};
const newFloatAttr = (data, size) => {
	return new BufferAttribute(new Float32Array(data), size);
};
const newIntAttr = (data, size) => {
	return new BufferAttribute(new Uint32Array(data), size);
};
const DEFAULT = "default";
const PropsNames = {
	aggregates: {
		name: IFCRELAGGREGATES,
		relating: "RelatingObject",
		related: "RelatedObjects",
		key: "children",
	},
	spatial: {
		name: IFCRELCONTAINEDINSPATIALSTRUCTURE,
		relating: "RelatingStructure",
		related: "RelatedElements",
		key: "children",
	},
	psets: {
		name: IFCRELDEFINESBYPROPERTIES,
		relating: "RelatingPropertyDefinition",
		related: "RelatedObjects",
		key: "hasPsets",
	},
	type: {
		name: IFCRELDEFINESBYTYPE,
		relating: "RelatingType",
		related: "RelatedObjects",
		key: "hasType",
	},
};

class IFCParser {
	constructor(state) {
		this.currentID = -1;
		this.state = state;
	}

	async parse(buffer) {
		if (this.state.api.wasmModule === undefined) await this.state.api.Init();
		this.currentID = this.newIfcModel(buffer);
		return this.loadAllGeometry();
	}

	initializeMeshBVH(computeBoundsTree, disposeBoundsTree, acceleratedRaycast) {
		this.computeBoundsTree = computeBoundsTree;
		this.disposeBoundsTree = disposeBoundsTree;
		this.acceleratedRaycast = acceleratedRaycast;
		this.setupThreeMeshBVH();
	}

	setupThreeMeshBVH() {
		if (
			!this.computeBoundsTree ||
			!this.disposeBoundsTree ||
			!this.acceleratedRaycast
		)
			return;
		BufferGeometry.prototype.computeBoundsTree = this.computeBoundsTree;
		BufferGeometry.prototype.disposeBoundsTree = this.disposeBoundsTree;
		Mesh.prototype.raycast = this.acceleratedRaycast;
	}

	applyThreeMeshBVH(geometry) {
		if (this.computeBoundsTree) geometry.computeBoundsTree();
	}

	newIfcModel(buffer) {
		const data = new Uint8Array(buffer);
		const modelID = this.state.api.OpenModel(data);
		this.state.models[modelID] = {
			modelID,
			mesh: {},
			items: {},
			types: {},
		};
		return modelID;
	}

	loadAllGeometry() {
		this.saveAllPlacedGeometriesByMaterial();
		return this.generateAllGeometriesByMaterial();
	}

	generateAllGeometriesByMaterial() {
		const { geometry, materials } = this.getGeometryAndMaterials();
		this.applyThreeMeshBVH(geometry);
		const mesh = new Mesh(geometry, materials);
		mesh.modelID = this.currentID;
		this.state.models[this.currentID].mesh = mesh;
		return mesh;
	}

	getGeometryAndMaterials() {
		const items = this.state.models[this.currentID].items;
		const mergedByMaterial = [];
		const materials = [];
		for (let materialID in items) {
			materials.push(items[materialID].material);
			const geometries = Object.values(items[materialID].geometries);
			mergedByMaterial.push(merge(geometries));
		}
		const geometry = merge(mergedByMaterial, true);
		return {
			geometry,
			materials,
		};
	}

	saveAllPlacedGeometriesByMaterial() {
		const flatMeshes = this.state.api.LoadAllGeometry(this.currentID);
		for (let i = 0; i < flatMeshes.size(); i++) {
			const flatMesh = flatMeshes.get(i);
			const placedGeom = flatMesh.geometries;
			for (let j = 0; j < placedGeom.size(); j++) {
				this.savePlacedGeometry(placedGeom.get(j), flatMesh.expressID);
			}
		}
	}

	savePlacedGeometry(placedGeometry, id) {
		const geometry = this.getBufferGeometry(placedGeometry);
		geometry.computeVertexNormals();
		const matrix = this.getMeshMatrix(placedGeometry.flatTransformation);
		geometry.applyMatrix4(matrix);
		this.saveGeometryByMaterial(geometry, placedGeometry, id);
	}

	getBufferGeometry(placed) {
		const geometry = this.state.api.GetGeometry(
			this.currentID,
			placed.geometryExpressID
		);
		const vertexData = this.getVertices(geometry);
		const indices = this.getIndices(geometry);
		const { vertices, normals } = this.extractVertexData(vertexData);
		return this.ifcGeomToBufferGeom(vertices, normals, indices);
	}

	getVertices(geometry) {
		const vData = geometry.GetVertexData();
		const vDataSize = geometry.GetVertexDataSize();
		return this.state.api.GetVertexArray(vData, vDataSize);
	}

	getIndices(geometry) {
		const iData = geometry.GetIndexData();
		const iDataSize = geometry.GetIndexDataSize();
		return this.state.api.GetIndexArray(iData, iDataSize);
	}

	getMeshMatrix(matrix) {
		const mat = new Matrix4();
		mat.fromArray(matrix);
		return mat;
	}

	ifcGeomToBufferGeom(vertices, normals, indexData) {
		const geometry = new BufferGeometry();
		geometry.setAttribute("position", newFloatAttr(vertices, 3));
		geometry.setAttribute("normal", newFloatAttr(normals, 3));
		geometry.setIndex(new BufferAttribute(indexData, 1));
		return geometry;
	}

	extractVertexData(vertexData) {
		const vertices = [];
		const normals = [];
		let isNormalData = false;
		for (let i = 0; i < vertexData.length; i++) {
			isNormalData ? normals.push(vertexData[i]) : vertices.push(vertexData[i]);
			if ((i + 1) % 3 == 0) isNormalData = !isNormalData;
		}
		return {
			vertices,
			normals,
		};
	}

	saveGeometryByMaterial(geom, placedGeom, id) {
		const color = placedGeom.color;
		const colorID = `${color.x}${color.y}${color.z}${color.w}`;
		this.storeGeometryAttribute(id, geom);
		this.createMaterial(colorID, color);
		const item = this.state.models[this.currentID].items[colorID];
		const currentGeom = item.geometries[id];
		if (!currentGeom) return (item.geometries[id] = geom);
		const merged = merge([currentGeom, geom]);
		item.geometries[id] = merged;
	}

	storeGeometryAttribute(id, geometry) {
		const size = geometry.attributes.position.count;
		const idAttribute = new Array(size).fill(id);
		geometry.setAttribute(IdAttrName, newIntAttr(idAttribute, 1));
	}

	createMaterial(colorID, color) {
		const items = this.state.models[this.currentID].items;
		if (items[colorID]) return;
		const col = new Color(color.x, color.y, color.z);
		const newMaterial = new MeshLambertMaterial({
			color: col,
			side: DoubleSide,
		});
		newMaterial.transparent = color.w !== 1;
		if (newMaterial.transparent) newMaterial.opacity = color.w;
		items[colorID] = {
			material: newMaterial,
			geometries: {},
		};
	}
}

class SubsetManager {
	constructor(state) {
		this.state = state;
		this.selected = {};
	}

	getSubset(modelID, material) {
		const currentMat = this.matIDNoConfig(modelID, material);
		if (!this.selected[currentMat]) return null;
		return this.selected[currentMat].mesh;
	}

	removeSubset(modelID, scene, material) {
		const currentMat = this.matIDNoConfig(modelID, material);
		if (!this.selected[currentMat]) return;
		if (scene) scene.remove(this.selected[currentMat].mesh);
		delete this.selected[currentMat];
	}

	createSubset(config) {
		if (!this.isConfigValid(config)) return;
		if (this.isPreviousSelection(config)) return;
		if (this.isEasySelection(config))
			return this.addToPreviousSelection(config);
		this.updatePreviousSelection(config.scene, config);
		return this.createSelectionInScene(config);
	}

	createSelectionInScene(config) {
		const filtered = this.filter(config);
		const { geomsByMaterial, materials } = this.getGeomAndMat(filtered);
		const hasDefaultMaterial = this.matID(config) == DEFAULT;
		const geometry = merge(geomsByMaterial, hasDefaultMaterial);
		const mats = hasDefaultMaterial ? materials : config.material;
		const mesh = new Mesh(geometry, mats);
		this.selected[this.matID(config)].mesh = mesh;
		mesh.modelID = config.modelID;
		config.scene.add(mesh);
		return mesh;
	}

	isConfigValid(config) {
		return (
			this.isValid(config.scene) &&
			this.isValid(config.modelID) &&
			this.isValid(config.ids) &&
			this.isValid(config.removePrevious)
		);
	}

	isValid(item) {
		return item != undefined && item != null;
	}

	getGeomAndMat(filtered) {
		const geomsByMaterial = [];
		const materials = [];
		for (let matID in filtered) {
			const geoms = Object.values(filtered[matID].geometries);
			if (!geoms.length) continue;
			materials.push(filtered[matID].material);
			if (geoms.length > 1) geomsByMaterial.push(merge(geoms));
			else geomsByMaterial.push(...geoms);
		}
		return {
			geomsByMaterial,
			materials,
		};
	}

	updatePreviousSelection(scene, config) {
		const previous = this.selected[this.matID(config)];
		if (!previous) return this.newSelectionGroup(config);
		scene.remove(previous.mesh);
		config.removePrevious
			? (previous.ids = new Set(config.ids))
			: config.ids.forEach((id) => previous.ids.add(id));
	}

	newSelectionGroup(config) {
		this.selected[this.matID(config)] = {
			ids: new Set(config.ids),
			mesh: {},
		};
	}

	isPreviousSelection(config) {
		if (!this.selected[this.matID(config)]) return false;
		if (this.containsIds(config)) return true;
		const previousIds = this.selected[this.matID(config)].ids;
		return JSON.stringify(config.ids) === JSON.stringify(previousIds);
	}

	containsIds(config) {
		const newIds = config.ids;
		const previous = Array.from(this.selected[this.matID(config)].ids);
		return newIds.every(
			(
				(i) => (v) =>
					(i = previous.indexOf(v, i) + 1)
			)(0)
		);
	}

	addToPreviousSelection(config) {
		const previous = this.selected[this.matID(config)];
		const filtered = this.filter(config);
		const geometries = Object.values(filtered)
			.map((i) => Object.values(i.geometries))
			.flat();
		const previousGeom = previous.mesh.geometry;
		previous.mesh.geometry = merge([previousGeom, ...geometries]);
		config.ids.forEach((id) => previous.ids.add(id));
	}

	filter(config) {
		const items = this.state.models[config.modelID].items;
		const filtered = {};
		for (let matID in items) {
			filtered[matID] = {
				material: items[matID].material,
				geometries: this.filterGeometries(
					new Set(config.ids),
					items[matID].geometries
				),
			};
		}
		return filtered;
	}

	filterGeometries(selectedIDs, geometries) {
		const ids = Array.from(selectedIDs);
		return Object.keys(geometries)
			.filter((key) => ids.includes(parseInt(key, 10)))
			.reduce((obj, key) => {
				return {
					...obj,
					[key]: geometries[key],
				};
			}, {});
	}

	isEasySelection(config) {
		const matID = this.matID(config);
		const def = this.matIDNoConfig(config.modelID);
		if (!config.removePrevious && matID != def && this.selected[matID])
			return true;
	}

	matID(config) {
		if (!config.material) return DEFAULT;
		const name = config.material.uuid || DEFAULT;
		return name.concat(" - ").concat(config.modelID.toString());
	}

	matIDNoConfig(modelID, material) {
		let name = DEFAULT;
		if (material) name = material.uuid;
		return name.concat(" - ").concat(modelID.toString());
	}
}

const IfcElements = {
	103090709: "IFCPROJECT",
	4097777520: "IFCSITE",
	4031249490: "IFCBUILDING",
	3124254112: "IFCBUILDINGSTOREY",
	3856911033: "IFCSPACE",
	25142252: "IFCCONTROLLER",
	32344328: "IFCBOILER",
	76236018: "IFCLAMP",
	90941305: "IFCPUMP",
	177149247: "IFCAIRTERMINALBOX",
	182646315: "IFCFLOWINSTRUMENT",
	263784265: "IFCFURNISHINGELEMENT",
	264262732: "IFCELECTRICGENERATOR",
	277319702: "IFCAUDIOVISUALAPPLIANCE",
	310824031: "IFCPIPEFITTING",
	331165859: "IFCSTAIR",
	342316401: "IFCDUCTFITTING",
	377706215: "IFCMECHANICALFASTENER",
	395920057: "IFCDOOR",
	402227799: "IFCELECTRICMOTOR",
	413509423: "IFCSYSTEMFURNITUREELEMENT",
	484807127: "IFCEVAPORATOR",
	486154966: "IFCWINDOWSTANDARDCASE",
	629592764: "IFCLIGHTFIXTURE",
	630975310: "IFCUNITARYCONTROLELEMENT",
	635142910: "IFCCABLECARRIERFITTING",
	639361253: "IFCCOIL",
	647756555: "IFCFASTENER",
	707683696: "IFCFLOWSTORAGEDEVICE",
	738039164: "IFCPROTECTIVEDEVICE",
	753842376: "IFCBEAM",
	812556717: "IFCTANK",
	819412036: "IFCFILTER",
	843113511: "IFCCOLUMN",
	862014818: "IFCELECTRICDISTRIBUTIONBOARD",
	900683007: "IFCFOOTING",
	905975707: "IFCCOLUMNSTANDARDCASE",
	926996030: "IFCVOIDINGFEATURE",
	979691226: "IFCREINFORCINGBAR",
	987401354: "IFCFLOWSEGMENT",
	1003880860: "IFCELECTRICTIMECONTROL",
	1051757585: "IFCCABLEFITTING",
	1052013943: "IFCDISTRIBUTIONCHAMBERELEMENT",
	1062813311: "IFCDISTRIBUTIONCONTROLELEMENT",
	1073191201: "IFCMEMBER",
	1095909175: "IFCBUILDINGELEMENTPROXY",
	1156407060: "IFCPLATESTANDARDCASE",
	1162798199: "IFCSWITCHINGDEVICE",
	1329646415: "IFCSHADINGDEVICE",
	1335981549: "IFCDISCRETEACCESSORY",
	1360408905: "IFCDUCTSILENCER",
	1404847402: "IFCSTACKTERMINAL",
	1426591983: "IFCFIRESUPPRESSIONTERMINAL",
	1437502449: "IFCMEDICALDEVICE",
	1509553395: "IFCFURNITURE",
	1529196076: "IFCSLAB",
	1620046519: "IFCTRANSPORTELEMENT",
	1634111441: "IFCAIRTERMINAL",
	1658829314: "IFCENERGYCONVERSIONDEVICE",
	1677625105: "IFCCIVILELEMENT",
	1687234759: "IFCPILE",
	1904799276: "IFCELECTRICAPPLIANCE",
	1911478936: "IFCMEMBERSTANDARDCASE",
	1945004755: "IFCDISTRIBUTIONELEMENT",
	1973544240: "IFCCOVERING",
	1999602285: "IFCSPACEHEATER",
	2016517767: "IFCROOF",
	2056796094: "IFCAIRTOAIRHEATRECOVERY",
	2058353004: "IFCFLOWCONTROLLER",
	2068733104: "IFCHUMIDIFIER",
	2176052936: "IFCJUNCTIONBOX",
	2188021234: "IFCFLOWMETER",
	2223149337: "IFCFLOWTERMINAL",
	2262370178: "IFCRAILING",
	2272882330: "IFCCONDENSER",
	2295281155: "IFCPROTECTIVEDEVICETRIPPINGUNIT",
	2320036040: "IFCREINFORCINGMESH",
	2347447852: "IFCTENDONANCHOR",
	2391383451: "IFCVIBRATIONISOLATOR",
	2391406946: "IFCWALL",
	2474470126: "IFCMOTORCONNECTION",
	2769231204: "IFCVIRTUALELEMENT",
	2814081492: "IFCENGINE",
	2906023776: "IFCBEAMSTANDARDCASE",
	2938176219: "IFCBURNER",
	2979338954: "IFCBUILDINGELEMENTPART",
	3024970846: "IFCRAMP",
	3026737570: "IFCTUBEBUNDLE",
	3027962421: "IFCSLABSTANDARDCASE",
	3040386961: "IFCDISTRIBUTIONFLOWELEMENT",
	3053780830: "IFCSANITARYTERMINAL",
	3079942009: "IFCOPENINGSTANDARDCASE",
	3087945054: "IFCALARM",
	3101698114: "IFCSURFACEFEATURE",
	3127900445: "IFCSLABELEMENTEDCASE",
	3132237377: "IFCFLOWMOVINGDEVICE",
	3171933400: "IFCPLATE",
	3221913625: "IFCCOMMUNICATIONSAPPLIANCE",
	3242481149: "IFCDOORSTANDARDCASE",
	3283111854: "IFCRAMPFLIGHT",
	3296154744: "IFCCHIMNEY",
	3304561284: "IFCWINDOW",
	3310460725: "IFCELECTRICFLOWSTORAGEDEVICE",
	3319311131: "IFCHEATEXCHANGER",
	3415622556: "IFCFAN",
	3420628829: "IFCSOLARDEVICE",
	3493046030: "IFCGEOGRAPHICELEMENT",
	3495092785: "IFCCURTAINWALL",
	3508470533: "IFCFLOWTREATMENTDEVICE",
	3512223829: "IFCWALLSTANDARDCASE",
	3518393246: "IFCDUCTSEGMENT",
	3571504051: "IFCCOMPRESSOR",
	3588315303: "IFCOPENINGELEMENT",
	3612865200: "IFCPIPESEGMENT",
	3640358203: "IFCCOOLINGTOWER",
	3651124850: "IFCPROJECTIONELEMENT",
	3694346114: "IFCOUTLET",
	3747195512: "IFCEVAPORATIVECOOLER",
	3758799889: "IFCCABLECARRIERSEGMENT",
	3824725483: "IFCTENDON",
	3825984169: "IFCTRANSFORMER",
	3902619387: "IFCCHILLER",
	4074379575: "IFCDAMPER",
	4086658281: "IFCSENSOR",
	4123344466: "IFCELEMENTASSEMBLY",
	4136498852: "IFCCOOLEDBEAM",
	4156078855: "IFCWALLELEMENTEDCASE",
	4175244083: "IFCINTERCEPTOR",
	4207607924: "IFCVALVE",
	4217484030: "IFCCABLESEGMENT",
	4237592921: "IFCWASTETERMINAL",
	4252922144: "IFCSTAIRFLIGHT",
	4278956645: "IFCFLOWFITTING",
	4288193352: "IFCACTUATOR",
	4292641817: "IFCUNITARYEQUIPMENT",
};

class PropertyManager {
	constructor(state) {
		this.state = state;
	}

	getExpressId(geometry, faceIndex) {
		if (!geometry.index) return;
		const geoIndex = geometry.index.array;
		return geometry.attributes[IdAttrName].getX(geoIndex[3 * faceIndex]);
	}

	getItemProperties(modelID, id, recursive = false) {
		return this.state.api.GetLine(modelID, id, recursive);
	}

	getAllItemsOfType(modelID, type, verbose) {
		const items = [];
		const lines = this.state.api.GetLineIDsWithType(modelID, type);
		for (let i = 0; i < lines.size(); i++) items.push(lines.get(i));
		if (verbose) return items.map((id) => this.state.api.GetLine(modelID, id));
		return items;
	}

	getPropertySets(modelID, elementID, recursive = false) {
		const propSetIds = this.getAllRelatedItemsOfType(
			modelID,
			elementID,
			PropsNames.psets
		);
		return propSetIds.map((id) =>
			this.state.api.GetLine(modelID, id, recursive)
		);
	}

	getTypeProperties(modelID, elementID, recursive = false) {
		const typeId = this.getAllRelatedItemsOfType(
			modelID,
			elementID,
			PropsNames.type
		);
		return typeId.map((id) => this.state.api.GetLine(modelID, id, recursive));
	}

	getSpatialStructure(modelID) {
		const chunks = this.getSpatialTreeChunks(modelID);
		const projectID = this.state.api
			.GetLineIDsWithType(modelID, IFCPROJECT)
			.get(0);
		const project = this.newIfcProject(projectID);
		this.getSpatialNode(modelID, project, chunks);
		return project;
	}

	newIfcProject(id) {
		return {
			expressID: id,
			type: "IFCPROJECT",
			children: [],
		};
	}

	getSpatialTreeChunks(modelID) {
		const treeChunks = {};
		this.getChunks(modelID, treeChunks, PropsNames.aggregates);
		this.getChunks(modelID, treeChunks, PropsNames.spatial);
		return treeChunks;
	}

	getChunks(modelID, chunks, propNames) {
		const relation = this.state.api.GetLineIDsWithType(modelID, propNames.name);
		for (let i = 0; i < relation.size(); i++) {
			const rel = this.state.api.GetLine(modelID, relation.get(i), false);
			const relating = rel[propNames.relating].value;
			const related = rel[propNames.related].map((r) => r.value);
			if (chunks[relating] == undefined) {
				chunks[relating] = related;
			} else {
				chunks[relating] = chunks[relating].concat(related);
			}
		}
	}

	getSpatialNode(modelID, node, treeChunks) {
		this.getChildren(modelID, node, treeChunks, PropsNames.aggregates);
		this.getChildren(modelID, node, treeChunks, PropsNames.spatial);
	}

	getChildren(modelID, node, treeChunks, propNames) {
		const children = treeChunks[node.expressID];
		if (children == undefined || children == null) return;
		const prop = propNames.key;
		node[prop] = children.map((child) => {
			const node = this.newNode(modelID, child);
			this.getSpatialNode(modelID, node, treeChunks);
			return node;
		});
	}

	newNode(modelID, id) {
		const typeID = this.state.models[modelID].types[id].toString();
		const typeName = IfcElements[typeID];
		return {
			expressID: id,
			type: typeName,
			children: [],
		};
	}

	getAllRelatedItemsOfType(modelID, id, propNames) {
		const lines = this.state.api.GetLineIDsWithType(modelID, propNames.name);
		const IDs = [];
		for (let i = 0; i < lines.size(); i++) {
			const rel = this.state.api.GetLine(modelID, lines.get(i));
			const isRelated = this.isRelated(id, rel, propNames);
			if (isRelated) this.getRelated(rel, propNames, IDs);
		}
		return IDs;
	}

	getRelated(rel, propNames, IDs) {
		const element = rel[propNames.relating];
		if (!Array.isArray(element)) IDs.push(element.value);
		else element.forEach((ele) => IDs.push(ele.value));
	}

	isRelated(id, rel, propNames) {
		const relatedItems = rel[propNames.related];
		if (Array.isArray(relatedItems)) {
			const values = relatedItems.map((item) => item.value);
			return values.includes(id);
		}
		return relatedItems.value === id;
	}
}

class TypeManager {
	constructor(state) {
		this.state = state;
	}

	getAllTypes() {
		for (let modelID in this.state.models) {
			const types = this.state.models[modelID].types;
			if (Object.keys(types).length == 0)
				this.getAllTypesOfModel(parseInt(modelID));
		}
	}

	getAllTypesOfModel(modelID) {
		this.state.models[modelID].types;
		const elements = Object.keys(IfcElements).map((e) => parseInt(e));
		const types = this.state.models[modelID].types;
		elements.forEach((type) => {
			const lines = this.state.api.GetLineIDsWithType(modelID, type);
			for (let i = 0; i < lines.size(); i++) types[lines.get(i)] = type;
		});
	}
}

let modelIdCounter = 0;

class IFCModel extends Group {
	constructor(mesh, ifc) {
		super();
		this.mesh = mesh;
		this.ifc = ifc;
		this.modelID = modelIdCounter++;
	}

	setWasmPath(path) {
		this.ifc.setWasmPath(path);
	}

	close(scene) {
		this.ifc.close(this.modelID, scene);
	}

	getExpressId(geometry, faceIndex) {
		return this.ifc.getExpressId(geometry, faceIndex);
	}

	getAllItemsOfType(type, verbose) {
		return this.ifc.getAllItemsOfType(this.modelID, type, verbose);
	}

	getItemProperties(id, recursive = false) {
		return this.ifc.getItemProperties(this.modelID, id, recursive);
	}

	getPropertySets(id, recursive = false) {
		return this.ifc.getPropertySets(this.modelID, id, recursive);
	}

	getTypeProperties(id, recursive = false) {
		return this.ifc.getTypeProperties(this.modelID, id, recursive);
	}

	getIfcType(id) {
		return this.ifc.getIfcType(this.modelID, id);
	}

	getSpatialStructure() {
		return this.ifc.getSpatialStructure(this.modelID);
	}

	getSubset(material) {
		return this.ifc.getSubset(this.modelID, material);
	}

	removeSubset(scene, material) {
		this.ifc.removeSubset(this.modelID, scene, material);
	}

	createSubset(config) {
		const modelConfig = {
			...config,
			modelID: this.modelID,
		};
		return this.ifc.createSubset(modelConfig);
	}
}

class IFCManager {
	constructor() {
		this.state = {
			models: [],
			api: new IfcAPI(),
		};
		this.parser = new IFCParser(this.state);
		this.subsets = new SubsetManager(this.state);
		this.properties = new PropertyManager(this.state);
		this.types = new TypeManager(this.state);
	}

	async parse(buffer) {
		const mesh = await this.parser.parse(buffer);
		this.types.getAllTypes();
		return new IFCModel(mesh, this);
	}

	setWasmPath(path) {
		this.state.api.SetWasmPath(path);
	}

	setupThreeMeshBVH(computeBoundsTree, disposeBoundsTree, acceleratedRaycast) {
		this.parser.initializeMeshBVH(
			computeBoundsTree,
			disposeBoundsTree,
			acceleratedRaycast
		);
	}

	close(modelID, scene) {
		this.state.api.CloseModel(modelID);
		if (scene) scene.remove(this.state.models[modelID].mesh);
		delete this.state.models[modelID];
	}

	getExpressId(geometry, faceIndex) {
		return this.properties.getExpressId(geometry, faceIndex);
	}

	getAllItemsOfType(modelID, type, verbose) {
		return this.properties.getAllItemsOfType(modelID, type, verbose);
	}

	getItemProperties(modelID, id, recursive = false) {
		return this.properties.getItemProperties(modelID, id, recursive);
	}

	getPropertySets(modelID, id, recursive = false) {
		return this.properties.getPropertySets(modelID, id, recursive);
	}

	getTypeProperties(modelID, id, recursive = false) {
		return this.properties.getTypeProperties(modelID, id, recursive);
	}

	getIfcType(modelID, id) {
		const typeID = this.state.models[modelID].types[id];
		return IfcElements[typeID.toString()];
	}

	getSpatialStructure(modelID) {
		return this.properties.getSpatialStructure(modelID);
	}

	getSubset(modelID, material) {
		return this.subsets.getSubset(modelID, material);
	}

	removeSubset(modelID, scene, material) {
		this.subsets.removeSubset(modelID, scene, material);
	}

	createSubset(config) {
		return this.subsets.createSubset(config);
	}
}

class IFCLoader extends Loader {
	constructor(manager) {
		super(manager);
		this.ifcManager = new IFCManager();
	}

	load(url, onLoad, onProgress, onError) {
		const scope = this;
		const loader = new FileLoader(scope.manager);
		loader.setPath(scope.path);
		loader.setResponseType("arraybuffer");
		loader.setRequestHeader(scope.requestHeader);
		loader.setWithCredentials(scope.withCredentials);
		loader.load(
			url,
			async function (buffer) {
				try {
					if (typeof buffer == "string") {
						throw new Error("IFC files must be given as a buffer!");
					}
					onLoad(await scope.parse(buffer));
				} catch (e) {
					if (onError) {
						onError(e);
					} else {
						console.error(e);
					}
					scope.manager.itemError(url);
				}
			},
			onProgress,
			onError
		);
	}

	parse(buffer) {
		return this.ifcManager.parse(buffer);
	}
}

export { IFCLoader };
//# sourceMappingURL=IFCLoader.js.map
