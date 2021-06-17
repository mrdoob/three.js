//Docs: https://agviegas.github.io/ifcjs-docs/#/

import * as WebIFC from './ifc/web-ifc-api.js';
import {
	FileLoader,
	Loader,
	Mesh,
	Color,
	MeshBasicMaterial,
	MeshLambertMaterial,
	DoubleSide,
	Matrix4,
	BufferGeometry,
	BufferAttribute,
} from '../../../build/three.module.js';
import {BufferGeometryUtils} from "../utils/BufferGeometryUtils.js"

const ifcAPI = new WebIFC.IfcAPI();

class IFCLoader extends Loader {

	constructor( manager ) {

		super( manager );
		this.modelID = 0;
		this.mapFaceindexID = {};
		this.mapIDGeometry = {};
		this.selectedObjects = [];
		this.highlightMaterial = new MeshBasicMaterial({ color: 0xff0000, depthTest: false, side: DoubleSide });

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load(
			url,
			async function ( buffer ) {

				try {

					onLoad( await scope.parse( buffer ) );

				} catch ( e ) {

					if ( onError ) {

						onError( e );

					} else {

						console.error( e );

					}

					scope.manager.itemError( url );

				}

			},
			onProgress,
			onError
		);

	}

	setWasmPath( path ) {

		ifcAPI.SetWasmPath( path );

	}

	getExpressId( faceIndex ) {

		for (let index in this.mapFaceindexID) {

		  if (parseInt(index) >= faceIndex) return this.mapFaceindexID[index];

		}

		return -1;
	}

	highlightItems( expressIds, scene, material = this.highlightMaterial ) {

		this.removePreviousSelection(scene);

		expressIds.forEach((id) => {

			if (!this.mapIDGeometry[id]) return;
			var mesh = new Mesh(this.mapIDGeometry[id], material);
			mesh.renderOrder = 1;
			scene.add(mesh);
			this.selectedObjects.push(mesh);
			return;

		});
	}

	removePreviousSelection( scene ) {

		if (this.selectedObjects.length > 0){

			this.selectedObjects.forEach((object) => scene.remove(object));

		} 
	}

	setItemsVisibility( expressIds, geometry, visible = false ) {

		this.setupVisibility(geometry);
		var previous = 0;

		for (var current in this.mapFaceindexID) {

			if (expressIds.includes(this.mapFaceindexID[current])) {

				for (var i = previous; i <= current; i++) this.setVertexVisibility(geometry, i, visible);

			}

			previous = current;

		}

		geometry.attributes.visibility.needsUpdate = true;

	}

	setVertexVisibility( geometry, index, visible ) {

		var isVisible = visible ? 0 : 1;
		var geoIndex = geometry.index.array;
		geometry.attributes.visibility.setX(geoIndex[3 * index], isVisible);
		geometry.attributes.visibility.setX(geoIndex[3 * index + 1], isVisible);
		geometry.attributes.visibility.setX(geoIndex[3 * index + 2], isVisible);
		
	}

	setupVisibility( geometry ) {

		if (!geometry.attributes.visibility) {

		  var visible = new Float32Array(geometry.getAttribute('position').count);
		  geometry.setAttribute('visibility', new BufferAttribute(visible, 1));

		}

	}

	getItemProperties( elementID, all = false ) {

		const properties = ifcAPI.GetLine(this.modelID, elementID);
	
		if (all) {

		  const propSetIds = this.getAllRelatedItemsOfType(elementID, WebIFC.IFCRELDEFINESBYPROPERTIES, "RelatedObjects", "RelatingPropertyDefinition");
		  properties.hasPropertySets = propSetIds.map((id) => ifcAPI.GetLine(this.modelID, id, true));
	
		  const typeId = this.getAllRelatedItemsOfType(elementID, WebIFC.IFCRELDEFINESBYTYPE, "RelatedObjects", "RelatingType");
		  properties.hasType = typeId.map((id) => ifcAPI.GetLine(this.modelID, id, true));
		  
		}
	
		// properties.type = properties.constructor.name;
		return properties;

	}

	getSpatialStructure() {

		let lines = ifcAPI.GetLineIDsWithType(this.modelID, WebIFC.IFCPROJECT);
		let ifcProjectId = lines.get(0);
		let ifcProject = ifcAPI.GetLine(this.modelID, ifcProjectId);
		this.getAllSpatialChildren(ifcProject);
		return ifcProject;

	}
	
	getAllSpatialChildren( spatialElement ) {

		const id = spatialElement.expressID;
		const spatialChildrenID = this.getAllRelatedItemsOfType(id, WebIFC.IFCRELAGGREGATES, "RelatingObject", "RelatedObjects");
		spatialElement.hasSpatialChildren = spatialChildrenID.map((id) => ifcAPI.GetLine(this.modelID, id, false));
		spatialElement.hasChildren = this.getAllRelatedItemsOfType(id, WebIFC.IFCRELCONTAINEDINSPATIALSTRUCTURE, "RelatingStructure", "RelatedElements");
		spatialElement.hasSpatialChildren.forEach(child => this.getAllSpatialChildren(child));
		
	}
	
	getAllRelatedItemsOfType ( elementID, type, relation, relatedProperty ) {

		const lines = ifcAPI.GetLineIDsWithType(this.modelID, type);
		const IDs = [];

		for (let i = 0; i < lines.size(); i++) {

		  	const relID = lines.get(i);
		  	const rel = ifcAPI.GetLine(this.modelID, relID);
		  	const relatedItems = rel[relation];
		  	let foundElement = false;
	
		  	if (Array.isArray(relatedItems)){

			  relatedItems.forEach((relID) => {

				  if (relID.value === elementID) foundElement = true;

				});
			}
			else foundElement = (relatedItems.value === elementID);
	
		  	if (foundElement) {

				var element = rel[relatedProperty];
				if (!Array.isArray(element)) IDs.push(element.value);
				else element.forEach(ele => IDs.push(ele.value))
			
		  	}
		}
		return IDs;
	}

	async parse( buffer ) {

		const geometryByMaterials = {};
		const mapIDGeometry = this.mapIDGeometry;
		const mapFaceindexID = this.mapFaceindexID;

		if ( ifcAPI.wasmModule === undefined ) {

			await ifcAPI.Init();

		}

		const data = new Uint8Array( buffer );
		this.modelID = ifcAPI.OpenModel( 'example.ifc', data );
		return loadAllGeometry( this.modelID );

		function loadAllGeometry(modelID) {

			saveAllPlacedGeometriesByMaterial(modelID);
			return generateAllGeometriesByMaterial();

		}
	
		function generateAllGeometriesByMaterial() {

			const { materials, geometries } = getMaterialsAndGeometries();
			const allGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries, true);
			return new Mesh(allGeometry, materials);

		}
	
		function getMaterialsAndGeometries() {

			const materials = [];
			const geometries = [];
			let totalFaceCount = 0;

			for (let i in geometryByMaterials) {

				materials.push(geometryByMaterials[i].material);
				const currentGeometries = geometryByMaterials[i].geometry;
				geometries.push(BufferGeometryUtils.mergeBufferGeometries(currentGeometries));

				for (let j in geometryByMaterials[i].indices) {

					const globalIndex = parseInt(j, 10) + parseInt(totalFaceCount, 10);
					mapFaceindexID[globalIndex] = geometryByMaterials[i].indices[j];

				}

				totalFaceCount += geometryByMaterials[i].lastIndex;

			}

			return { materials, geometries };

		}
	
		function saveAllPlacedGeometriesByMaterial(modelID) {

			const flatMeshes = ifcAPI.LoadAllGeometry(modelID);

			for (let i = 0; i < flatMeshes.size(); i++) {

				const flatMesh = flatMeshes.get(i);
				const productId = flatMesh.expressID;
				const placedGeometries = flatMesh.geometries;

				for (let j = 0; j < placedGeometries.size(); j++) {

					savePlacedGeometryByMaterial(modelID, placedGeometries.get(j), productId);

				}
			}
		}

		function savePlacedGeometryByMaterial(modelID, placedGeometry, productId) {

			const geometry = getBufferGeometry(modelID, placedGeometry);
			geometry.computeVertexNormals();
			const matrix = getMeshMatrix(placedGeometry.flatTransformation);
			geometry.applyMatrix4(matrix);
			storeGeometryForHighlight(productId, geometry);
			saveGeometryByMaterial(geometry, placedGeometry, productId);

		}

		function getBufferGeometry(modelID, placedGeometry) {

			const geometry = ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);
			const verts = ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
			const indices = ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
			return ifcGeometryToBuffer(verts, indices);

		}

		function getMeshMatrix(matrix) {

			const mat = new Matrix4();
			mat.fromArray(matrix);
			return mat;

		}
	
		function storeGeometryForHighlight(productId, geometry) {

			if (!mapIDGeometry[productId]) {

				mapIDGeometry[productId] = geometry;
				return;

			}

			const geometries = [mapIDGeometry[productId], geometry];
			mapIDGeometry[productId] = BufferGeometryUtils.mergeBufferGeometries(geometries, true);

		}
	
		function ifcGeometryToBuffer(vertexData, indexData) {

			const geometry = new BufferGeometry();
			const { vertices, normals } = extractVertexData(vertexData);
			geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
			geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
			geometry.setIndex(new BufferAttribute(indexData, 1));
			return geometry;

		}
	
		function extractVertexData(vertexData) {

			const vertices = [];
			const normals = [];
			let isNormalData = false;

			for (let i = 0; i < vertexData.length; i++) {

				isNormalData ? normals.push(vertexData[i]) : vertices.push(vertexData[i]);
				if ((i + 1) % 3 == 0) isNormalData = !isNormalData;

			}

			return { vertices, normals };

		}
	
		function saveGeometryByMaterial(geometry, placedGeometry, productId) {

			const color = placedGeometry.color;
			const id = `${color.x}${color.y}${color.z}${color.w}`;
			createMaterial(id, color);
			const currentGeometry = geometryByMaterials[id];
			currentGeometry.geometry.push(geometry);
			currentGeometry.lastIndex += geometry.index.count / 3;
			currentGeometry.indices[currentGeometry.lastIndex] = productId;

		}
	
		function createMaterial(id, color) {

			if (!geometryByMaterials[id]){

				const col = new Color(color.x, color.y, color.z);
				const newMaterial = new MeshLambertMaterial({ color: col, side: DoubleSide });
				newMaterial.onBeforeCompile = materialHider;
				newMaterial.transparent = color.w !== 1;
				if (newMaterial.transparent) newMaterial.opacity = color.w;
				geometryByMaterials[id] = initializeGeometryByMaterial(newMaterial);

			}
		}
	
		function initializeGeometryByMaterial(newMaterial) {

			return {
				material: newMaterial,
				geometry: [],
				indices: {},
				lastIndex: 0

			};
	  	}

		function materialHider(shader) {
			shader.vertexShader = `
			attribute float sizes;
			attribute float visibility;
			varying float vVisible;
		  ${shader.vertexShader}`.replace(
			  `#include <fog_vertex>`,
			  `#include <fog_vertex>
			  vVisible = visibility;
			`
			);
			shader.fragmentShader = `
			varying float vVisible;
		  ${shader.fragmentShader}`.replace(
			  `#include <clipping_planes_fragment>`,
			  `
			  if (vVisible > 0.5) discard;
			#include <clipping_planes_fragment>`
			);
		}
	}
}

export { IFCLoader };
