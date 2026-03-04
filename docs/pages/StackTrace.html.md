# StackTrace

Class representing a stack trace for debugging purposes.

## Constructor

### new StackTrace( stackMessage : Error | string | null )

Creates a StackTrace instance by capturing and filtering the current stack trace.

**stackMessage**

An optional stack trace to use instead of capturing a new one.

Default is `null`.

## Properties

### .isStackTrace : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .stack : Array.<{fn: string, file: string, line: number, column: number}>

The stack trace.

## Methods

### .getError( message : string ) : string

Returns the full error message including the stack trace.

**message**

The error message.

**Returns:** The full error message with stack trace.

### .getLocation() : string

Returns a formatted location string of the top stack frame.

**Returns:** The formatted stack trace message.

## Source

[src/nodes/core/StackTrace.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/StackTrace.js)