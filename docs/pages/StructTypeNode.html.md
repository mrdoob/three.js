*Inheritance: EventDispatcher → Node →*

# StructTypeNode

Represents a struct type node in the node-based system. This class is used to define and manage the layout and types of struct members. It extends the base Node class and provides methods to get the length of the struct, retrieve member types, and generate the struct type for a builder.

## Constructor

### new StructTypeNode( membersLayout : Object, name : string )

Creates an instance of StructTypeNode.

**membersLayout**

The layout of the members for the struct.

**name**

The optional name of the struct.

Default is `null`.

## Properties

### .isStructTypeNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .membersLayout : Array.<{name: string, type: string, atomic: boolean}>

The layout of the members for the struct

### .name : string

The name of the struct.

Default is `null`.

**Overrides:** [Node#name](Node.html#name)

## Methods

### .getLength() : number

Returns the length of the struct in 4-byte elements (e.g. float or int components). The length is calculated by summing the lengths of the struct's members, accounting for memory alignment. To get the size in bytes, multiply the returned value by 4.

**Returns:** The length of the struct in 4-byte elements.

## Source

[src/nodes/core/StructTypeNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/StructTypeNode.js)