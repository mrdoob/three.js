Face3 - Triangle face
------------------------

.. rubric:: Constructor

.. class:: Face3( a, b, c, normal, color, materialIndex )

    Triangle face

    (indices start from zero)

    :param integer a: vertex A index
    :param integer b: vertex B index
    :param integer c: vertex C index
    :param varying normal: face normal or array of vertex normals
    :param varying color: face color or array of vertex colors
    :param integer materialIndex: material index

.. rubric:: Attributes

.. attribute:: Face3.a

    Vertex A index

.. attribute:: Face3.b

    Vertex B index

.. attribute:: Face3.c

    Vertex C index

.. attribute:: Face3.normal

    Face normal

    ``default (0,0,0)``

.. attribute:: Face3.color

    Face color

    ``default white``

.. attribute:: Face3.centroid

    Face centroid

.. attribute:: Face3.vertexNormals

    Array of vertex normals

.. attribute:: Face3.vertexColors

    Array of vertex colors

.. attribute:: Face3.vertexTangents

    Array of vertex tangents

.. attribute:: Face3.materialIndex

    Material index (points to ``geometry.materials`` array)

.. rubric:: Example

::

    var face = new THREE.Face3( 0, 1, 2, new THREE.Vector3( 0, 1, 0 ), new THREE.Color( 0xffaa00 ), 0 );