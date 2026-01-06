*Inheritance: EventDispatcher → Node →*

# ScriptableNode

This type of node allows to implement nodes with custom scripts. The script section is represented as an instance of `CodeNode` written with JavaScript. The script itself must adhere to a specific structure.

*   main(): Executed once by default and every time `node.needsUpdate` is set.
*   layout: The layout object defines the script's interface (inputs and outputs).

## Code Example

```js
ScriptableNodeResources.set( 'TSL', TSL );
const scriptableNode = scriptable( js( `
	layout = {
		outputType: 'node',
		elements: [
			{ name: 'source', inputType: 'node' },
		]
	};
	const { mul, oscSine } = TSL;
	function main() {
		const source = parameters.get( 'source' ) || float();
		return mul( source, oscSine() ) );
	}
` ) );
scriptableNode.setParameter( 'source', color( 1, 0, 0 ) );
const material = new THREE.MeshBasicNodeMaterial();
material.colorNode = scriptableNode;
```

## Constructor

### new ScriptableNode( codeNode : CodeNode, parameters : Object )

Constructs a new scriptable node.

**codeNode**

The code node.

Default is `null`.

**parameters**

The parameters definition.

Default is `{}`.

## Properties

### .codeNode : CodeNode

The code node.

Default is `null`.

### .isScriptableNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .parameters : Object

The parameters definition.

Default is `{}`.

### .source : string

The source code of the scriptable node.

## Methods

### .call( name : string, …params : any ) : any

Calls a function from the script.

**name**

The function name.

**params**

A list of parameters.

**Returns:** The result of the function call.

### .callAsync( name : string, …params : any ) : Promise.<any> (async)

Asynchronously calls a function from the script.

**name**

The function name.

**params**

A list of parameters.

**Returns:** The result of the function call.

### .clearParameters() : ScriptableNode

Deletes all parameters from the script.

**Returns:** A reference to this node.

### .deleteParameter( name : string ) : ScriptableNode

Deletes a parameter from the script.

**name**

The parameter to remove.

**Returns:** A reference to this node.

### .dispose()

Frees all internal resources.

**Overrides:** [Node#dispose](Node.html#dispose)

### .getDefaultOutput() : ScriptableValueNode

Returns default output of the script.

**Returns:** The default output.

### .getDefaultOutputNode() : Node

Returns default node output of the script.

**Returns:** The default node output.

### .getInputLayout( id : string ) : Object

Returns an input from the layout with the given id/name.

**id**

The id/name of the input.

**Returns:** The element entry.

### .getLayout() : Object

Returns the layout of the script.

**Returns:** The script's layout.

### .getLocal( name : string ) : Object

Gets the value of a local script variable.

**name**

The variable name.

**Returns:** The value.

### .getMethod() : function

Returns a function created from the node's script.

**Returns:** The function representing the node's code.

### .getNodeType( builder : NodeBuilder ) : string

Overwritten since the node types is inferred from the script's output.

**builder**

The current node builder

**Overrides:** [Node#getNodeType](Node.html#getNodeType)

**Returns:** The node type.

### .getObject() : Object

Returns an object representation of the script.

**Returns:** The result object.

### .getOutput( name : string ) : ScriptableValueNode

Returns a script output for the given name.

**name**

The name of the output.

**Returns:** The node value.

### .getOutputLayout( id : string ) : Object

Returns an output from the layout with the given id/name.

**id**

The id/name of the output.

**Returns:** The element entry.

### .getParameter( name : string ) : ScriptableValueNode

Returns a parameter for the given name

**name**

The name of the parameter.

**Returns:** The node value.

### .getValue() : Node

Returns the value of this node which is the value of the default output.

**Returns:** The value.

### .onRefresh()

Event listener for the `refresh` event.

### .refresh( output : string )

Refreshes the script node.

**output**

An optional output.

Default is `null`.

### .setLocal( name : string, value : Object ) : Resources

Sets the reference of a local script variable.

**name**

The variable name.

**value**

The reference to set.

**Returns:** The resource map

### .setOutput( name : string, value : Node ) : ScriptableNode

Defines a script output for the given name and value.

**name**

The name of the output.

**value**

The node value.

**Returns:** A reference to this node.

### .setParameter( name : string, value : any ) : ScriptableNode

Sets a value for the given parameter name.

**name**

The parameter name.

**value**

The parameter value.

**Returns:** A reference to this node.

## Source

[src/nodes/code/ScriptableNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/code/ScriptableNode.js)