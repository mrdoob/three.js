import { GoogleGenAI } from '@google/genai';
import * as Commands from './commands/Commands.js';
import { Vector3, BoxGeometry, SphereGeometry, MeshStandardMaterial, Mesh, DirectionalLight, PointLight, AmbientLight, Color, CylinderGeometry } from 'three';

class Agent {

	constructor( editor ) {

		this.editor = editor;
		this.container = new THREE.Group();
		this.dom = document.createElement( 'div' );
		this.dom.id = 'agent';
		this.lastModifiedObject = null; // Track last modified object

		// Create UI elements
		this.createUI();

		// Initialize signals
		this.signals = {
			agentResponse: new signals.Signal(),
			agentThinking: new signals.Signal()
		};

		// Bind methods
		this.processQuery = this.processQuery.bind( this );
		this.executeCommand = this.executeCommand.bind( this );
		this.generateRandomColor = this.generateRandomColor.bind( this );
		this.generateUniqueObjectName = this.generateUniqueObjectName.bind( this );

		this.editor.signals.storageLoaded.add( () => {

			this.init();

		} );

	}

	generateUniqueObjectName( baseName ) {

		const scene = this.editor.scene;
		let counter = 1;
		let name;

		// Keep incrementing counter until we find an unused name
		do {

			name = `${baseName}${counter}`;
			counter ++;

		} while ( scene.getObjectByName( name ) !== undefined );

		return name;

	}

	generateRandomColor() {

		const randomHex = Math.floor( Math.random() * 16777215 ).toString( 16 );
		return '#' + randomHex.padStart( 6, '0' );

	}

	createUI() {

		// Create message bubble
		const messageBubble = document.createElement( 'div' );
		messageBubble.style.display = 'none';
		messageBubble.style.padding = '8px 12px';
		messageBubble.style.borderRadius = '4px';
		messageBubble.style.marginBottom = '8px';
		messageBubble.style.fontSize = '14px';
		messageBubble.style.position = 'relative';
		messageBubble.style.maxHeight = '400px'; // Add max height
		messageBubble.style.overflowY = 'auto'; // Add vertical scrollbar when needed

		// Add message container first
		const messageContainer = document.createElement( 'div' );
		messageContainer.className = 'message-text';
		messageContainer.style.marginRight = '20px'; // Make space for the close button
		messageContainer.style.whiteSpace = 'pre-wrap';
		messageBubble.appendChild( messageContainer );

		// Add close button
		const closeButton = document.createElement( 'div' );
		closeButton.innerHTML = '×';
		closeButton.style.position = 'absolute';
		closeButton.style.top = '8px';
		closeButton.style.right = '8px';
		closeButton.style.cursor = 'pointer';
		closeButton.style.fontSize = '18px';
		closeButton.style.lineHeight = '14px';
		closeButton.style.zIndex = '1';
		closeButton.onclick = () => {

			messageBubble.style.display = 'none';

		};

		messageBubble.appendChild( closeButton );

		// Create input area
		const input = document.createElement( 'textarea' );
		input.placeholder = 'What do you want to do?';

		// Prevent keyboard shortcuts when focused
		input.addEventListener( 'keydown', ( e ) => {

			e.stopPropagation();

			if ( e.key === 'Enter' ) {

				if ( e.shiftKey ) {

					// Allow Shift+Enter for newlines
					return;

				}

				e.preventDefault();
				executeQuery();

			}

		} );

		// Create submit button
		const button = document.createElement( 'button' );
		button.textContent = 'SEND';

		const executeQuery = async () => {

			if ( button.disabled || ! input.value.trim() ) return;

			button.disabled = true;
			input.disabled = true;

			await this.processQuery( input.value );

			input.value = '';
			button.disabled = false;
			input.disabled = false;
			input.focus();

		};

		// Add event listeners
		button.addEventListener( 'click', executeQuery );

		// Append elements
		this.dom.appendChild( messageBubble );
		this.dom.appendChild( input );
		this.dom.appendChild( button );

		// Store references
		this.messageBubble = messageBubble;

	}

	showError( message ) {

		this.showMessage( message, 'error' );

	}

	showMessage( message, type = 'normal' ) {

		// Get the message container
		const messageContainer = this.messageBubble.querySelector( '.message-text' );
		const closeButton = this.messageBubble.querySelector( 'div:last-child' );

		// Set styles based on message type
		if ( type === 'error' ) {

			this.messageBubble.style.backgroundColor = '#ffebee';
			this.messageBubble.style.color = '#d32f2f';
			closeButton.style.color = '#d32f2f';

		} else {

			this.messageBubble.style.backgroundColor = '#e8f5e9';
			this.messageBubble.style.color = '#2e7d32';
			closeButton.style.color = '#2e7d32';

		}

		// Update message text
		messageContainer.textContent = message;
		this.messageBubble.style.display = 'block';

	}

	async init() {

		// Initialize Google AI
		const ai = new GoogleGenAI( { apiKey: 'GENAI_API_KEY' } );

		// Get scene information
		const sceneInfo = this.getSceneInfo();

		// Prepare prompt
		const systemPrompt = `You are a Three.js scene manipulation assistant. Current scene info:
		
			${JSON.stringify( sceneInfo, null, 2 )}

		Available commands:
		- AddObject: Add a new object to the scene
			Types: box/cube, sphere, directionalLight, pointLight, ambientLight, cylinder
			Box parameters: 
				- width, height, depth (default: 1)
				- widthSegments, heightSegments, depthSegments (default: 1) - controls geometry detail
			Sphere parameters: 
				- radius (default: 0.5)
				- widthSegments (default: 32) - horizontal detail
				- heightSegments (default: 16) - vertical detail
			Cylinder parameters:
				- radiusTop (default: 0.5)
				- radiusBottom (default: 0.5)
				- height (default: 1)
				- radialSegments (default: 32) - horizontal detail
				- heightSegments (default: 1) - vertical detail
				- openEnded (default: false)
			DirectionalLight parameters:
				- color (default: white)
				- intensity (default: 1)
			PointLight parameters:
				- color (default: white)
				- intensity (default: 1)
				- distance (default: 0)
				- decay (default: 2)
			AmbientLight parameters:
				- color (default: white)
				- intensity (default: 1)
			Common parameters for all: 
				- color (use simple color names like "red" or hex values like "#ff0000" - do not use functions or dynamic values)
				- position (e.g. {x: 0, y: 5, z: 0})
		- SetPosition: Set object position
			Parameters:
				- object: name of the object to move (optional - defaults to last modified object)
				- position: {x, y, z} (omitted coordinates keep current values)
				Example: Move right = {x: 2}, Move up = {y: 2}
		- SetMaterialColor: Change object material color
			Parameters:
				- object: name of the object (optional - defaults to last modified object)
				- color: color value (e.g. "red", "#ff0000", or "random" for a random color)
				Note: Use "random" keyword for random colors, do not use JavaScript expressions
		- SetScale: Change object size
			Parameters:
				- object: name of the object (optional - defaults to last modified object)
				- scale: {x, y, z} (values > 1 make bigger, < 1 make smaller)
				Example: Double size = {x: 2, y: 2, z: 2}
				Example: Half size = {x: 0.5, y: 0.5, z: 0.5}
		- SetMaterialValue: Set material property value
			Parameters:
				- object: name of the object (optional - defaults to last modified object)
				- property: material property to set (e.g. "metalness", "roughness", "wireframe", "transparent", "opacity")
				- value: value to set (numbers between 0-1 for metalness/roughness/opacity, true/false for wireframe/transparent)
			Example: Make metallic = { property: "metalness", value: 1.0 }
			Example: Make rough = { property: "roughness", value: 1.0 }
			Example: Make reflective = Use MultiCmds to set both metalness=1.0 and roughness=0.0
			Example: Make transparent = { property: "transparent", value: true, opacity: 0.5 }
			Note: For reflective surfaces, combine metalness=1.0 with roughness=0.0 using MultiCmds
		- SetRotation: Set object rotation
			Parameters:
				- object: name of the object (optional - defaults to last modified object)
				- rotation: {x, y, z} in radians
		- SetGeometry: Modify object geometry detail
			Parameters:
				- object: name of the object to modify (optional - defaults to last modified object)
				- widthSegments: number of segments along width (for box/sphere)
				- heightSegments: number of segments along height (for box/sphere)
				- depthSegments: number of segments along depth (for box only)
			Example: High detail sphere = { widthSegments: 64, heightSegments: 32 }
			Example: High detail box = { widthSegments: 4, heightSegments: 4, depthSegments: 4 }
		- RemoveObject: Remove an object from the scene
			Parameters:
				- object: name of the object to remove
		- MultiCmds: Execute multiple commands in sequence
			Parameters:
				- commands: array of command objects
			Example - Create multiple objects:
				{
					"type": "MultiCmds",
					"params": {
						"commands": [
							{
								"type": "AddObject",
								"params": {
									"type": "cube",
									"name": "Cube1",
									"position": {"x": -1.5}
								}
							},
							{
								"type": "AddObject",
								"params": {
									"type": "cube",
									"name": "Cube2",
									"position": {"x": -0.5}
								}
							},
							{
								"type": "AddObject",
								"params": {
									"type": "cube",
									"name": "Cube3",
									"position": {"x": 0.5}
								}
							},
							{
								"type": "AddObject",
								"params": {
									"type": "cube",
									"name": "Cube4",
									"position": {"x": 1.5}
								}
							}
						]
					}
				}
			Example - Create and modify an object:
				{
					"type": "MultiCmds",
					"params": {
						"commands": [
							{
								"type": "AddObject",
								"params": { "type": "cube", "name": "MyCube" }
							},
							{
								"type": "SetMaterialColor",
								"params": { "object": "MyCube", "color": "red" }
							},
							{
								"type": "SetScale",
								"params": { "object": "MyCube", "scale": {"x": 2, "y": 2, "z": 2} }
							}
						]
					}
				}
			Example - Modify all objects in the scene:
				{
					"type": "MultiCmds",
					"params": {
						"commands": [
							{
								"type": "SetMaterialColor",
								"params": { "object": "Box1", "color": "red" }
							},
							{
								"type": "SetMaterialColor",
								"params": { "object": "Box2", "color": "blue" }
							}
						]
					}
				}
			Note: Use MultiCmds when you need to:
				1. Create multiple objects at once
				2. Apply multiple modifications to a single object
				3. Apply modifications to multiple objects
				4. Any combination of the above

			Important: When working with multiple similar objects (e.g. multiple spheres):
				- Objects are automatically numbered (e.g. "Sphere1", "Sphere2", etc.)
				- Use the exact object name including the number when targeting specific objects
				- To modify all objects of a type, create a MultiCmds command with one command per object
				- The scene info includes:
					- objectCounts: how many of each type exist
					- objectsByType: groups of objects by their base name
					- spheres: list of all sphere names
					- boxes: list of all box names
					- cylinders: list of all cylinder names
					- directionalLights: list of all directional light names
					- pointLights: list of all point light names
					- ambientLights: list of all ambient light names

			Example - Set random colors for all spheres:
				{
					"type": "MultiCmds",
					"params": {
						"commands": [
							{
								"type": "SetMaterialColor",
								"params": { "object": "Sphere1", "color": "random" }
							},
							{
								"type": "SetMaterialColor",
								"params": { "object": "Sphere2", "color": "random" }
							}
						]
					}
				}

		Respond ONLY with a JSON object in this format:
		{
			"response": "Your text response to the user explaining what you're doing",
			"commands": {
				"type": "command_type",
				"params": {
					// command specific parameters
				}
			}
		}

		Important:
		1. If no commands are needed, set "commands" to null
		2. Do not include any JavaScript expressions or functions in the JSON
		3. For random colors, use the "random" keyword instead of Math.random()
		4. Do not include any other text outside the JSON

		Do not include any other text outside the JSON.`;

		this.chat = await ai.chats.create( {
			model: 'gemini-2.5-pro-exp-03-25',
			history: [
				{
					role: 'user',
					parts: [ { text: systemPrompt } ],
				},
				{
					role: 'model',
					parts: [
						{
							text: 'I\'m ready to help you create and modify your 3D scene.',
						},
					],
				},
			],
			config: {
				temperature: 0.2,
				maxOutputTokens: 2048
			},
		} );

		console.log( 'CHAT:', this.chat );

	}

	async processQuery( query ) {

		if ( ! query.trim() ) return;

		try {

			this.signals.agentThinking.dispatch();

			const response = await this.chat.sendMessage( { message: query } );

			console.log( 'RESPONSE:', response.text );

			let responseData;

			try {

				// Strip markdown code block markers if present
				const cleanText = response.text.replace( /^```json\n|\n```$/g, '' )
					.replace( /^\s*```\s*|\s*```\s*$/g, '' ) // Remove any remaining code block markers
					.trim();

				try {

					// First try parsing as is
					responseData = JSON.parse( cleanText );

				} catch ( e ) {

					// If that fails, try to fix common JSON issues
					const fixedText = cleanText
						.replace( /,\s*([}\]])/g, '$1' ) // Remove trailing commas
						.replace( /([a-zA-Z0-9])\s*:\s*/g, '"$1": ' ) // Quote unquoted keys
						.replace( /\n/g, ' ' ) // Remove newlines
						.replace( /\s+/g, ' ' ); // Normalize whitespace

					responseData = JSON.parse( fixedText );

				}

			} catch ( e ) {

				// console.error( 'AGENT: Failed to parse AI response as JSON:', e );
				// console.error( 'AGENT: Raw response:', response.text );
				this.showError( response.text );
				return;

			}

			// Execute commands if present
			if ( responseData.commands ) {

				try {

					await this.executeCommand( responseData.commands );

				} catch ( e ) {

					console.error( 'AGENT: Failed to execute commands:', e );
					this.showError( 'Failed to execute command: ' + e.message );
					return;

				}

			}

			// Log the response
			// console.log( 'AGENT:', responseData.response );
			this.signals.agentResponse.dispatch( responseData.response );
			this.showMessage( responseData.response );

		} catch ( error ) {

			console.error( 'AGENT: Agent error:', error );
			this.showError( 'Agent error: ' + error.message );

		}

	}

	async executeCommand( commandData ) {

		if ( ! commandData.type || ! Commands[ commandData.type + 'Command' ] ) {

			console.error( 'AGENT: Invalid command type:', commandData.type );
			return;

		}

		let command;

		// Helper to get target object, falling back to last modified
		const getTargetObject = ( objectName ) => {

			if ( objectName ) {

				const object = this.editor.scene.getObjectByName( objectName );
				if ( object ) {

					this.lastModifiedObject = object;
					return object;

				}

			}

			return this.lastModifiedObject;

		};

		const createMaterial = ( params ) => {

			const material = new MeshStandardMaterial();

			if ( params.color ) {

				material.color.set( params.color );

			}

			return material;

		};

		const setPosition = ( object, position ) => {

			if ( position ) {

				object.position.set(
					position.x ?? 0,
					position.y ?? 0,
					position.z ?? 0
				);

			}

		};

		switch ( commandData.type ) {

			case 'AddObject':

				const type = commandData.params.type?.toLowerCase();

				if ( type === 'box' || type === 'cube' ) {

					const width = commandData.params.width ?? 1;
					const height = commandData.params.height ?? 1;
					const depth = commandData.params.depth ?? 1;
					const widthSegments = commandData.params.widthSegments ?? 1;
					const heightSegments = commandData.params.heightSegments ?? 1;
					const depthSegments = commandData.params.depthSegments ?? 1;
					const geometry = new BoxGeometry( width, height, depth, widthSegments, heightSegments, depthSegments );
					const mesh = new Mesh( geometry, createMaterial( commandData.params ) );
					mesh.name = commandData.params.name || this.generateUniqueObjectName( 'Box' );

					setPosition( mesh, commandData.params.position );

					command = new Commands.AddObjectCommand( this.editor, mesh );
					this.lastModifiedObject = mesh;

				} else if ( type === 'sphere' ) {

					const radius = commandData.params.radius ?? 0.5;
					const widthSegments = commandData.params.widthSegments ?? 32;
					const heightSegments = commandData.params.heightSegments ?? 16;
					const geometry = new SphereGeometry( radius, widthSegments, heightSegments );
					const mesh = new Mesh( geometry, createMaterial( commandData.params ) );
					mesh.name = commandData.params.name || this.generateUniqueObjectName( 'Sphere' );

					setPosition( mesh, commandData.params.position );

					command = new Commands.AddObjectCommand( this.editor, mesh );
					this.lastModifiedObject = mesh;

				} else if ( type === 'cylinder' ) {

					const radiusTop = commandData.params.radiusTop ?? 0.5;
					const radiusBottom = commandData.params.radiusBottom ?? 0.5;
					const height = commandData.params.height ?? 1;
					const radialSegments = commandData.params.radialSegments ?? 32;
					const heightSegments = commandData.params.heightSegments ?? 1;
					const openEnded = commandData.params.openEnded ?? false;
					const geometry = new CylinderGeometry( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded );
					const mesh = new Mesh( geometry, createMaterial( commandData.params ) );
					mesh.name = commandData.params.name || this.generateUniqueObjectName( 'Cylinder' );

					setPosition( mesh, commandData.params.position );

					command = new Commands.AddObjectCommand( this.editor, mesh );
					this.lastModifiedObject = mesh;

				} else if ( type === 'directionallight' ) {

					const color = commandData.params.color || 0xffffff;
					const intensity = commandData.params.intensity ?? 1;
					const light = new DirectionalLight( color, intensity );
					light.name = commandData.params.name || this.generateUniqueObjectName( 'DirectionalLight' );

					setPosition( light, commandData.params.position );

					command = new Commands.AddObjectCommand( this.editor, light );
					this.lastModifiedObject = light;

				} else if ( type === 'pointlight' ) {

					const color = commandData.params.color || 0xffffff;
					const intensity = commandData.params.intensity ?? 1;
					const distance = commandData.params.distance ?? 0;
					const decay = commandData.params.decay ?? 2;
					const light = new PointLight( color, intensity, distance, decay );
					light.name = commandData.params.name || this.generateUniqueObjectName( 'PointLight' );

					setPosition( light, commandData.params.position );

					command = new Commands.AddObjectCommand( this.editor, light );
					this.lastModifiedObject = light;

				} else if ( type === 'ambientlight' ) {

					const color = commandData.params.color || 0xffffff;
					const intensity = commandData.params.intensity ?? 1;
					const light = new AmbientLight( color, intensity );
					light.name = commandData.params.name || this.generateUniqueObjectName( 'AmbientLight' );

					command = new Commands.AddObjectCommand( this.editor, light );
					this.lastModifiedObject = light;

				} else {

					console.warn( 'AGENT: Unsupported object type:', type );

				}

				break;

			case 'SetPosition':

				const positionObject = getTargetObject( commandData.params.object );

				if ( positionObject && commandData.params.position ) {

					const currentPos = positionObject.position;
					const newPosition = new Vector3(
						commandData.params.position.x ?? currentPos.x,
						commandData.params.position.y ?? currentPos.y,
						commandData.params.position.z ?? currentPos.z
					);
					command = new Commands.SetPositionCommand( this.editor, positionObject, newPosition );

				}

				break;

			case 'SetRotation':

				const rotationObject = getTargetObject( commandData.params.object );

				if ( rotationObject && commandData.params.rotation ) {

					const rot = commandData.params.rotation;
					const currentRot = rotationObject.rotation;
					const newRotation = new Vector3(
						rot.x ?? currentRot.x,
						rot.y ?? currentRot.y,
						rot.z ?? currentRot.z
					);
					command = new Commands.SetRotationCommand( this.editor, rotationObject, newRotation );

				}

				break;

			case 'SetScale':

				const scaleObject = getTargetObject( commandData.params.object );

				if ( scaleObject && commandData.params.scale ) {

					const scale = commandData.params.scale;
					const newScale = new Vector3( scale.x || 1, scale.y || 1, scale.z || 1 );
					command = new Commands.SetScaleCommand( this.editor, scaleObject, newScale );

				}

				break;

			case 'SetMaterialColor':

				const colorObject = getTargetObject( commandData.params.object );

				if ( colorObject && colorObject.material && commandData.params.color ) {

					let colorValue = commandData.params.color;
					// If color is "random", generate a random color
					if ( colorValue === 'random' ) {

						colorValue = this.generateRandomColor();

					}

					const color = new Color( colorValue );
					command = new Commands.SetMaterialColorCommand( this.editor, colorObject, 'color', color.getHex() );

				}

				break;

			case 'SetMaterialValue':

				const materialObject = getTargetObject( commandData.params.object );

				if ( materialObject && materialObject.material && commandData.params.property ) {

					const property = commandData.params.property;
					let value = commandData.params.value;

					// Handle special cases for certain property types
					if ( property.includes( 'map' ) && value === null ) {

						// Handle removing textures
						value = null;

					} else if ( typeof value === 'string' && ! isNaN( value ) ) {

						// Convert numeric strings to numbers
						value = parseFloat( value );

					}

					command = new Commands.SetMaterialValueCommand( this.editor, materialObject, property, value );

				}

				break;

			case 'SetGeometry':

				const detailObject = getTargetObject( commandData.params.object );

				if ( detailObject && detailObject.geometry ) {

					const params = commandData.params;
					let newGeometry;

					if ( detailObject.geometry instanceof BoxGeometry ) {

						const box = detailObject.geometry;
						newGeometry = new BoxGeometry(
							box.parameters.width ?? 1,
							box.parameters.height ?? 1,
							box.parameters.depth ?? 1,
							params.widthSegments ?? 1,
							params.heightSegments ?? 1,
							params.depthSegments ?? 1
						);

					} else if ( detailObject.geometry instanceof SphereGeometry ) {

						const sphere = detailObject.geometry;
						newGeometry = new SphereGeometry(
							sphere.parameters.radius ?? 0.5,
							params.widthSegments ?? 32,
							params.heightSegments ?? 16
						);

					} else if ( detailObject.geometry instanceof CylinderGeometry ) {

						const cylinder = detailObject.geometry;
						newGeometry = new CylinderGeometry(
							params.radiusTop ?? cylinder.parameters.radiusTop ?? 0.5,
							params.radiusBottom ?? cylinder.parameters.radiusBottom ?? 0.5,
							params.height ?? cylinder.parameters.height ?? 1,
							params.radialSegments ?? cylinder.parameters.radialSegments ?? 32,
							params.heightSegments ?? cylinder.parameters.heightSegments ?? 1,
							params.openEnded ?? cylinder.parameters.openEnded ?? false
						);

					}

					if ( newGeometry ) {

						command = new Commands.SetGeometryCommand( this.editor, detailObject, newGeometry );

					}

				}

				break;

			case 'RemoveObject':

				const removeObject = getTargetObject( commandData.params.object );

				if ( removeObject ) {

					command = new Commands.RemoveObjectCommand( this.editor, removeObject );
					this.lastModifiedObject = null;

				}

				break;

			case 'MultiCmds':

				if ( Array.isArray( commandData.params.commands ) ) {

					const commands = [];

					for ( const cmd of commandData.params.commands ) {

						const subCommand = await this.executeCommand( cmd );
						if ( subCommand ) commands.push( subCommand );

					}

					command = new Commands.MultiCmdsCommand( this.editor, commands );

				}

				break;

			default:
				console.warn( 'AGENT: Unsupported command type:', commandData.type, '- Available commands are: AddObject, SetPosition, SetRotation, SetScale, SetMaterialColor, SetMaterialValue, SetGeometry, RemoveObject, MultiCmds' );
				break;

		}

		console.log( 'AGENT: Command:', command );

		if ( command ) {

			this.editor.execute( command );

		}

		return command;

	}

	getSceneInfo() {

		const scene = this.editor.scene;

		// Helper to get all objects of a specific type
		const getObjectsByType = ( type ) => {

			return scene.children.filter( obj => {

				const baseName = obj.name.replace( /\d+$/, '' );
				return baseName.toLowerCase() === type.toLowerCase();

			} ).map( obj => obj.name );

		};

		// Get base names and their counts
		const nameCount = {};
		const objectsByType = {};

		scene.children.forEach( obj => {

			const baseName = obj.name.replace( /\d+$/, '' ); // Remove trailing numbers
			nameCount[ baseName ] = ( nameCount[ baseName ] || 0 ) + 1;

			// Group objects by their base name
			if ( ! objectsByType[ baseName ] ) {

				objectsByType[ baseName ] = [];

			}

			objectsByType[ baseName ].push( obj.name );

		} );

		const objects = scene.children.map( obj => ( {
			type: obj.type,
			name: obj.name,
			baseName: obj.name.replace( /\d+$/, '' ), // Add base name
			position: obj.position,
			rotation: obj.rotation,
			scale: obj.scale,
			isMesh: obj.isMesh,
			isLight: obj.isLight,
			material: obj.material ? {
				type: obj.material.type,
				color: obj.material.color ? '#' + obj.material.color.getHexString() : undefined
			} : undefined
		} ) );

		return {
			objects,
			meshes: objects.filter( obj => obj.isMesh ),
			lights: objects.filter( obj => obj.isLight ),
			materials: Object.keys( this.editor.materials ).length,
			cameras: Object.keys( this.editor.cameras ).length,
			objectCounts: nameCount, // Add counts of similar objects
			objectsByType, // Add grouped objects by type
			spheres: getObjectsByType( 'Sphere' ),
			boxes: getObjectsByType( 'Box' ),
			cylinders: getObjectsByType( 'Cylinder' ),
			directionalLights: getObjectsByType( 'DirectionalLight' ),
			pointLights: getObjectsByType( 'PointLight' ),
			ambientLights: getObjectsByType( 'AmbientLight' )
		};

	}

	clear() {

		while ( this.container.children.length > 0 ) {

			this.container.remove( this.container.children[ 0 ] );

		}

	}

}

export { Agent };
