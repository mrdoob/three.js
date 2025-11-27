import { Tab } from '../ui/Tab.js';
import { List } from '../ui/List.js';
import { Item } from '../ui/Item.js';
import { createValueSpan } from '../ui/utils.js';
import { ValueSlider, ValueCheckbox, ValueColor, ValueSelect } from '../ui/Values.js';
import { FrontSide, BackSide, DoubleSide } from 'three';

const SIDE_OPTIONS = {
	'FrontSide': FrontSide,
	'BackSide': BackSide,
	'DoubleSide': DoubleSide
};

class Materials extends Tab {

	constructor( options = {} ) {

		super( 'Materials', options );

		// Material list
		const materialList = new List( 'Material', 'Type', '#' );
		materialList.domElement.classList.add( 'materials-list' );
		materialList.setGridStyle( '1fr .8fr 40px' );

		const scrollWrapper = document.createElement( 'div' );
		scrollWrapper.className = 'list-scroll-wrapper';
		scrollWrapper.appendChild( materialList.domElement );

		// Property panel container
		const propertyPanel = document.createElement( 'div' );
		propertyPanel.className = 'materials-property-panel';

		// Shader code container
		const shaderPanel = document.createElement( 'div' );
		shaderPanel.className = 'materials-shader-panel';

		// Shader tabs
		const shaderTabs = document.createElement( 'div' );
		shaderTabs.className = 'shader-tabs';

		const vertexTab = document.createElement( 'button' );
		vertexTab.className = 'shader-tab active';
		vertexTab.textContent = 'Vertex';
		vertexTab.onclick = () => this.showShader( 'vertex' );

		const fragmentTab = document.createElement( 'button' );
		fragmentTab.className = 'shader-tab';
		fragmentTab.textContent = 'Fragment';
		fragmentTab.onclick = () => this.showShader( 'fragment' );

		shaderTabs.appendChild( vertexTab );
		shaderTabs.appendChild( fragmentTab );

		// Shader code display
		const shaderCode = document.createElement( 'pre' );
		shaderCode.className = 'shader-code';

		shaderPanel.appendChild( shaderTabs );
		shaderPanel.appendChild( shaderCode );

		// Combine all into content
		this.content.appendChild( scrollWrapper );
		this.content.appendChild( propertyPanel );
		this.content.appendChild( shaderPanel );

		// Store references
		this.materialList = materialList;
		this.propertyPanel = propertyPanel;
		this.shaderPanel = shaderPanel;
		this.shaderTabs = shaderTabs;
		this.shaderCode = shaderCode;
		this.vertexTab = vertexTab;
		this.fragmentTab = fragmentTab;

		// Data structures
		this.itemMap = new Map(); // uuid -> Item
		this.materialData = new Map(); // material -> { usageCount, objects }
		this.selectedMaterial = null;
		this.currentShaderType = 'vertex';
		this.cachedShaders = new Map(); // material.uuid -> { vertex, fragment }

		// Property editors (will be created when material is selected)
		this.propertyEditors = {};

	}

	updateFromScenes( scenes, renderer ) {

		// Collect materials from scenes
		const newMaterialData = new Map();

		for ( const scene of scenes ) {

			scene.traverse( ( object ) => {

				if ( object.material ) {

					const materials = Array.isArray( object.material ) ? object.material : [ object.material ];

					for ( const material of materials ) {

						if ( ! material.uuid ) continue;

						let data = newMaterialData.get( material );

						if ( ! data ) {

							data = { usageCount: 0, objects: [] };
							newMaterialData.set( material, data );

						}

						data.usageCount ++;
						data.objects.push( object );

					}

				}

			} );

		}

		// Update material data
		this.materialData = newMaterialData;

		// Sync UI with material data
		this.syncMaterialList();

		// Try to get shader code for selected material
		if ( this.selectedMaterial && renderer ) {

			this.updateShaderCode( renderer );

		}

	}

	syncMaterialList() {

		const existingUuids = new Set( this.itemMap.keys() );
		const currentUuids = new Set();

		// Add/update materials
		for ( const [ material, data ] of this.materialData ) {

			currentUuids.add( material.uuid );

			let item = this.itemMap.get( material.uuid );

			if ( ! item ) {

				item = this.createMaterialItem( material );
				this.itemMap.set( material.uuid, item );
				this.materialList.add( item );

			}

			// Update usage count
			const countCell = item.itemRow.children[ 2 ];
			if ( countCell ) {

				countCell.textContent = data.usageCount;

			}

		}

		// Remove materials that no longer exist
		for ( const uuid of existingUuids ) {

			if ( ! currentUuids.has( uuid ) ) {

				const item = this.itemMap.get( uuid );
				if ( item ) {

					this.materialList.remove( item );
					this.itemMap.delete( uuid );

				}

				// Clear selection if removed
				if ( this.selectedMaterial && this.selectedMaterial.uuid === uuid ) {

					this.selectedMaterial = null;
					this.clearPropertyPanel();
					this.clearShaderCode();

				}

			}

		}

	}

	createMaterialItem( material ) {

		const name = material.name || `Material_${material.id}`;
		const type = this.getMaterialTypeName( material );
		const data = this.materialData.get( material );
		const count = data ? data.usageCount : 0;

		const nameSpan = createValueSpan();
		nameSpan.textContent = name;
		nameSpan.title = name;

		const typeSpan = createValueSpan();
		typeSpan.textContent = type;
		typeSpan.title = type;

		const item = new Item( nameSpan, typeSpan, count );
		item.userData.material = material;

		// Add click handler for selection
		item.itemRow.classList.add( 'selectable' );
		item.itemRow.addEventListener( 'click', () => {

			this.selectMaterial( material );

		} );

		return item;

	}

	getMaterialTypeName( material ) {

		// Get clean type name
		let type = material.type || 'Material';

		// Shorten common suffixes
		type = type.replace( 'NodeMaterial', 'Node' );

		return type;

	}

	selectMaterial( material ) {

		// Update selection UI
		for ( const [ uuid, item ] of this.itemMap ) {

			item.itemRow.classList.toggle( 'selected', uuid === material.uuid );

		}

		this.selectedMaterial = material;
		this.updatePropertyPanel( material );

		// Clear cached shaders to force refresh
		this.cachedShaders.delete( material.uuid );
		this.clearShaderCode();

	}

	updatePropertyPanel( material ) {

		this.clearPropertyPanel();

		// Create property section
		const propertiesHeader = document.createElement( 'div' );
		propertiesHeader.className = 'materials-section-header';
		propertiesHeader.textContent = 'Properties';
		this.propertyPanel.appendChild( propertiesHeader );

		const propertiesContent = document.createElement( 'div' );
		propertiesContent.className = 'materials-properties-content';
		this.propertyPanel.appendChild( propertiesContent );

		// Add common properties
		this.addPropertyRow( propertiesContent, material, 'visible', 'checkbox' );

		if ( material.color !== undefined ) {

			this.addPropertyRow( propertiesContent, material, 'color', 'color' );

		}

		if ( material.opacity !== undefined ) {

			this.addPropertyRow( propertiesContent, material, 'opacity', 'slider', { min: 0, max: 1 } );

		}

		this.addPropertyRow( propertiesContent, material, 'transparent', 'checkbox' );

		if ( material.metalness !== undefined ) {

			this.addPropertyRow( propertiesContent, material, 'metalness', 'slider', { min: 0, max: 1 } );

		}

		if ( material.roughness !== undefined ) {

			this.addPropertyRow( propertiesContent, material, 'roughness', 'slider', { min: 0, max: 1 } );

		}

		if ( material.emissiveIntensity !== undefined ) {

			this.addPropertyRow( propertiesContent, material, 'emissiveIntensity', 'slider', { min: 0, max: 10 } );

		}

		this.addPropertyRow( propertiesContent, material, 'wireframe', 'checkbox' );
		this.addPropertyRow( propertiesContent, material, 'side', 'select', { options: SIDE_OPTIONS } );
		this.addPropertyRow( propertiesContent, material, 'depthTest', 'checkbox' );
		this.addPropertyRow( propertiesContent, material, 'depthWrite', 'checkbox' );

	}

	addPropertyRow( container, object, property, type, options = {} ) {

		if ( object[ property ] === undefined ) return;

		const row = document.createElement( 'div' );
		row.className = 'materials-property-row';

		const label = document.createElement( 'span' );
		label.className = 'materials-property-label';
		label.textContent = property;
		row.appendChild( label );

		let editor;

		switch ( type ) {

			case 'checkbox':
				editor = new ValueCheckbox( { value: object[ property ] } );
				editor.addEventListener( 'change', ( { value } ) => {

					object[ property ] = value;
					object.needsUpdate = true;

				} );
				break;

			case 'slider':
				editor = new ValueSlider( {
					value: object[ property ],
					min: options.min !== undefined ? options.min : 0,
					max: options.max !== undefined ? options.max : 1,
					step: options.step !== undefined ? options.step : 0.01
				} );
				editor.addEventListener( 'change', ( { value } ) => {

					object[ property ] = value;
					object.needsUpdate = true;

				} );
				break;

			case 'color':
				editor = new ValueColor( { value: object[ property ] } );
				editor.addEventListener( 'change', () => {

					// ValueColor updates the color object directly
					object.needsUpdate = true;

				} );
				break;

			case 'select':
				editor = new ValueSelect( { options: options.options, value: object[ property ] } );
				editor.addEventListener( 'change', ( { value } ) => {

					object[ property ] = value;
					object.needsUpdate = true;

				} );
				break;

		}

		if ( editor ) {

			row.appendChild( editor.domElement );
			this.propertyEditors[ property ] = editor;

		}

		container.appendChild( row );

	}

	clearPropertyPanel() {

		this.propertyPanel.innerHTML = '';
		this.propertyEditors = {};

	}

	updateShaderCode( renderer ) {

		if ( ! this.selectedMaterial ) return;

		const material = this.selectedMaterial;

		// Check if we already have cached shaders
		let shaders = this.cachedShaders.get( material.uuid );

		if ( ! shaders ) {

			shaders = this.extractShaderCode( renderer, material );

			if ( shaders ) {

				this.cachedShaders.set( material.uuid, shaders );

			}

		}

		if ( shaders ) {

			this.displayShaderCode( shaders );

		}

	}

	extractShaderCode( renderer, material ) {

		// Access pipelines through renderer's internal structure
		const pipelines = renderer._pipelines;

		if ( ! pipelines ) return null;

		// Look through all programs to find ones that match our material
		const programs = pipelines.programs;

		if ( ! programs ) return null;

		// Get first available vertex and fragment shaders
		// Note: The programs are stored with the shader code as the key
		let vertexCode = null;
		let fragmentCode = null;

		// Try to find shaders from the vertex and fragment program maps
		for ( const [ code, stage ] of programs.vertex ) {

			// Check if this shader is related to our material by name match
			if ( stage.name === material.name || vertexCode === null ) {

				vertexCode = code;

				// If name matches, use this one
				if ( stage.name === material.name ) break;

			}

		}

		for ( const [ code, stage ] of programs.fragment ) {

			if ( stage.name === material.name || fragmentCode === null ) {

				fragmentCode = code;

				if ( stage.name === material.name ) break;

			}

		}

		if ( vertexCode || fragmentCode ) {

			return {
				vertex: vertexCode || '// Vertex shader not available',
				fragment: fragmentCode || '// Fragment shader not available'
			};

		}

		return null;

	}

	displayShaderCode( shaders ) {

		const code = this.currentShaderType === 'vertex' ? shaders.vertex : shaders.fragment;
		this.shaderCode.textContent = code || `// ${this.currentShaderType} shader not available`;

	}

	showShader( type ) {

		this.currentShaderType = type;

		// Update tab active state
		this.vertexTab.classList.toggle( 'active', type === 'vertex' );
		this.fragmentTab.classList.toggle( 'active', type === 'fragment' );

		// Update code display
		if ( this.selectedMaterial ) {

			const shaders = this.cachedShaders.get( this.selectedMaterial.uuid );

			if ( shaders ) {

				this.displayShaderCode( shaders );

			}

		}

	}

	clearShaderCode() {

		this.shaderCode.textContent = '// Select a material to view shader code';

	}

}

export { Materials };
