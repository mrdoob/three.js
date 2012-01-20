Geometry - Base class for geometries
----------------------------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: Geometry()

    Base class for geometries

    Encapsulates unique instances of vertex buffer objects in :class:`WebGLRenderer`


.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: Geometry.id

    Unique number of this geometry instance

.. attribute:: Geometry.boundingBox

    Bounding box

    ::

        boundingBox = { min: new THREE.Vector3(), max: new THREE.Vector3() }

.. attribute:: Geometry.boundingSphere

    Bounding sphere

    ::

        boundingSphere = { radius: float }

.. attribute:: Geometry.materials

    Array of :class:`materials <Material>`

    Used with models containing multiple materials in a single geometry (with pass-through :class:`MeshFaceMaterial`)

    Face indices index into this array.


.. ...............................................................................
.. rubric:: Attribute buffers
.. ...............................................................................

.. attribute:: Geometry.faces

    Array of faces (:class:`Face3`, :class:`Face4`)

.. attribute:: Geometry.vertices

    Array of :class:`vertices <Vertex>`

    Face indices index into this array.

.. attribute:: Geometry.colors

   Array of vertex :class:`colors <Color>`, matching number and order of vertices.

   Used in :class:`ParticleSystem`, :class:`Line` and :class:`Ribbon`.

   :class:`Meshes <Mesh>` use per-face-use-of-vertex colors embedded directly in faces.

.. attribute:: Geometry.faceUvs

    Array of face UV layers.
    Each UV layer is an array of :class:`UV` matching order and number of faces.

.. attribute:: Geometry.faceVertexUvs

    Array of vertex UV layers.
    Each UV layer is an array of :class:`UV` matching order and number of vertices in faces.

.. attribute:: Geometry.morphTargets

    Array of morph targets.
    Each morph target is JS object:

    ::

        morphTarget = { name: "targetName", vertices: [ new THREE.Vertex(), ... ] }

    Morph vertices match number and order of primary vertices.

.. attribute:: Geometry.morphColors

    Array of morph colors.
    Morph colors have similar structure as morph targets, each color set is JS object:

    ::

        morphColor = { name: "colorName", colors: [ new THREE.Color(), ... ] }

    Morph colors can match either number and order of faces (face colors) or number of vertices (vertex colors).

.. attribute:: Geometry.skinWeights

    Array of skinning weights (:class:`Vector4`), matching number and order of vertices.

.. attribute:: Geometry.skinIndices

    Array of skinning indices (:class:`Vector4`), matching number and order of vertices.


.. ...............................................................................
.. rubric:: Flags
.. ...............................................................................

.. attribute:: Geometry.hasTangents

    True if geometry has tangents. Set in :func:`Geometry.computeTangents`

    ``default false``

.. attribute:: Geometry.dynamic

    Set to `true` if attribute buffers will need to change in runtime (using ``dirty`` flags).

    Unless set to true internal typed arrays corresponding to buffers will be deleted once sent to GPU.

    ``default false``


.. ...............................................................................
.. rubric:: Methods
.. ...............................................................................

.. function:: Geometry.applyMatrix( matrix )

    Bakes matrix transform directly into vertex coordinates

    :param Matrix4 matrix: matrix transform

.. function:: Geometry.computeCentroids()

    Computes centroids for all faces

.. function:: Geometry.computeFaceNormals()

    Computes face normals

.. function:: Geometry.computeVertexNormals()

    Computes vertex normals by averaging face normals.

    Face normals must be existing / computed beforehand.

.. function:: Geometry.computeTangents()

    Computes vertex tangents

    Based on http://www.terathon.com/code/tangent.html

    Geometry must have vertex UVs (layer 0 will be used).

.. function:: Geometry.computeBoundingBox()

    Computes bounding box of the geometry, updating :attr:`Geometry.boundingBox` attribute.

.. function:: Geometry.computeBoundingSphere()

    Computes bounding sphere of the geometry, updating :attr:`Geometry.boundingSphere` attribute.

.. function:: Geometry.mergeVertices()

    Checks for duplicate vertices using hashmap.
    Duplicated vertices are removed and faces' vertices are updated.

.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    // geometry with random points
    // (useful for example with ParticleSystem)

    var n = 10000;
    var geometry = new THREE.Geometry()
    for ( var i = 0; i < n; i ++ ) {

        var x = THREE.MathUtils.randFloatSpread( 1000 );
        var y = THREE.MathUtils.randFloatSpread( 1000 );
        var z = THREE.MathUtils.randFloatSpread( 1000 );
        var position = new THREE.Vector3( x, y, z );
        var vertex = new THREE.Vertex( position );

        geometry.vertices.push( vertex );

    }

    geometry.computeBoundingSphere();
