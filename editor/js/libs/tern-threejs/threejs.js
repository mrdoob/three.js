(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    return mod(require("tern/lib/infer"), require("tern/lib/tern"));
  if (typeof define == "function" && define.amd) // AMD
    return define([ "tern/lib/infer", "tern/lib/tern" ], mod);
  mod(tern, tern);
})(function(infer, tern) {
  "use strict";

  tern.registerPlugin("threejs", function(server, options) {
    return {
      defs : {
  "!name": "threejs",
  "THREE": {
    "Original": {
      "!url": "http://threejs.org/docs/#Reference/Original",
      "prototype": {
        "!proto": "THREE.Geometry.prototype"
      },
      "!doc": "todo"
    },
    "Camera": {
      "!url": "http://threejs.org/docs/#Reference/cameras/Camera",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "matrixWorldInverse": {
          "!type": "+THREE.Matrix4",
          "!doc": "This is the inverse of matrixWorld. MatrixWorld contains the Matrix which has the world transform of the Camera."
        },
        "projectionMatrix": {
          "!type": "+THREE.Matrix4",
          "!doc": "This is the matrix which contains the projection."
        },
        "lookAt": {
          "!type": "fn(vector: +THREE.Vector3)",
          "!doc": "vector — point to look at<br>\n\t\t<br>\n\t\tThis makes the camera look at the vector position in the global space as long as the parent of this camera is the scene or at position (0,0,0)."
        }
      },
      "!doc": "Abstract base class for cameras. This class should always be inherited when you build a new camera.",
      "!type": "fn()"
    },
    "CubeCamera": {
      "!url": "http://threejs.org/docs/#Reference/cameras/CubeCamera",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "renderTarget": {
          "!type": "+THREE.WebGLRenderTargetCube",
          "!doc": "The cube texture that gets generated."
        },
        "updateCubeMap": {
          "!type": "fn(renderer: todo, scene: todo) -> todo",
          "!doc": "Call this to update the renderTarget."
        }
      },
      "!doc": "Creates 6 cameras that render to a [page:WebGLRenderTargetCube].",
      "!type": "fn(near: number, far: number, cubeResolution: number)"
    },
    "OrthographicCamera": {
      "!url": "http://threejs.org/docs/#Reference/cameras/OrthographicCamera",
      "prototype": {
        "!proto": "THREE.Camera.prototype",
        "left": {
          "!type": "number",
          "!doc": "Camera frustum left plane."
        },
        "right": {
          "!type": "number",
          "!doc": "Camera frustum right plane."
        },
        "top": {
          "!type": "number",
          "!doc": "Camera frustum top plane."
        },
        "bottom": {
          "!type": "number",
          "!doc": "Camera frustum bottom plane."
        },
        "near": {
          "!type": "number",
          "!doc": "Camera frustum near plane."
        },
        "far": {
          "!type": "number",
          "!doc": "Camera frustum far plane."
        },
        "updateProjectionMatrix": {
          "!type": "fn()",
          "!doc": "Updates the camera projection matrix. Must be called after change of parameters."
        }
      },
      "!doc": "Camera with orthographic projection.",
      "!type": "fn(left: number, right: number, top: number, bottom: number, near: number, far: number)"
    },
    "PerspectiveCamera": {
      "!url": "http://threejs.org/docs/#Reference/cameras/PerspectiveCamera",
      "prototype": {
        "!proto": "THREE.Camera.prototype",
        "fov": {
          "!type": "number",
          "!doc": "Camera frustum vertical field of view, from bottom to top of view, in degrees."
        },
        "aspect": {
          "!type": "number",
          "!doc": "Camera frustum aspect ratio, window width divided by window height."
        },
        "near": {
          "!type": "number",
          "!doc": "Camera frustum near plane."
        },
        "far": {
          "!type": "number",
          "!doc": "Camera frustum far plane."
        },
        "setLens": {
          "!type": "fn(focalLength: number, frameSize: number)",
          "!doc": "Uses focal length (in mm) to estimate and set FOV 35mm (fullframe) camera is used if frame size is not specified.<br>\n\t\tFormula based on [link:http://www.bobatkins.com/photography/technical/field_of_view.html]"
        },
        "setViewOffset": {
          "!type": "fn(fullWidth: number, fullHeight: number, x: number, y: number, width: number, height: number)",
          "!doc": "For example, if you have 3x2 monitors and each monitor is 1920x1080 and the monitors are in grid like this:<br>\n\n\t\t<pre>+---+---+---+\n| A | B | C |\n+---+---+---+\n| D | E | F |\n+---+---+---+</pre>\n\n\t\tthen for each monitor you would call it like this:<br>\n\n\t\t<code>var w = 1920;\nvar h = 1080;\nvar fullWidth = w * 3;\nvar fullHeight = h * 2;\n\n// A\ncamera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );\n// B\ncamera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );\n// C\ncamera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );\n// D\ncamera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );\n// E\ncamera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );\n// F\ncamera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );\n</code>\n\n\t\tNote there is no reason monitors have to be the same size or in a grid."
        },
        "updateProjectionMatrix": {
          "!type": "fn()",
          "!doc": "Updates the camera projection matrix. Must be called after change of parameters."
        }
      },
      "!doc": "Camera with perspective projection.",
      "!type": "fn(fov: number, aspect: number, near: number, far: number)"
    },
    "CustomBlendingEquations": {
      "!url": "http://threejs.org/docs/#Reference/constants/CustomBlendingEquations",
      "prototype": {}
    },
    "GLState": {
      "!url": "http://threejs.org/docs/#Reference/constants/GLState",
      "prototype": {}
    },
    "Materials": {
      "!url": "http://threejs.org/docs/#Reference/constants/Materials",
      "prototype": {}
    },
    "ShadowingTypes": {
      "!url": "http://threejs.org/docs/#Reference/constants/ShadowingTypes",
      "prototype": {}
    },
    "Textures": {
      "!url": "http://threejs.org/docs/#Reference/constants/Textures",
      "prototype": {}
    },
    "BufferAttribute": {
      "!url": "http://threejs.org/docs/#Reference/core/BufferAttribute",
      "prototype": {
        "array": {
          "!type": "[]",
          "!doc": "Stores the data associated with this attribute; can be an Array or a Typed Array. This element should have <code>itemSize * numVertices</code> elements, where numVertices is the number of vertices in the associated [page:BufferGeometry geometry]."
        },
        "itemSize": {
          "!type": "number",
          "!doc": "Records how many items of the array are associated with a particular vertex. For instance, if this\n\t\tattribute is storing a 3-component vector (such as a position, normal, or color), then itemSize should be 3."
        },
        "length": {
          "!type": "number",
          "!doc": "Gives the total number of elements in the array."
        },
        "needsUpdate": {
          "!type": "bool",
          "!doc": "Flag to indicate that this attribute has changed and should be re-send to the GPU. Set this to true when you modify the value of the array."
        },
        "setX": {
          "!type": "fn(index, x)",
          "!doc": "Sets the value of the array at <code>index * itemSize</code> to x"
        },
        "setY": {
          "!type": "fn(index, y)",
          "!doc": "Sets the value of the array at <code>index * itemSize + 1</code> to y"
        },
        "setZ": {
          "!type": "fn(index, z)",
          "!doc": "Sets the value of the array at <code>index * itemSize + 2</code> to z"
        },
        "setXY": {
          "!type": "fn(index, x, y)",
          "!doc": "Sets the value of the array at <code>index * itemSize</code> to x and \n\t\tsets the value of the array at <code>index * itemSize + 1</code> to y"
        },
        "setXYZ": {
          "!type": "fn(index, x, y, z)",
          "!doc": "Sets the value of the array at <code>index * itemSize</code> to x,\n\t\tthe value of the array at <code>index * itemSize + 1</code> to y, and\n\t\tthe value of the array at <code>index * itemSize + 2</code> to z."
        },
        "setXYZW": {
          "!type": "fn(index, x, y, z, w)",
          "!doc": "Sets the value of the array at <code>index * itemSize</code> to x,\n\t\tthe value of the array at <code>index * itemSize + 1</code> to y, \n\t\tthe value of the array at <code>index * itemSize + 2</code> to z, and\n\t\tthe value of the array at <code>index * itemSize + 3</code> to w."
        },
        "clone": {
          "!type": "fn() -> +THREE.BufferAttribute",
          "!doc": "Copies this attribute."
        }
      },
      "!doc": "This class stores data for an attribute associated with a [page:BufferGeometry]. See that page for details and a usage example. This class is used to store builtin attributes such as vertex position, normals, color, etc., but can also be used in your code to store custom attributes in a [page:BufferGeometry].",
      "!type": "fn(array: [], itemSize: number)"
    },
    "BufferGeometry": {
      "!url": "http://threejs.org/docs/#Reference/core/BufferGeometry",
      "prototype": {
        "id": {
          "!type": "number",
          "!doc": "Unique number for this buffergeometry instance."
        },
        "attributes": {
          "!type": "Hashmap",
          "!doc": "This hashmap has as id the name of the attribute to be set and as value the [page:BufferAttribute buffer] to set it to.\n\t\tRather than accessing this property directly, use addAttribute and getAttribute to access attributes of this geometry."
        },
        "drawCalls": {
          "!type": "[]",
          "!doc": "For geometries that use indexed triangles, this Array can be used to split the object into multiple WebGL draw calls. Each draw call will draw some subset of the vertices in this geometry using the configured [page:Material shader]. This may be necessary if, for instance, you have more than 65535 vertices in your object. \n\t\tEach element is an object of the form:\n\t\t<code>{ start: Integer, count: Integer, index: Integer }</code>\n\t\twhere start specifies the index of the first vertex in this draw call, count specifies how many vertices are included, and index specifies an optional offset.\n\n\t\tUse addDrawCall to add draw calls, rather than modifying this array directly."
        },
        "boundingBox": {
          "!type": "+THREE.Box3",
          "!doc": "Bounding box.\n\t\t<code>{ min: new THREE.Vector3(), max: new THREE.Vector3() }</code>"
        },
        "boundingSphere": {
          "!type": "+THREE.Sphere",
          "!doc": "Bounding sphere.\n\t\t<code>{ radius: float }</code>"
        },
        "morphTargets": {
          "!type": "[]",
          "!doc": "Array of morph targets. Each morph target is a Javascript object:\n\t\t<code>{ name: \"targetName\", vertices: [ new THREE.Vertex(), ... ] }</code>\n\t\tMorph vertices match number and order of primary vertices."
        },
        "addAttribute": {
          "!type": "null",
          "!doc": "Adds an attribute to this geometry. Use this rather than the attributes property, \n\t\tbecause an internal array of attributes is maintained to speed up iterating over\n\t\tattributes."
        },
        "addDrawCall": {
          "!type": "fn(start: number, count: number, indexOffset: number)",
          "!doc": "Adds a draw call to this geometry; see the drawcalls property for details."
        },
        "applyMatrix": {
          "!type": "fn(matrix: +THREE.Matrix4)",
          "!doc": "Bakes matrix transform directly into vertex coordinates."
        },
        "computeVertexNormals": {
          "!type": "fn()",
          "!doc": "Computes vertex normals by averaging face normals.<br>"
        },
        "computeBoundingBox": {
          "!type": "fn()",
          "!doc": "Computes bounding box of the geometry, updating [page:Geometry Geometry.boundingBox] attribute.<br>\n\t\tBounding boxes aren't computed by default. They need to be explicitly computed, otherwise they are *null*."
        },
        "computeBoundingSphere": {
          "!type": "fn()",
          "!doc": "Computes bounding sphere of the geometry, updating [page:Geometry Geometry.boundingSphere] attribute.<br>\n\t\tBounding spheres aren't computed by default. They need to be explicitly computed, otherwise they are *null*."
        },
        "dispose": {
          "!type": "fn()",
          "!doc": "Disposes the object from memory. <br>\n\t\tYou need to call this when you want the bufferGeometry removed while the application is running."
        },
        "fromGeometry": {
          "!type": "fn()",
          "!doc": "Populates this BufferGeometry with data from a [page:Geometry] object."
        },
        "getAttribute": {
          "!type": "fn(name: string) -> +THREE.BufferAttribute",
          "!doc": "Returns the [page:BufferAttribute attribute] with the specified name."
        },
        "normalizeNormals": {
          "!type": "fn()",
          "!doc": "Every normal vector in a geometry will have a magnitude of 1.\n\t\tThis will correct lighting on the geometry surfaces."
        }
      },
      "!doc": "<p>\n\t\tThis class is an efficient alternative to [page:Geometry], because it stores all data, including\n\t\tvertex positions, face indices, normals, colors, UVs, and custom attributes within buffers; this\n\t\treduces the cost of passing all this data to the GPU. \n\t\tThis also makes BufferGeometry harder to work with than [page:Geometry]; rather than accessing \n\t\tposition data as [page:Vector3] objects, color data as [page:Color] objects, and so on, you have to \n\t\taccess the raw data from the appropriate [page:BufferAttribute attribute] buffer. This makes \n\t\tBufferGeometry best-suited for static objects where you don't need to manipulate the geometry much\n\t\tafter instantiating it.\n\t\t</p>\n\n\t\t<h3>Example</h3>\n\t\t<code>\n\t\tvar geometry = new THREE.BufferGeometry();\n\t\t// create a simple square shape. We duplicate the top left and bottom right\n\t\t// vertices because each vertex needs to appear once per triangle. \n\t\tvar vertexPositions = [ \n\t\t\t[-1.0, -1.0,  1.0],\n\t\t\t[ 1.0, -1.0,  1.0],\n\t\t\t[ 1.0,  1.0,  1.0],\n\n\t\t\t[ 1.0,  1.0,  1.0],\n\t\t\t[-1.0,  1.0,  1.0],\n\t\t\t[-1.0, -1.0,  1.0]\n\t\t];\n\t\tvar vertices = new Float32Array( vertexPositions.length * 3 ); // three components per vertex\n\n\t\t// components of the position vector for each vertex are stored\n\t\t// contiguously in the buffer.\n\t\tfor ( var i = 0; i &lt; vertexPositions.length; i++ )\n\t\t{\n\t\t\tvertices[ i*3 + 0 ] = vertexPositions[i][0];\n\t\t\tvertices[ i*3 + 1 ] = vertexPositions[i][1];\n\t\t\tvertices[ i*3 + 2 ] = vertexPositions[i][2];\n\t\t}\n\n\t\t// itemSize = 3 because there are 3 values (components) per vertex\n\t\tgeometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );\n\t\tvar material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );\n\t\tvar mesh = new THREE.Mesh( geometry, material );\n\t\t</code>\n\t\t<p>More examples: [example:webgl_buffergeometry Complex mesh with non-indexed faces], [example:webgl_buffergeometry_uint Complex mesh with indexed faces], [example:webgl_buffergeometry_lines Lines], [example:webgl_buffergeometry_lines_indexed Indexed Lines], [example:webgl_buffergeometry_particles Particles], and [example:webgl_buffergeometry_rawshader Raw Shaders].</p>\n\n\t\t\n\t\t<h3>Accessing attributes</h3>\n\t\t<p>\n\t\tWebGL stores data associated with individual vertices of a geometry in <emph>attributes</emph>. \n\t\tExamples include the position of the vertex, the normal vector for the vertex, the vertex color,\n\t\tand so on. When using [page:Geometry], the [page:WebGLRenderer renderer] takes care of wrapping\n\t\tup this information into typed array buffers and sending this data to the shader. With \n\t\tBufferGeometry, all of this data is stored in buffers associated with an individual attributes.\n\t\tThis means that to get the position data associated with a vertex (for instance), you must call\n\t\t[page:.getAttribute] to access the 'position' [page:BufferAttribute attribute], then access the individual \n\t\tx, y, and z coordinates of the position.  \n\t\t</p>\n\t\t<p>\n\t\tThe following attributes are set by various members of this class:\n\t\t</p>\n\t\t<h4>[page:BufferAttribute position] (itemSize: 3)</h4>\n\t\t<div>\n\t\tStores the x, y, and z coordinates of each vertex in this geometry. Set by [page:.fromGeometry]().\n\t\t</div>\n\n\t\t<h4>[page:BufferAttribute normal] (itemSize: 3)</h4>\n\t\t<div>\n\t\tStores the x, y, and z components of the face or vertex normal vector of each vertex in this geometry.\n\t\tSet by [page:.fromGeometry]().\n\t\t</div>\n\n\t\t<h4>[page:BufferAttribute color] (itemSize: 3)</h4>\n\t\t<div>\n\t\tStores the red, green, and blue channels of vertex color of each vertex in this geometry.\n\t\tSet by [page:.fromGeometry]().\n\t\t</div>\n\n\t\t<h4>[page:BufferAttribute tangent] (itemSize: 3)</h4>\n\t\t<div>\n\t\tStores the x, y, and z components of the tangent vector of each vertex in this geometry. Set by [page:.computeTangents]().\n\t\t</div>\n\n\t\t<h4>[page:BufferAttribute index] (itemSize: 3)</h4>\n\t\tAllows for vertices to be re-used across multiple triangles; this is called using \"indexed triangles,\" and works much the same as it does in [page:Geometry]: each triangle is associated with the index of three vertices. This attribute therefore stores the index of each vertex for each triangular face.\n\n\t\tIf this attribute is not set, the [page:WebGLRenderer renderer] assumes that each three contiguous positions represent a single triangle.",
      "!type": "fn()"
    },
    "Clock": {
      "!url": "http://threejs.org/docs/#Reference/core/Clock",
      "prototype": {
        "autoStart": {
          "!type": "bool",
          "!doc": "If set, starts the clock automatically when the first update is called."
        },
        "startTime": {
          "!type": "number",
          "!doc": "When the clock is running, It holds the start time of the clock. <br>\n\t\tThis counted from the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC."
        },
        "oldTime": {
          "!type": "number",
          "!doc": "When the clock is running, It holds the previous time from a update.<br>\n\t\tThis counted from the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC."
        },
        "elapsedTime": {
          "!type": "number",
          "!doc": "When the clock is running, It holds the time elapsed between the start of the clock to the previous update.<br>\n\t\tThis counted from the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC."
        },
        "running": {
          "!type": "bool",
          "!doc": "This property keeps track whether the clock is running or not."
        },
        "start": {
          "!type": "fn()",
          "!doc": "Starts clock."
        },
        "stop": {
          "!type": "fn()",
          "!doc": "Stops clock."
        },
        "getElapsedTime": {
          "!type": "fn() -> number",
          "!doc": "Get the seconds passed since the clock started."
        },
        "getDelta": {
          "!type": "fn() -> number",
          "!doc": "Get the seconds passed since the last call to this method."
        }
      },
      "!doc": "Object for keeping track of time.",
      "!type": "fn(autoStart: bool)"
    },
    "EventDispatcher": {
      "!url": "http://threejs.org/docs/#Reference/core/EventDispatcher",
      "prototype": {
        "addEventListener": {
          "!type": "fn(type: string, listener: function)",
          "!doc": "Adds a listener to an event type."
        },
        "hasEventListener": {
          "!type": "fn(type: string, listener: function) -> bool",
          "!doc": "Checks if listener is added to an event type."
        },
        "removeEventListener": {
          "!type": "fn(type: string, listener: function)",
          "!doc": "Removes a listener from an event type."
        },
        "dispatchEvent": {
          "!type": "fn(type: string)",
          "!doc": "Fire an event type."
        }
      },
      "!doc": "JavaScript events for custom objects.<br>\n\t\t<a href=\"https://github.com/mrdoob/eventdispatcher.js\">https://github.com/mrdoob/eventdispatcher.js</a>",
      "!type": "fn()"
    },
    "Face3": {
      "!url": "http://threejs.org/docs/#Reference/core/Face3",
      "prototype": {
        "a": {
          "!type": "number",
          "!doc": "Vertex A index."
        },
        "b": {
          "!type": "number",
          "!doc": "Vertex B index."
        },
        "c": {
          "!type": "number",
          "!doc": "Vertex C index."
        },
        "normal": {
          "!type": "+THREE.Vector3",
          "!doc": "Face normal."
        },
        "color": {
          "!type": "+THREE.Color",
          "!doc": "Face color."
        },
        "vertexNormals": {
          "!type": "[]",
          "!doc": "Array of 3 vertex normals."
        },
        "vertexColors": {
          "!type": "[]",
          "!doc": "Array of 3 vertex colors."
        },
        "materialIndex": {
          "!type": "number",
          "!doc": "Material index (points to [page:MultiMaterial MultiMaterial.materials])."
        },
        "clone": {
          "!type": "fn() -> +THREE.Face3",
          "!doc": "Creates a new clone of the Face3 object."
        }
      },
      "!doc": "Triangle face.",
      "!type": "fn(a: number, b: number, c: number, normal: +THREE.Vector3, color: +THREE.Color, materialIndex: number)"
    },
    "Geometry": {
      "!url": "http://threejs.org/docs/#Reference/core/Geometry",
      "prototype": {
        "id": {
          "!type": "number",
          "!doc": "Unique number for this geometry instance."
        },
        "name": {
          "!type": "string",
          "!doc": "Name for this geometry. Default is an empty string."
        },
        "vertices": {
          "!type": "[]",
          "!doc": "Array of [page:Vector3 vertices].<br>\n\t\tThe array of vertices holds every position of points in the model.<br>\n\t\tTo signal an update in this array, [page:Geometry Geometry.verticesNeedUpdate] needs to be set to true."
        },
        "colors": {
          "!type": "[]",
          "!doc": "Array of vertex [page:Color colors], matching number and order of vertices.<br>\n\t\tUsed in [page:PointCloud] and [page:Line].<br>\n\t\t[page:Mesh Meshes] use per-face-use-of-vertex colors embedded directly in faces.<br>\n\t\tTo signal an update in this array, [page:Geometry Geometry.colorsNeedUpdate] needs to be set to true."
        },
        "faces": {
          "!type": "[]",
          "!doc": "Array of [page:Face3 triangles].<br>\n\t\tThe array of faces describe how each vertex in the model is connected with each other.<br>\n\t\tTo signal an update in this array, [page:Geometry Geometry.elementsNeedUpdate] needs to be set to true."
        },
        "faceVertexUvs": {
          "!type": "[]",
          "!doc": "Array of face [page:UV] layers.<br>\n\t\tEach UV layer is an array of [page:UV]s matching the order and number of vertices in faces.<br>\n\t\tTo signal an update in this array, [page:Geometry Geometry.uvsNeedUpdate] needs to be set to true."
        },
        "morphTargets": {
          "!type": "[]",
          "!doc": "Array of morph targets. Each morph target is a Javascript object:\n\t\t<code>{ name: \"targetName\", vertices: [ new THREE.Vector3(), ... ] }</code>\n\t\tMorph vertices match number and order of primary vertices."
        },
        "morphNormals": {
          "!type": "[]",
          "!doc": "Array of morph normals. Morph normals have similar structure as morph targets, each normal set is a Javascript object:\n\t\t<code>morphNormal = { name: \"NormalName\", normals: [ new THREE.Vector3(), ... ] }</code>"
        },
        "skinWeights": {
          "!type": "[]",
          "!doc": "Array of skinning weights, matching number and order of vertices."
        },
        "skinIndices": {
          "!type": "[]",
          "!doc": "Array of skinning indices, matching number and order of vertices."
        },
        "boundingBox": {
          "!type": "object",
          "!doc": "Bounding box.\n\t\t<code>{ min: new THREE.Vector3(), max: new THREE.Vector3() }</code>"
        },
        "boundingSphere": {
          "!type": "object",
          "!doc": "Bounding sphere.\n\t\t<code>{ radius: float }</code>"
        },
        "dynamic": {
          "!type": "bool",
          "!doc": "Set to *true* if attribute buffers will need to change in runtime (using \"dirty\" flags).<br>\n\t\tUnless set to true internal typed arrays corresponding to buffers will be deleted once sent to GPU.<br>\n\t\tDefaults to true."
        },
        "verticesNeedUpdate": {
          "!type": "bool",
          "!doc": "Set to *true* if the vertices array has been updated."
        },
        "elementsNeedUpdate": {
          "!type": "bool",
          "!doc": "Set to *true* if the faces array has been updated."
        },
        "uvsNeedUpdate": {
          "!type": "bool",
          "!doc": "Set to *true* if the uvs array has been updated."
        },
        "normalsNeedUpdate": {
          "!type": "bool",
          "!doc": "Set to *true* if the normals array has been updated."
        },
        "colorsNeedUpdate": {
          "!type": "bool",
          "!doc": "Set to *true* if the colors array has been updated."
        },
        "lineDistancesNeedUpdate": {
          "!type": "bool",
          "!doc": "Set to *true* if the linedistances array has been updated."
        },
        "lineDistances": {
          "!type": "array",
          "!doc": "An array containing distances between vertices for Line geometries.\n\t\tThis is required for LinePieces/LineDashedMaterial to render correctly.\n\t\tLine distances can also be generated with computeLineDistances."
        },
        "applyMatrix": {
          "!type": "fn(matrix: +THREE.Matrix4)",
          "!doc": "Bakes matrix transform directly into vertex coordinates."
        },
        "computeFaceNormals": {
          "!type": "fn()",
          "!doc": "Computes face normals."
        },
        "computeVertexNormals": {
          "!type": "fn()",
          "!doc": "Computes vertex normals by averaging face normals.<br>\n\t\tFace normals must be existing / computed beforehand."
        },
        "computeMorphNormals": {
          "!type": "fn()",
          "!doc": "Computes morph normals."
        },
        "computeBoundingBox": {
          "!type": "fn()",
          "!doc": "Computes bounding box of the geometry, updating [page:Geometry Geometry.boundingBox] attribute."
        },
        "computeBoundingSphere": {
          "!type": "fn()",
          "!doc": "Neither bounding boxes or bounding spheres are computed by default. They need to be explicitly computed, otherwise they are *null*."
        },
        "merge": {
          "!type": "fn(geometry: +THREE.Geometry, matrix: +THREE.Matrix4, materialIndexOffset: number)",
          "!doc": "Merge two geometries or geometry and geometry from object (using object's transform)"
        },
        "mergeVertices": {
          "!type": "fn()",
          "!doc": "Checks for duplicate vertices using hashmap.<br>\n\t\tDuplicated vertices are removed and faces' vertices are updated."
        },
        "clone": {
          "!type": "fn() -> +THREE.Geometry",
          "!doc": "Creates a new clone of the Geometry."
        },
        "dispose": {
          "!type": "fn()",
          "!doc": "Removes The object from memory. <br>\n\t\tDon't forget to call this method when you remove a geometry because it can cause memory leaks."
        },
        "computeLineDistances": {
          "!type": "fn()",
          "!doc": "Compute distances between vertices for Line geometries."
        }
      },
      "!doc": "Base class for geometries.<br>\n\t\tA geometry holds all data necessary to describe a 3D model.",
      "!type": "fn()"
    },
    "Object3D": {
      "!url": "http://threejs.org/docs/#Reference/core/Object3D",
      "prototype": {
        "id": {
          "!type": "number",
          "!doc": "readonly – Unique number for this object instance."
        },
        "uuid": {
          "!type": "string",
          "!doc": "[link:http://en.wikipedia.org/wiki/Universally_unique_identifier UUID] of this object instance.\n\t\tThis gets automatically assigned, so this shouldn't be edited."
        },
        "name": {
          "!type": "string",
          "!doc": "Optional name of the object (doesn't need to be unique)."
        },
        "parent": {
          "!type": "+THREE.Object3D",
          "!doc": "Object's parent in the scene graph."
        },
        "children": {
          "!type": "+THREE.Object3D",
          "!doc": "Array with object's children."
        },
        "position": {
          "!type": "+THREE.Vector3",
          "!doc": "Object's local position."
        },
        "rotation": {
          "!type": "+THREE.Euler",
          "!doc": "Object's local rotation (<a href=\"https://en.wikipedia.org/wiki/Euler_angles\" target=\"_blank\">Euler angles</a>), in radians."
        },
        "scale": {
          "!type": "+THREE.Vector3",
          "!doc": "Object's local scale."
        },
        "up": {
          "!type": "+THREE.Vector3",
          "!doc": "Up direction."
        },
        "matrix": {
          "!type": "+THREE.Matrix4",
          "!doc": "Local transform."
        },
        "quaternion": {
          "!type": "+THREE.Quaternion",
          "!doc": "Object's local rotation as [page:Quaternion Quaternion]."
        },
        "visible": {
          "!type": "bool",
          "!doc": "default – true"
        },
        "castShadow": {
          "!type": "bool",
          "!doc": "default – false"
        },
        "receiveShadow": {
          "!type": "bool",
          "!doc": "default – false"
        },
        "frustumCulled": {
          "!type": "bool",
          "!doc": "default – true"
        },
        "matrixAutoUpdate": {
          "!type": "bool",
          "!doc": "default – true"
        },
        "matrixWorldNeedsUpdate": {
          "!type": "bool",
          "!doc": "default – false"
        },
        "userData": {
          "!type": "object",
          "!doc": "An object that can be used to store custom data about the Object3d. It should not hold references to functions as these will not be cloned."
        },
        "matrixWorld": {
          "!type": "+THREE.Matrix4",
          "!doc": "The global transform of the object. If the Object3d has no parent, then it's identical to the local transform."
        },
        "applyMatrix": {
          "!type": "fn(matrix: +THREE.Matrix4)",
          "!doc": "This updates the position, rotation and scale with the matrix."
        },
        "translateX": {
          "!type": "fn(distance: number)",
          "!doc": "Translates object along x axis by distance."
        },
        "translateY": {
          "!type": "fn(distance: number)",
          "!doc": "Translates object along y axis by distance."
        },
        "translateZ": {
          "!type": "fn(distance: number)",
          "!doc": "Translates object along z axis by distance."
        },
        "localToWorld": {
          "!type": "fn(vector: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Updates the vector from local space to world space."
        },
        "worldToLocal": {
          "!type": "fn(vector: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Updates the vector from world space to local space."
        },
        "lookAt": {
          "!type": "fn(vector: +THREE.Vector3)",
          "!doc": "Rotates object to face point in space."
        },
        "traverse": {
          "!type": "fn(callback: function)",
          "!doc": "Executes the callback on this object and all descendants."
        },
        "traverseVisible": {
          "!type": "fn(callback: function)",
          "!doc": "Like traverse, but the callback will only be executed for visible objects.\n\t\tDescendants of invisible objects are not traversed."
        },
        "traverseAncestors": {
          "!type": "fn(callback: function)",
          "!doc": "Executes the callback on this object and all ancestors."
        },
        "updateMatrix": {
          "!type": "fn()",
          "!doc": "Updates local transform."
        },
        "updateMatrixWorld": {
          "!type": "fn(force: bool)",
          "!doc": "Updates global transform of the object and its children."
        },
        "clone": {
          "!type": "fn() -> +THREE.Object3D",
          "!doc": "Creates a new clone of this object and all descendants."
        },
        "getObjectByName": {
          "!type": "fn(name: string) -> +THREE.Object3D",
          "!doc": "Searches through the object's children and returns the first with a matching name."
        },
        "getObjectById": {
          "!type": "fn(id: number) -> +THREE.Object3D",
          "!doc": "Searches through the object's children and returns the first with a matching id."
        },
        "translateOnAxis": {
          "!type": "fn(axis: +THREE.Vector3, distance: number) -> +THREE.Object3D",
          "!doc": "Translate an object by distance along an axis in object space. The axis is assumed to be normalized."
        },
        "rotateOnAxis": {
          "!type": "fn(axis: +THREE.Vector3, angle: number) -> +THREE.Object3D",
          "!doc": "Rotate an object along an axis in object space. The axis is assumed to be normalized."
        },
        "raycast": {
          "!type": "fn(raycaster: +THREE.Raycaster, intersects: []) -> []",
          "!doc": "Abstract method to get intersections between a casted ray and this object. Subclasses such as [page:Mesh], [page:Line], and [page:PointCloud] implement this method in order to participate in raycasting."
        }
      },
      "!doc": "Base class for scene graph objects.",
      "!type": "fn()"
    },
    "Raycaster": {
      "!url": "http://threejs.org/docs/#Reference/core/Raycaster",
      "prototype": {
        "ray": {
          "!type": "+THREE.Ray",
          "!doc": "The Ray used for the raycasting."
        },
        "near": {
          "!type": "float",
          "!doc": "The near factor of the raycaster. This value indicates which objects can be discarded based on the distance.<br>\n\t\tThis value shouldn't be negative and should be smaller than the far property."
        },
        "far": {
          "!type": "float",
          "!doc": "The far factor of the raycaster. This value indicates which objects can be discarded based on the distance.<br>\n\t\tThis value shouldn't be negative and should be larger than the near property."
        },
        "precision": {
          "!type": "float",
          "!doc": "The precision factor of the raycaster when intersecting [page:Mesh] objects."
        },
        "set": {
          "!type": "fn(origin: +THREE.Vector3, direction: +THREE.Vector3)",
          "!doc": "Updates the ray with a new origin and direction."
        },
        "setFromCamera": {
          "!type": "fn(coords: +THREE.Vector2, camera: +THREE.Camera)",
          "!doc": "Updates the ray with a new origin and direction."
        },
        "intersectObject": {
          "!type": "fn(object: +THREE.Object3D, recursive: bool) -> []",
          "!doc": "Checks all intersection between the ray and the object with or without the descendants. Intersections are returned sorted by distance, closest first. An array of intersections is returned...\n        <code>\n            [ { distance, point, face, faceIndex, indices, object }, ... ]\n        </code>\n        <p>\n        [page:Float distance] – distance between the origin of the ray and the intersection<br>\n        [page:Vector3 point] – point of intersection, in world coordinates<br>\n        [page:Face3 face] – intersected face<br>\n        [page:Integer faceIndex] – index of the intersected face<br>\n        [page:Array indices] – indices of vertices comprising the intersected face<br>\n        [page:Object3D object] – the intersected object\n    \t</p>\n        <p>\n        When intersecting a [page:Mesh] with a [page:BufferGeometry], the *faceIndex* will be *undefined*, and *indices* will be set; when intersecting a [page:Mesh] with a [page:Geometry], *indices* will be *undefined*. \n        </p>\n\t\t<p>\n\t\t*Raycaster* delegates to the [page:Object3D.raycast raycast] method of the passed object, when evaluating whether the ray intersects the object or not. This allows [page:Mesh meshes] to respond differently to ray casting than [page:Line lines] and [page:PointCloud pointclouds].\n\t\t</p>\n\t\t<p>\n\t\t*Note* that for meshes, faces must be pointed towards the origin of the [page:.ray ray] in order to be detected; intersections of the ray passing through the back of a face will not be detected. To raycast against both faces of an object, you'll want to set the [page:Mesh.material material]'s [page:Material.side side] property to *THREE.DoubleSide*.  \n\t\t</p>"
        },
        "intersectObjects": {
          "!type": "fn(objects: [], recursive: bool) -> []",
          "!doc": "Checks all intersection between the ray and the objects with or without the descendants. Intersections are returned sorted by distance, closest first. Intersections are of the same form as those returned by [page:.intersectObject]."
        }
      },
      "!doc": "This class makes raycasting easier. Raycasting is used for picking and more.",
      "!type": "fn(origin: +THREE.Vector3, direction: +THREE.Vector3, near: number, far: number)"
    },
    "Lut": {
      "!url": "http://threejs.org/docs/#Reference/examples/Lut",
      "prototype": {
        "minV": {
          "!type": "number",
          "!doc": "The minimum value to be represented with the lookup table. Default is 0."
        },
        "maxV": {
          "!type": "number",
          "!doc": "The maximum value to be represented with the lookup table. Default is 1."
        },
        "copy": {
          "!type": "fn(lut: +THREE.Lut)",
          "!doc": "Copies given lut."
        },
        "setminV": {
          "!type": "fn(minV: number) -> +THREE.Lut",
          "!doc": "Sets this Lut with the minimum value to be represented."
        },
        "setmaxV": {
          "!type": "fn(maxV: number) -> +THREE.Lut",
          "!doc": "Sets this Lut with the maximum value to be represented."
        },
        "changeNumberOfColors": {
          "!type": "fn(numberOfColors: number) -> +THREE.Lut",
          "!doc": "Sets this Lut with the number of colors to be used."
        },
        "changeColorMap": {
          "!type": "fn(colorMap: number) -> +THREE.Lut",
          "!doc": "Sets this Lut with the colormap to be used."
        },
        "addColorMap": {
          "!type": "fn(colorMapName, arrayOfColors) -> +THREE.Lut",
          "!doc": "Insert a new color map into the set of available color maps."
        },
        "getColor": {
          "!type": "fn(value) -> +THREE.Lut",
          "!doc": "Returns a Three.Color."
        }
      },
      "!doc": "Represents a lookup table for colormaps. It is used to determine the color values from a range of data values.",
      "!type": "fn(colormap, numberOfColors)"
    },
    "CombinedCamera": {
      "!url": "http://threejs.org/docs/#Reference/examples/cameras/CombinedCamera",
      "prototype": {
        "!proto": "THREE.Camera.prototype",
        "fov": {
          "!type": "number",
          "!doc": "Gets or sets the camera frustum vertical field of view in perspective view."
        },
        "left": {
          "!type": "number",
          "!doc": "Gets or sets the camera frustum left plane in orthographic view."
        },
        "right": {
          "!type": "number",
          "!doc": "Gets or sets the camera frustum right plane in orthographic view."
        },
        "top": {
          "!type": "number",
          "!doc": "Gets or sets the camera frustum top plane in orthographic view."
        },
        "bottom": {
          "!type": "number",
          "!doc": "Gets or sets the camera frustum bottom plane in orthographic view."
        },
        "zoom": {
          "!type": "number",
          "!doc": "Gets or sets the zoom factor of the camera."
        },
        "near": {
          "!type": "number",
          "!doc": "Gets camera frustum near plane."
        },
        "far": {
          "!type": "number",
          "!doc": "Gets camera frustum far plane."
        },
        "cameraO": {
          "!type": "+THREE.OrthographicCamera",
          "!doc": "Gets or sets the internal OrthographicCamera used as camera."
        },
        "cameraP": {
          "!type": "+THREE.PerspectiveCamera",
          "!doc": "Gets or sets the internal PerspectiveCamera used as camera."
        },
        "inOrthographicMode": {
          "!type": "boolean",
          "!doc": "Gets whether the combinedCamera is in Orthographic Mode."
        },
        "inPerspectiveMode": {
          "!type": "boolean",
          "!doc": "Gets whether the combinedCamera is in Perspective Mode."
        },
        "setFov": {
          "!type": "fn(fov: number)",
          "!doc": "sets the camera frustum vertical field of view in perspective view."
        },
        "setZoom": {
          "!type": "fn(zoom: number)",
          "!doc": "Sets the zoomfactor."
        },
        "setLens": {
          "!type": "fn(focalLength: number, frameHeight: number)",
          "!doc": "Sets the fov based on lens data."
        },
        "toFrontView": {
          "!type": "fn()",
          "!doc": "Sets the camera to view the front of the target."
        },
        "toBackView": {
          "!type": "fn()",
          "!doc": "Sets the camera to view the back of the target."
        },
        "toLeftView": {
          "!type": "fn()",
          "!doc": "Sets the camera to view the left of the target."
        },
        "toRightView": {
          "!type": "fn()",
          "!doc": "Sets the camera to view the right of the target."
        },
        "toTopView": {
          "!type": "fn()",
          "!doc": "Sets the camera to view the top."
        },
        "toBottomView": {
          "!type": "fn()",
          "!doc": "Sets the camera to view the bottom."
        },
        "setSize": {
          "!type": "fn(width: number, height: number)",
          "!doc": "Sets the size of the orthographic view."
        },
        "toOrthographic": {
          "!type": "fn()",
          "!doc": "Change the camera to orthographic view."
        },
        "toPerspective": {
          "!type": "fn()",
          "!doc": "Change the camera to Perspective view."
        },
        "updateProjectionMatrix": {
          "!type": "fn()",
          "!doc": "Updates the ProjectionMatrix."
        }
      },
      "!doc": "A general purpose camera, for setting FOV, Lens Focal Length,\n \t\tand switching between perspective and orthographic views easily.\n \t\tUse this only if you do not wish to manage\n \t\tboth an Orthographic and Perspective Camera",
      "!type": "fn(width: number, height: number, fov: number, near: number, far: number, orthoNear: number, orthoFar: number)"
    },
    "FontUtils": {
      "!url": "http://threejs.org/docs/#Reference/extras/FontUtils",
      "prototype": {
        "divisions": {
          "!type": "number",
          "!doc": "The amount of segments in a curve. Default is 10."
        },
        "style": {
          "!type": "string",
          "!doc": "The style of the used font. Default is \"normal\"."
        },
        "weight": {
          "!type": "string",
          "!doc": "The weight of the used font. Default is \"normal\"."
        },
        "face": {
          "!type": "string",
          "!doc": "The name of the font. Default is \"helvetiker\"."
        },
        "faces": {
          "!type": "object",
          "!doc": "All Fonts which are already loaded in."
        },
        "size": {
          "!type": "number",
          "!doc": "The size of the used Font. Default is 150."
        },
        "drawText": {
          "!type": "fn(text: string) -> object",
          "!doc": "Calculates the path and offset of the text in the used font. It returns an  object like { paths : fontPaths, offset : width }."
        },
        "Triangulate": {
          "!type": "fn(contour: [], indices: bool) -> []",
          "!doc": "Triangulates a contour into an array of faces."
        },
        "extractGlyphPoints": {
          "!type": "fn(c: string, face: string, scale: number, offset: number, path: +THREE.Path) -> object",
          "!doc": "This ectracts the glyphPoints of the character of the face and returns an object containing the path and the new offset."
        },
        "generateShapes": {
          "!type": "fn(text: string, parameters: object) -> []",
          "!doc": "Generates shapes from the text and return them as an Array of [page:Shape]."
        },
        "loadFace": {
          "!type": "fn(data: object) -> object",
          "!doc": "This loads and saves the data of the face and return the data. When you add the font Data as javascriptfile, then this automatically get called. So there is no need to do this yourself."
        },
        "getFace": {
          "!type": "fn() -> object",
          "!doc": "Returns the used font its data based on its style and weight."
        }
      },
      "!doc": "A class for text operations in three.js (See [page:TextGeometry])"
    },
    "GeometryUtils": {
      "!url": "http://threejs.org/docs/#Reference/extras/GeometryUtils",
      "prototype": {},
      "!doc": "Contains handy functions geometry manipulations."
    },
    "ImageUtils": {
      "!url": "http://threejs.org/docs/#Reference/extras/ImageUtils",
      "prototype": {
        "crossOrigin": {
          "!type": "string",
          "!doc": "The crossOrigin string to implement CORS for loading the image from a different domain that allows CORS."
        },
        "generateDataTexture": {
          "!type": "fn(width: number, height: number, color: number) -> +THREE.DataTexture",
          "!doc": "Generates a texture of a single color. It is a DataTexture with format, RGBFormat."
        },
        "parseDDS": {
          "!type": "fn(buffer: string, loadMipmaps: boolean) -> +THREE.CompressedTexture",
          "!doc": "Parses a DDS Image from the string into a CompressedTexture."
        },
        "loadCompressedTexture": {
          "!type": "fn(url: todo, mapping: todo, onLoad: todo, onError: todo) -> todo",
          "!doc": "todo"
        },
        "loadTexture": {
          "!type": "fn(url: string, mapping: UVMapping, onLoad: function, onError: function) -> todo",
          "!doc": "todo"
        },
        "getNormalMap": {
          "!type": "fn(image: todo, depth: todo) -> todo",
          "!doc": "todo"
        },
        "loadCompressedTextureCube": {
          "!type": "fn(array: todo, mapping: todo, onLoad: todo, onError: todo) -> todo",
          "!doc": "todo"
        },
        "loadTextureCube": {
          "!type": "fn(array: todo, mapping: todo, onLoad: todo, onError: todo) -> todo",
          "!doc": "todo"
        }
      },
      "!doc": "A Helper class to ease the loading of images of different types."
    },
    "SceneUtils": {
      "!url": "http://threejs.org/docs/#Reference/extras/SceneUtils",
      "prototype": {
        "createMultiMaterialObject": {
          "!type": "fn(geometry: +THREE.Geometry, materials: []) -> +THREE.Object3D",
          "!doc": "Creates an new Object3D an new mesh for each material defined in materials. Beware that this is not the same as MultiMaterial which defines multiple material for 1 mesh.<br>\n\t\tThis is mostly useful for object that need a material and a wireframe implementation."
        },
        "attach": {
          "!type": "fn(child: +THREE.Object3D, scene: +THREE.Object3D, parent: +THREE.Object3D)",
          "!doc": "Attaches the object to the parent without the moving the object in the worldspace."
        },
        "detach": {
          "!type": "fn(child: +THREE.Object3D, parent: +THREE.Object3D, scene: +THREE.Object3D)",
          "!doc": "Detaches the object from the parent and adds it back to the scene without moving in worldspace."
        }
      },
      "!doc": "A class containing useful utility functions for scene manipulation."
    },
    "Animation": {
      "!url": "http://threejs.org/docs/#Reference/extras/collada-animation/Animation",
      "prototype": {
        "root": {
          "!type": "Object3d",
          "!doc": "The root object of the animation."
        },
        "data": {
          "!type": "object",
          "!doc": "The data containing the animation"
        },
        "hierarchy": {
          "!type": "[]",
          "!doc": "The objects that are influenced by the animation."
        },
        "currentTime": {
          "!type": "number",
          "!doc": "The time elapsed since the last start/restart of the animation."
        },
        "timeScale": {
          "!type": "number",
          "!doc": "The timez"
        },
        "isPlaying": {
          "!type": "boolean",
          "!doc": "Indicates whether the animation is playing. This shouldn't be adapted by user code."
        },
        "isPaused": {
          "!type": "boolean",
          "!doc": "Indicates whether the animation is paused. This shouldn't be adapted by user code."
        },
        "loop": {
          "!type": "boolean",
          "!doc": "Set to make the animation restart when the animation ends."
        },
        "interpolationType": {
          "!type": "number",
          "!doc": "The type to indicate how to interpolate between 2 data points."
        },
        "play": {
          "!type": "fn(startTime: number)",
          "!doc": "Starts the animation from a moment startTime in the animation."
        },
        "stop": {
          "!type": "fn()",
          "!doc": "Stops the animation."
        },
        "update": {
          "!type": "fn(deltaTimeMS: number) -> bool",
          "!doc": "Updates the animation in time. This shouldn't be called by user code. The animationHandler calls this method."
        },
        "interpolateCatmullRom": {
          "!type": "fn(points: [], scale: number) -> array",
          "!doc": "Interpolates the point based on the key. Is used in update."
        },
        "getNextKeyWith": {
          "!type": "fn(type: string, h: object, key: number) -> object",
          "!doc": "Gets the next key. Is used in Update."
        },
        "getPrevKeyWith": {
          "!type": "fn(type: string, h: object, key: number) -> object",
          "!doc": "Gets the previous key. Is used in Update."
        }
      },
      "!doc": "This class animates an object based on an hierarchy. This hierarchy can be Object3ds or bones.",
      "!type": "fn(root: Object3d, name: string)"
    },
    "AnimationHandler": {
      "!url": "http://threejs.org/docs/#Reference/extras/collada-animation/AnimationHandler",
      "prototype": {
        "CATMULLROM": {
          "!type": "number",
          "!doc": "Enum Value to indicate that the animation needs to be interpolated as CATMULLROM."
        },
        "CATMULLROM_FORWARD": {
          "!type": "number",
          "!doc": "Enum Value to indicate that the animation needs to be interpolated as CATMULLROM_FORWARD."
        },
        "LINEAR": {
          "!type": "number",
          "!doc": "Enum Value to indicate that the animation needs to be interpolated as LINEAR."
        },
        "removeFromUpdate": {
          "!type": "fn(animation: +THREE.Animation)",
          "!doc": "Removes the animation from the update cycle. This gets called when the animation stops. This shouldn't be called by usercode."
        },
        "get": {
          "!type": "fn(name: string) -> object",
          "!doc": "Gets the animationData from its library."
        },
        "update": {
          "!type": "fn(deltaTimeMS: number)",
          "!doc": "Updates all active animations with deltaTime."
        },
        "parse": {
          "!type": "fn(root: object)",
          "!doc": "Parses the object to get the hierachy."
        },
        "add": {
          "!type": "fn(data: object)",
          "!doc": "Adds the animationData from its library."
        },
        "addToUpdate": {
          "!type": "fn(animation: +THREE.Animation)",
          "!doc": "Adds the animation from the update cycle. This gets called when the animation starts. This shouldn't be called by user code."
        }
      },
      "!doc": "The AnimationHandler handles the initialisation of the Animation data and \n\t\tthe animations itself. It keeps track of every animation and if it's active or not.\n\t\tIt also update all animations which are active if its method *update* is called.",
      "!type": "fn()"
    },
    "AnimationMorphTarget": {
      "!url": "http://threejs.org/docs/#Reference/extras/collada-animation/AnimationMorphTarget",
      "prototype": {
        "root": {
          "!type": "todo",
          "!doc": "todo"
        },
        "data": {
          "!type": "todo",
          "!doc": "todo"
        },
        "hierarchy": {
          "!type": "todo",
          "!doc": "todo"
        },
        "currentTime": {
          "!type": "number",
          "!doc": "todo"
        },
        "timeScale": {
          "!type": "number",
          "!doc": "todo"
        },
        "isPlaying": {
          "!type": "boolean",
          "!doc": "todo"
        },
        "isPaused": {
          "!type": "boolean",
          "!doc": "todo"
        },
        "loop": {
          "!type": "boolean",
          "!doc": "todo"
        },
        "influence": {
          "!type": "number",
          "!doc": "todo"
        },
        "play": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        },
        "pause": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        },
        "stop": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        },
        "update": {
          "!type": "fn(deltaTimeMS: todo) -> todo",
          "!doc": "todo"
        }
      },
      "!doc": "todo",
      "!type": "fn(root: todo, data: todo)"
    },
    "KeyFrameAnimation": {
      "!url": "http://threejs.org/docs/#Reference/extras/collada-animation/KeyFrameAnimation",
      "prototype": {
        "root": {
          "!type": "todo",
          "!doc": "todo"
        },
        "data": {
          "!type": "todo",
          "!doc": "todo"
        },
        "hierarchy": {
          "!type": "todo",
          "!doc": "todo"
        },
        "currentTime": {
          "!type": "number",
          "!doc": "todo"
        },
        "timeScale": {
          "!type": "number",
          "!doc": "todo"
        },
        "isPlaying": {
          "!type": "boolean",
          "!doc": "todo"
        },
        "isPaused": {
          "!type": "boolean",
          "!doc": "todo"
        },
        "loop": {
          "!type": "boolean",
          "!doc": "todo"
        },
        "JITCompile": {
          "!type": "boolean",
          "!doc": "todo"
        },
        "play": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        },
        "pause": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        },
        "stop": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        },
        "update": {
          "!type": "fn(deltaTimeMS: todo) -> todo",
          "!doc": "todo"
        },
        "interpolateCatmullRom": {
          "!type": "fn(points: todo, scale: todo) -> todo",
          "!doc": "todo"
        },
        "getNextKeyWith": {
          "!type": "fn(sid: todo, h: todo, key: todo) -> todo",
          "!doc": "todo"
        },
        "getPrevKeyWith": {
          "!type": "fn(sid: todo, h: todo, key: todo) -> todo",
          "!doc": "todo"
        }
      },
      "!doc": "todo",
      "!type": "fn(root: todo, data: todo, JITCompile: todo)"
    },
    "Curve": {
      "!url": "http://threejs.org/docs/#Reference/extras/core/Curve",
      "prototype": {
        "getPoint": {
          "!type": "fn(t) -> Vector",
          "!doc": "Returns a vector for point t of the curve where t is between 0 and 1"
        },
        "getPointAt": {
          "!type": "fn(u) -> Vector",
          "!doc": "Returns a vector for point at relative position in curve according to arc length"
        },
        "getPoints": {
          "!type": "fn(divisions) -> []",
          "!doc": "Get sequence of points using getPoint( t )"
        },
        "getSpacedPoints": {
          "!type": "fn(divisions) -> []",
          "!doc": "Get sequence of equi-spaced points using getPointAt( u )"
        },
        "getLength": {
          "!type": "fn() -> number",
          "!doc": "Get total curve arc length"
        },
        "getLengths": {
          "!type": "fn(divisions) -> []",
          "!doc": "Get list of cumulative segment lengths"
        },
        "updateArcLengths": {
          "!type": "fn()",
          "!doc": "Update the cumlative segment distance cache"
        },
        "getUtoTmapping": {
          "!type": "fn(u, distance) -> number",
          "!doc": "Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equidistant"
        },
        "getTangent": {
          "!type": "fn(t) -> Vector",
          "!doc": "Returns a unit vector tangent at t. If the subclassed curve do not implement its tangent derivation, 2 points a small delta apart will be used to find its gradient which seems to give a reasonable approximation"
        },
        "getTangentAt": {
          "!type": "fn(u) -> Vector",
          "!doc": "Returns tangent at equidistant point u on the curve"
        }
      },
      "!doc": "An extensible curve object which contains methods for interpolation.",
      "!type": "fn()"
    },
    "CurvePath": {
      "!url": "http://threejs.org/docs/#Reference/extras/core/CurvePath",
      "prototype": {
        "!proto": "THREE.Curve.prototype",
        "curves": {
          "!type": "array",
          "!doc": "todo"
        },
        "bends": {
          "!type": "array",
          "!doc": "todo"
        },
        "autoClose": {
          "!type": "boolean",
          "!doc": "todo"
        },
        "getWrapPoints": {
          "!type": "fn(oldPts: todo, path: todo) -> todo",
          "!doc": "todo"
        },
        "createPointsGeometry": {
          "!type": "fn(divisions: todo) -> todo",
          "!doc": "todo"
        },
        "addWrapPath": {
          "!type": "fn(bendpath: todo) -> todo",
          "!doc": "todo"
        },
        "createGeometry": {
          "!type": "fn(points: todo) -> todo",
          "!doc": "todo"
        },
        "add": {
          "!type": "fn(curve: todo) -> todo",
          "!doc": "todo"
        },
        "getTransformedSpacedPoints": {
          "!type": "fn(segments: todo, bends: todo) -> todo",
          "!doc": "todo"
        },
        "createSpacedPointsGeometry": {
          "!type": "fn(divisions: todo) -> todo",
          "!doc": "todo"
        },
        "closePath": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        },
        "getBoundingBox": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        },
        "getCurveLengths": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        },
        "getTransformedPoints": {
          "!type": "fn(segments: todo, bends: todo) -> todo",
          "!doc": "todo"
        },
        "checkConnection": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        }
      },
      "!doc": "todo",
      "!type": "fn()"
    },
    "Gyroscope": {
      "!url": "http://threejs.org/docs/#Reference/extras/core/Gyroscope",
      "prototype": {
        "!proto": "THREE.Object3D.prototype"
      },
      "!doc": "todo",
      "!type": "fn()"
    },
    "Path": {
      "!url": "http://threejs.org/docs/#Reference/extras/core/Path",
      "prototype": {
        "!proto": "THREE.CurvePath.prototype",
        "actions": {
          "!type": "array",
          "!doc": "The possible actions that define the path."
        },
        "fromPoints": {
          "!type": "fn(vectors) -> todo",
          "!doc": "Adds to the Path from the points. The first vector defines the offset. After that the lines get defined."
        },
        "moveTo": {
          "!type": "fn(x, y) -> todo",
          "!doc": "This moves the offset to x and y"
        },
        "lineTo": {
          "!type": "fn(x, y) -> todo",
          "!doc": "This creates a line from the offset to X and Y and updates the offset to X and Y."
        },
        "quadraticCurveTo": {
          "!type": "fn(aCPx, aCPy, aX, aY) -> todo",
          "!doc": "This creates a quadratic curve from the offset to aX and aY with aCPx and aCPy as control point and updates the offset to aX and aY."
        },
        "bezierCurveTo": {
          "!type": "fn(aCP1x, aCP1y, aCP2x, aCP2y, aX, aY) -> todo",
          "!doc": "This creates a bezier curve from the offset to aX and aY with aCP1x, aCP1y and aCP1x, aCP1y  as control points and updates the offset to aX and aY."
        },
        "arc": {
          "!type": "fn(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise) -> todo",
          "!doc": "todo"
        },
        "absarc": {
          "!type": "fn(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise) -> todo",
          "!doc": "todo"
        },
        "ellipse": {
          "!type": "fn(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise) -> todo",
          "!doc": "todo"
        },
        "absellipse": {
          "!type": "fn(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise) -> todo",
          "!doc": "todo"
        },
        "toShapes": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        }
      },
      "!doc": "A 2d path representation, comprising of points, lines, and cubes,  similar to the html5 2d canvas api. It extends CurvePath.",
      "!type": "fn(points: todo)"
    },
    "Shape": {
      "!url": "http://threejs.org/docs/#Reference/extras/core/Shape",
      "prototype": {
        "!proto": "THREE.Path.prototype",
        "holes": {
          "!type": "array",
          "!doc": "todo"
        },
        "makeGeometry": {
          "!type": "fn(options: todo) -> todo",
          "!doc": "Convenience method to return ShapeGeometry"
        },
        "extractAllPoints": {
          "!type": "fn(divisions: todo) -> todo",
          "!doc": "Get points of shape and holes (keypoints based on segments parameter)"
        },
        "extrude": {
          "!type": "fn(options: todo) -> todo",
          "!doc": "Convenience method to return ExtrudeGeometry"
        },
        "extractPoints": {
          "!type": "fn(divisions: todo) -> todo",
          "!doc": "todo"
        },
        "extractAllSpacedPoints": {
          "!type": "fn(divisions: todo) -> todo",
          "!doc": "todo"
        },
        "getPointsHoles": {
          "!type": "fn(divisions: todo) -> todo",
          "!doc": "Get points of holes"
        },
        "getSpacedPointsHoles": {
          "!type": "fn(divisions: todo) -> todo",
          "!doc": "Get points of holes (spaced by regular distance)"
        }
      },
      "!doc": "Defines a 2d shape plane using paths.",
      "!type": "fn()"
    },
    "ArcCurve": {
      "!url": "http://threejs.org/docs/#Reference/extras/curves/ArcCurve",
      "prototype": {
        "!proto": "THREE.EllipseCurve.prototype"
      },
      "!doc": "Alias for [page:EllipseCurve]"
    },
    "CubicBezierCurve": {
      "!url": "http://threejs.org/docs/#Reference/extras/curves/CubicBezierCurve",
      "prototype": {
        "!proto": "THREE.Curve.prototype",
        "v0": "+THREE.Vector2",
        "v1": "+THREE.Vector2",
        "v2": "+THREE.Vector2",
        "v3": "+THREE.Vector2"
      },
      "!doc": "Create a smooth 2d <a href=\"http://en.wikipedia.org/wiki/B%C3%A9zier_curve#mediaviewer/File:Bezier_curve.svg\" target=\"_blank\">cubic bezier curve</a>."
    },
    "CubicBezierCurve3": {
      "!url": "http://threejs.org/docs/#Reference/extras/curves/CubicBezierCurve3",
      "prototype": {
        "!proto": "THREE.Curve.prototype",
        "v0": "+THREE.Vector3",
        "v1": "+THREE.Vector3",
        "v2": "+THREE.Vector3",
        "v3": "+THREE.Vector3"
      },
      "!doc": "Create a smooth 3d <a href=\"http://en.wikipedia.org/wiki/B%C3%A9zier_curve#mediaviewer/File:Bezier_curve.svg\" target=\"_blank\">cubic bezier curve</a>.",
      "!type": "fn(v0: +THREE.Vector3, v1: +THREE.Vector3, v2: +THREE.Vector3, v3: +THREE.Vector3)"
    },
    "EllipseCurve": {
      "!url": "http://threejs.org/docs/#Reference/extras/curves/EllipseCurve",
      "prototype": {
        "!proto": "THREE.Curve.prototype",
        "aX": "number",
        "aY": "number",
        "xRadius": "Radians",
        "yRadius": "Radians",
        "aStartAngle": "number",
        "aEndAngle": "number",
        "aClockwise": "bool"
      },
      "!doc": "Creates a 2d curve in the shape of an ellipse.",
      "!type": "fn(aX: number, aY: number, xRadius: number, yRadius: number, aStartAngle: Radians, aEndAngle: Radians, aClockwise: bool)"
    },
    "LineCurve": {
      "!url": "http://threejs.org/docs/#Reference/extras/curves/LineCurve",
      "prototype": {
        "!proto": "THREE.Curve.prototype",
        "v1": "+THREE.Vector2",
        "v2": "+THREE.Vector2"
      },
      "!doc": "A curve representing a 2d line segment",
      "!type": "fn(v1: +THREE.Vector2, v2: +THREE.Vector2)"
    },
    "LineCurve3": {
      "!url": "http://threejs.org/docs/#Reference/extras/curves/LineCurve3",
      "prototype": {
        "!proto": "THREE.Curve.prototype",
        "v1": "+THREE.Vector3",
        "v2": "+THREE.Vector3"
      },
      "!doc": "A curve representing a 3d line segment",
      "!type": "fn(v1: +THREE.Vector3, v2: +THREE.Vector3)"
    },
    "QuadraticBezierCurve": {
      "!url": "http://threejs.org/docs/#Reference/extras/curves/QuadraticBezierCurve",
      "prototype": {
        "!proto": "THREE.Curve.prototype",
        "v0": "+THREE.Vector2",
        "v1": "+THREE.Vector2",
        "v2": "+THREE.Vector2"
      },
      "!doc": "Create a smooth 2d <a href=\"http://en.wikipedia.org/wiki/B%C3%A9zier_curve#mediaviewer/File:B%C3%A9zier_2_big.gif\" target=\"_blank\">quadratic bezier curve</a>.",
      "!type": "fn(v0: +THREE.Vector2, v1: +THREE.Vector2, v2: +THREE.Vector2)"
    },
    "QuadraticBezierCurve3": {
      "!url": "http://threejs.org/docs/#Reference/extras/curves/QuadraticBezierCurve3",
      "prototype": {
        "!proto": "THREE.Curve.prototype",
        "v0": "+THREE.Vector3",
        "v1": "+THREE.Vector3",
        "v2": "+THREE.Vector3"
      },
      "!doc": "Create a smooth 3d <a href=\"http://en.wikipedia.org/wiki/B%C3%A9zier_curve#mediaviewer/File:B%C3%A9zier_2_big.gif\" target=\"_blank\">quadratic bezier curve</a>.",
      "!type": "fn(v0: +THREE.Vector3, v1: +THREE.Vector3, v2: +THREE.Vector3)"
    },
    "SplineCurve": {
      "!url": "http://threejs.org/docs/#Reference/extras/curves/SplineCurve",
      "prototype": {
        "!proto": "THREE.Curve.prototype",
        "points": "[]"
      },
      "!doc": "Create a smooth 2d spline curve from a series of points",
      "!type": "fn(points: [])"
    },
    "BoxGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/BoxGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype"
      },
      "!doc": "BoxGeometry is the quadrilateral primitive geometry class. It is typically used for creating a cube or irregular quadrilateral of the dimensions provided with the 'width', 'height', and 'depth' constructor arguments.",
      "!type": "fn(width: number, height: number, depth: number, widthSegments: number, heightSegments: number, depthSegments: number)"
    },
    "CircleGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/CircleGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype"
      },
      "!doc": "CircleGeometry is a simple shape of Euclidean geometry.  It is contructed from a number of triangular segments that are oriented around a central point and extend as far out as a given radius.  It is built counter-clockwise from a start angle and a given central angle.  It can also be used to create regular polygons, where the number of segments determines the number of sides.",
      "!type": "fn(radius: number, segments: number, thetaStart: number, thetaLength: number)"
    },
    "CubeGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/CubeGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype"
      },
      "!doc": "Renamed CubeGeometry to BoxGeometry. see [page:BoxGeometry]."
    },
    "CylinderGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/CylinderGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype"
      },
      "!doc": "A class for generating cylinder geometries",
      "!type": "fn(radiusTop: number, radiusBottom: number, height: number, radiusSegments: number, heightSegments: number, openEnded: bool, thetaStart: number, thetaLength: number)"
    },
    "DodecahedronGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/DodecahedronGeometry",
      "prototype": {
        "!proto": "THREE.PolyhedronGeometry.prototype",
        "parameters": {
          "!type": "object",
          "!doc": "An object with all of the parameters that were used to generate the geometry."
        }
      },
      "!doc": "A class for generating a dodecahedron geometries.",
      "!type": "fn(radius: number, detail: number)"
    },
    "ExtrudeGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/ExtrudeGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype",
        "addShapeList": {
          "!type": "fn(shapes: [], options: object)",
          "!doc": "Adds the shapes to the list to extrude."
        },
        "addShape": {
          "!type": "fn(shape: +THREE.Shape, options: object)",
          "!doc": "Add the shape to the list to extrude."
        }
      },
      "!doc": "Creates extruded geometry from a path shape",
      "!type": "fn(shapes: [], options: object)"
    },
    "IcosahedronGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/IcosahedronGeometry",
      "prototype": {
        "!proto": "THREE.PolyhedronGeometry.prototype",
        "parameters": {
          "!type": "object",
          "!doc": "An object with all of the parameters that were used to generate the geometry."
        }
      },
      "!doc": "A class for generating an icosahedron geometry.",
      "!type": "fn(radius: number, detail: number)"
    },
    "LatheGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/LatheGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype"
      },
      "!doc": "Class for generating meshes with axial symmetry. Possible uses include donuts, pipes, vases etc. The lathe rotate around the Y axis.",
      "!type": "fn(points: [], segments: number, phiStart: number, phiLength: number)"
    },
    "OctahedronGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/OctahedronGeometry",
      "prototype": {
        "!proto": "THREE.PolyhedronGeometry.prototype",
        "parameters": {
          "!type": "object",
          "!doc": "An object with all of the parameters that were used to generate the geometry."
        }
      },
      "!doc": "A class for generating an octahedron geometry.",
      "!type": "fn(radius: number, detail: number)"
    },
    "ParametricGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/ParametricGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype"
      },
      "!doc": "Generate geometry representing a parametric surface.",
      "!type": "fn(func: function, slices: number, stacks: number)"
    },
    "PlaneGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/PlaneGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype"
      },
      "!doc": "A class for generating plane geometries",
      "!type": "fn(width: number, height: number, widthSegments: number, heightSegments: number)"
    },
    "PolyhedronGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/PolyhedronGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype",
        "parameters": {
          "!type": "object",
          "!doc": "An object with all of the parameters that were used to generate the geometry."
        }
      },
      "!doc": "A polyhedron is a solid in three dimensions with flat faces. This class will take an array of vertices,\n\t\t\tproject them onto a sphere, and then divide them up to the desired level of detail. This class is used\n\t\t\tby [page:DodecahedronGeometry], [page:IcosahedronGeometry], [page:OctahedronGeometry],\n\t\t\tand [page:TetrahedronGeometry] to generate their respective geometries.",
      "!type": "fn(vertices: [], faces: [], radius: number, detail: number)"
    },
    "RingGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/RingGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype"
      },
      "!doc": "A class for generating a two-dimensional ring geometry.",
      "!type": "fn(innerRadius: number, outerRadius: number, thetaSegments: number, phiSegments: number, thetaStart: number, thetaLength: number)"
    },
    "ShapeGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/ShapeGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype",
        "addShape": {
          "!type": "fn(shape: +THREE.Shape, options: object)",
          "!doc": "Adds a single shape to the geometry"
        }
      },
      "!doc": "Creates a one-sided polygonal geometry from one or more path shapes. Similar to [page:ExtrudeGeometry]",
      "!type": "fn(shapes: [], options: object)"
    },
    "SphereGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/SphereGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype"
      },
      "!doc": "A class for generating sphere geometries",
      "!type": "fn(radius: number, widthSegments: number, heightSegments: number, phiStart: number, phiLength: number, thetaStart: number, thetaLength: number)"
    },
    "TetrahedronGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/TetrahedronGeometry",
      "prototype": {
        "!proto": "THREE.PolyhedronGeometry.prototype",
        "parameters": {
          "!type": "object",
          "!doc": "An object with all of the parameters that were used to generate the geometry."
        }
      },
      "!doc": "A class for generating a tetrahedron geometries.",
      "!type": "fn(radius: number, detail: number)"
    },
    "TextGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/TextGeometry",
      "prototype": {
        "!proto": "THREE.ExtrudeGeometry.prototype"
      },
      "!doc": "This object creates an 3D object of text as a single object.",
      "!type": "fn(text: string, parameters: object)"
    },
    "TorusGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/TorusGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype"
      },
      "!doc": "A class for generating torus geometries",
      "!type": "fn(radius: number, tube: number, radialSegments: number, tubularSegments: number, arc: number)"
    },
    "TorusKnotGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/TorusKnotGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype"
      },
      "!doc": "Creates a torus knot, the particular shape of which is defined by a pair of coprime integers, p and q.  If p and q are not coprime, the result will be a torus link.",
      "!type": "fn(radius: number, tube: number, radialSegments: number, tubularSegments: number, p: number, q: number, heightScale: number)"
    },
    "TubeGeometry": {
      "!url": "http://threejs.org/docs/#Reference/geometries/TubeGeometry",
      "prototype": {
        "!proto": "THREE.Geometry.prototype",
        "parameters": {
          "!type": "object",
          "!doc": "An object with all of the parameters that were used to generate the geometry."
        },
        "tangents": {
          "!type": "[]",
          "!doc": "An array of [page:Vector3] tangents"
        },
        "normals": {
          "!type": "[]",
          "!doc": "An array of [page:Vector3] normals"
        },
        "binormals": {
          "!type": "[]",
          "!doc": "An array of [page:Vector3] binormals"
        }
      },
      "!doc": "Creates a tube that extrudes along a 3d curve",
      "!type": "fn(path: +THREE.Curve, segments: number, radius: number, radiusSegments: number, closed: bool)"
    },
    "ArrowHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/ArrowHelper",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "line": {
          "!type": "+THREE.Line",
          "!doc": "Contains the line part of the arrowHelper."
        },
        "cone": {
          "!type": "+THREE.Mesh",
          "!doc": "Contains the cone part of the arrowHelper."
        },
        "setColor": {
          "!type": "fn(hex: number)",
          "!doc": "Sets the color of the arrowHelper."
        },
        "setLength": {
          "!type": "fn(length: number, headLength: number, headWidth: number)",
          "!doc": "Sets the length of the arrowhelper."
        },
        "setDirection": {
          "!type": "fn(dir: +THREE.Vector3)",
          "!doc": "Sets the direction of the arrowhelper."
        }
      },
      "!doc": "An 3D arrow Object.",
      "!type": "fn(dir: +THREE.Vector3, origin: +THREE.Vector3, length: number, hex: number, headLength: number, headWidth: number)"
    },
    "AxisHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/AxisHelper",
      "prototype": {
        "!proto": "THREE.Line.prototype"
      },
      "!doc": "An axis object to visualize the the 3 axes in a simple way. <br>\n\t\t\tThe X axis is red. The Y axis is green. The Z axis is blue.",
      "!type": "fn(size: number)"
    },
    "BoundingBoxHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/BoundingBoxHelper",
      "prototype": {
        "!proto": "THREE.Mesh.prototype",
        "object": {
          "!type": "+THREE.Object3D",
          "!doc": "Contains the object3D to show the world-axis-aligned boundingbox."
        },
        "box": {
          "!type": "+THREE.Box3",
          "!doc": "Contains the bounding box of the object."
        },
        "update": {
          "!type": "fn()",
          "!doc": "Updates the BoundingBoxHelper based on the object property."
        }
      },
      "!doc": "A helper object to show the world-axis-aligned bounding box for an object.",
      "!type": "fn(object: +THREE.Object3D, hex: number)"
    },
    "BoxHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/BoxHelper",
      "prototype": {
        "!proto": "THREE.Line.prototype",
        "update": {
          "!type": "fn(object: +THREE.Object3D)",
          "!doc": "Updates the helper's geometry to match the dimensions of the [page:Geometry.boundingBox bounding box] of the passed object's geometry.\n\n\t\t<h2>Source</h2>\n\n\t\t[link:https://github.com/mrdoob/three.js/blob/master/src/[path].js src/[path].js]"
        }
      },
      "!doc": "Helper object to show a wireframe box (with no face diagonals) around an object",
      "!type": "fn(object: +THREE.Object3D)"
    },
    "CameraHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/CameraHelper",
      "prototype": {
        "!proto": "THREE.Line.prototype",
        "pointMap": {
          "!type": "object",
          "!doc": "This contains the points to viualize the cameraHelper"
        },
        "camera": {
          "!type": "+THREE.Camera",
          "!doc": "The camera to visualize."
        },
        "update": {
          "!type": "fn()",
          "!doc": "Updates the helper based on the projectionMatrix of the camera."
        }
      },
      "!doc": "The camera Helper is an Object3D which helps visualizing what a camera contains in its frustum.<br>\n\t\tIt visualizes the frustum with an line Geometry.",
      "!type": "fn(camera: +THREE.Camera)"
    },
    "DirectionalLightHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/DirectionalLightHelper",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "lightPlane": {
          "!type": "+THREE.Line",
          "!doc": "Contains the line mesh showing the location of the directional light."
        },
        "light": {
          "!type": "+THREE.DirectionalLight",
          "!doc": "Contains the directionalLight."
        },
        "targetLine": {
          "!type": "+THREE.Line",
          "!doc": "Contains the line mesh that shows the direction of the light."
        },
        "update": {
          "!type": "fn()",
          "!doc": "Updates the helper to match the position and direction of the [page:.light]."
        }
      },
      "!doc": "Visualize a [page:DirectionalLight]'s effect on the scene",
      "!type": "fn(light: +THREE.DirectionalLight, size: number)"
    },
    "EdgesHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/EdgesHelper",
      "prototype": {
        "!proto": "THREE.Line.prototype"
      },
      "!doc": "Creates a wireframe object that shows the \"hard\" edges of another object's geometry. To draw a full wireframe image of an object, see [page:WireframeHelper].",
      "!type": "fn(object: +THREE.Object3D, color: +THREE.Color, thresholdAngle: number)"
    },
    "FaceNormalsHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/FaceNormalsHelper",
      "prototype": {
        "!proto": "THREE.Line.prototype",
        "object": {
          "!type": "+THREE.Object3D",
          "!doc": "The attached object"
        },
        "update": {
          "!type": "fn()",
          "!doc": "Updates the face normal preview based on movement of the object."
        }
      },
      "!doc": "Renders [page:ArrowHelper arrows] to visualize an object's [page:Face3 face] normals. Requires that the object's geometry be an instance of [page:Geometry] (does not work with [page:BufferGeometry]), and that face normals have been specified on all [page:Face3 faces] or calculated with [page:Geometry.computeFaceNormals computeFaceNormals].",
      "!type": "fn(object: +THREE.Object3D, size: number, color: +THREE.Color, linewidth: number)"
    },
    "GridHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/GridHelper",
      "prototype": {
        "!proto": "THREE.Line.prototype"
      },
      "!doc": "The GridHelper is an object to define grids. Grids are two-dimensional arrays of lines.",
      "!type": "fn(size: number, step: number)"
    },
    "HemisphereLightHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/HemisphereLightHelper",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "lightSphere": {
          "!type": "+THREE.Mesh",
          "!doc": "The sphere mesh that shows the location of the hemispherelight."
        },
        "light": {
          "!type": "+THREE.HemisphereLight",
          "!doc": "Contains the HemisphereLight."
        },
        "update": {
          "!type": "fn()",
          "!doc": "Updates the helper to match the position and direction of the [page:.light]."
        }
      },
      "!doc": "Creates a visual aid for a [page:HemisphereLight HemisphereLight].",
      "!type": "fn(light: +THREE.HemisphereLight, sphereSize: number)"
    },
    "PointLightHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/PointLightHelper",
      "prototype": {
        "!proto": "THREE.Mesh.prototype",
        "lightSphere": {
          "!type": "+THREE.Mesh",
          "!doc": "todo"
        },
        "light": {
          "!type": "+THREE.PointLight",
          "!doc": "todo"
        },
        "update": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        }
      },
      "!doc": "This display a helper for a pointLight",
      "!type": "fn(light: todo, sphereSize: todo)"
    },
    "SpotLightHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/SpotLightHelper",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "lightSphere": {
          "!type": "+THREE.Mesh",
          "!doc": "todo"
        },
        "light": {
          "!type": "+THREE.SpotLight",
          "!doc": "todo"
        },
        "lightCone": {
          "!type": "+THREE.Mesh",
          "!doc": "todo"
        },
        "update": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        }
      },
      "!doc": "todo",
      "!type": "fn(light: todo, sphereSize: todo)"
    },
    "VertexNormalsHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/VertexNormalsHelper",
      "prototype": {
        "!proto": "THREE.Line.prototype",
        "object": {
          "!type": "+THREE.Object3D",
          "!doc": "The attached object"
        },
        "update": {
          "!type": "fn()",
          "!doc": "Updates the vertex normal preview based on movement of the object."
        }
      },
      "!doc": "Renders [page:ArrowHelper arrows] to visualize an object's vertex normal vectors. Requires that normals have been specified in a [page:BufferAttribute custom attribute] or have been calculated using [page:Geometry.computeVertexNormals computeVertexNormals].",
      "!type": "fn(object: +THREE.Object3D, size: number, color: +THREE.Color, linewidth: number)"
    },
    "WireframeHelper": {
      "!url": "http://threejs.org/docs/#Reference/extras/helpers/WireframeHelper",
      "prototype": {
        "!proto": "THREE.Line.prototype"
      },
      "!doc": "Creates a wireframe object that shows the edges of another object's geometry. To draw a  wireframe image showing only \"hard\" edges (edges between non-coplanar faces), see [page:EdgesHelper].",
      "!type": "fn(object: +THREE.Object3D, color: +THREE.Color)"
    },
    "ImmediateRenderObject": {
      "!url": "http://threejs.org/docs/#Reference/extras/objects/ImmediateRenderObject",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "render": {
          "!type": "fn(renderCallback: function)",
          "!doc": "This function needs to be overridden to start the creation of the object and should call renderCallback when finished."
        }
      },
      "!doc": "base class for immediate rendering objects.",
      "!type": "fn()"
    },
    "MorphBlendMesh": {
      "!url": "http://threejs.org/docs/#Reference/extras/objects/MorphBlendMesh",
      "prototype": {
        "!proto": "THREE.Mesh.prototype",
        "animationsMap": {
          "!type": "object",
          "!doc": "todo"
        },
        "animationsList": {
          "!type": "array",
          "!doc": "todo"
        },
        "setAnimationWeight": {
          "!type": "fn(name: todo, weight: todo) -> todo",
          "!doc": "todo"
        },
        "setAnimationFPS": {
          "!type": "fn(name: todo, fps: todo) -> todo",
          "!doc": "todo"
        },
        "createAnimation": {
          "!type": "fn(name: todo, start: todo, end: todo, fps: todo) -> todo",
          "!doc": "todo"
        },
        "playAnimation": {
          "!type": "fn(name: todo) -> todo",
          "!doc": "todo"
        },
        "update": {
          "!type": "fn(delta: todo) -> todo",
          "!doc": "todo"
        },
        "autoCreateAnimations": {
          "!type": "fn(fps: todo) -> todo",
          "!doc": "todo"
        },
        "setAnimationDuration": {
          "!type": "fn(name: todo, duration: todo) -> todo",
          "!doc": "todo"
        },
        "setAnimationDirectionForward": {
          "!type": "fn(name: todo) -> todo",
          "!doc": "todo"
        },
        "getAnimationDuration": {
          "!type": "fn(name: todo) -> todo",
          "!doc": "todo"
        },
        "getAnimationTime": {
          "!type": "fn(name: todo) -> todo",
          "!doc": "todo"
        },
        "setAnimationDirectionBackward": {
          "!type": "fn(name: todo) -> todo",
          "!doc": "todo"
        },
        "setAnimationTime": {
          "!type": "fn(name: todo, time: todo) -> todo",
          "!doc": "todo"
        },
        "stopAnimation": {
          "!type": "fn(name: todo) -> todo",
          "!doc": "todo"
        }
      },
      "!doc": "todo",
      "!type": "fn(geometry: todo, material: todo)"
    },
    "AmbientLight": {
      "!url": "http://threejs.org/docs/#Reference/lights/AmbientLight",
      "prototype": {
        "!proto": "THREE.Light.prototype"
      },
      "!doc": "This light's color gets applied to all the objects in the scene globally.",
      "!type": "fn(hex: number)"
    },
    "DirectionalLight": {
      "!url": "http://threejs.org/docs/#Reference/lights/DirectionalLight",
      "prototype": {
        "!proto": "THREE.Light.prototype",
        "target": {
          "!type": "+THREE.Object3D",
          "!doc": "Target used for shadow camera orientation."
        },
        "intensity": {
          "!type": "number",
          "!doc": "Light's intensity.<br>\n\t\t\tDefault — *1.0*."
        }
      },
      "!doc": "Affects objects using [page:MeshLambertMaterial] or [page:MeshPhongMaterial].",
      "!type": "fn(hex: number, intensity: number)"
    },
    "HemisphereLight": {
      "!url": "http://threejs.org/docs/#Reference/lights/HemisphereLight",
      "prototype": {
        "!proto": "THREE.Light.prototype",
        "groundColor": {
          "!type": "number",
          "!doc": "Light's ground color.<br>"
        },
        "intensity": {
          "!type": "number",
          "!doc": "Light's intensity.<br>\n\t\t\tDefault — *1.0*."
        }
      },
      "!doc": "A light source positioned directly above the scene.",
      "!type": "fn(skyColorHex: number, groundColorHex: number, intensity: number)"
    },
    "Light": {
      "!url": "http://threejs.org/docs/#Reference/lights/Light",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "color": {
          "!type": "+THREE.Color",
          "!doc": "Color of the light.<br>"
        }
      },
      "!doc": "Abstract base class for lights.",
      "!type": "fn(hex: number)"
    },
    "PointLight": {
      "!url": "http://threejs.org/docs/#Reference/lights/PointLight",
      "prototype": {
        "!proto": "THREE.Light.prototype",
        "intensity": {
          "!type": "number",
          "!doc": "Light's intensity.<br>\n\t\t\tDefault - *1.0*."
        },
        "distance": {
          "!type": "number",
          "!doc": "If non-zero, light will attenuate linearly from maximum intensity at light *position* down to zero at *distance*.<br>\n\t\t\tDefault — *0.0*."
        }
      },
      "!doc": "Affects objects using [page:MeshLambertMaterial] or [page:MeshPhongMaterial].",
      "!type": "fn(hex: number, intensity: number, distance: number)"
    },
    "SpotLight": {
      "!url": "http://threejs.org/docs/#Reference/lights/SpotLight",
      "prototype": {
        "!proto": "THREE.Light.prototype",
        "target": {
          "!type": "+THREE.Object3D",
          "!doc": "Spotlight focus points at target.position.<br>\n\t\t\tDefault position — *(0,0,0)*."
        },
        "intensity": {
          "!type": "number",
          "!doc": "Light's intensity.<br>\n\t\t\tDefault — *1.0*."
        },
        "distance": {
          "!type": "number",
          "!doc": "If non-zero, light will attenuate linearly from maximum intensity at light *position* down to zero at *distance*.<br>\n\t\t\tDefault — *0.0*."
        },
        "angle": {
          "!type": "number",
          "!doc": "Maximum extent of the spotlight, in radians, from its direction. Should be no more than *Math.PI/2*.<br>\n\t\t\tDefault — *Math.PI/3*."
        },
        "exponent": {
          "!type": "number",
          "!doc": "Rapidity of the falloff of light from its target direction.<br>\n\t\t\tDefault — *10.0*."
        }
      },
      "!doc": "A point light that can cast shadow in one direction.",
      "!type": "fn(hex: number, intensity: number, distance: todo, angle: todo, exponent: todo)"
    },
    "BabylonLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/BabylonLoader",
      "prototype": {
        "load": {
          "!type": "fn(url: string, onLoad: function, onProgress: function, onError: function)",
          "!doc": "Begin loading from url and call onLoad with the parsed response content."
        },
        "parse": {
          "!type": "fn(json: object) -> +THREE.Object3D",
          "!doc": "Parse a <em>JSON</em> structure and return an [page:Object3D object] or a [page:Scene scene].<br>\n\t\tFound objects are converted to [page:Mesh] with a [page:BufferGeometry] and a default [page:MeshPhongMaterial].<br>\n\t\tLights are parsed accordingly."
        }
      },
      "!doc": "A loader for loading a <em>.babylon</em> resource.",
      "!type": "fn(manager: +THREE.LoadingManager)"
    },
    "BufferGeometryLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/BufferGeometryLoader",
      "prototype": {
        "load": {
          "!type": "fn(url: string, onLoad: function, onProgress: function, onError: function)",
          "!doc": "Begin loading from url and call onLoad with the parsed response content."
        },
        "parse": {
          "!type": "fn(json: object) -> +THREE.BufferGeometry",
          "!doc": "Parse a <em>JSON</em> structure and return a [page:BufferGeometry]."
        }
      },
      "!doc": "A loader for loading a [page:BufferGeometry].",
      "!type": "fn(manager: +THREE.LoadingManager)"
    },
    "Cache": {
      "!url": "http://threejs.org/docs/#Reference/loaders/Cache",
      "prototype": {
        "files": {
          "!type": "object",
          "!doc": "An [page:Object object] that hold cached values."
        },
        "add": {
          "!type": "fn(key: string, value)",
          "!doc": "Adds a cache entry with that key to hold the value. If this key already holds a value, it is overwritten."
        },
        "get": {
          "!type": "fn(key: string)",
          "!doc": "Get the value of key. If the key does not exist the null value is returned."
        },
        "remove": {
          "!type": "fn(key: string)",
          "!doc": "Remove the cached value associated with the key."
        },
        "clear": {
          "!type": "fn()",
          "!doc": "Remove all values from the cache."
        }
      },
      "!doc": "A simple caching classe, used internaly by [page:FileLoader].",
      "!type": "fn()"
    },
    "ColladaLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/ColladaLoader",
      "prototype": {
        "options": {
          "!type": "[]",
          "!doc": "&nbsp;.[page:Boolean centerGeometry] — Force [page:Geometry] to always be centered at the local origin of the containing [page: Mesh].<br>\n\t\t&nbsp;.[page:Boolean convertUpAxis] — Axis conversion is done for geometries, animations, and controllers.<br>\n\t\t&nbsp;.[page:Boolean subdivideFaces] — Force subdivision into multiple [page: Face3].<br>\n\t\t&nbsp;.[page:String upAxis] — X, Y or Z<br>\n\t\t&nbsp;.[page:Boolean defaultEnvMap] — Cubemap to use for reflective or refractive materials.<br>"
        },
        "geometries": {
          "!type": "object",
          "!doc": "Parsed <em>.dae</em> geometries."
        },
        "load": {
          "!type": "fn(url: string, onLoad: function, onProgress: function)",
          "!doc": "Begin loading from url and call onLoad with the parsed response content."
        },
        "parse": {
          "!type": "fn(doc: Document, callBack: function, url: string) -> object",
          "!doc": "Parse an <em>XML Document</em> and return an [page:Object object] that contain loaded parts: .[page:Scene scene], .[page:Array morphs], .[page:Array skins], .[page:Array animations], .[page:Object dae]"
        },
        "setPreferredShading": {
          "!type": "fn(shading: number)",
          "!doc": "Set the .[page:Integer shading] property on the resource's materials.<br>\n\t\tOptions are [page:Materials THREE.SmoothShading], [page:Materials THREE.FlatShading]."
        },
        "applySkin": {
          "!type": "fn(geometry: +THREE.Geometry, instanceCtrl: object, frame: number)",
          "!doc": "Apply a skin (vertices, animation, bones) from a <em>collada skin controller</em>, on the given [page:Geometry]."
        }
      },
      "!doc": "A loader for <em>Collada</em> files.",
      "!type": "fn()"
    },
    "ImageLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/ImageLoader",
      "prototype": {
        "crossOrigin": {
          "!type": "string",
          "!doc": "The crossOrigin string to implement CORS for loading the url from a different domain that allows CORS."
        },
        "load": {
          "!type": "fn(url: string, onLoad: function, onProgress: function, onError: function)",
          "!doc": "Begin loading from url and return the [page:Image image] object that will contain the data."
        },
        "setCrossOrigin": {
          "!type": "fn(value: string)",
          "!doc": "The crossOrigin string to implement CORS for loading the url from a different domain that allows CORS."
        }
      },
      "!doc": "A loader for loading an [page:Image].",
      "!type": "fn(manager: +THREE.LoadingManager)"
    },
    "JSONLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/JSONLoader",
      "prototype": {
        "!proto": "THREE.Loader.prototype",
        "withCredentials": {
          "!type": "boolean",
          "!doc": "If true, the ajax request will use cookies."
        },
        "onLoadStart": {
          "!type": "function",
          "!doc": "The default is a function with empty body."
        },
        "onLoadComplete": {
          "!type": "function",
          "!doc": "The default is a function with empty body."
        },
        "load": {
          "!type": "fn(url: string, callback: function, texturePath: string)",
          "!doc": "[page:String url] — required<br>\n\t\t[page:Function callback] — required. Will be called when load completes. The arguments will be the loaded [page:Object3D] and the loaded [page:Array materials].<br>\n\t\t[page:String texturePath] — optional. If not specified, textures will be assumed to be in the same folder as the Javascript model file."
        },
        "loadAjaxJSON": {
          "!type": "fn(context: +THREE.JSONLoader, url: string, callback: function, texturePath: string, callbackProgress: function)",
          "!doc": "Begin loading from url and call <em>callback</em> with the parsed response content."
        },
        "parse": {
          "!type": "fn(json: object, texturePath: string) -> +THREE.Object3D",
          "!doc": "Parse a <em>JSON</em> structure and return an [page:Object] containing the parsed .[page:Geometry] and .[page:Array materials]."
        },
        "updateProgress": {
          "!type": "fn(progress: object)",
          "!doc": "Updates the DOM object with the progress made."
        },
        "createMaterial": {
          "!type": "fn(m: object, texturePath: string) -> +THREE.Material",
          "!doc": "Creates the Material based on the parameters m."
        },
        "initMaterials": {
          "!type": "fn(materials: [], texturePath: string) -> []",
          "!doc": "Creates an array of [page:Material] based on the array of parameters m. The index of the parameters decide the correct index of the materials."
        },
        "extractUrlBase": {
          "!type": "fn(url: string) -> string",
          "!doc": "Extract the base from the URL."
        }
      },
      "!doc": "A loader for loading objects in JSON format.",
      "!type": "fn()"
    },
    "Loader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/Loader",
      "prototype": {
        "onLoadStart": {
          "!type": "function",
          "!doc": "The default is a function with empty body."
        },
        "onLoadProgress": {
          "!type": "function",
          "!doc": "The default is a function with empty body."
        },
        "onLoadComplete": {
          "!type": "function",
          "!doc": "The default is a function with empty body."
        },
        "crossOrigin": {
          "!type": "string",
          "!doc": "The crossOrigin string to implement CORS for loading the url from a different domain that allows CORS."
        },
        "updateProgress": {
          "!type": "fn(progress: object)",
          "!doc": "Updates the DOM object with the progress made."
        },
        "createMaterial": {
          "!type": "fn(m: object, texturePath: string) -> +THREE.Material",
          "!doc": "Creates the Material based on the parameters m."
        },
        "initMaterials": {
          "!type": "fn(materials: [], texturePath: string) -> []",
          "!doc": "Creates an array of [page:Material] based on the array of parameters m. The index of the parameters decide the correct index of the materials."
        },
        "extractUrlBase": {
          "!type": "fn(url: string) -> string",
          "!doc": "Extract the base from the URL."
        }
      },
      "!doc": "Base class for implementing loaders.",
      "!type": "fn()"
    },
    "LoadingManager": {
      "!url": "http://threejs.org/docs/#Reference/loaders/LoadingManager",
      "prototype": {
        "onLoad": {
          "!type": "function",
          "!doc": "The function that needs to be called when all loaders are done."
        },
        "onProgress": {
          "!type": "function",
          "!doc": "The function that needs to be called when an item is complete. The arguments are url(The url of the item just loaded),<br>\n\t\tloaded(the amount of items already loaded), total( The total amount of items to be loaded.)"
        },
        "onError": {
          "!type": "function",
          "!doc": "The function that needs to be called when an item errors."
        },
        "itemStart": {
          "!type": "fn(url: string)",
          "!doc": "This should be called by any loader used by the manager when the loader starts loading an url. These shouldn't be called outside a loader."
        },
        "itemEnd": {
          "!type": "fn(url: string)",
          "!doc": "This should be called by any loader used by the manager when the loader ended loading an url.  These shouldn't be called outside a loader."
        }
      },
      "!doc": "Handles and keeps track of loaded and pending data.",
      "!type": "fn(onLoad: function, onProgress: function, onError: function)"
    },
    "MTLLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/MTLLoader",
      "prototype": {
        "load": {
          "!type": "fn(url: string, onLoad: function, onProgress: function, onError: function)",
          "!doc": "Begin loading from url and return the loaded material."
        },
        "parse": {
          "!type": "fn(text: string) -> MTLLoaderMaterialCreator",
          "!doc": "Parse a <em>mtl</em> text structure and return a [page:MTLLoaderMaterialCreator] instance.<br>"
        }
      },
      "!doc": "A loader for loading an <em>.mtl</em> resource, used internaly by [page:OBJMTLLoader] and [page:UTF8Loader].",
      "!type": "fn(baseUrl: string, options: object, crossOrigin: string)"
    },
    "MaterialLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/MaterialLoader",
      "prototype": {
        "load": {
          "!type": "fn(url: string, onLoad: function, onProgress: function, onError: function)",
          "!doc": "Begin loading from url and return the [page:Material] object that will contain the data."
        },
        "setCrossOrigin": {
          "!type": "fn(value: string)",
          "!doc": "The crossOrigin string to implement CORS for loading the url from a different domain that allows CORS."
        },
        "parse": {
          "!type": "fn(json: object) -> +THREE.Material",
          "!doc": "Parse a <em>JSON</em> structure and create a new [page:Material] of the type [page:String json.type] with parameters defined in the json object."
        }
      },
      "!doc": "A loader for loading a [page:Material] in JSON format.",
      "!type": "fn(manager: +THREE.LoadingManager)"
    },
    "OBJLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/OBJLoader",
      "prototype": {
        "load": {
          "!type": "fn(url: string, onLoad: function, onProgress: function, onError: function)",
          "!doc": "Begin loading from url and call onLoad with the parsed response content."
        },
        "parse": {
          "!type": "fn(text: string) -> +THREE.Object3D",
          "!doc": "Parse an <em>obj</em> text structure and return an [page:Object3D].<br>\n\t\tFound objects are converted to [page:Mesh] with a [page:BufferGeometry] and a default [page:MeshLambertMaterial]."
        }
      },
      "!doc": "A loader for loading an <em>.obj</em> resource.",
      "!type": "fn(manager: +THREE.LoadingManager)"
    },
    "OBJMTLLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/OBJMTLLoader",
      "prototype": {
        "load": {
          "!type": "fn(objUrl: string, mtlUrl: string, onLoad: function, onProgress: function, onError: function)",
          "!doc": "Begin loading from urls and call onLoad with the parsed response content."
        },
        "parse": {
          "!type": "fn(text: string, mtllibCallback: function) -> +THREE.Object3D",
          "!doc": "Parse an <em>obj</em> text structure and return an [page:Object3D].<br>\n\t\tFound objects are converted to a [page:Mesh] and materials are converted to [page:MeshLambertMaterial]."
        }
      },
      "!doc": "A loader for loading a <em>.obj</em> and its <em>.mtl</em> together.",
      "!type": "fn(manager: +THREE.LoadingManager)"
    },
    "ObjectLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/ObjectLoader",
      "prototype": {
        "load": {
          "!type": "fn(url: string, onLoad: function, onProgress: function, onError: function)",
          "!doc": "Begin loading from url and call onLoad with the parsed response content."
        },
        "parse": {
          "!type": "fn(json: object) -> +THREE.Object3D",
          "!doc": "Parse a <em>JSON</em> content and return a threejs object."
        },
        "setCrossOrigin": {
          "!type": "fn(value: string)",
          "!doc": "[page:String value] — The crossOrigin string to implement CORS for loading the url from a different domain that allows CORS."
        }
      },
      "!doc": "A loader for loading a JSON resource. Unlike the [page:JSONLoader], this one make use of the <em>.type</em> attributes of objects to map them to their original classes.",
      "!type": "fn(manager: +THREE.LoadingManager)"
    },
    "PDBLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/PDBLoader",
      "prototype": {
        "load": {
          "!type": "fn(url: string, onLoad: function, onProgress: function, onError: function)",
          "!doc": "Begin loading from url and call onLoad with the parsed response content."
        },
        "parsePDB": {
          "!type": "fn(text: string) -> object",
          "!doc": "Parse a <em>pdb</em> text and return a <em>JSON</em> structure.<br>"
        },
        "createModel": {
          "!type": "fn(json: object, callback: function)",
          "!doc": "Parse a <em>(JSON) pdb</em> structure and return two [page:Geometry]: one for atoms, one for bonds.<br>"
        }
      },
      "!doc": "A loader for loading a <em>.pdb</em> resource.\n\t\t<br><br>\n\t\tThe <a href=\"http://en.wikipedia.org/wiki/Protein_Data_Bank_(file_format)\">Protein Data Bank file format</a> is a textual file format describing the three-dimensional structures of molecules.",
      "!type": "fn(manager: +THREE.LoadingManager)"
    },
    "SVGLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/SVGLoader",
      "prototype": {
        "load": {
          "!type": "fn(url: string, onLoad: function, onProgress: function, onError: function)",
          "!doc": "Begin loading from url and call onLoad with the response content."
        }
      },
      "!doc": "A loader for loading an <em>.svg</em> resource.",
      "!type": "fn(manager: +THREE.LoadingManager)"
    },
    "TGALoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/TGALoader",
      "prototype": {
        "load": {
          "!type": "fn(url: string, onLoad: function, onProgress: function, onError: function) -> +THREE.DataTexture",
          "!doc": "Begin loading from url and pass the loaded [page:DataTexture texture] to onLoad. The [page:DataTexture texture] is also directly returned for immediate use (but may not be fully loaded)."
        }
      },
      "!doc": "Class for loading a <em>.tga</em> [page:DataTexture texture].",
      "!type": "fn(manager: +THREE.LoadingManager)"
    },
    "TextureLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/TextureLoader",
      "prototype": {
        "crossOrigin": {
          "!type": "string",
          "!doc": "default — *null*.<br>\n\t\tIf set, assigns the *crossOrigin* attribute of the image to the value of *crossOrigin*, prior to starting the load."
        },
        "load": {
          "!type": "fn(url: string, onLoad: function, onProgress: function, onError: function)",
          "!doc": "Begin loading from url and pass the loaded [page:Texture texture] to onLoad."
        }
      },
      "!doc": "Class for loading a [page:Texture texture].",
      "!type": "fn(manager: +THREE.LoadingManager)"
    },
    "FileLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/FileLoader",
      "prototype": {
        "cache": {
          "!type": "+THREE.Cache",
          "!doc": "A [page:Cache cache] instance that hold the response from each request made through this loader, so each file is requested once."
        },
        "crossOrigin": {
          "!type": "string",
          "!doc": "The crossOrigin string to implement CORS for loading the url from a different domain that allows CORS."
        },
        "responseType": {
          "!type": "string",
          "!doc": "Can be set to change the response type."
        },
        "load": {
          "!type": "fn(url: string, onLoad: function, onProgress: function, onError: function)",
          "!doc": "Begin loading from url and return the [page:String text] response that will contain the data."
        },
        "setCrossOrigin": {
          "!type": "fn(value: string)",
          "!doc": "[page:String value] — The crossOrigin string to implement CORS for loading the url from a different domain that allows CORS."
        },
        "setResponseType": {
          "!type": "fn(value: string)",
          "!doc": "[page:String value] — the empty string (default), \"arraybuffer\", \"blob\", \"document\", \"json\", or \"text\"."
        }
      },
      "!doc": "A low level class for loading resources with XmlHttpRequest, used internaly by most loaders.",
      "!type": "fn(manager: +THREE.LoadingManager)"
    },
    "GLTFLoader": {
      "!url": "http://threejs.org/docs/#Reference/loaders/GLTFLoader",
      "prototype": {
        "!proto": "THREE.Loader.prototype",
        "load": {
          "!type": "fn(url: string, callback: function) -> +THREE.Object3D",
          "!doc": "Begin loading from url and call the callback function with the parsed response content."
        }
      },
      "!doc": "A loader for loading a <em>.gltf</em> resource in <em>JSON</em> format.\n\t\t<br><br>\n\t\tThe <a href=\"https://www.khronos.org/gltf\">glTF file format</a> is a JSON file format to enable rapid delivery and loading of 3D content.",
      "!type": "fn()"
    },
    "LineBasicMaterial": {
      "!url": "http://threejs.org/docs/#Reference/materials/LineBasicMaterial",
      "prototype": {
        "!proto": "THREE.Material.prototype",
        "color": {
          "!type": "number",
          "!doc": "Sets the color of the line. Default is 0xffffff."
        },
        "linewidth": {
          "!type": "number",
          "!doc": "Due to limitations in the <a href=\"https://code.google.com/p/angleproject/\" target=\"_blank\">ANGLE layer</a>, on Windows platforms linewidth will always be 1 regardless of the set value."
        },
        "linecap": {
          "!type": "string",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:WebGLRenderer WebGL] renderer, but does work with the [page:CanvasRenderer Canvas] renderer."
        },
        "linejoin": {
          "!type": "string",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:WebGLRenderer WebGL] renderer, but does work with the [page:CanvasRenderer Canvas] renderer."
        },
        "vertexColors": {
          "!type": "number",
          "!doc": "This setting might not have any effect when used with certain renderers."
        },
        "fog": {
          "!type": "bool",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:CanvasRenderer Canvas] renderer, but does work with the [page:WebGLRenderer WebGL] renderer."
        }
      },
      "!doc": "A material for drawing wireframe-style geometries.",
      "!type": "fn(parameters: object)"
    },
    "LineDashedMaterial": {
      "!url": "http://threejs.org/docs/#Reference/materials/LineDashedMaterial",
      "prototype": {
        "!proto": "THREE.Material.prototype",
        "color": {
          "!type": "+THREE.Color",
          "!doc": "Sets the color of the line. Default is 0xffffff."
        },
        "linewidth": {
          "!type": "number",
          "!doc": "Due to limitations in the <a href=\"https://code.google.com/p/angleproject/\" target=\"_blank\">ANGLE layer</a>, on Windows platforms linewidth will always be 1 regardless of the set value."
        },
        "scale": {
          "!type": "number",
          "!doc": "The scale of the dashed part of a line."
        },
        "dashSize": {
          "!type": "number",
          "!doc": "The size of the dash. This is both the gap with the stroke. Default is 3."
        },
        "gapSize": {
          "!type": "number",
          "!doc": "The size of the gap. Default is 1."
        },
        "vertexColors": {
          "!type": "boolean",
          "!doc": "This setting might not have any effect when used with certain renderers."
        },
        "fog": {
          "!type": "boolean",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:CanvasRenderer Canvas] renderer, but does work with the [page:WebGLRenderer WebGL] renderer."
        }
      },
      "!doc": "A material for drawing wireframe-style geometries with dashed lines.",
      "!type": "fn(parameters: object)"
    },
    "Material": {
      "!url": "http://threejs.org/docs/#Reference/materials/Material",
      "prototype": {
        "id": {
          "!type": "number",
          "!doc": "Unique number for this material instance."
        },
        "name": {
          "!type": "string",
          "!doc": "Material name. Default is an empty string."
        },
        "opacity": {
          "!type": "number",
          "!doc": "Default is *1.0*."
        },
        "transparent": {
          "!type": "bool",
          "!doc": "Default is *false*."
        },
        "blendDst": {
          "!type": "number",
          "!doc": "Blending destination. It's one of the blending mode constants defined in [page:Three Three.js]. Default is [page:CustomBlendingEquation OneMinusSrcAlphaFactor]."
        },
        "blendEquation": {
          "!type": "number",
          "!doc": "Blending equation to use when applying blending. It's one of the constants defined in [page:Three Three.js]. Default is [page:CustomBlendingEquation AddEquation.]"
        },
        "depthTest": {
          "!type": "bool",
          "!doc": "Whether to have depth test enabled when rendering this material. Default is *true*."
        },
        "depthWrite": {
          "!type": "bool",
          "!doc": "When drawing 2D overlays it can be useful to disable the depth writing in order to layer several things together without creating z-index artifacts."
        },
        "polygonOffset": {
          "!type": "bool",
          "!doc": "Whether to use polygon offset. Default is *false*. This corresponds to the *POLYGON_OFFSET_FILL* WebGL feature."
        },
        "polygonOffsetFactor": {
          "!type": "number",
          "!doc": "Sets the polygon offset factor. Default is *0*."
        },
        "polygonOffsetUnits": {
          "!type": "number",
          "!doc": "Sets the polygon offset units. Default is *0*."
        },
        "alphaTest": {
          "!type": "number",
          "!doc": "Sets the alpha value to be used when running an alpha test. Default is *0*."
        },
        "overdraw": {
          "!type": "number",
          "!doc": "Amount of triangle expansion at draw time. This is a workaround for cases when gaps appear between triangles when using [page:CanvasRenderer]. *0.5* tends to give good results across browsers. Default is *0*."
        },
        "visible": {
          "!type": "bool",
          "!doc": "Defines whether this material is visible. Default is *true*."
        },
        "side": {
          "!type": "Enum",
          "!doc": "Default is [page:Materials THREE.FrontSide]. Other options are [page:Materials THREE.BackSide] and [page:Materials THREE.DoubleSide]."
        },
        "needsUpdate": {
          "!type": "bool",
          "!doc": "This property is automatically set to *true* when instancing a new material."
        },
        "clone": {
          "!type": "fn(material: material) -> +THREE.Material",
          "!doc": "This clones the material in the optional parameter and returns it."
        },
        "dispose": {
          "!type": "fn()",
          "!doc": "This disposes the material."
        },
        "setValues": {
          "!type": "fn(values: object)",
          "!doc": "Sets the properties based on the *values*."
        }
      },
      "!doc": "Materials describe the appearance of [page:Object objects]. They are defined in a (mostly) renderer-independent way, so you don't have to rewrite materials if you decide to use a different renderer.",
      "!type": "fn()"
    },
    "MeshBasicMaterial": {
      "!url": "http://threejs.org/docs/#Reference/materials/MeshBasicMaterial",
      "prototype": {
        "!proto": "THREE.Material.prototype",
        "color": {
          "!type": "number",
          "!doc": "Sets the color of the geometry. Default is 0xffffff."
        },
        "lightMap": {
          "!type": "+THREE.Texture",
          "!doc": "Set light map. Default is null."
        },
        "specularMap": {
          "!type": "+THREE.Texture",
          "!doc": "Set specular map. Default is null."
        },
        "alphaMap": {
          "!type": "+THREE.Texture",
          "!doc": "Only the color of the texture is used, ignoring the alpha channel if one exists. For RGB and RGBA textures, the [page:WebGLRenderer WebGL] renderer will use the green channel when sampling this texture due to the extra bit of precision provided for green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and luminance/alpha textures will also still work as expected."
        },
        "envMap": {
          "!type": "TextureCube",
          "!doc": "Set env map. Default is null."
        },
        "fog": {
          "!type": "bool",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:CanvasRenderer Canvas] renderer, but does work with the [page:WebGLRenderer WebGL] renderer."
        },
        "shading": {
          "!type": "string",
          "!doc": "Define shading type. Default is THREE.SmoothShading."
        },
        "wireframe": {
          "!type": "bool",
          "!doc": "Render geometry as wireframe. Default is false (i.e. render as flat polygons)."
        },
        "wireframeLinewidth": {
          "!type": "number",
          "!doc": "Due to limitations in the <a href=\"https://code.google.com/p/angleproject/\" target=\"_blank\">ANGLE layer</a>, on Windows platforms linewidth will always be 1 regardless of the set value."
        },
        "wireframeLinecap": {
          "!type": "string",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:WebGLRenderer WebGL] renderer, but does work with the [page:CanvasRenderer Canvas] renderer."
        },
        "wireframeLinejoin": {
          "!type": "string",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:WebGLRenderer WebGL] renderer, but does work with the [page:CanvasRenderer Canvas] renderer."
        },
        "vertexColors": {
          "!type": "number",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:CanvasRenderer Canvas] renderer, but does work with the [page:WebGLRenderer WebGL] renderer."
        },
        "skinning": {
          "!type": "bool",
          "!doc": "Define whether the material uses skinning. Default is false."
        },
        "morphTargets": {
          "!type": "bool",
          "!doc": "Define whether the material uses morphTargets. Default is false."
        },
        "map": {
          "!type": "+THREE.Texture",
          "!doc": "Sets the texture map. Default is  null."
        },
        "combine": {
          "!type": "number",
          "!doc": "How to combine the result of the surface's color with the environment map, if any."
        },
        "reflectivity": {
          "!type": "number",
          "!doc": "How much the environment map affects the surface; also see \"combine\"."
        },
        "refractionRatio": {
          "!type": "number",
          "!doc": "The index of refraction for an environment map using [page:Textures THREE.CubeRefractionMapping]. Default is *0.98*."
        }
      },
      "!doc": "A material for drawing geometries in a simple shaded (flat or wireframe) way.",
      "!type": "fn(parameters: object)"
    },
    "MeshDepthMaterial": {
      "!url": "http://threejs.org/docs/#Reference/materials/MeshDepthMaterial",
      "prototype": {
        "!proto": "THREE.Material.prototype",
        "morphTargets": {
          "!type": "boolean",
          "!doc": "Define whether the material uses morphTargets. Default is false."
        },
        "wireframe": {
          "!type": "boolean",
          "!doc": "Render geometry as wireframe. Default is false (i.e. render as smooth shaded)."
        },
        "wireframeLinewidth": {
          "!type": "number",
          "!doc": "Controls wireframe thickness. Default is 1.<br><br>\n\t\t\tDue to limitations in the ANGLE layer, on Windows platforms linewidth will always be 1 regardless of the set value."
        }
      },
      "!doc": "A material for drawing geometry by depth. Depth is based off of the camera near and far plane. White is nearest, black is farthest.",
      "!type": "fn(parameters: object)"
    },
    "MultiMaterial": {
      "!url": "http://threejs.org/docs/#Reference/materials/MultiMaterial",
      "prototype": {
        "materials": {
          "!type": "[]",
          "!doc": "Get or set the materials for the geometry."
        }
      },
      "!doc": "A Material to define multiple materials for the same geometry. \n\t\tThe geometry decides which material is used for which faces by the [page:Face3 faces materialindex].\n\t\tThe materialindex corresponds with the index of the material in the materials array.",
      "!type": "fn(materials: [])"
    },
    "MeshLambertMaterial": {
      "!url": "http://threejs.org/docs/#Reference/materials/MeshLambertMaterial",
      "prototype": {
        "!proto": "THREE.Material.prototype",
        "color": {
          "!type": "+THREE.Color",
          "!doc": "Diffuse color of the material. Default is white.<br>"
        },
        "emissive": {
          "!type": "+THREE.Color",
          "!doc": "Emissive (light) color of the material, essentially a solid color unaffected by other lighting. Default is black.<br>"
        },
        "wrapAround": {
          "!type": "boolean",
          "!doc": "Define whether the diffuse lighting wraps around the model or not. This option adds a little more (tintable) light\n\t\t\tonto the side of the object in relation to a light."
        },
        "wrapRGB": {
          "!type": "+THREE.Vector3",
          "!doc": "Decide how much of the wrap around values get used if the wrapAround option is set. The x, y, z values correspond\n\t\t\tto the r, g, b values respectively. The typical range is of each is from 0 to 1. For example setting all of the\n\t\t\tvector values to 0.5 will add a moderate amount of light to the side of the model. Changing *b* to 1 will\n\t\t\ttint the light on the side to be more blue. Defaults to *(1,1,1)*."
        },
        "map": {
          "!type": "+THREE.Texture",
          "!doc": "Set color texture map. Default is null."
        },
        "lightMap": {
          "!type": "+THREE.Texture",
          "!doc": "Set light map. Default is null."
        },
        "specularMap": {
          "!type": "+THREE.Texture",
          "!doc": "Since this material does not have a specular component, the specular value affects only how much of the environment map affects the surface. Default is null."
        },
        "alphaMap": {
          "!type": "+THREE.Texture",
          "!doc": "Only the color of the texture is used, ignoring the alpha channel if one exists. For RGB and RGBA textures, the [page:WebGLRenderer WebGL] renderer will use the green channel when sampling this texture due to the extra bit of precision provided for green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and luminance/alpha textures will also still work as expected."
        },
        "envMap": {
          "!type": "TextureCube",
          "!doc": "Set env map. Default is null."
        },
        "combine": {
          "!type": "number",
          "!doc": "Options are [page:Textures THREE.Multiply] (default), [page:Textures THREE.MixOperation], [page:Textures THREE.AddOperation]. If mix is chosen, the reflectivity is used to blend between the two colors."
        },
        "reflectivity": {
          "!type": "number",
          "!doc": "How much the environment map affects the surface; also see \"combine\"."
        },
        "refractionRatio": {
          "!type": "number",
          "!doc": "The index of refraction for an environment map using [page:Textures THREE.CubeRefractionMapping]. Default is *0.98*."
        },
        "fog": {
          "!type": "bool",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:CanvasRenderer Canvas] renderer, but does work with the [page:WebGLRenderer WebGL] renderer."
        },
        "shading": {
          "!type": "number",
          "!doc": "Options are [page:Materials THREE.SmoothShading] (default), [page:Materials THREE.FlatShading]."
        },
        "wireframe": {
          "!type": "bool",
          "!doc": "Whether the triangles' edges are displayed instead of surfaces. Default is *false*."
        },
        "wireframeLinewidth": {
          "!type": "number",
          "!doc": "Due to limitations in the <a href=\"https://code.google.com/p/angleproject/\" target=\"_blank\">ANGLE layer</a>, on Windows platforms linewidth will always be 1 regardless of the set value."
        },
        "wireframeLinecap": {
          "!type": "string",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:WebGLRenderer WebGL] renderer, but does work with the [page:CanvasRenderer Canvas] renderer."
        },
        "wireframeLinejoin": {
          "!type": "string",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:WebGLRenderer WebGL] renderer, but does work with the [page:CanvasRenderer Canvas] renderer."
        },
        "vertexColors": {
          "!type": "number",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:CanvasRenderer Canvas] renderer, but does work with the [page:WebGLRenderer WebGL] renderer."
        },
        "skinning": {
          "!type": "bool",
          "!doc": "Define whether the material uses skinning. Default is *false*."
        },
        "morphTargets": {
          "!type": "bool",
          "!doc": "Define whether the material uses morphTargets. Default is *false*."
        },
        "morphNormals": {
          "!type": "boolean",
          "!doc": "Defines whether the material uses morphNormals. Set as true to pass morphNormal attributes from the [page:Geometry]\n\t\t\tto the shader. Default is *false*."
        }
      },
      "!doc": "A material for non-shiny (Lambertian) surfaces, evaluated per vertex.",
      "!type": "fn(parameters: object)"
    },
    "MeshNormalMaterial": {
      "!url": "http://threejs.org/docs/#Reference/materials/MeshNormalMaterial",
      "prototype": {
        "!proto": "THREE.Material.prototype",
        "wireframe": {
          "!type": "boolean",
          "!doc": "Render geometry as wireframe. Default is false (i.e. render as smooth shaded)."
        },
        "wireframeLinewidth": {
          "!type": "number",
          "!doc": "Controls wireframe thickness. Default is 1.<br><br>\n\t\t\tDue to limitations in the ANGLE layer, on Windows platforms linewidth will always be 1 regardless of the set value."
        },
        "morphTargets": {
          "!type": "boolean",
          "!doc": "Define whether the material uses morphTargets. Default is false."
        }
      },
      "!doc": "A material that maps the normal vectors to RGB colors.",
      "!type": "fn(parameters: object)"
    },
    "MeshPhongMaterial": {
      "!url": "http://threejs.org/docs/#Reference/materials/MeshPhongMaterial",
      "prototype": {
        "!proto": "THREE.Material.prototype",
        "color": {
          "!type": "+THREE.Color",
          "!doc": "Diffuse color of the material. Default is white.<br>"
        },
        "emissive": {
          "!type": "+THREE.Color",
          "!doc": "Emissive (light) color of the material, essentially a solid color unaffected by other lighting. Default is black.<br>"
        },
        "specular": {
          "!type": "+THREE.Color",
          "!doc": "Specular color of the material, i.e., how shiny the material is and the color of its shine. Setting this the same color as the diffuse value (times some intensity) makes the material more metallic-looking; setting this to some gray makes the material look more plastic. Default is dark gray.<br>"
        },
        "shininess": {
          "!type": "number",
          "!doc": "How shiny the specular highlight is; a higher value gives a sharper highlight. Default is *30*. It should not be set to 0."
        },
        "metal": {
          "!type": "boolean",
          "!doc": "If set to true the shader multiplies the specular highlight by the underlying color of the object, making\n\t\t\tit appear to be more metal-like and darker. If set to false the specular highlight is added ontop of the\n\t\t\tunderlying colors."
        },
        "wrapAround": {
          "!type": "boolean",
          "!doc": "Define whether the diffuse lighting wraps around the model or not. This option adds a little more (tintable) light\n\t\t\tonto the side of the object in relation to a light."
        },
        "wrapRGB": {
          "!type": "+THREE.Vector3",
          "!doc": "Decide how much of the wrap around values get used if the wrapAround option is set. The x, y, z values correspond\n\t\t\tto the r, g, b values respectively. The typical range is of each is from 0 to 1. For example setting all of the\n\t\t\tvector values to 0.5 will add a moderate amount of light to the side of the model. Changing *b* to 1 will\n\t\t\ttint the light on the side to be more blue. Defaults to (1,1,1)."
        },
        "map": {
          "!type": "+THREE.Texture",
          "!doc": "Set color texture map. Default is null."
        },
        "lightMap": {
          "!type": "+THREE.Texture",
          "!doc": "Set light map. Default is null."
        },
        "bumpMap": {
          "!type": "+THREE.Texture",
          "!doc": "The texture to create a bump map. The black and white values map to the perceived depth in relation to the lights.\n\t\t\tBump doesn't actually affect the geometry of the object, only the lighting. If a normal map is defined this will\n\t\t\tbe ignored."
        },
        "bumpScale": {
          "!type": "number",
          "!doc": "How much the bump map affects the material. Typical ranges are 0-1. Default is 1."
        },
        "normalMap": {
          "!type": "+THREE.Texture",
          "!doc": "The texture to create a normal map. The RGB values affect the surface normal for each pixel fragment and change\n\t\t\tthe way the color is lit. Normal maps do not change the actual shape of the surface, only the lighting."
        },
        "normalScale": {
          "!type": "+THREE.Vector2",
          "!doc": "How much the normal map affects the material. Typical ranges are 0-1. Default is (1,1)."
        },
        "specularMap": {
          "!type": "+THREE.Texture",
          "!doc": "The specular map value affects both how much the specular surface highlight contributes and how much of the environment map affects the surface. Default is null."
        },
        "alphaMap": {
          "!type": "+THREE.Texture",
          "!doc": "Only the color of the texture is used, ignoring the alpha channel if one exists. For RGB and RGBA textures, the [page:WebGLRenderer WebGL] renderer will use the green channel when sampling this texture due to the extra bit of precision provided for green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and luminance/alpha textures will also still work as expected."
        },
        "envMap": {
          "!type": "TextureCube",
          "!doc": "Set env map. Default is null."
        },
        "combine": {
          "!type": "number",
          "!doc": "Options are [page:Textures THREE.MultiplyOperation] (default), [page:Textures THREE.MixOperation], [page:Textures THREE.AddOperation]. If mix is chosen, the reflectivity is used to blend between the two colors."
        },
        "reflectivity": {
          "!type": "number",
          "!doc": "How much the environment map affects the surface; also see \"combine\"."
        },
        "refractionRatio": {
          "!type": "number",
          "!doc": "The index of refraction for an environment map using [page:Textures THREE.CubeRefractionMapping]. Default is *0.98*."
        },
        "fog": {
          "!type": "bool",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:CanvasRenderer Canvas] renderer, but does work with the [page:WebGLRenderer WebGL] renderer."
        },
        "shading": {
          "!type": "number",
          "!doc": "Options are [page:Materials THREE.SmoothShading] (default), [page:Materials THREE.FlatShading]."
        },
        "wireframe": {
          "!type": "bool",
          "!doc": "Whether the triangles' edges are displayed instead of surfaces. Default is *false*."
        },
        "wireframeLinewidth": {
          "!type": "number",
          "!doc": "Due to limitations in the <a href=\"https://code.google.com/p/angleproject/\" target=\"_blank\">ANGLE layer</a>, on Windows platforms linewidth will always be 1 regardless of the set value."
        },
        "wireframeLinecap": {
          "!type": "string",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:WebGLRenderer WebGL] renderer, but does work with the [page:CanvasRenderer Canvas] renderer."
        },
        "wireframeLinejoin": {
          "!type": "string",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:WebGLRenderer WebGL] renderer, but does work with the [page:CanvasRenderer Canvas] renderer."
        },
        "vertexColors": {
          "!type": "number",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:CanvasRenderer Canvas] renderer, but does work with the [page:WebGLRenderer WebGL] renderer."
        },
        "skinning": {
          "!type": "bool",
          "!doc": "Define whether the material uses skinning. Default is *false*."
        },
        "morphTargets": {
          "!type": "bool",
          "!doc": "Define whether the material uses morphTargets. Default is *false*."
        },
        "morphNormals": {
          "!type": "boolean",
          "!doc": "Defines whether the material uses morphNormals. Set as true to pass morphNormal attributes from the [page:Geometry]\n\t\t\tto the shader. Default is *false*."
        }
      },
      "!doc": "A material for shiny surfaces, evaluated per pixel.",
      "!type": "fn(parameters: object)"
    },
    "PointCloudMaterial": {
      "!url": "http://threejs.org/docs/#Reference/materials/PointCloudMaterial",
      "prototype": {
        "!proto": "THREE.Material.prototype",
        "color": {
          "!type": "number",
          "!doc": "Sets the color of the particles. Default is 0xffffff."
        },
        "map": {
          "!type": "+THREE.Texture",
          "!doc": "Sets the color of the particles using data from a texture."
        },
        "size": {
          "!type": "number",
          "!doc": "Sets the size of the particles. Default is 1.0."
        },
        "sizeAttenuation": {
          "!type": "bool",
          "!doc": "Specify whether particles' size will get smaller with the distance. Default is true."
        },
        "vertexColors": {
          "!type": "bool",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:CanvasRenderer Canvas] renderer, but does work with the [page:WebGLRenderer WebGL] renderer."
        },
        "fog": {
          "!type": "bool",
          "!doc": "This setting might not have any effect when used with certain renderers. For example, it is ignored with the [page:CanvasRenderer Canvas] renderer, but does work with the [page:WebGLRenderer WebGL] renderer."
        }
      },
      "!doc": "The default material used by [page:PointCloud particle] systems.",
      "!type": "fn(parameters: object)"
    },
    "RawShaderMaterial": {
      "!url": "http://threejs.org/docs/#Reference/materials/RawShaderMaterial",
      "prototype": {
        "!proto": "THREE.ShaderMaterial.prototype"
      },
      "!doc": "This class works just like [page:ShaderMaterial], except that definitions of built-in uniforms and attributes are not automatically prepended to the GLSL shader code."
    },
    "ShaderMaterial": {
      "!url": "http://threejs.org/docs/#Reference/materials/ShaderMaterial",
      "prototype": {
        "!proto": "THREE.Material.prototype",
        "uniforms": {
          "!type": "object",
          "!doc": "Object specifying the uniforms to be passed to the shader code; keys are uniform names, values are definitions of the form\n\t\t<code>\n\t\t{ type: 'f', value: 1.0 }\n\t\t</code>\n\t\twhere *type* is a <a href=\"#uniform-types\">uniform type string</a>, and *value* is the value of the uniform. Names must match the name of the uniform, as defined in the GLSL code. Note that uniforms are refreshed on every frame, so updating the value of the uniform will immediately update the value available to the GLSL code."
        },
        "attributes": {
          "!type": "object",
          "!doc": "<p>\n\t\tObject specifying the custom attributes to be passed to the shader code; keys are attribute names, values are definitions of the form\n\t\t<code>\n\t\t{ type: 'f', value: [1.0, 0.5, 2.0, ...] }\n\t\t</code>\n\t\twhere *type* is an <a href=\"#attribute-types\">attribute type string</a>, and *value* is an array containing an attribute value for each vertex in the geometry (or *undefined* if using [page:BufferGeometry]). Names must match the name of the attribute, as defined in the GLSL code.\n\t\t</p>\n\t\t<p>\n\t\tNote that attribute buffers are <emph>not</emph> refreshed automatically when their values change; if using [page:Geometry], set <code>needsUpdate = true</code> on the attribute definition. If using [page:BufferGeometry], set <code>needsUpdate = true</code> on the [page:BufferAttribute].\n\t\t</p>"
        },
        "defines": {
          "!type": "object",
          "!doc": "Defines custom constants using *#define* directives within the GLSL code for both the vertex shader and the fragment shader; each key/value pair yields another directive:\n\t\t<code>\n\t\tdefines: {\n\t\t\tFOO: 15,\n\t\t\tBAR: true\n\t\t}\n\t\t</code>\n\t\tyields the lines\n\t\t<code>\n\t\t#define FOO 15\n\t\t#define BAR true\n\t\t</code>\n\t\tin the GLSL code."
        },
        "vertexShader": {
          "!type": "string",
          "!doc": "Vertex shader GLSL code.  This is the actual code for the shader. In the example above, the *vertexShader* and *fragmentShader* code is extracted from the DOM; it could be passed as a string directly or loaded via AJAX instead."
        },
        "fragmentShader": {
          "!type": "string",
          "!doc": "Fragment shader GLSL code.  This is the actual code for the shader. In the example above, the *vertexShader* and *fragmentShader* code is extracted from the DOM; it could be passed as a string directly or loaded via AJAX instead."
        },
        "shading": {
          "!type": "number",
          "!doc": "Define shading type, which determines whether normals are smoothed between vertices; possible values are [page:Materials THREE.SmoothShading] or [page:Materials THREE.FlatShading]. Default is THREE.SmoothShading."
        },
        "linewidth": {
          "!type": "number",
          "!doc": "Due to limitations in the <a href=\"https://code.google.com/p/angleproject/\" target=\"_blank\">ANGLE layer</a>, on Windows platforms linewidth will always be 1 regardless of the set value."
        },
        "wireframe": {
          "!type": "bool",
          "!doc": "Render geometry as wireframe (using GL_LINES instead of GL_TRIANGLES). Default is false (i.e. render as flat polygons)."
        },
        "wireframeLinewidth": {
          "!type": "number",
          "!doc": "Due to limitations in the <a href=\"https://code.google.com/p/angleproject/\" target=\"_blank\">ANGLE layer</a>, on Windows platforms linewidth will always be 1 regardless of the set value."
        },
        "fog": {
          "!type": "bool",
          "!doc": "Define whether the material color is affected by global fog settings; true to pass fog uniforms to the shader. Default is false."
        },
        "lights": {
          "!type": "bool",
          "!doc": "Defines whether this material uses lighting; true to pass uniform data related to lighting to this shader"
        },
        "vertexColors": {
          "!type": "number",
          "!doc": "Define how the vertices are colored, by defining how the *colors* attribute gets populated. Possible values are [page:Materials THREE.NoColors], [page:Materials THREE.FaceColors] and [page:Materials THREE.VertexColors]. Default is THREE.NoColors."
        },
        "skinning": {
          "!type": "bool",
          "!doc": "Define whether the material uses skinning; true to pass skinning attributes to the shader. Default is false."
        },
        "morphTargets": {
          "!type": "bool",
          "!doc": "Defines whether the material uses morphTargets; true morphTarget attributes to this shader"
        },
        "morphNormals": {
          "!type": "boolean",
          "!doc": "Defines whether the material uses morphNormals. Set as true to pass morphNormal attributes from the [page:Geometry]\n\t\t\tto the shader. Default is *false*."
        },
        "program": {
          "!type": "+THREE.WebGLProgram",
          "!doc": "The compiled shader program associated with this material, generated by [page:WebGLRenderer]. You should not need to access this property."
        },
        "clone": {
          "!type": "fn() -> +THREE.ShaderMaterial",
          "!doc": "Generates a shallow copy of this material. Note that the vertexShader and fragmentShader are copied <emph>by reference</emph>, as are the definitions of the *attributes*; this means that clones of the material will share the same compiled [page:WebGLProgram]. However, the *uniforms* are copied <emph>by value</emph>, which allows you to have different sets of uniforms for different copies of the material."
        }
      },
      "!doc": "Material rendered with custom shaders. A shader is a small program written in [link:https://www.opengl.org/documentation/glsl/ GLSL] to run on the GPU. You may want to use a custom shader if you need to:\n\t\t<ul>\n\t\t\t<li>implement an effect not included with any of the built-in [page:Material materials]</li>\n\t\t\t<li>combine many objects into a single [page:Geometry] or [page:BufferGeometry] in order to improve performance</li>\n\t\t\t<li>associate custom data with individual vertices (\"custom attributes\")</li>\n\t\t</ul>\n\t\tNote that a ShaderMaterial will only be rendered properly by [page:WebGLRenderer], since the GLSL code in the vertexShader and fragmentShader properties must be compiled and run on the GPU using WebGL.",
      "!type": "fn(parameters: object)"
    },
    "SpriteCanvasMaterial": {
      "!url": "http://threejs.org/docs/#Reference/materials/SpriteCanvasMaterial",
      "prototype": {
        "!proto": "THREE.Material.prototype",
        "color": {
          "!type": "+THREE.Color",
          "!doc": "The color of the sprite. The material will set up the color for the context before calling the material's program."
        },
        "program": {
          "!type": "fn(context: CanvasRenderingContext2D, color: +THREE.Color)",
          "!doc": "Define a program that will use the context to draw the sprite."
        }
      },
      "!doc": "Create a material that can draw custom sprites using a 2d canvas.",
      "!type": "fn(parameters: object)"
    },
    "SpriteMaterial": {
      "!url": "http://threejs.org/docs/#Reference/materials/SpriteMaterial",
      "prototype": {
        "!proto": "THREE.Material.prototype",
        "color": {
          "!type": "+THREE.Color",
          "!doc": "The texture is multiplied by this color. The default is 0xffffff"
        },
        "map": {
          "!type": "+THREE.Texture",
          "!doc": "The texture map. Default is null."
        },
        "rotation": {
          "!type": "Radians",
          "!doc": "The rotation of the sprite in radians. Default is 0."
        },
        "fog": {
          "!type": "boolean",
          "!doc": "Whether or not this material affected by the scene's fog. Default is false"
        }
      },
      "!doc": "A material for a [page:Sprite].",
      "!type": "fn(parameters: object)"
    },
    "Box2": {
      "!url": "http://threejs.org/docs/#Reference/math/Box2",
      "prototype": {
        "min": {
          "!type": "+THREE.Vector2",
          "!doc": "Lower (x, y) boundary of this box."
        },
        "max": {
          "!type": "+THREE.Vector2",
          "!doc": "Upper (x, y) boundary of this box."
        },
        "set": {
          "!type": "fn(min: +THREE.Vector2, max: +THREE.Vector2) -> +THREE.Box2",
          "!doc": "Sets the lower and upper (x, y) boundaries of this box."
        },
        "expandByPoint": {
          "!type": "fn(point: +THREE.Vector2) -> +THREE.Box2",
          "!doc": "Expands the boundaries of this box to include *point*."
        },
        "clampPoint": {
          "!type": "fn(point: +THREE.Vector2, optionalTarget: +THREE.Vector2) -> +THREE.Vector2",
          "!doc": "Clamps *point* within the bounds of this box."
        },
        "isIntersectionBox": {
          "!type": "fn(box: +THREE.Box2) -> bool",
          "!doc": "Determines whether or not this box intersects *box*."
        },
        "setFromPoints": {
          "!type": "fn(points: []) -> +THREE.Box2",
          "!doc": "Sets the upper and lower bounds of this box to include all of the points in *points*."
        },
        "size": {
          "!type": "fn(optionalTarget: +THREE.Vector2) -> +THREE.Vector2",
          "!doc": "Returns the width and height of this box."
        },
        "union": {
          "!type": "fn(box: +THREE.Box2) -> +THREE.Box2",
          "!doc": "Unions this box with *box* setting the upper bound of this box to the greater of the \n\t\ttwo boxes' upper bounds and the lower bound of this box to the lesser of the two boxes'\n\t\tlower bounds."
        },
        "getParameter": {
          "!type": "fn(point: +THREE.Vector2, optionalTarget: +THREE.Vector2) -> +THREE.Vector2",
          "!doc": "Returns a point as a proportion of this box's width and height."
        },
        "expandByScalar": {
          "!type": "fn(scalar: float) -> +THREE.Box2",
          "!doc": "Expands each dimension of the box by *scalar*. If negative, the dimensions of the box <br>\n\t\twill be contracted."
        },
        "intersect": {
          "!type": "fn(box: +THREE.Box2) -> +THREE.Box2",
          "!doc": "Returns the intersection of this and *box*, setting the upper bound of this box to the lesser <br>\n\t\tof the two boxes' upper bounds and the lower bound of this box to the greater of the two boxes' <br>\n\t\tlower bounds."
        },
        "containsBox": {
          "!type": "fn(box: +THREE.Box2) -> bool",
          "!doc": "Returns true if this box includes the entirety of *box*. If this and *box* overlap exactly,<br>\n\t\tthis function also returns true."
        },
        "translate": {
          "!type": "fn(offset: +THREE.Vector2) -> +THREE.Box2",
          "!doc": "Adds *offset* to both the upper and lower bounds of this box, effectively moving this box <br>\n\t\t*offset* units in 2D space."
        },
        "empty": {
          "!type": "fn() -> bool",
          "!doc": "Returns true if this box includes zero points within its bounds.<br>\n\t\tNote that a box with equal lower and upper bounds still includes one point, the\n\t\tone both bounds share."
        },
        "clone": {
          "!type": "fn() -> +THREE.Box2",
          "!doc": "Returns a copy of this box."
        },
        "equals": {
          "!type": "fn(box: +THREE.Box2) -> bool",
          "!doc": "Returns true if this box and *box* share the same lower and upper bounds."
        },
        "expandByVector": {
          "!type": "fn(vector: +THREE.Vector2) -> +THREE.Box2",
          "!doc": "Expands this box equilaterally by *vector*. The width of this box will be\n\t\texpanded by the x component of *vector* in both directions. The height of \n\t\tthis box will be expanded by the y component of *vector* in both directions."
        },
        "copy": {
          "!type": "fn(box: +THREE.Box2) -> +THREE.Box2",
          "!doc": "Copies the values of *box* to this box."
        },
        "makeEmpty": {
          "!type": "fn() -> +THREE.Box2",
          "!doc": "Makes this box empty."
        },
        "center": {
          "!type": "fn(optionalTarget: +THREE.Vector2) -> +THREE.Vector2",
          "!doc": "Returns the center point of this box."
        },
        "distanceToPoint": {
          "!type": "fn(point: +THREE.Vector2) -> number",
          "!doc": "Returns the distance from any edge of this box to the specified point. <br>\n\t\tIf the point lies inside of this box, the distance will be 0."
        },
        "containsPoint": {
          "!type": "fn(point: +THREE.Vector2) -> bool",
          "!doc": "Returns true if the specified point lies within the boundaries of this box."
        },
        "setFromCenterAndSize": {
          "!type": "fn(center: +THREE.Vector2, size: +THREE.Vector2) -> +THREE.Box2",
          "!doc": "Centers this box on *center* and sets this box's width and height to the values specified\n\t\tin *size*."
        }
      },
      "!doc": "Represents a boundary box in 2D space.",
      "!type": "fn(min: +THREE.Vector2, max: +THREE.Vector2)"
    },
    "Box3": {
      "!url": "http://threejs.org/docs/#Reference/math/Box3",
      "prototype": {
        "min": {
          "!type": "+THREE.Vector3",
          "!doc": "Lower (x, y, z) boundary of this box."
        },
        "max": {
          "!type": "+THREE.Vector3",
          "!doc": "Upper (x, y, z) boundary of this box."
        },
        "set": {
          "!type": "fn(min: +THREE.Vector3, max: +THREE.Vector3) -> +THREE.Box3",
          "!doc": "Sets the lower and upper (x, y, z) boundaries of this box."
        },
        "applyMatrix4": {
          "!type": "fn(matrix: +THREE.Matrix4) -> +THREE.Box3",
          "!doc": "Transforms this Box3 with the supplied matrix."
        },
        "clampPoint": {
          "!type": "fn(point: +THREE.Vector3, optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Clamps *point* within the bounds of this box."
        },
        "isIntersectionBox": {
          "!type": "fn(box: +THREE.Box3) -> bool",
          "!doc": "Determines whether or not this box intersects *box*."
        },
        "setFromPoints": {
          "!type": "fn(points: []) -> +THREE.Box3",
          "!doc": "Sets the upper and lower bounds of this box to include all of the points in *points*."
        },
        "setFromObject": {
          "!type": "fn(object: +THREE.Object3D) -> +THREE.Box3",
          "!doc": "Computes the world-axis-aligned bounding box of an object (including its children),\n\t\taccounting for both the object's, and childrens', world transforms"
        },
        "size": {
          "!type": "fn(optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Returns the width, height, and depth of this box."
        },
        "union": {
          "!type": "fn(box: +THREE.Box3) -> +THREE.Box3",
          "!doc": "Unions this box with *box* setting the upper bound of this box to the greater of the \n\t\ttwo boxes' upper bounds and the lower bound of this box to the lesser of the two boxes'\n\t\tlower bounds."
        },
        "getParameter": {
          "!type": "fn(point: +THREE.Vector3, optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Returns point as a proportion of this box's width and height."
        },
        "intersect": {
          "!type": "fn(box: +THREE.Box3) -> +THREE.Box3",
          "!doc": "Returns the intersection of this and *box*, setting the upper bound of this box to the lesser <br>\n\t\tof the two boxes' upper bounds and the lower bound of this box to the greater of the two boxes' <br>\n\t\tlower bounds."
        },
        "containsBox": {
          "!type": "fn(box: +THREE.Box3) -> bool",
          "!doc": "Returns true if this box includes the entirety of *box*. If this and *box* overlap exactly,<br>\n\t\tthis function also returns true."
        },
        "containsPoint": {
          "!type": "fn(point: +THREE.Vector3) -> bool",
          "!doc": "Returns true if the specified point lies within the boundaries of this box."
        },
        "translate": {
          "!type": "fn(offset: +THREE.Vector3) -> +THREE.Box3",
          "!doc": "Adds *offset* to both the upper and lower bounds of this box, effectively moving this box <br>\n\t\t*offset* units in 3D space."
        },
        "empty": {
          "!type": "fn() -> bool",
          "!doc": "Returns true if this box includes zero points within its bounds.<br>\n\t\tNote that a box with equal lower and upper bounds still includes one point, the\n\t\tone both bounds share."
        },
        "clone": {
          "!type": "fn() -> +THREE.Box3",
          "!doc": "Returns a copy of this box."
        },
        "equals": {
          "!type": "fn(box: +THREE.Box3) -> bool",
          "!doc": "Returns true if this box and *box* share the same lower and upper bounds."
        },
        "expandByPoint": {
          "!type": "fn(point: +THREE.Vector3) -> +THREE.Box3",
          "!doc": "Expands the boundaries of this box to include *point*."
        },
        "expandByScalar": {
          "!type": "fn(scalar: float) -> +THREE.Box3",
          "!doc": "Expands each dimension of the box by *scalar*. If negative, the dimensions of the box <br>\n\t\twill be contracted."
        },
        "expandByVector": {
          "!type": "fn(vector: +THREE.Vector3) -> +THREE.Box3",
          "!doc": "Expands this box equilaterally by *vector*. The width of this box will be\n\t\texpanded by the x component of *vector* in both directions. The height of \n\t\tthis box will be expanded by the y component of *vector* in both directions.\n\t\tThe depth of this box will be expanded by the z component of *vector* in\n\t\tboth directions."
        },
        "copy": {
          "!type": "fn(box: +THREE.Box3) -> +THREE.Box3",
          "!doc": "Copies the values of *box* to this box."
        },
        "makeEmpty": {
          "!type": "fn() -> +THREE.Box3",
          "!doc": "Makes this box empty."
        },
        "center": {
          "!type": "fn(optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Returns the center point of this box."
        },
        "getBoundingSphere": {
          "!type": "fn(optionalTarget: +THREE.Sphere) -> +THREE.Sphere",
          "!doc": "Gets a sphere that bounds the box."
        },
        "distanceToPoint": {
          "!type": "fn(point: +THREE.Vector3) -> number",
          "!doc": "Returns the distance from any edge of this box to the specified point. <br>\n\t\tIf the point lies inside of this box, the distance will be 0."
        },
        "setFromCenterAndSize": {
          "!type": "fn(center: +THREE.Vector3, size: +THREE.Vector3) -> +THREE.Box3",
          "!doc": "Centers this box on *center* and sets this box's width and height to the values specified\n\t\tin *size*."
        }
      },
      "!doc": "Represents a boundary box in 3d space.",
      "!type": "fn(min: +THREE.Vector3, max: +THREE.Vector3)"
    },
    "Color": {
      "!url": "http://threejs.org/docs/#Reference/math/Color",
      "prototype": {
        "r": {
          "!type": "number",
          "!doc": "Red channel value between 0 and 1. Default is 1."
        },
        "g": {
          "!type": "number",
          "!doc": "Green channel value between 0 and 1. Default is 1."
        },
        "b": {
          "!type": "number",
          "!doc": "Blue channel value between 0 and 1. Default is 1."
        },
        "copy": {
          "!type": "fn(color: +THREE.Color) -> +THREE.Color",
          "!doc": "Copies given color."
        },
        "copyGammaToLinear": {
          "!type": "fn(color: +THREE.Color) -> +THREE.Color",
          "!doc": "Copies given color making conversion from gamma to linear space."
        },
        "copyLinearToGamma": {
          "!type": "fn(color: +THREE.Color) -> +THREE.Color",
          "!doc": "Copies given color making conversion from linear to gamma space."
        },
        "convertGammaToLinear": {
          "!type": "fn() -> +THREE.Color",
          "!doc": "Converts this color from gamma to linear space."
        },
        "convertLinearToGamma": {
          "!type": "fn() -> +THREE.Color",
          "!doc": "Converts this color from linear to gamma space."
        },
        "setRGB": {
          "!type": "fn(r: number, g: number, b: number) -> +THREE.Color",
          "!doc": "Sets this color from RGB values."
        },
        "getHex": {
          "!type": "fn() -> number",
          "!doc": "Returns the hexadecimal value of this color."
        },
        "getHexString": {
          "!type": "fn() -> string",
          "!doc": "Returns the string formated hexadecimal value of this color."
        },
        "setHex": {
          "!type": "fn(hex: number) -> +THREE.Color",
          "!doc": "Sets this color from a hexadecimal value."
        },
        "setStyle": {
          "!type": "fn(style: string) -> +THREE.Color",
          "!doc": "Sets this color\tfrom a CSS-style string."
        },
        "getStyle": {
          "!type": "fn() -> string",
          "!doc": "Returns the value of this color as a CSS-style string. Example: rgb(255,0,0)"
        },
        "setHSL": {
          "!type": "fn(h: number, s: number, l: number) -> +THREE.Color",
          "!doc": "Sets color from hsl"
        },
        "offsetHSL": {
          "!type": "fn(h: number, s: number, l: number) -> +THREE.Color",
          "!doc": "Adds given h, s, and l to this color's existing h, s, and l values."
        },
        "add": {
          "!type": "fn(color: +THREE.Color) -> +THREE.Color",
          "!doc": "Adds rgb values of given color to rgb values of this color"
        },
        "addColors": {
          "!type": "fn(color1: +THREE.Color, color2: +THREE.Color) -> +THREE.Color",
          "!doc": "Sets this color to the sum of color1 and color2"
        },
        "addScalar": {
          "!type": "fn(s: number) -> +THREE.Color",
          "!doc": "Adds s to the rgb values of this color"
        },
        "multiply": {
          "!type": "fn(color: +THREE.Color) -> +THREE.Color",
          "!doc": "Multiplies this color's rgb values by given color's rgb values"
        },
        "multiplyScalar": {
          "!type": "fn(s: number) -> +THREE.Color",
          "!doc": "Multiplies this color's rgb values by s"
        },
        "lerp": {
          "!type": "fn(color: +THREE.Color, alpha) -> +THREE.Color",
          "!doc": "Linear interpolation of this colors rgb values and the rgb values of the first argument. The alpha argument can be thought of as the percent between the two colors, where 0 is this color and 1 is the first argument."
        },
        "toArray": {
          "!type": "fn(array: []) -> []",
          "!doc": "Returns an array [r,g,b]"
        },
        "equals": {
          "!type": "fn(c: +THREE.Color) -> +THREE.Color",
          "!doc": "Compares this color and c and returns true if they are the same, false otherwise."
        },
        "clone": {
          "!type": "fn() -> +THREE.Color",
          "!doc": "Clones this color."
        },
        "set": {
          "!type": "fn(value) -> +THREE.Color",
          "!doc": "Delegates to .copy, .setStyle, or .setHex depending on input type."
        }
      },
      "!doc": "Represents a color.",
      "!type": "fn(value)"
    },
    "Euler": {
      "!url": "http://threejs.org/docs/#Reference/math/Euler",
      "prototype": {
        "x": "number",
        "y": "number",
        "z": "number",
        "order": "string",
        "set": {
          "!type": "fn(x: number, y: number, z: number, order: string) -> +THREE.Euler",
          "!doc": "Sets the angles of this euler transform."
        },
        "copy": {
          "!type": "fn(euler: +THREE.Euler) -> +THREE.Euler",
          "!doc": "Copies value of *euler* to this euler."
        },
        "setFromRotationMatrix": {
          "!type": "fn(m: +THREE.Matrix4, order: string) -> +THREE.Euler",
          "!doc": "Sets the angles of this euler transform from a pure rotation matrix based on the orientation specified by order."
        },
        "setFromQuaternion": {
          "!type": "fn(q: +THREE.Quaternion, order: string) -> +THREE.Euler",
          "!doc": "Sets the angles of this euler transform from a normalized quaternion based on the orientation specified by order."
        },
        "reorder": {
          "!type": "fn(newOrder: string) -> +THREE.Euler",
          "!doc": "Resets the euler angle with a new order by creating a quaternion from this euler angle and then setting this euler angle with the quaternion and the new order. <br>\n\t\tWARNING: this discards revolution information."
        },
        "setFromVector3": {
          "!type": "fn(vector: +THREE.Vector3, order: string) -> +THREE.Euler",
          "!doc": "Optionally Vector3 to the XYZ parameters of Euler, and order to the Euler's order property."
        },
        "toVector3": {
          "!type": "fn() -> +THREE.Vector3",
          "!doc": "Returns the Euler's XYZ properties as a Vector3."
        },
        "fromArray": {
          "!type": "fn(array: []) -> +THREE.Euler",
          "!doc": "Assigns this euler's x angle to array[0]. <br>\n\t\tAssigns this euler's y angle to array[1]. <br>\n\t\tAssigns this euler's z angle to array[2]. <br>\n\t\tOptionally assigns this euler's order to array[3]."
        },
        "toArray": {
          "!type": "fn(array: []) -> []",
          "!doc": "Returns an array [x, y, z, order]"
        },
        "equals": {
          "!type": "fn(euler: +THREE.Euler) -> bool",
          "!doc": "Checks for strict equality of this euler and *euler*."
        },
        "clone": {
          "!type": "fn() -> +THREE.Euler",
          "!doc": "Returns a new euler created from this euler."
        }
      },
      "!doc": "Euler Angles. <br><br>\n\n\t\tEuler angles describe a rotation transformation by rotating an object on its various axes in specified amounts per axis, and a specified axis order.\n\t\t(More information on <a href=\"http://en.wikipedia.org/wiki/Euler_angles\" target=\"blank\">Wikipedia</a>)",
      "!type": "fn(x: number, y: number, z: number, order: string)"
    },
    "Frustum": {
      "!url": "http://threejs.org/docs/#Reference/math/Frustum",
      "prototype": {
        "planes": {
          "!type": "[]",
          "!doc": "Array of 6 [page:Plane planes]."
        },
        "setFromMatrix": {
          "!type": "fn(matrix: +THREE.Matrix4) -> +THREE.Frustum",
          "!doc": "Array of 6 [page:Plane planes]."
        },
        "intersectsObject": {
          "!type": "fn(object: +THREE.Object3D) -> bool",
          "!doc": "Checks whether the object's bounding sphere is intersecting the Frustum."
        },
        "clone": {
          "!type": "fn() -> +THREE.Frustum",
          "!doc": "Return a copy of this Frustum"
        },
        "set": {
          "!type": "fn(p0: +THREE.Plane, p1: +THREE.Plane, p2: +THREE.Plane, p3: +THREE.Plane, p4: +THREE.Plane, p5: +THREE.Plane) -> bool",
          "!doc": "Sets the current frustum from the passed planes. No plane order is implicitely implied."
        },
        "copy": {
          "!type": "fn(frustum: +THREE.Frustum) -> +THREE.Frustum",
          "!doc": "Copies the values of the passed frustum."
        },
        "containsPoint": {
          "!type": "fn(point: +THREE.Vector3) -> bool",
          "!doc": "Checks to see if the frustum contains the point."
        },
        "intersectsSphere": {
          "!type": "fn(sphere: +THREE.Sphere) -> bool",
          "!doc": "Check to see if the sphere intersects with the frustum."
        }
      },
      "!doc": "<a href=\"http://en.wikipedia.org/wiki/Frustum\">Frustums</a> are used to determine what is inside the camera's field of view. They help speed up the rendering process.",
      "!type": "fn(p0: +THREE.Plane, p1: +THREE.Plane, p2: +THREE.Plane, p3: +THREE.Plane, p4: +THREE.Plane, p5: +THREE.Plane)"
    },
    "Line3": {
      "!url": "http://threejs.org/docs/#Reference/math/Line3",
      "prototype": {
        "start": "+THREE.Vector3",
        "end": "+THREE.Vector3",
        "set": {
          "!type": "fn(start: +THREE.Vector3, end: +THREE.Vector3) -> +THREE.Line3",
          "!doc": "Sets the start and end values by copying the provided vectors."
        },
        "copy": {
          "!type": "fn(line: +THREE.Line3) -> +THREE.Line3",
          "!doc": "Copies the passed line's start and end vectors to this line."
        },
        "clone": {
          "!type": "fn() -> +THREE.Line3",
          "!doc": "Return a new copy of this [page:Line3]."
        },
        "equals": {
          "!type": "fn(line: +THREE.Line3) -> bool",
          "!doc": "<h3>[method:Float distance]()</h3>\n\t\t<div>\n\t\tReturns the length of the line segment.\n\t\t</div>\n\t\tReturns true if both line's start and end points are equal."
        },
        "distance": {
          "!type": "fn() -> number",
          "!doc": "Returns the length of the line segment."
        },
        "distanceSq": {
          "!type": "fn() -> number",
          "!doc": "Returns the line segment's length squared."
        },
        "applyMatrix4": {
          "!type": "fn(matrix: +THREE.Matrix4) -> +THREE.Line3",
          "!doc": "Apply a matrix transform to the line segment."
        },
        "at": {
          "!type": "fn(t: number, optionalTarget: +THREE.Vector3) -> Vector",
          "!doc": "Return a vector at a certain position along the line. When t = 0, it returns the start vector, and when t=1 it returns the end vector."
        },
        "center": {
          "!type": "fn(optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Return the center of the line segment."
        },
        "delta": {
          "!type": "fn(optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Returns the delta vector of the line segment, or the end vector minus the start vector."
        },
        "closestPointToPoint": {
          "!type": "fn(point: +THREE.Vector3, clampToLine: bool, optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Returns the closets point on the line. If clamp to line is true, then the returned value will be clamped to the line segment."
        },
        "closestPointToPointParameter": {
          "!type": "fn(point: +THREE.Vector3, clampToLine: bool) -> number",
          "!doc": "Returns a point parameter based on the closest point as projected on the line segement. If clamp to line is true, then the returned value will be between 0 and 1."
        }
      },
      "!doc": "A geometric line segment represented by a start and end point.",
      "!type": "fn(start: +THREE.Vector3, end: +THREE.Vector3)"
    },
    "Math": {
      "!url": "http://threejs.org/docs/#Reference/math/Math",
      "prototype": {
        "clamp": {
          "!type": "fn(x: number, a: number, b: number) -> number",
          "!doc": "Clamps the *x* to be between *a* and *b*."
        },
        "clampBottom": {
          "!type": "fn(x: number, a: number) -> number",
          "!doc": "Clamps the *x* to be larger than *a*."
        },
        "mapLinear": {
          "!type": "fn(x: number, a1: number, a2: number, b1: number, b2: number) -> number",
          "!doc": "Linear mapping of *x* from range [*a1*, *a2*] to range [*b1*, *b2*]."
        },
        "random16": {
          "!type": "fn() -> number",
          "!doc": "Random float from 0 to 1 with 16 bits of randomness.<br>\n\t\tStandard Math.random() creates repetitive patterns when applied over larger space."
        },
        "randInt": {
          "!type": "fn(low: number, high: number) -> number",
          "!doc": "Random integer from *low* to *high* interval."
        },
        "randFloat": {
          "!type": "fn(low: number, high: number) -> number",
          "!doc": "Random float from *low* to *high* interval."
        },
        "randFloatSpread": {
          "!type": "fn(range: number) -> number",
          "!doc": "Random float from *- range / 2* to *range / 2* interval."
        },
        "sign": {
          "!type": "fn(x: number) -> number",
          "!doc": "Returns -1 if *x* is less than 0, 1 if *x* is greater than 0, and 0 if *x* is zero."
        },
        "degToRad": {
          "!type": "fn(degrees: number) -> number",
          "!doc": "Converts degrees to radians."
        },
        "radToDeg": {
          "!type": "fn(radians: number) -> number",
          "!doc": "Converts radians to degrees"
        },
        "smoothstep": {
          "!type": "fn(x: number, min: number, max: number) -> number",
          "!doc": "Returns a value between 0-1 that represents the percentage that x has moved between min and max, but smoothed or slowed down the closer X is to the min and max.<br><br>\n\t\t\n\t\t[link:http://en.wikipedia.org/wiki/Smoothstep Wikipedia]"
        },
        "smootherstep": {
          "!type": "fn(x: number, min: number, max: number) -> number",
          "!doc": "Returns a value between 0-1. It works the same as smoothstep, but more smooth."
        }
      },
      "!doc": "Math utility functions"
    },
    "Matrix3": {
      "!url": "http://threejs.org/docs/#Reference/math/Matrix3",
      "prototype": {
        "elements": {
          "!type": "Float32Array",
          "!doc": "Float32Array with column-major matrix values."
        },
        "transpose": {
          "!type": "fn() -> +THREE.Matrix3",
          "!doc": "Transposes this matrix in place."
        },
        "transposeIntoArray": {
          "!type": "fn(array: []) -> +THREE.Matrix3",
          "!doc": "Transposes this matrix into the supplied array, and returns itself."
        },
        "determinant": {
          "!type": "fn() -> number",
          "!doc": "Returns the matrix's determinant."
        },
        "set": {
          "!type": "fn(n11: number, n12: number, n13: number, n21: number, n22: number, n23: number, n31: number, n32: number, n33: number) -> +THREE.Matrix3",
          "!doc": "Set the 3x3 matrix values to the given row-major sequence of values."
        },
        "multiplyScalar": {
          "!type": "fn(scalar: number) -> +THREE.Matrix3",
          "!doc": "Multiply every component of the matrix by a scalar value."
        },
        "applyToBufferAttribute": {
          "!type": "fn(attribute: []) -> +THREE.BufferAttribute",
          "!doc": "Multiply (apply) this matrix to every vector3 in the attribute."
        },
        "getNormalMatrix": {
          "!type": "fn(matrix4: +THREE.Matrix4) -> +THREE.Matrix3",
          "!doc": "Set this matrix as the normal matrix of the passed [page:Matrix4 matrix4]. The normal matrix is the inverse transpose of the matrix."
        },
        "getInverse": {
          "!type": "fn(matrix4: +THREE.Matrix4, throwOnInvertible: bool) -> +THREE.Matrix3",
          "!doc": "Set this matrix to the inverse of the passed matrix."
        },
        "copy": {
          "!type": "fn(matrix: +THREE.Matrix3) -> +THREE.Matrix3",
          "!doc": "Copy the values of the passed matrix."
        },
        "clone": {
          "!type": "fn() -> +THREE.Matrix3",
          "!doc": "Create a copy of the matrix."
        },
        "identity": {
          "!type": "fn() -> +THREE.Matrix3",
          "!doc": "Set as an identity matrix.<br><br>\n\t\t\n\t\t1, 0, 0<br>\n\t\t0, 1, 0<br>\n\t\t0, 0, 1<br>"
        }
      },
      "!doc": "A 3x3 matrix.",
      "!type": "fn(n11: number, n12: number, n13: number, n21: number, n22: number, n23: number, n31: number, n32: number, n33: number)"
    },
    "Matrix4": {
      "!url": "http://threejs.org/docs/#Reference/math/Matrix4",
      "prototype": {
        "elements": {
          "!type": "Float32Array",
          "!doc": "A column-major list of matrix values."
        },
        "set": {
          "!type": "fn(n11: number, n12: number, n13: number, n14: number, n21: number, n22: number, n23: number, n24: number, n31: number, n32: number, n33: number, n34: number, n41: number, n42: number, n43: number, n44: number) -> +THREE.Matrix4",
          "!doc": "Sets all fields of this matrix to the supplied row-major values n11..n44."
        },
        "identity": {
          "!type": "fn() -> +THREE.Matrix4",
          "!doc": "Resets this matrix to identity."
        },
        "copy": {
          "!type": "fn(m: +THREE.Matrix4) -> +THREE.Matrix4",
          "!doc": "Copies a matrix *m* into this matrix."
        },
        "copyPosition": {
          "!type": "fn(m: +THREE.Matrix4) -> +THREE.Matrix4",
          "!doc": "Copies the translation component of the supplied matrix *m* into this matrix translation component."
        },
        "makeBasis": {
          "!type": "fn(xAxis: +THREE.Vector3, zAxis: +THREE.Vector3, zAxis: +THREE.Vector3) -> +THREE.Matrix4",
          "!doc": "Creates the basis matrix consisting of the three provided axis vectors.  Returns the current matrix."
        },
        "extractBasis": {
          "!type": "fn(xAxis: +THREE.Vector3, zAxis: +THREE.Vector3, zAxis: +THREE.Vector3) -> +THREE.Matrix4",
          "!doc": "Extracts basis of into the three axis vectors provided.  Returns the current matrix."
        },
        "extractRotation": {
          "!type": "fn(m: +THREE.Matrix4) -> +THREE.Matrix4",
          "!doc": "Extracts the rotation of the supplied matrix *m* into this matrix rotation component."
        },
        "lookAt": {
          "!type": "fn(eye: +THREE.Vector3, center: +THREE.Vector3, up: +THREE.Vector3) -> +THREE.Matrix4",
          "!doc": "Constructs a rotation matrix, looking from *eye* towards *center* with defined *up* vector."
        },
        "multiply": {
          "!type": "fn(m: +THREE.Matrix4) -> +THREE.Matrix4",
          "!doc": "Multiplies this matrix by *m*."
        },
        "multiplyMatrices": {
          "!type": "fn(a: +THREE.Matrix4, b: +THREE.Matrix4) -> +THREE.Matrix4",
          "!doc": "Sets this matrix to *a x b*."
        },
        "multiplyToArray": {
          "!type": "fn(a: +THREE.Matrix4, b: +THREE.Matrix4, r: []) -> +THREE.Matrix4",
          "!doc": "Sets this matrix to *a x b* and stores the result into the flat array *r*.<br>\n\t\t*r* can be either a regular Array or a TypedArray."
        },
        "multiplyScalar": {
          "!type": "fn(s: number) -> +THREE.Matrix4",
          "!doc": "Multiplies this matrix by *s*."
        },
        "determinant": {
          "!type": "fn() -> number",
          "!doc": "Computes determinant of this matrix.<br>\n\t\tBased on [link:http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm]"
        },
        "transpose": {
          "!type": "fn() -> +THREE.Matrix4",
          "!doc": "Transposes this matrix."
        },
        "flattenToArrayOffset": {
          "!type": "fn(flat: [], offset: number) -> []",
          "!doc": "Flattens this matrix into supplied *flat* array starting from *offset* position in the array."
        },
        "setPosition": {
          "!type": "fn(v: +THREE.Vector3) -> +THREE.Matrix4",
          "!doc": "Sets the position component for this matrix from vector *v*."
        },
        "getInverse": {
          "!type": "fn(m: +THREE.Matrix4) -> +THREE.Matrix4",
          "!doc": "Sets this matrix to the inverse of matrix *m*.<br>\n\t\tBased on [link:http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm]."
        },
        "makeRotationFromEuler": {
          "!type": "fn(euler: +THREE.Euler) -> +THREE.Matrix4",
          "!doc": "Sets the rotation submatrix of this matrix to the rotation specified by Euler angles, the rest of the matrix is identity.<br>\n\t\tDefault order is *\"XYZ\"*."
        },
        "makeRotationFromQuaternion": {
          "!type": "fn(q: +THREE.Quaternion) -> +THREE.Matrix4",
          "!doc": "Sets the rotation submatrix of this matrix to the rotation specified by *q*. The rest of the matrix is identity."
        },
        "scale": {
          "!type": "fn(v: +THREE.Vector3) -> +THREE.Matrix4",
          "!doc": "Multiplies the columns of this matrix by vector *v*."
        },
        "compose": {
          "!type": "fn(translation: +THREE.Vector3, quaternion: +THREE.Quaternion, scale: +THREE.Vector3) -> +THREE.Matrix4",
          "!doc": "Sets this matrix to the transformation composed of *translation*, *quaternion* and *scale*."
        },
        "decompose": {
          "!type": "fn(translation: +THREE.Vector3, quaternion: +THREE.Quaternion, scale: +THREE.Vector3) -> []",
          "!doc": "Decomposes this matrix into the *translation*, *quaternion* and *scale* components."
        },
        "makeTranslation": {
          "!type": "fn(x: number, y: number, z: number) -> +THREE.Matrix4",
          "!doc": "Sets this matrix as translation transform."
        },
        "makeRotationX": {
          "!type": "fn(theta: number) -> +THREE.Matrix4",
          "!doc": "Sets this matrix as rotation transform around x axis by *theta* radians."
        },
        "makeRotationY": {
          "!type": "fn(theta: number) -> +THREE.Matrix4",
          "!doc": "Sets this matrix as rotation transform around y axis by *theta* radians."
        },
        "makeRotationZ": {
          "!type": "fn(theta: number) -> +THREE.Matrix4",
          "!doc": "Sets this matrix as rotation transform around z axis by *theta* radians."
        },
        "makeRotationAxis": {
          "!type": "fn(axis: +THREE.Vector3, theta: number) -> +THREE.Matrix4",
          "!doc": "Sets this matrix as rotation transform around *axis* by *angle* radians.<br>\n\t\tBased on [link:http://www.gamedev.net/reference/articles/article1199.asp]."
        },
        "makeScale": {
          "!type": "fn(x: number, y: number, z: number) -> +THREE.Matrix4",
          "!doc": "Sets this matrix as scale transform."
        },
        "makePerspective": {
          "!type": "fn(left: number, right: number, top: number, bottom: number, near: number, far: number) -> +THREE.Matrix4",
          "!doc": "Creates a perspective projection matrix."
        },
        "makeOrthographic": {
          "!type": "fn(left: number, right: number, top: number, bottom: number, near: number, far: number) -> +THREE.Matrix4",
          "!doc": "Creates an orthographic projection matrix."
        },
        "clone": {
          "!type": "fn() -> +THREE.Matrix4",
          "!doc": "Clones this matrix."
        },
        "applyToBufferAttribute": {
          "!type": "fn(attribute: []) -> +THREE.BufferAttribute",
          "!doc": "Multiply (apply) this matrix to every vector3 in the attribute."
        },
        "getMaxScaleOnAxis": {
          "!type": "fn() -> number",
          "!doc": "Gets the max scale value of the 3 axes."
        }
      },
      "!doc": "A 4x4 Matrix.",
      "!type": "fn(n11: number, n12: number, n13: number, n14: number, n21: number, n22: number, n23: number, n24: number, n31: number, n32: number, n33: number, n34: number, n41: number, n42: number, n43: number, n44: number)"
    },
    "Plane": {
      "!url": "http://threejs.org/docs/#Reference/math/Plane",
      "prototype": {
        "normal": "+THREE.Vector3",
        "constant": "number",
        "normalize": {
          "!type": "fn() -> +THREE.Plane",
          "!doc": "Normalizes the normal vector, and adjusts the constant value accordingly."
        },
        "set": {
          "!type": "fn(normal: +THREE.Vector3, constant: number) -> +THREE.Plane",
          "!doc": "Sets the plane's values."
        },
        "copy": {
          "!type": "fn(plane: +THREE.Plane) -> +THREE.Plane",
          "!doc": "Copies the values of the passed plane to this plane."
        },
        "applyMatrix4": {
          "!type": "fn(matrix: +THREE.Matrix4, optionalNormalMatrix: +THREE.Matrix3) -> +THREE.Plane",
          "!doc": "Apply a Matrix4 to the plane. The second parameter is optional.\n\t\t\n\t\t<code>\n\t\tvar optionalNormalMatrix = new THREE.Matrix3().getNormalMatrix( matrix ) \n\t\t</code>"
        },
        "orthoPoint": {
          "!type": "fn(point: +THREE.Vector3, optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Returns a vector in the same direction as the Plane's normal, but the magnitude is passed point's original distance to the plane."
        },
        "isIntersectionLine": {
          "!type": "fn(line: +THREE.Line3) -> bool",
          "!doc": "Tests whether a line segment intersects with the plane. (Do not mistake this for a collinear check.)"
        },
        "intersectLine": {
          "!type": "fn(line: +THREE.Line3, optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Returns the intersection point of the passed line and the plane. Returns undefined if the line does not intersect. Returns the line's starting point if the line is coplanar with the plane."
        },
        "setFromNormalAndCoplanarPoint": {
          "!type": "fn(normal: +THREE.Vector3, point: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Sets the plane's values as defined by a normal and arbitrary coplanar point."
        },
        "clone": {
          "!type": "fn() -> +THREE.Plane",
          "!doc": "Returns a new copy of this plane."
        },
        "distanceToPoint": {
          "!type": "fn(point: +THREE.Vector3) -> number",
          "!doc": "Returns the smallest distance from the point to the plane."
        },
        "equals": {
          "!type": "fn(plane: +THREE.Plane) -> bool",
          "!doc": "Checks to see if two planes are equal (their normals and constants match)"
        },
        "setComponents": {
          "!type": "fn(x: number, y: number, z: number, w: number) -> +THREE.Plane",
          "!doc": "Set the individual components that make up the plane."
        },
        "distanceToSphere": {
          "!type": "fn(sphere: +THREE.Sphere) -> number",
          "!doc": "Returns the smallest distance from an edge of the sphere to the plane."
        },
        "setFromCoplanarPoints": {
          "!type": "fn(a: +THREE.Vector3, b: +THREE.Vector3, c: +THREE.Vector3) -> +THREE.Plane",
          "!doc": "Defines the plane based on the 3 provided points. The winding order is counter clockwise, and determines which direction the normal will point."
        },
        "projectPoint": {
          "!type": "fn(point: +THREE.Vector3, optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Projects a point onto the plane. The projected point is the closest point on the plane to the passed point, so a line drawn from the projected point and the passed point would be orthogonal to the plane."
        },
        "negate": {
          "!type": "fn() -> +THREE.Plane",
          "!doc": "Negates both the normal vector and constant, effectively mirroring the plane across the origin."
        },
        "translate": {
          "!type": "fn(offset: +THREE.Vector3) -> +THREE.Plane",
          "!doc": "Translates the plane the distance defined by the vector. Note that this only affects the constant (distance from origin) and will not affect the normal vector."
        },
        "coplanarPoint": {
          "!type": "fn(optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Returns a coplanar point. (The projection of the normal vector at the origin onto the plane.)"
        }
      },
      "!doc": "A two dimensional surface that extends infinitely in 3d space.",
      "!type": "fn(normal: +THREE.Vector3, constant: number)"
    },
    "Quaternion": {
      "!url": "http://threejs.org/docs/#Reference/math/Quaternion",
      "prototype": {
        "x": "number",
        "y": "number",
        "z": "number",
        "w": "number",
        "set": {
          "!type": "fn(x: number, y: number, z: number, w: number) -> +THREE.Quaternion",
          "!doc": "Sets values of this quaternion."
        },
        "copy": {
          "!type": "fn(q: +THREE.Quaternion) -> +THREE.Quaternion",
          "!doc": "Copies values of *q* to this quaternion."
        },
        "setFromEuler": {
          "!type": "fn(euler: +THREE.Euler) -> +THREE.Quaternion",
          "!doc": "Sets this quaternion from rotation specified by Euler angle."
        },
        "setFromAxisAngle": {
          "!type": "fn(axis: +THREE.Vector3, angle: number) -> +THREE.Quaternion",
          "!doc": "Sets this quaternion from rotation specified by axis and angle.<br>\n\t\tAdapted from [link:http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm].<br>\n\t\t*Axis* is asumed to be normalized, *angle* is in radians."
        },
        "setFromRotationMatrix": {
          "!type": "fn(m: +THREE.Matrix4) -> +THREE.Quaternion",
          "!doc": "Sets this quaternion from rotation component of *m*.<br>\n\t\tAdapted from [link:http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm]."
        },
        "setFromUnitVectors": {
          "!type": "fn(vFrom: +THREE.Vector3, vTo: +THREE.Vector3) -> +THREE.Quaternion",
          "!doc": "Sets this quaternion to the rotation required to rotate direction vector *vFrom* to direction vector *vTo*.<br>\n\t\tAdapted from [link:http://lolengine.net/blog/2013/09/18/beautiful-maths-quaternion-from-vectors].<br>\n\t\t*vFrom* and *vTo* are assumed to be normalized."
        },
        "inverse": {
          "!type": "fn() -> +THREE.Quaternion",
          "!doc": "Inverts this quaternion."
        },
        "length": {
          "!type": "fn() -> number",
          "!doc": "Computes length of this quaternion."
        },
        "normalize": {
          "!type": "fn() -> +THREE.Quaternion",
          "!doc": "Normalizes this quaternion."
        },
        "multiply": {
          "!type": "fn(b: +THREE.Quaternion) -> +THREE.Quaternion",
          "!doc": "Multiplies this quaternion by *b*."
        },
        "multiplyQuaternions": {
          "!type": "fn(a: +THREE.Quaternion, b: +THREE.Quaternion) -> +THREE.Quaternion",
          "!doc": "Sets this quaternion to *a x b*<br>\n\t\tAdapted from [link:http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm]."
        },
        "multiplyVector3": {
          "!type": "fn(vector: +THREE.Vector3, dest: +THREE.Vector3) -> +THREE.Quaternion",
          "!doc": "Rotates *vector* by this quaternion into *dest*.<br>\n\t\tIf *dest* is not specified, result goes to *vec*."
        },
        "clone": {
          "!type": "fn() -> +THREE.Quaternion",
          "!doc": "Clones this quaternion."
        },
        "slerp": {
          "!type": "fn(qb: +THREE.Quaternion, t: float) -> +THREE.Quaternion",
          "!doc": "Handles the spherical linear interpolation between this quaternion's configuration\n\t\tand that of *qb*. *t* represents how close to the current (0) or target (1) rotation the\n\t\tresult should be."
        },
        "toArray": {
          "!type": "fn(array: []) -> []",
          "!doc": "Returns the numerical elements of this quaternion in an array of format (x, y, z, w)."
        },
        "equals": {
          "!type": "fn(v: +THREE.Quaternion) -> bool",
          "!doc": "Compares each component of *v* to each component of this quaternion to determine if they\n\t\trepresent the same rotation."
        },
        "lengthSq": {
          "!type": "fn() -> number",
          "!doc": "Calculates the squared length of the quaternion."
        },
        "fromArray": {
          "!type": "fn(array: []) -> +THREE.Quaternion",
          "!doc": "Sets this quaternion's component values from an array."
        },
        "conjugate": {
          "!type": "fn() -> +THREE.Quaternion",
          "!doc": "Returns the rotational conjugate of this quaternion. The conjugate of a quaternion\n\t\trepresents the same rotation in the opposite direction about the rotational axis."
        }
      },
      "!doc": "Implementation of a <a href=\"http://en.wikipedia.org/wiki/Quaternion\">quaternion</a>. This is used for rotating things without encountering the dreaded <a href=\"http://en.wikipedia.org/wiki/Gimbal_lock\">gimbal lock</a> issue, amongst other advantages.",
      "!type": "fn(x: number, y: number, z: number, w: number)"
    },
    "Ray": {
      "!url": "http://threejs.org/docs/#Reference/math/Ray",
      "prototype": {
        "origin": {
          "!type": "+THREE.Vector3",
          "!doc": "The origin of the [page:Ray]."
        },
        "direction": {
          "!type": "+THREE.Vector3",
          "!doc": "The direction of the [page:Ray]. This must be normalized (with [page:Vector3].normalize) for the methods to operate properly."
        },
        "applyMatrix4": {
          "!type": "fn(matrix4: +THREE.Matrix4) -> +THREE.Ray",
          "!doc": "Transform this [page:Ray] by the [page:Matrix4]."
        },
        "clone": {
          "!type": "fn() -> +THREE.Ray",
          "!doc": "Create a clone of this [page:Ray]."
        },
        "closestPointToPoint": {
          "!type": "fn(point: +THREE.Vector3, optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Get the point along this [page:Ray] that is closest to the [page:Vector3] provided."
        },
        "copy": {
          "!type": "fn(ray: +THREE.Ray) -> +THREE.Ray",
          "!doc": "Copy the properties of the provided [page:Ray], then return this [page:Ray]."
        },
        "distanceToPlane": {
          "!type": "fn(plane: +THREE.Plane) -> number",
          "!doc": "Get the distance from the origin to the [page:Plane], or *null* if the [page:Ray] doesn't intersect the [page:Plane]."
        },
        "distanceToPoint": {
          "!type": "fn(point: +THREE.Vector3) -> number",
          "!doc": "Get the distance of the closest approach between the [page:Ray] and the [page:Vector3]."
        },
        "equals": {
          "!type": "fn(ray: +THREE.Ray) -> bool",
          "!doc": "Return whether this and the other [page:Ray] have equal offsets and directions."
        },
        "isIntersectionBox": {
          "!type": "fn(box: +THREE.Box3) -> bool",
          "!doc": "Return whether or not this [page:Ray] intersects with the [page:Box3]."
        },
        "isIntersectionPlane": {
          "!type": "fn(plane: +THREE.Plane) -> bool",
          "!doc": "Return whether or not this [page:Ray] intersects with the [page:Plane]."
        },
        "isIntersectionSphere": {
          "!type": "fn(sphere: +THREE.Sphere) -> bool",
          "!doc": "Return whether or not this [page:Ray] intersects with the [page:Sphere]."
        },
        "recast": {
          "!type": "fn(t: number) -> +THREE.Ray",
          "!doc": "Shift the origin of this [page:Ray] along its direction by the distance given."
        },
        "set": {
          "!type": "fn(origin: +THREE.Vector3, direction: +THREE.Vector3) -> +THREE.Ray",
          "!doc": "Copy the parameters to the origin and direction properties."
        }
      },
      "!doc": "A ray that emits from an origin in a certain direction.",
      "!type": "fn(origin: +THREE.Vector3, direction: +THREE.Vector3)"
    },
    "Sphere": {
      "!url": "http://threejs.org/docs/#Reference/math/Sphere",
      "prototype": {
        "center": "+THREE.Vector3",
        "radius": "number",
        "applyMatrix4": {
          "!type": "fn(matrix: +THREE.Matrix4) -> +THREE.Sphere",
          "!doc": "Transforms this sphere with the provided [page:Matrix4]."
        },
        "clampPoint": {
          "!type": "fn(point: +THREE.Vector3, optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Clamps a point within the sphere. If the point is is outside the sphere, it will clamp it to the closets point on the edge of the sphere."
        },
        "translate": {
          "!type": "fn(offset: +THREE.Vector3) -> +THREE.Sphere",
          "!doc": "Translate the sphere's center by the provided offset vector."
        },
        "clone": {
          "!type": "fn() -> +THREE.Sphere",
          "!doc": "Provides a new copy of the sphere."
        },
        "equals": {
          "!type": "fn(sphere: +THREE.Sphere) -> bool",
          "!doc": "Checks to see if the two spheres' centers and radii are equal."
        },
        "setFromPoints": {
          "!type": "fn(points: [], optionalCenter: +THREE.Vector3) -> +THREE.Sphere",
          "!doc": "Computes the minimum bounding sphere for *points*. If *optionalCenter* is given, it is used as the sphere's center. Otherwise, the center of the axis-aligned bounding box encompassing *points* is calculated."
        },
        "distanceToPoint": {
          "!type": "fn(point: +THREE.Vector3) -> number",
          "!doc": "Returns the closest distance from the boundary of the sphere to the point. If the sphere contains the point, the distance will be negative."
        },
        "getBoundingBox": {
          "!type": "fn(optionalTarget: Box) -> Box",
          "!doc": "Returns a bounding box for the sphere, optionally setting a provided box target."
        },
        "containsPoint": {
          "!type": "fn(point: +THREE.Vector3) -> bool",
          "!doc": "Checks to see if the sphere contains the provided point inclusive of the edge of the sphere."
        },
        "copy": {
          "!type": "fn(sphere: +THREE.Sphere) -> +THREE.Sphere",
          "!doc": "Copies the values of the passed sphere to this sphere."
        },
        "intersectsSphere": {
          "!type": "fn(sphere: +THREE.Sphere) -> bool",
          "!doc": "Checks to see if two spheres intersect."
        },
        "empty": {
          "!type": "fn() -> bool",
          "!doc": "Checks to see if the sphere is empty (the radius set to 0)."
        }
      },
      "!doc": "A geometric sphere defined by a center position and radius.",
      "!type": "fn(center: +THREE.Vector3, radius: number)"
    },
    "Triangle": {
      "!url": "http://threejs.org/docs/#Reference/math/Triangle",
      "prototype": {
        "a": {
          "!type": "+THREE.Vector3",
          "!doc": "The first [page:Vector3] of the triangle."
        },
        "b": {
          "!type": "+THREE.Vector3",
          "!doc": "The second [page:Vector3] of the triangle."
        },
        "c": {
          "!type": "+THREE.Vector3",
          "!doc": "The third [page:Vector3] of the triangle."
        },
        "setFromPointsAndIndices": {
          "!type": "fn(points: [], i0: number, i1: number, i2: number) -> +THREE.Triangle",
          "!doc": "Sets the triangle's vectors to the vectors in the array."
        },
        "set": {
          "!type": "fn(a: +THREE.Vector3, b: +THREE.Vector3, c: +THREE.Vector3) -> +THREE.Triangle",
          "!doc": "Sets the triangle's vectors to the passed vectors."
        },
        "normal": {
          "!type": "fn(optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Return the calculated normal of the triangle."
        },
        "barycoordFromPoint": {
          "!type": "fn(point: +THREE.Vector3, optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Return a barycentric coordinate from the given vector. <br><br>\n\t\t[link:http://commons.wikimedia.org/wiki/File:Barycentric_coordinates_1.png](Picture of barycentric coordinates)"
        },
        "clone": {
          "!type": "fn() -> +THREE.Triangle",
          "!doc": "Return a new copy of this triangle."
        },
        "area": {
          "!type": "fn() -> number",
          "!doc": "Return the area of the triangle."
        },
        "midpoint": {
          "!type": "fn(optionalTarget: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Return the midpoint of the triangle. Optionally sets a target vector."
        },
        "equals": {
          "!type": "fn(triangle: +THREE.Triangle) -> bool",
          "!doc": "Checks to see if two triangles are equal (share the same vectors)."
        },
        "plane": {
          "!type": "fn(optionalTarget: +THREE.Plane) -> +THREE.Plane",
          "!doc": "Return a [page:Plane plane] based on the triangle. Optionally sets a target plane."
        },
        "containsPoint": {
          "!type": "fn(point: +THREE.Vector3) -> bool",
          "!doc": "Checks to see if the passed vector is within the triangle."
        },
        "copy": {
          "!type": "fn(triangle: +THREE.Triangle) -> +THREE.Triangle",
          "!doc": "Copies the values of the vertices of the passed triangle to this triangle."
        }
      },
      "!doc": "A geometric triangle as defined by three vectors.",
      "!type": "fn(a: +THREE.Vector3, b: +THREE.Vector3, c: +THREE.Vector3)"
    },
    "Vector2": {
      "!url": "http://threejs.org/docs/#Reference/math/Vector2",
      "prototype": {
        "x": "number",
        "y": "number",
        "set": {
          "!type": "fn(x: number, y: number) -> +THREE.Vector2",
          "!doc": "Sets value of this vector."
        },
        "copy": {
          "!type": "fn(v: +THREE.Vector2) -> +THREE.Vector2",
          "!doc": "Copies value of *v* to this vector."
        },
        "add": {
          "!type": "fn(v: +THREE.Vector2) -> +THREE.Vector2",
          "!doc": "Adds *v* to this vector."
        },
        "addVectors": {
          "!type": "fn(a: +THREE.Vector2, b: +THREE.Vector2) -> +THREE.Vector2",
          "!doc": "Sets this vector to *a + b*."
        },
        "sub": {
          "!type": "fn(v: +THREE.Vector2) -> +THREE.Vector2",
          "!doc": "Subtracts *v* from this vector."
        },
        "subVectors": {
          "!type": "fn(a: +THREE.Vector2, b: +THREE.Vector2) -> +THREE.Vector2",
          "!doc": "Sets this vector to *a - b*."
        },
        "multiplyScalar": {
          "!type": "fn(s: number) -> +THREE.Vector2",
          "!doc": "Multiplies this vector by scalar *s*."
        },
        "divideScalar": {
          "!type": "fn(s: number) -> +THREE.Vector2",
          "!doc": "Divides this vector by scalar *s*.<br>\n\t\tSet vector to *( 0, 0 )* if *s == 0*."
        },
        "negate": {
          "!type": "fn() -> +THREE.Vector2",
          "!doc": "Inverts this vector."
        },
        "dot": {
          "!type": "fn(v: +THREE.Vector2) -> number",
          "!doc": "Computes dot product of this vector and *v*."
        },
        "lengthSq": {
          "!type": "fn() -> number",
          "!doc": "Computes squared length of this vector."
        },
        "length": {
          "!type": "fn() -> number",
          "!doc": "Computes length of this vector."
        },
        "normalize": {
          "!type": "fn() -> +THREE.Vector2",
          "!doc": "Normalizes this vector."
        },
        "distanceTo": {
          "!type": "fn(v: +THREE.Vector2) -> number",
          "!doc": "Computes distance of this vector to *v*."
        },
        "distanceToSquared": {
          "!type": "fn(v: +THREE.Vector2) -> number",
          "!doc": "Computes squared distance of this vector to *v*."
        },
        "setLength": {
          "!type": "fn(l: number) -> +THREE.Vector2",
          "!doc": "Normalizes this vector and multiplies it by *l*."
        },
        "equals": {
          "!type": "fn(v: +THREE.Vector2) -> bool",
          "!doc": "Checks for strict equality of this vector and *v*."
        },
        "clone": {
          "!type": "fn() -> +THREE.Vector2",
          "!doc": "Clones this vector."
        },
        "clamp": {
          "!type": "fn(min: +THREE.Vector2, max: +THREE.Vector2) -> +THREE.Vector2",
          "!doc": "If this vector's x or y value is greater than the max vector's x or y value, it is replaced by the corresponding value. <br>\tIf this vector's x or y value is less than the min vector's x or y value, it is replace by the corresponding value."
        },
        "clampScalar": {
          "!type": "fn(min: number, max: number) -> +THREE.Vector2",
          "!doc": "If this vector's x or y values are greater than the max value, they are replaced by the max value. <br>  If this vector's x or y values are less than the min value, they are replace by the min value."
        },
        "floor": {
          "!type": "fn() -> +THREE.Vector2",
          "!doc": "The components of the vector are rounded downwards (towards negative infinity) to an integer value."
        },
        "ceil": {
          "!type": "fn() -> +THREE.Vector2",
          "!doc": "The components of the vector are rounded upwards (towards positive infinity) to an integer value."
        },
        "round": {
          "!type": "fn() -> +THREE.Vector2",
          "!doc": "The components of the vector are rounded towards the nearest integer value."
        },
        "roundToZero": {
          "!type": "fn() -> +THREE.Vector2",
          "!doc": "The components of the vector are rounded towards zero (up if negative, down if positive) to an integer value."
        },
        "lerp": {
          "!type": "fn(v: +THREE.Vector2, alpha: number) -> +THREE.Vector2",
          "!doc": "Linear interpolation between this vector and v, where alpha is the percent along the line."
        },
        "lerpVectors": {
          "!type": "fn(v1: +THREE.Vector2, v2: +THREE.Vector2, alpha: number) -> +THREE.Vector2",
          "!doc": "Sets this vector to be the vector linearly interpolated between *v1* and *v2* with *alpha* factor."
        },
        "setComponent": {
          "!type": "fn(index: number, value: number) -> undefined",
          "!doc": "if index equals 0 method replaces this.x with value. <br>\n\t\tif index equals 1 method replaces this.y with value."
        },
        "addScalar": {
          "!type": "fn(s: number) -> +THREE.Vector2",
          "!doc": "Add the scalar value s to this vector's x and y values."
        },
        "getComponent": {
          "!type": "fn(index: number) -> number",
          "!doc": "if index equals 0 returns the x value. <br>\n\t\tif index equals 1 returns the y value."
        },
        "fromArray": {
          "!type": "fn(array: []) -> +THREE.Vector2",
          "!doc": "Sets this vector's x value to be array[0] and y value to be array[1]."
        },
        "toArray": {
          "!type": "fn(array: []) -> []",
          "!doc": "Returns an array [x, y]."
        },
        "min": {
          "!type": "fn(v: +THREE.Vector2) -> +THREE.Vector2",
          "!doc": "If this vector's x or y value is less than v's x or y value, replace that value with the corresponding min value."
        },
        "max": {
          "!type": "fn(v: +THREE.Vector2) -> +THREE.Vector2",
          "!doc": "If this vector's x or y value is greater than v's x or y value, replace that value with the corresponding max value."
        },
        "setX": {
          "!type": "fn(x: number) -> +THREE.Vector2",
          "!doc": "replace this vector's x value with x."
        },
        "setY": {
          "!type": "fn(y: number) -> +THREE.Vector2",
          "!doc": "replace this vector's y value with y."
        }
      },
      "!doc": "2D vector.",
      "!type": "fn(x: number, y: number)"
    },
    "Vector3": {
      "!url": "http://threejs.org/docs/#Reference/math/Vector3",
      "prototype": {
        "x": "number",
        "y": "number",
        "z": "number",
        "set": {
          "!type": "fn(x: number, y: number, z: number) -> +THREE.Vector3",
          "!doc": "Sets value of this vector."
        },
        "setX": {
          "!type": "fn(x: number) -> +THREE.Vector3",
          "!doc": "Sets x value of this vector."
        },
        "setY": {
          "!type": "fn(y: number) -> +THREE.Vector3",
          "!doc": "Sets y value of this vector."
        },
        "setZ": {
          "!type": "fn(z: number) -> +THREE.Vector3",
          "!doc": "Sets z value of this vector."
        },
        "copy": {
          "!type": "fn(v: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Copies value of *v* to this vector."
        },
        "add": {
          "!type": "fn(v: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Adds *v* to this vector."
        },
        "addVectors": {
          "!type": "fn(a: +THREE.Vector3, b: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Sets this vector to *a + b*."
        },
        "sub": {
          "!type": "fn(v: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Subtracts *v* from this vector."
        },
        "subVectors": {
          "!type": "fn(a: +THREE.Vector3, b: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Sets this vector to *a - b*."
        },
        "multiplyScalar": {
          "!type": "fn(s: number) -> +THREE.Vector3",
          "!doc": "Multiplies this vector by scalar *s*."
        },
        "divideScalar": {
          "!type": "fn(s: number) -> +THREE.Vector3",
          "!doc": "Divides this vector by scalar *s*.<br>\n\t\tSet vector to *( 0, 0, 0 )* if *s == 0*."
        },
        "negate": {
          "!type": "fn() -> +THREE.Vector3",
          "!doc": "Inverts this vector."
        },
        "dot": {
          "!type": "fn(v: +THREE.Vector3) -> number",
          "!doc": "Computes dot product of this vector and *v*."
        },
        "lengthSq": {
          "!type": "fn() -> number",
          "!doc": "Computes squared length of this vector."
        },
        "length": {
          "!type": "fn() -> number",
          "!doc": "Computes length of this vector."
        },
        "lengthManhattan": {
          "!type": "fn() -> number",
          "!doc": "Computes Manhattan length of this vector.<br>\n\t\t[link:http://en.wikipedia.org/wiki/Taxicab_geometry]"
        },
        "normalize": {
          "!type": "fn() -> +THREE.Vector3",
          "!doc": "Normalizes this vector. Transforms this Vector into a Unit vector by dividing the vector by it's length."
        },
        "distanceTo": {
          "!type": "fn(v: +THREE.Vector3) -> number",
          "!doc": "Computes distance of this vector to *v*."
        },
        "distanceToSquared": {
          "!type": "fn(v: +THREE.Vector3) -> number",
          "!doc": "Computes squared distance of this vector to *v*."
        },
        "setLength": {
          "!type": "fn(l: number) -> +THREE.Vector3",
          "!doc": "Normalizes this vector and multiplies it by *l*."
        },
        "cross": {
          "!type": "fn(v: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Sets this vector to cross product of itself and *v*."
        },
        "crossVectors": {
          "!type": "fn(a: +THREE.Vector3, b: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Sets this vector to cross product of *a* and *b*."
        },
        "setFromMatrixPosition": {
          "!type": "fn(m: +THREE.Matrix4) -> +THREE.Vector3",
          "!doc": "Sets this vector extracting position from matrix transform."
        },
        "setFromMatrixScale": {
          "!type": "fn(m: +THREE.Matrix4) -> +THREE.Vector3",
          "!doc": "Sets this vector extracting scale from matrix transform."
        },
        "equals": {
          "!type": "fn(v: +THREE.Vector3) -> bool",
          "!doc": "Checks for strict equality of this vector and *v*."
        },
        "clone": {
          "!type": "fn() -> +THREE.Vector3",
          "!doc": "Clones this vector."
        },
        "clamp": {
          "!type": "fn(min: +THREE.Vector3, max: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "If this vector's x, y or z value is greater than the max vector's x, y or z value, it is replaced by the corresponding value. <br><br>\n\t\tIf this vector's x, y or z value is less than the min vector's x, y or z value, it is replace by the corresponding value."
        },
        "clampScalar": {
          "!type": "fn(min: number, max: number) -> +THREE.Vector3",
          "!doc": "If this vector's x, y or z values are greater than the max value, they are replaced by the max value. <br>  If this vector's x, y or z values are less than the min value, they are replace by the min value."
        },
        "floor": {
          "!type": "fn() -> +THREE.Vector3",
          "!doc": "The components of the vector are rounded downwards (towards negative infinity) to an integer value."
        },
        "ceil": {
          "!type": "fn() -> +THREE.Vector3",
          "!doc": "The components of the vector are rounded upwards (towards positive infinity) to an integer value."
        },
        "round": {
          "!type": "fn() -> +THREE.Vector3",
          "!doc": "The components of the vector are rounded towards the nearest integer value."
        },
        "roundToZero": {
          "!type": "fn() -> +THREE.Vector3",
          "!doc": "The components of the vector are rounded towards zero (up if negative, down if positive) to an integer value."
        },
        "applyMatrix3": {
          "!type": "fn(m: +THREE.Matrix3) -> +THREE.Vector3",
          "!doc": "Multiplies this vector times a 3 x 3 matrix."
        },
        "applyMatrix4": {
          "!type": "fn(m: +THREE.Matrix3) -> +THREE.Vector3",
          "!doc": "Multiplies this vector by 4 x 3 subset of a Matrix4."
        },
        "projectOnPlane": {
          "!type": "fn(planeNormal: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Projects this vector onto a plane by subtracting this vector projected onto the plane's normal from this vector."
        },
        "projectOnVector": {
          "!type": "fn() -> +THREE.Vector3",
          "!doc": "Projects this vector onto another vector."
        },
        "addScalar": {
          "!type": "fn() -> +THREE.Vector3",
          "!doc": "Adds a s to this vector."
        },
        "divide": {
          "!type": "fn(v: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Divides this vector by vector v."
        },
        "min": {
          "!type": "fn(v: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "If this vector's x, y, or z value is less than vector v's x, y, or z value, that value is replaced by the corresponding vector v value."
        },
        "max": {
          "!type": "fn(v: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "If this vector's x, y, or z value is greater than vector v's x, y, or z value, that value is replaced by the corresponding vector v value."
        },
        "setComponent": {
          "!type": "fn(index: number, value: number) -> +THREE.Vector3",
          "!doc": "If index equals 0 the method sets this vector's x value to value <br>\n\t\tIf index equals 1 the method sets this vector's y value to value <br>\n\t\tIf index equals 2 the method sets this vector's z value to value"
        },
        "transformDirection": {
          "!type": "fn(m: +THREE.Matrix4) -> +THREE.Vector3",
          "!doc": "Transforms the direction of this vector by a matrix (a 3 x 3 subset of a Matrix4) and then normalizes the result."
        },
        "multiplyVectors": {
          "!type": "fn(a: +THREE.Vector3, b: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Sets this vector equal to the result of multiplying vector a by vector b."
        },
        "getComponent": {
          "!type": "fn(index: number) -> number",
          "!doc": "Returns the value of the vector component x, y, or z by an index. <br><br>\n\n\t\tIndex 0: x <br>\n\t\tIndex 1: y <br>\n\t\tIndex 2: z <br>"
        },
        "applyAxisAngle": {
          "!type": "fn(axis: +THREE.Vector3, angle: number) -> +THREE.Vector3",
          "!doc": "Applies a rotation specified by an axis and an angle to this vector."
        },
        "lerp": {
          "!type": "fn(v: +THREE.Vector3, alpha: number) -> +THREE.Vector3",
          "!doc": "Linear Interpolation between this vector and vector v, where alpha is the percent along the line."
        },
        "lerpVectors": {
          "!type": "fn(v1: +THREE.Vector3, v2: +THREE.Vector3, alpha: number) -> +THREE.Vector3",
          "!doc": "Sets this vector to be the vector linearly interpolated between *v1* and *v2* with *alpha* factor."
        },
        "angleTo": {
          "!type": "fn(v: +THREE.Vector3) -> number",
          "!doc": "Returns the angle between this vector and vector v in radians."
        },
        "setFromMatrixColumn": {
          "!type": "fn(index: number, matrix: +THREE.Matrix4) -> +THREE.Vector3",
          "!doc": "Sets this vector's x, y, and z equal to the column of the matrix specified by the index."
        },
        "reflect": {
          "!type": "fn(normal: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Reflect incident vector off of plane orthogonal to normal. Normal is assumed to have unit length."
        },
        "fromArray": {
          "!type": "fn(array: []) -> +THREE.Vector3",
          "!doc": "Sets the vector's components based on an array formatted like [x, y, z]"
        },
        "multiply": {
          "!type": "fn(v: +THREE.Vector3) -> +THREE.Vector3",
          "!doc": "Multiplies this vector by vector v."
        },
        "applyProjection": {
          "!type": "fn(m: +THREE.Matrix4) -> +THREE.Vector3",
          "!doc": "Multiplies this vector and m, and divides by perspective."
        },
        "toArray": {
          "!type": "fn(array: []) -> []",
          "!doc": "Assigns this vector's x value to array[0]. <br>\n\t\tAssigns this vector's y value to array[1]. <br>\n\t\tAssigns this vector's z value to array[2]. <br>\n\t\tReturns the created array."
        },
        "applyEuler": {
          "!type": "fn(euler: +THREE.Euler) -> +THREE.Vector3",
          "!doc": "Applies euler transform to this vector by converting the [page:Euler] object to a [page:Quaternion] and applying."
        },
        "applyQuaternion": {
          "!type": "fn(quaternion: +THREE.Quaternion) -> +THREE.Vector3",
          "!doc": "Applies a [page:Quaternion] transform to this vector."
        },
        "project": {
          "!type": "fn(camera: +THREE.Camera) -> +THREE.Vector3",
          "!doc": "Projects the vector with the camera."
        },
        "unproject": {
          "!type": "fn(camera: +THREE.Camera) -> +THREE.Vector3",
          "!doc": "Unprojects the vector with the camera."
        }
      },
      "!doc": "3D vector.",
      "!type": "fn(x: number, y: number, z: number)"
    },
    "Vector4": {
      "!url": "http://threejs.org/docs/#Reference/math/Vector4",
      "prototype": {
        "x": "number",
        "y": "number",
        "z": "number",
        "w": "number",
        "set": {
          "!type": "fn(x: number, y: number, z: number, w: number) -> +THREE.Vector4",
          "!doc": "Sets value of this vector."
        },
        "copy": {
          "!type": "fn(v: +THREE.Vector4) -> +THREE.Vector4",
          "!doc": "Copies value of *v* to this vector."
        },
        "add": {
          "!type": "fn(v: +THREE.Vector4) -> +THREE.Vector4",
          "!doc": "Adds *v* to this vector."
        },
        "addVectors": {
          "!type": "fn(a: +THREE.Vector4, b: +THREE.Vector4) -> +THREE.Vector4",
          "!doc": "Sets this vector to *a + b*."
        },
        "sub": {
          "!type": "fn(v: +THREE.Vector4) -> +THREE.Vector4",
          "!doc": "Subtracts *v* from this vector."
        },
        "subVectors": {
          "!type": "fn(a: +THREE.Vector4, b: +THREE.Vector4) -> +THREE.Vector4",
          "!doc": "Sets this vector to *a - b*."
        },
        "multiplyScalar": {
          "!type": "fn(s: number) -> +THREE.Vector4",
          "!doc": "Multiplies this vector by scalar *s*."
        },
        "divideScalar": {
          "!type": "fn(s: number) -> +THREE.Vector4",
          "!doc": "Divides this vector by scalar *s*.<br>\n\t\tSet vector to *( 0, 0, 0 )* if *s == 0*."
        },
        "negate": {
          "!type": "fn() -> +THREE.Vector4",
          "!doc": "Inverts this vector."
        },
        "dot": {
          "!type": "fn(v: +THREE.Vector4) -> number",
          "!doc": "Computes dot product of this vector and *v*."
        },
        "lengthSq": {
          "!type": "fn() -> number",
          "!doc": "Computes squared length of this vector."
        },
        "length": {
          "!type": "fn() -> number",
          "!doc": "Computes length of this vector."
        },
        "normalize": {
          "!type": "fn() -> +THREE.Vector4",
          "!doc": "Normalizes this vector."
        },
        "setLength": {
          "!type": "fn(l: number) -> +THREE.Vector4",
          "!doc": "Normalizes this vector and multiplies it by *l*."
        },
        "lerp": {
          "!type": "fn(v: +THREE.Vector4, alpha: number) -> +THREE.Vector4",
          "!doc": "Linearly interpolate between this vector and *v* with *alpha* factor."
        },
        "lerpVectors": {
          "!type": "fn(v1: +THREE.Vector4, v2: +THREE.Vector4, alpha: number) -> +THREE.Vector4",
          "!doc": "Sets this vector to be the vector linearly interpolated between *v1* and *v2* with *alpha* factor."
        },
        "clone": {
          "!type": "fn() -> +THREE.Vector4",
          "!doc": "Clones this vector."
        },
        "clamp": {
          "!type": "fn(min: +THREE.Vector4, max: +THREE.Vector4) -> +THREE.Vector4",
          "!doc": "If this vector's x, y, z, or w value is greater than the max vector's x, y, z, or w value, it is replaced by the corresponding value.<br><br>\n\n\t\tIf this vector's x, y, z, or w value is less than the min vector's x, y, z, or w value, it is replace by the corresponding value."
        },
        "clampScalar": {
          "!type": "fn(min: number, max: number) -> +THREE.Vector4",
          "!doc": "If this vector's x, y, z or w values are greater than the max value, they are replaced by the max value. <br>\n\t\tIf this vector's x, y, z or w values are less than the min value, they are replace by the min value."
        },
        "floor": {
          "!type": "fn() -> +THREE.Vector4",
          "!doc": "The components of the vector are rounded downwards (towards negative infinity) to an integer value."
        },
        "ceil": {
          "!type": "fn() -> +THREE.Vector4",
          "!doc": "The components of the vector are rounded upwards (towards positive infinity) to an integer value."
        },
        "round": {
          "!type": "fn() -> +THREE.Vector4",
          "!doc": "The components of the vector are rounded towards the nearest integer value."
        },
        "roundToZero": {
          "!type": "fn() -> +THREE.Vector4",
          "!doc": "The components of the vector are rounded towards zero (up if negative, down if positive) to an integer value."
        },
        "applyMatrix4": {
          "!type": "fn(m: +THREE.Matrix4) -> +THREE.Vector4",
          "!doc": "Transforms the vector by the matrix."
        },
        "min": {
          "!type": "fn(v: +THREE.Vector4) -> +THREE.Vector4",
          "!doc": "If this vector's x, y, z, or w value is less than vector v's x, y, z, or w value, that value is replaced by the corresponding vector v value."
        },
        "max": {
          "!type": "fn(v: +THREE.Vector4) -> +THREE.Vector4",
          "!doc": "If this vector's x, y, z, or w value is greater than vector v's x, y, z, or w value, that value is replaced by the corresponding vector v value."
        },
        "addScalar": {
          "!type": "fn(s: number) -> +THREE.Vector4",
          "!doc": "Adds a scalar value to all of the vector's components."
        },
        "equals": {
          "!type": "fn(v: +THREE.Vector4) -> bool",
          "!doc": "Checks to see if this vector matches vector v."
        },
        "setAxisAngleFromRotationMatrix": {
          "!type": "fn(m: +THREE.Matrix4) -> +THREE.Vector4",
          "!doc": "Sets this Vector4 to the computed <a href=\"http://en.wikipedia.org/wiki/Axis%E2%80%93angle_representation\" target=\"_blank\">axis-angle representation</a> of the rotation defined by Matrix4 m. Assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled).<br><br>\n\n\t\tThe axis is stored in components (x, y, z) of the vector, and the rotation in radians is stored in component w"
        },
        "setAxisAngleFromQuaternion": {
          "!type": "fn(q: +THREE.Quaternion) -> +THREE.Vector4",
          "!doc": "Sets this Vector4 to the computed <a href=\"http://en.wikipedia.org/wiki/Axis%E2%80%93angle_representation\" target=\"_blank\">axis-angle representation</a> of the rotation defined by Quaternion q.<br><br>\n\n\t\tThe axis is stored in components (x, y, z) of the vector, and the rotation in radians is stored in component w"
        },
        "getComponent": {
          "!type": "fn(index: number) -> number",
          "!doc": "Returns the value of the vector component x, y, or z by an index.<br><br>\n\n\t\tIndex 0: x<br>\n\t\tIndex 1: y<br>\n\t\tIndex 2: z<br>\n\t\tIndex 3: w<br>"
        },
        "setComponent": {
          "!type": "fn(index: number, value: number)",
          "!doc": "Sets the value of the vector component\tx, y, or z by an index.<br><br>\n\n\t\tIndex 0: x<br>\n\t\tIndex 1: y<br>\n\t\tIndex 2: z<br>\n\t\tIndex 3: w<br>"
        },
        "fromArray": {
          "!type": "fn(array: []) -> +THREE.Vector4",
          "!doc": "Sets the vector's components based on an array formatted like [x, y, z, w]"
        },
        "toArray": {
          "!type": "fn(array: []) -> []",
          "!doc": "Returns an array in the format [x, y, z, w]"
        },
        "lengthManhattan": {
          "!type": "fn() -> number",
          "!doc": "Computes Manhattan length of this vector.<br>\n\t\t[link:http://en.wikipedia.org/wiki/Taxicab_geometry]"
        },
        "setX": {
          "!type": "fn(x: number) -> +THREE.Vector4",
          "!doc": "Sets the x component of the vector."
        },
        "setY": {
          "!type": "fn(y: number) -> +THREE.Vector4",
          "!doc": "Sets the y component of the vector."
        },
        "setZ": {
          "!type": "fn(z: number) -> +THREE.Vector4",
          "!doc": "Sets the z component of the vector."
        },
        "setW": {
          "!type": "fn(w: number) -> +THREE.Vector4",
          "!doc": "Sets the w component of the vector."
        }
      },
      "!doc": "4D vector.",
      "!type": "fn(x: number, y: number, z: number, w: number)"
    },
    "Bone": {
      "!url": "http://threejs.org/docs/#Reference/objects/Bone",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "skinMatrix": {
          "!type": "+THREE.Matrix4",
          "!doc": "The matrix of the bone."
        },
        "skin": {
          "!type": "+THREE.SkinnedMesh",
          "!doc": "The skin that contains this bone."
        },
        "update": {
          "!type": "fn(parentSkinMatrix: +THREE.Matrix4, forceUpdate: boolean) -> todo",
          "!doc": "This updates the matrix of the bone and the matrices of its children."
        }
      },
      "!doc": "A bone which is part of a SkinnedMesh.",
      "!type": "fn(belongsToSkin: +THREE.SkinnedMesh)"
    },
    "LOD": {
      "!url": "http://threejs.org/docs/#Reference/objects/LOD",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "objects": {
          "!type": "array",
          "!doc": "todo"
        },
        "addLevel": {
          "!type": "fn(object: todo, distance: todo) -> todo",
          "!doc": "todo"
        },
        "getObjectForDistance": {
          "!type": "fn(distance: todo) -> todo",
          "!doc": "todo"
        },
        "update": {
          "!type": "fn(camera: todo) -> todo",
          "!doc": "todo"
        }
      },
      "!doc": "todo",
      "!type": "fn()"
    },
    "LensFlare": {
      "!url": "http://threejs.org/docs/#Reference/objects/LensFlare",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "lensFlares": {
          "!type": "array",
          "!doc": "todo"
        },
        "positionScreen": {
          "!type": "+THREE.Vector3",
          "!doc": "todo"
        },
        "customUpdateCallback": {
          "!type": "todo",
          "!doc": "todo"
        },
        "updateLensFlares": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        }
      },
      "!doc": "todo",
      "!type": "fn(texture: todo, size: todo, distance: todo, blending: todo, color: todo)"
    },
    "Line": {
      "!url": "http://threejs.org/docs/#Reference/objects/Line",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "geometry": {
          "!type": "+THREE.Geometry",
          "!doc": "Vertices representing the line segment(s)."
        },
        "material": {
          "!type": "+THREE.Material",
          "!doc": "Material for the line."
        },
        "type": {
          "!type": "number",
          "!doc": "In OpenGL terms, LineStrip is the classic GL_LINE_STRIP and LinePieces is the equivalent to GL_LINES."
        },
        "raycast": {
          "!type": "fn(raycaster: +THREE.Raycaster, intersects: []) -> []",
          "!doc": "Get intersections between a casted ray and this Line. [page:Raycaster.intersectObject] will call this method."
        }
      },
      "!doc": "A line or a series of lines.",
      "!type": "fn(geometry: +THREE.Geometry, material: +THREE.Material, type: number)"
    },
    "Mesh": {
      "!url": "http://threejs.org/docs/#Reference/objects/Mesh",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "geometry": {
          "!type": "+THREE.Geometry",
          "!doc": "An instance of [page:Geometry], defining the object's structure."
        },
        "material": {
          "!type": "+THREE.Material",
          "!doc": "An instance of [page:Material], defining the object's appearance. Default is a [page:MeshBasicMaterial] with wireframe mode enabled and randomised colour."
        },
        "getMorphTargetIndexByName": {
          "!type": "fn(name: string) -> number",
          "!doc": "Returns the index of a morph target defined by name."
        },
        "updateMorphTargets": {
          "!type": "fn()",
          "!doc": "Updates the morphtargets to have no influence on the object."
        },
        "raycast": {
          "!type": "fn(raycaster: +THREE.Raycaster, intersects: []) -> []",
          "!doc": "Get intersections between a casted ray and this mesh. [page:Raycaster.intersectObject] will call this method."
        }
      },
      "!doc": "Base class for Mesh objects, such as [page:MorphAnimMesh] and [page:SkinnedMesh].",
      "!type": "fn(geometry: +THREE.Geometry, material: +THREE.Material)"
    },
    "MorphAnimMesh": {
      "!url": "http://threejs.org/docs/#Reference/objects/MorphAnimMesh",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "directionBackwards": {
          "!type": "boolean",
          "!doc": "todo"
        },
        "direction": {
          "!type": "number",
          "!doc": "todo"
        },
        "endKeyframe": {
          "!type": "number",
          "!doc": "todo"
        },
        "mirroredLoop": {
          "!type": "boolean",
          "!doc": "todo"
        },
        "startKeyframe": {
          "!type": "number",
          "!doc": "todo"
        },
        "lastKeyframe": {
          "!type": "number",
          "!doc": "todo"
        },
        "length": {
          "!type": "number",
          "!doc": "todo"
        },
        "time": {
          "!type": "number",
          "!doc": "todo"
        },
        "duration": {
          "!type": "number",
          "!doc": "todo"
        },
        "currentKeyframe": {
          "!type": "number",
          "!doc": "todo"
        },
        "setDirectionForward": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        },
        "playAnimation": {
          "!type": "fn(label: todo, fps: todo) -> todo",
          "!doc": "todo"
        },
        "setFrameRange": {
          "!type": "fn(start: todo, end: todo) -> todo",
          "!doc": "todo"
        },
        "setDirectionBackward": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        },
        "parseAnimations": {
          "!type": "fn() -> todo",
          "!doc": "todo"
        },
        "updateAnimation": {
          "!type": "fn(delta: todo) -> todo",
          "!doc": "todo"
        },
        "setAnimationLabel": {
          "!type": "fn(label: todo, start: todo, end: todo) -> todo",
          "!doc": "todo"
        }
      },
      "!doc": "todo",
      "!type": "fn(geometry: todo, material: todo)"
    },
    "PointCloud": {
      "!url": "http://threejs.org/docs/#Reference/objects/PointCloud",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "geometry": {
          "!type": "+THREE.Geometry",
          "!doc": "An instance of [page:Geometry], where each vertex designates the position of a particle in the system."
        },
        "material": {
          "!type": "+THREE.Material",
          "!doc": "An instance of [page:Material], defining the object's appearance. Default is a [page:PointCloudMaterial] with randomised colour."
        },
        "clone": {
          "!type": "fn() -> +THREE.PointCloud",
          "!doc": "This creates a clone of the particle system."
        },
        "raycast": {
          "!type": "fn(raycaster: +THREE.Raycaster, intersects: []) -> []",
          "!doc": "Get intersections between a casted ray and this PointCloud. [page:Raycaster.intersectObject] will call this method."
        }
      },
      "!doc": "A class for displaying particles in the form of variable size points. For example, if using the [page:WebGLRenderer], the particles are displayed using GL_POINTS.",
      "!type": "fn(geometry: +THREE.Geometry, material: +THREE.Material)"
    },
    "SkinnedMesh": {
      "!url": "http://threejs.org/docs/#Reference/objects/SkinnedMesh",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "bones": {
          "!type": "array",
          "!doc": "This contains the array of bones for this mesh. These should be set in the constructor."
        },
        "identityMatrix": {
          "!type": "+THREE.Matrix4",
          "!doc": "This is an identityMatrix to calculate the bones matrices from."
        },
        "useVertexTexture": {
          "!type": "boolean",
          "!doc": "The boolean defines whether a vertex texture is used to calculate the bones. This boolean shouldn't be changed after constructor."
        },
        "boneMatrices": {
          "!type": "array",
          "!doc": "This array of matrices contains the matrices of the bones. These get calculated in the constructor."
        },
        "pose": {
          "!type": "fn()",
          "!doc": "This method sets the skinnedmesh in the rest pose."
        },
        "addBone": {
          "!type": "fn(bone: +THREE.Bone) -> +THREE.Bone",
          "!doc": "This method adds the bone to the skinnedmesh when it is provided. It creates a new bone and adds that when no bone is given."
        }
      },
      "!doc": "An 3d object that has bones data. These Bones can then be used to animate the vertices of the object.",
      "!type": "fn(geometry: +THREE.Geometry, material: +THREE.Material, useVertexTexture: boolean)"
    },
    "Sprite": {
      "!url": "http://threejs.org/docs/#Reference/objects/Sprite",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "material": {
          "!type": "+THREE.SpriteMaterial",
          "!doc": "An instance of [page:Material], defining the object's appearance. Default is a [page:SpriteMaterial] which is a white plane."
        },
        "clone": {
          "!type": "fn() -> +THREE.Sprite",
          "!doc": "This creates a new clone of the sprite."
        }
      },
      "!doc": "A sprite is a plane in an 3d scene which faces always towards the camera.",
      "!type": "fn(material: +THREE.Material)"
    },
    "CanvasRenderer": {
      "!url": "http://threejs.org/docs/#Reference/renderers/CanvasRenderer",
      "prototype": {
        "info": {
          "!type": "object",
          "!doc": "An object with a series of statistical information about the graphics board memory and the rendering process. Useful for debugging or just for the sake of curiosity. The object contains the following fields:"
        },
        "domElement": {
          "!type": "DOMElement",
          "!doc": "A [page:Canvas] where the renderer draws its output.<br>\n\t\t\tThis is automatically created by the renderer in the constructor (if not provided already); you just need to add it to your page."
        },
        "autoClear": {
          "!type": "bool",
          "!doc": "Defines whether the renderer should automatically clear its output before rendering."
        },
        "sortObjects": {
          "!type": "bool",
          "!doc": "Defines whether the renderer should sort objects. Default is true.<br>\n      Note: Sorting is used to attempt to properly render objects that have some degree of transparency.  By definition, sorting objects may not work in all cases.  Depending on the needs of application, it may be neccessary to turn off sorting and use other methods to deal with transparency rendering e.g. manually determining the object rendering order."
        },
        "sortElements": {
          "!type": "boolean",
          "!doc": "Defines whether the renderer should sort the face of each object. Default is true."
        },
        "render": {
          "!type": "fn(scene: +THREE.Scene, camera: +THREE.Camera)",
          "!doc": "Render a scene using a camera."
        },
        "clear": {
          "!type": "fn()",
          "!doc": "Tells the renderer to clear its color drawing buffer with the clearcolor."
        },
        "setClearColor": {
          "!type": "fn(color: +THREE.Color, alpha: number)",
          "!doc": "This set the clearColor and the clearAlpha."
        },
        "setSize": {
          "!type": "fn(width: number, height: number)",
          "!doc": "This set the size of the drawing canvas and if updateStyle is set, then the css of the canvas is updated too."
        },
        "setClearColorHex": {
          "!type": "fn(hex: number, alpha: number)",
          "!doc": "This set the clearColor and the clearAlpha."
        },
        "getClearColorHex": {
          "!type": "fn() -> number",
          "!doc": "Returns the [page:number hex] color."
        },
        "getClearAlpha": {
          "!type": "fn() -> number",
          "!doc": "Returns the alpha value."
        }
      },
      "!doc": "The Canvas renderer displays your beautifully crafted scenes <em>not</em> using WebGL, but draws it using the (slower) <a href=\"http://www.w3.org/html/wg/drafts/2dcontext/html5_canvas/\">Canvas 2D Context</a> API.<br><br>\n\t\t\tThis renderer can be a nice fallback from [page:WebGLRenderer] for simple scenes:\n\n\t\t\t<code>\n\t\t\tfunction webglAvailable() {\n\t\t\t\ttry {\n\t\t\t\t\tvar canvas = document.createElement( 'canvas' );\n\t\t\t\t\treturn !!( window.WebGLRenderingContext &amp;&amp; (\n\t\t\t\t\t\tcanvas.getContext( 'webgl' ) ||\n\t\t\t\t\t\tcanvas.getContext( 'experimental-webgl' ) )\n\t\t\t\t\t);\n\t\t\t\t} catch ( e ) {\n\t\t\t\t\treturn false;\n\t\t\t\t}\n\t\t\t}\n\n\t\t\tif ( webglAvailable() ) {\n\t\t\t\trenderer = new THREE.WebGLRenderer();\n\t\t\t} else {\n\t\t\t\trenderer = new THREE.CanvasRenderer();\n\t\t\t}\n\t\t\t</code>\n\n\t\t\tNote: both WebGLRenderer and CanvasRenderer are embedded in the web page using an HTML5 &lt;canvas&gt; tag.\n\t\t\tThe \"Canvas\" in CanvasRenderer means it uses Canvas 2D instead of WebGL.<br><br>\n\n\t\t\tDon't confuse either CanvasRenderer with the SoftwareRenderer example, which simulates a screen buffer in a Javascript array.",
      "!type": "fn(parameters: object)"
    },
    "WebGLRenderTarget": {
      "!url": "http://threejs.org/docs/#Reference/renderers/WebGLRenderTarget",
      "prototype": {
        "wrapS": {
          "!type": "number",
          "!doc": "The default is THREE.ClampToEdgeWrapping, where the edge is clamped to the outer edge texels. The other two choices are THREE.RepeatWrapping and THREE.MirroredRepeatWrapping."
        },
        "wrapT": {
          "!type": "number",
          "!doc": "The default is THREE.ClampToEdgeWrapping, where the edge is clamped to the outer edge texels. The other two choices are THREE.RepeatWrapping and THREE.MirroredRepeatWrapping."
        },
        "magFilter": {
          "!type": "number",
          "!doc": "How the texture is sampled when a texel covers more than one pixel. The default is THREE.LinearFilter, which takes the four closest texels and bilinearly interpolates among them. The other option is THREE.NearestFilter, which uses the value of the closest texel."
        },
        "minFilter": {
          "!type": "number",
          "!doc": "How the texture is sampled when a texel covers less than one pixel. The default is THREE.LinearMipMapLinearFilter, which uses mipmapping and a trilinear filter. Other choices are THREE.NearestFilter, THREE.NearestMipMapNearestFilter, THREE.NearestMipMapLinearFilter, THREE.LinearFilter, and THREE.LinearMipMapNearestFilter. These vary whether the nearest texel or nearest four texels are retrieved on the nearest mipmap or nearest two mipmaps. Interpolation occurs among the samples retrieved."
        },
        "anisotropy": {
          "!type": "number",
          "!doc": "The number of samples taken along the axis through the pixel that has the highest density of texels. By default, this value is 1. A higher value gives a less blurry result than a basic mipmap, at the cost of more texture samples being used. Use renderer.getMaxAnisotropy() to find the maximum valid anisotropy value for the GPU; this value is usually a power of 2."
        },
        "repeat": {
          "!type": "+THREE.Vector2",
          "!doc": "How many times the texture is repeated across the surface, in each direction U and V."
        },
        "offset": {
          "!type": "+THREE.Vector2",
          "!doc": "How much a single repetition of the texture is offset from the beginning, in each direction U and V. Typical range is 0.0 to 1.0."
        },
        "format": {
          "!type": "number",
          "!doc": "The default is THREE.RGBAFormat for the texture. Other formats are: THREE.AlphaFormat, THREE.RGBFormat, THREE.LuminanceFormat, and THREE.LuminanceAlphaFormat. There are also compressed texture formats, if the S3TC extension is supported: THREE.RGB_S3TC_DXT1_Format, THREE.RGBA_S3TC_DXT1_Format, THREE.RGBA_S3TC_DXT3_Format, and THREE.RGBA_S3TC_DXT5_Format."
        },
        "type": {
          "!type": "number",
          "!doc": "The default is THREE.UnsignedByteType. Other valid types (as WebGL allows) are THREE.ByteType, THREE.ShortType, THREE.UnsignedShortType, THREE.IntType, THREE.UnsignedIntType, THREE.HalfFloatType, THREE.FloatType, THREE.UnsignedShort4444Type, THREE.UnsignedShort5551Type, and THREE.UnsignedShort565Type."
        },
        "depthBuffer": {
          "!type": "boolean",
          "!doc": "Renders to the depth buffer. Default is true."
        },
        "stencilBuffer": {
          "!type": "boolean",
          "!doc": "Renders to the stencil buffer. Default is true."
        },
        "generateMipmaps": {
          "!type": "boolean",
          "!doc": "Whether to generate mipmaps (if possible) for a texture. True by default."
        },
        "setSize": {
          "!type": "fn(width: number, height: number)",
          "!doc": "Sets the size of the renderTarget."
        },
        "clone": {
          "!type": "fn() -> RenderTarget",
          "!doc": "Creates a copy of the render target."
        },
        "dispose": {
          "!type": "fn()",
          "!doc": "Dispatches a dispose event."
        }
      },
      "!doc": "A render target is a buffer where the video card draws pixels for a scene that is being rendered in the background. It is used in different effects.",
      "!type": "fn(width: number, height: number, options: object)"
    },
    "WebGLRenderTargetCube": {
      "!url": "http://threejs.org/docs/#Reference/renderers/WebGLRenderTargetCube",
      "prototype": {
        "!proto": "THREE.WebGLRenderTarget.prototype",
        "activeCubeFace": {
          "!type": "integer",
          "!doc": "The activeCubeFace property corresponds to a cube side (PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5) and is\n\t\tused and set internally by the [page:CubeCamera]."
        }
      },
      "!doc": "[page:CubeCamera] uses this as its [page:WebGLRenderTarget]",
      "!type": "fn(width: number, height: number, options: object)"
    },
    "WebGLRenderer": {
      "!url": "http://threejs.org/docs/#Reference/renderers/WebGLRenderer",
      "prototype": {
        "domElement": {
          "!type": "DOMElement",
          "!doc": "A [page:Canvas] where the renderer draws its output.<br>\n\t\tThis is automatically created by the renderer in the constructor (if not provided already); you just need to add it to your page."
        },
        "context": {
          "!type": "WebGLRenderingContext",
          "!doc": "The HTML5 Canvas's 'webgl' context obtained from the canvas where the renderer will draw."
        },
        "autoClear": {
          "!type": "bool",
          "!doc": "Defines whether the renderer should automatically clear its output before rendering."
        },
        "autoClearColor": {
          "!type": "bool",
          "!doc": "If autoClear is true, defines whether the renderer should clear the color buffer. Default is true."
        },
        "autoClearDepth": {
          "!type": "bool",
          "!doc": "If autoClear is true, defines whether the renderer should clear the depth buffer. Default is true."
        },
        "autoClearStencil": {
          "!type": "bool",
          "!doc": "If autoClear is true, defines whether the renderer should clear the stencil buffer. Default is true."
        },
        "sortObjects": {
          "!type": "bool",
          "!doc": "Note: Sorting is used to attempt to properly render objects that have some degree of transparency.  By definition, sorting objects may not work in all cases.  Depending on the needs of application, it may be neccessary to turn off sorting and use other methods to deal with transparency rendering e.g. manually determining the object rendering order."
        },
        "autoUpdateObjects": {
          "!type": "bool",
          "!doc": "Defines whether the renderer should auto update objects. Default is true."
        },
        "gammaInput": {
          "!type": "bool",
          "!doc": "Default is false. If set, then it expects that all textures and colors are premultiplied gamma."
        },
        "gammaOutput": {
          "!type": "bool",
          "!doc": "Default is false.  If set, then it expects that all textures and colors need to be outputted in premultiplied gamma."
        },
        "shadowMapEnabled": {
          "!type": "bool",
          "!doc": "Default is false. If set, use shadow maps in the scene."
        },
        "shadowMapType": {
          "!type": "number",
          "!doc": "Options are THREE.BasicShadowMap, THREE.PCFShadowMap, THREE.PCFSoftShadowMap. Default is THREE.PCFShadowMap."
        },
        "shadowMapCullFace": {
          "!type": "number",
          "!doc": "Default is THREE.CullFaceFront. The faces that needed to be culled. Possible values: THREE.CullFaceFront and THREE.CullFaceBack"
        },
        "shadowMapCascade": {
          "!type": "bool",
          "!doc": "Default is false. If Set, use cascaded shadowmaps. See [link:http://developer.download.nvidia.com/SDK/10.5/opengl/src/cascaded_shadow_maps/doc/cascaded_shadow_maps.pdf cascaded shadowmaps] for more information."
        },
        "maxMorphTargets": {
          "!type": "number",
          "!doc": "Default is 8. The maximum number of MorphTargets allowed in a shader. Keep in mind that the standard materials only allow 8 MorphTargets."
        },
        "maxMorphNormals": {
          "!type": "number",
          "!doc": "Default is 4. The maximum number of MorphNormals allowed in a shader. Keep in mind that the standard materials only allow 4 MorphNormals."
        },
        "autoScaleCubemaps": {
          "!type": "bool",
          "!doc": "Default is true. If set, then Cubemaps are scaled, when they are bigger than the maximum size, to make sure that they aren't bigger than the maximum size."
        },
        "info": {
          "!type": "object",
          "!doc": "<ul>\n\t\t\t<li>memory:\n\t\t\t\t<ul>\n\t\t\t\t\t<li>programs</li>\n\t\t\t\t\t<li>geometries</li>\n\t\t\t\t\t<li>textures</li>\n\t\t\t\t</ul>\n\t\t\t</li>\n\t\t\t<li>render:\n\t\t\t\t<ul>\n\t\t\t\t\t<li>calls</li>\n\t\t\t\t\t<li>vertices</li>\n\t\t\t\t\t<li>faces</li>\n\t\t\t\t\t<li>points</li>\n\t\t\t\t</ul>\n\t\t\t</li>\n\t\t</ul>"
        },
        "shadowMapPlugin": {
          "!type": "+THREE.ShadowMapPlugin",
          "!doc": "This contains the reference to the shadowMapPlugin."
        },
        "getContext": {
          "!type": "fn() -> WebGLRenderingContext",
          "!doc": "Return the WebGL context."
        },
        "supportsVertexTextures": {
          "!type": "fn() -> bool",
          "!doc": "Return a [page:Boolean] true if the context supports vertex textures."
        },
        "setSize": {
          "!type": "fn(width: number, height: number)",
          "!doc": "Resizes the output canvas to (width, height), and also sets the viewport to fit that size, starting in (0, 0)."
        },
        "setViewport": {
          "!type": "fn(x: number, y: number, width: number, height: number)",
          "!doc": "Sets the viewport to render from (x, y) to (x + width, y + height)."
        },
        "setScissor": {
          "!type": "fn(x: number, y: number, width: number, height: number)",
          "!doc": "Sets the scissor area from (x, y) to (x + width, y + height)."
        },
        "enableScissorTest": {
          "!type": "fn(enable: bool)",
          "!doc": "Enable the scissor test. When this is enabled, only the pixels within the defined scissor area will be affected by further renderer actions."
        },
        "setClearColor": {
          "!type": "fn(color: +THREE.Color, alpha: number)",
          "!doc": "Sets the clear color and opacity."
        },
        "getClearColor": {
          "!type": "fn() -> +THREE.Color",
          "!doc": "Returns a [page:Color THREE.Color] instance with the current clear color."
        },
        "getClearAlpha": {
          "!type": "fn() -> number",
          "!doc": "Returns a [page:Float float] with the current clear alpha. Ranges from 0 to 1."
        },
        "clear": {
          "!type": "fn(color: bool, depth: bool, stencil: bool)",
          "!doc": "Arguments default to true."
        },
        "renderBufferImmediate": {
          "!type": "fn(object: +THREE.Object3D, program: shaderprogram, shading: +THREE.Material)",
          "!doc": "Render an immediate buffer. Gets called by renderImmediateObject."
        },
        "renderBufferDirect": {
          "!type": "fn(camera: +THREE.Camera, lights: [], fog: +THREE.Fog, material: +THREE.Material, geometryGroup: object, object: +THREE.Object3D)",
          "!doc": "Render a buffer geometry group using the camera and with the correct material."
        },
        "renderBuffer": {
          "!type": "fn(camera: +THREE.Camera, lights: [], fog: +THREE.Fog, material: +THREE.Material, geometryGroup: object, object: +THREE.Object3D)",
          "!doc": "Render a geometry group using the camera and with the correct material."
        },
        "render": {
          "!type": "fn(scene: +THREE.Scene, camera: +THREE.Camera, renderTarget: +THREE.WebGLRenderTarget, forceClear: bool)",
          "!doc": "Even with forceClear set to true you can prevent certain buffers being cleared by setting either the .autoClearColor, .autoClearStencil or .autoClearDepth properties to false."
        },
        "renderImmediateObject": {
          "!type": "fn(camera, lights, fog, material, object)",
          "!doc": "Renders an immediate Object using a camera."
        },
        "setFaceCulling": {
          "!type": "fn(cullFace, frontFace)",
          "!doc": "If cullFace is false, culling will be disabled."
        },
        "setDepthTest": {
          "!type": "fn(depthTest: boolean)",
          "!doc": "This sets, based on depthTest, whether or not the depth data needs to be tested against the depth buffer."
        },
        "setDepthWrite": {
          "!type": "fn(depthWrite: boolean)",
          "!doc": "This sets, based on depthWrite, whether or not the depth data needs to be written in the depth buffer."
        },
        "setBlending": {
          "!type": "fn(blending: number, blendEquation: number, blendSrc: number, blendDst: number)",
          "!doc": "This method sets the correct blending."
        },
        "setTexture": {
          "!type": "fn(texture: +THREE.Texture, slot: number)",
          "!doc": "This method sets the correct texture to the correct slot for the wegl shader. The slot number can be found as a value of the uniform of the sampler."
        },
        "setRenderTarget": {
          "!type": "fn(renderTarget: +THREE.WebGLRenderTarget)",
          "!doc": "This method sets the active rendertarget."
        },
        "supportsCompressedTextureS3TC": {
          "!type": "fn() -> boolean",
          "!doc": "This method returns true if the webgl implementation supports compressed textures of the format S3TC."
        },
        "getMaxAnisotropy": {
          "!type": "fn() -> number",
          "!doc": "This returns the anisotropy level of the textures."
        },
        "getPrecision": {
          "!type": "fn() -> string",
          "!doc": "This gets the precision used by the shaders. It returns \"highp\",\"mediump\" or \"lowp\"."
        },
        "setMaterialFaces": {
          "!type": "fn(material: +THREE.Material)",
          "!doc": "This sets which side needs to be culled in the webgl renderer."
        },
        "supportsStandardDerivatives": {
          "!type": "fn() -> boolean",
          "!doc": "This method returns true if the webgl implementation supports standard derivatives."
        },
        "supportsFloatTextures": {
          "!type": "fn() -> boolean",
          "!doc": "This method returns true if the webgl implementation supports float textures."
        },
        "clearTarget": {
          "!type": "fn(renderTarget: +THREE.WebGLRenderTarget, color: boolean, depth: boolean, stencil: boolean)",
          "!doc": "This method clears a rendertarget. To do this, it activates the rendertarget."
        }
      },
      "!doc": "The WebGL renderer displays your beautifully crafted scenes using WebGL, if your device supports it.",
      "!type": "fn(parameters: object)"
    },
    "ShaderChunk": {
      "!url": "http://threejs.org/docs/#Reference/renderers/shaders/ShaderChunk",
      "prototype": {},
      "!doc": "Shader chunks for WebLG Shader library"
    },
    "ShaderLib": {
      "!url": "http://threejs.org/docs/#Reference/renderers/shaders/ShaderLib",
      "prototype": {},
      "!doc": "Webgl Shader Library for three.js"
    },
    "UniformsLib": {
      "!url": "http://threejs.org/docs/#Reference/renderers/shaders/UniformsLib",
      "prototype": {},
      "!doc": "Uniforms library for shared webgl shaders"
    },
    "UniformsUtils": {
      "!url": "http://threejs.org/docs/#Reference/renderers/shaders/UniformsUtils",
      "prototype": {},
      "!doc": "Uniform Utilities. Support merging and cloning of uniform variables"
    },
    "WebGLProgram": {
      "!url": "http://threejs.org/docs/#Reference/renderers/webgl/WebGLProgram",
      "prototype": {
        "uniforms": "object",
        "attributes": "object",
        "id": "string",
        "code": "string",
        "usedTimes": "number",
        "program": "object",
        "vertexShader": "+THREE.WebGLShader",
        "fragmentShader": "+THREE.WebGLShader"
      },
      "!doc": "Constructor for the GLSL program sent to vertex and fragment shaders, including default uniforms and attributes.",
      "!type": "fn(renderer: +THREE.WebGLRenderer, code: object, material: +THREE.Material, parameters: object)"
    },
    "WebGLShader": {
      "!url": "http://threejs.org/docs/#Reference/renderers/webgl/WebGLShader",
      "prototype": {},
      "!doc": "todo"
    },
    "LensFlarePlugin": {
      "!url": "http://threejs.org/docs/#Reference/renderers/webgl/plugins/LensFlarePlugin",
      "prototype": {
        "render": {
          "!type": "fn(scene: +THREE.Scene, camera: +THREE.Camera, viewportWidth: number, viewportHeight: number)",
          "!doc": "Renders the lensflares defined in the scene. This gets automatically called as post render function to draw the lensflares."
        }
      },
      "!doc": "The Webglrenderer plugin class that allows lensflares to be rendered in the WebglRenderer. This plugin is automatically loaded in the Webglrenderer.",
      "!type": "fn()"
    },
    "ShadowMapPlugin": {
      "!url": "http://threejs.org/docs/#Reference/renderers/webgl/plugins/ShadowMapPlugin",
      "prototype": {
        "render": {
          "!type": "fn(scene: +THREE.Scene, camera: +THREE.Camera)",
          "!doc": "Prepares the shadowmaps to be rendered defined in the scene. This gets automatically called as pre render function to draw the lensflares."
        }
      },
      "!doc": "The Webglrenderer plugin class that allows shadowmaps to be rendered in the WebglRenderer. This plugin is automatically loaded in the Webglrenderer.",
      "!type": "fn()"
    },
    "SpritePlugin": {
      "!url": "http://threejs.org/docs/#Reference/renderers/webgl/plugins/SpritePlugin",
      "prototype": {
        "render": {
          "!type": "fn(scene: +THREE.Scene, camera: +THREE.Camera)",
          "!doc": "Renders the sprites defined in the scene. This gets automatically called as post-render function to draw the lensflares."
        }
      },
      "!doc": "The Webglrenderer plugin class that allows Sprites to be rendered in the WebglRenderer. This plugin is automatically loaded in the Webglrenderer.",
      "!type": "fn()"
    },
    "Fog": {
      "!url": "http://threejs.org/docs/#Reference/scenes/Fog",
      "prototype": {
        "name": {
          "!type": "string",
          "!doc": "Default is the empty string."
        },
        "color": {
          "!type": "+THREE.Color",
          "!doc": "Fog color.  Example: If set to black, far away objects will be rendered black."
        },
        "near": {
          "!type": "number",
          "!doc": "Default is 1."
        },
        "far": {
          "!type": "number",
          "!doc": "Default is 1000."
        },
        "clone": {
          "!type": "fn() -> +THREE.Fog",
          "!doc": "Returns a copy of this."
        }
      },
      "!doc": "This class contains the parameters that define linear fog, i.e., that grows linearly denser with the distance.",
      "!type": "fn(hex: number, near: number, far: number)"
    },
    "FogExp2": {
      "!url": "http://threejs.org/docs/#Reference/scenes/FogExp2",
      "prototype": {
        "name": {
          "!type": "string",
          "!doc": "Default is the empty string."
        },
        "color": {
          "!type": "+THREE.Color",
          "!doc": "Fog color. Example: If set to black, far away objects will be rendered black."
        },
        "density": {
          "!type": "number",
          "!doc": "Default is 0.00025."
        },
        "clone": {
          "!type": "fn() -> +THREE.FogExp2",
          "!doc": "Returns a copy of this."
        }
      },
      "!doc": "This class contains the parameters that define exponential fog, i.e., that grows exponentially denser with the distance.",
      "!type": "fn(hex: number, density: number)"
    },
    "Scene": {
      "!url": "http://threejs.org/docs/#Reference/scenes/Scene",
      "prototype": {
        "!proto": "THREE.Object3D.prototype",
        "fog": {
          "!type": "+THREE.Fog",
          "!doc": "A [page:Fog fog] instance defining the type of fog that affects everything rendered in the scene. Default is null."
        },
        "overrideMaterial": {
          "!type": "+THREE.Material",
          "!doc": "If not null, it will force everything in the scene to be rendered with that material. Default is null."
        },
        "autoUpdate": {
          "!type": "boolean",
          "!doc": "Default is true. If set, then the renderer checks every frame if the scene and its objects needs matrix updates. \n\t\tWhen it isn't, then you have to maintain all matrices in the scene yourself."
        }
      },
      "!doc": "Scenes allow you to set up what and where is to be rendered by three.js. This is where you place objects, lights and cameras.",
      "!type": "fn()"
    },
    "CompressedTexture": {
      "!url": "http://threejs.org/docs/#Reference/textures/CompressedTexture",
      "prototype": {
        "!proto": "THREE.Texture.prototype",
        "flipY": {
          "!type": "boolean",
          "!doc": "False by default. Flipping textures does not work for compressed textures."
        },
        "generateMipmaps": {
          "!type": "boolean",
          "!doc": "False by default. Mipmaps can't be generated for compressed textures"
        }
      },
      "!doc": "Creates a texture based on data in compressed form.",
      "!type": "fn(mipmaps: [], width: number, height: number, format: number, type: number, mapping: number, wrapS: number, wrapT: number, magFilter: number, minFilter: number, anisotropy: number)"
    },
    "DataTexture": {
      "!url": "http://threejs.org/docs/#Reference/textures/DataTexture",
      "prototype": {
        "!proto": "THREE.Texture.prototype"
      },
      "!doc": "Creates a texture directly from bitmapdata, width and height.",
      "!type": "fn(data: ArraybufferView, width: number, height: number, format: number, type: number, mapping: number, wrapS: number, wrapT: number, magFilter: number, minFilter: number, anisotropy: number)"
    },
    "Texture": {
      "!url": "http://threejs.org/docs/#Reference/textures/Texture",
      "prototype": {
        "id": {
          "!type": "number",
          "!doc": "Unique number for this texture instance."
        },
        "image": {
          "!type": "Image",
          "!doc": "An Image object, typically created using the ImageUtils or [page:ImageLoader ImageLoader] classes. The Image object can include an image (e.g., PNG, JPG, GIF, DDS), video (e.g., MP4, OGG/OGV), or set of six images for a cube map. To use video as a texture you need to have a playing HTML5 video element as a source for your texture image and continuously update this texture as long as video is playing."
        },
        "mapping": {
          "!type": "object",
          "!doc": "How the image is applied to the object. An object type of THREE.UVMapping is the default, where the U,V coordinates are used to apply the map, and a single texture is expected. The other types are THREE.CubeReflectionMapping, for cube maps used as a reflection map; THREE.CubeRefractionMapping, refraction mapping; and THREE.SphericalReflectionMapping, a spherical reflection map projection."
        },
        "wrapS": {
          "!type": "number",
          "!doc": "The default is THREE.ClampToEdgeWrapping, where the edge is clamped to the outer edge texels. The other two choices are THREE.RepeatWrapping and THREE.MirroredRepeatWrapping."
        },
        "wrapT": {
          "!type": "number",
          "!doc": "NOTE: tiling of images in textures only functions if image dimensions are powers of two (2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, ...) in terms of pixels. Individual dimensions need not be equal, but each must be a power of two. This is a limitation of WebGL, not Three.js."
        },
        "magFilter": {
          "!type": "number",
          "!doc": "How the texture is sampled when a texel covers more than one pixel. The default is THREE.LinearFilter, which takes the four closest texels and bilinearly interpolates among them. The other option is THREE.NearestFilter, which uses the value of the closest texel."
        },
        "minFilter": {
          "!type": "number",
          "!doc": "How the texture is sampled when a texel covers less than one pixel. The default is THREE.LinearMipMapLinearFilter, which uses mipmapping and a trilinear filter. Other choices are THREE.NearestFilter, THREE.NearestMipMapNearestFilter, THREE.NearestMipMapLinearFilter, THREE.LinearFilter, and THREE.LinearMipMapNearestFilter. These vary whether the nearest texel or nearest four texels are retrieved on the nearest mipmap or nearest two mipmaps. Interpolation occurs among the samples retrieved."
        },
        "format": {
          "!type": "number",
          "!doc": "The default is THREE.RGBAFormat for the texture. Other formats are: THREE.AlphaFormat, THREE.RGBFormat, THREE.LuminanceFormat, and THREE.LuminanceAlphaFormat. There are also compressed texture formats, if the S3TC extension is supported: THREE.RGB_S3TC_DXT1_Format, THREE.RGBA_S3TC_DXT1_Format, THREE.RGBA_S3TC_DXT3_Format, and THREE.RGBA_S3TC_DXT5_Format."
        },
        "type": {
          "!type": "number",
          "!doc": "The default is THREE.UnsignedByteType. Other valid types (as WebGL allows) are THREE.ByteType, THREE.ShortType, THREE.UnsignedShortType, THREE.IntType, THREE.UnsignedIntType, THREE.FloatType, THREE.UnsignedShort4444Type, THREE.UnsignedShort5551Type, and THREE.UnsignedShort565Type."
        },
        "anisotropy": {
          "!type": "number",
          "!doc": "The number of samples taken along the axis through the pixel that has the highest density of texels. By default, this value is 1. A higher value gives a less blurry result than a basic mipmap, at the cost of more texture samples being used. Use renderer.getMaxAnisotropy() to find the maximum valid anisotropy value for the GPU; this value is usually a power of 2."
        },
        "needsUpdate": {
          "!type": "boolean",
          "!doc": "If a texture is changed after creation, set this flag to true so that the texture is properly set up. Particularly important for setting the wrap mode."
        },
        "repeat": {
          "!type": "+THREE.Vector2",
          "!doc": "How many times the texture is repeated across the surface, in each direction U and V."
        },
        "offset": {
          "!type": "+THREE.Vector2",
          "!doc": "How much a single repetition of the texture is offset from the beginning, in each direction U and V. Typical range is 0.0 to 1.0."
        },
        "name": {
          "!type": "string",
          "!doc": "Given name of the texture, empty string by default."
        },
        "generateMipmaps": {
          "!type": "boolean",
          "!doc": "Whether to generate mipmaps (if possible) for a texture. True by default."
        },
        "flipY": {
          "!type": "boolean",
          "!doc": "True by default. Flips the image's Y axis to match the WebGL texture coordinate space."
        },
        "mipmaps": {
          "!type": "array",
          "!doc": "Array of mipmaps generated."
        },
        "unpackAlignment": {
          "!type": "number",
          "!doc": "4 by default. Specifies the alignment requirements for the start of each pixel row in memory. The allowable values are 1 (byte-alignment), 2 (rows aligned to even-numbered bytes), 4 (word-alignment), and 8 (rows start on double-word boundaries). See <a href=\"http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml\">glPixelStorei</a> for more information."
        },
        "premultiplyAlpha": {
          "!type": "boolean",
          "!doc": "False by default, which is the norm for PNG images. Set to true if the RGB values have been stored premultiplied by alpha."
        },
        "onUpdate": {
          "!type": "object",
          "!doc": "A callback function, called when the texture is updated (e.g., when needsUpdate has been set to true and then the texture is used)."
        }
      },
      "!doc": "Create a texture to apply to a surface or as a reflection or refraction map.",
      "!type": "fn(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy)"
    }
  }
}
    };
  });
});
