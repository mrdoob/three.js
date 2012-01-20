Face3 - Triangle face
------------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: Face3( a, b, c, normal, color, materialIndex )

    Triangle face

    (indices start from zero)

    :param integer a: vertex A index
    :param integer b: vertex B index
    :param integer c: vertex C index
    :param varying normal: face normal or array of vertex normals
    :param varying color: face color or array of vertex colors
    :param integer materialIndex: material index


.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: Face3.a

    Vertex A index

.. attribute:: Face3.b

    Vertex B index

.. attribute:: Face3.c

    Vertex C index

.. attribute:: Face3.normal

    Face normal

    :class:`Vector3` - default ``( 0, 0, 0 )``

.. attribute:: Face3.color

    Face color

    :class:`Color` - default ``white``

.. attribute:: Face3.centroid

    Face centroid

    :class:`Vector3` - default ``( 0, 0, 0 )``

.. attribute:: Face3.vertexNormals

    Array of 3 vertex normals

    default ``[]``

.. attribute:: Face3.vertexColors

    Array of 3 vertex colors

    default ``[]``

.. attribute:: Face3.vertexTangents

    Array of 3 vertex tangents

    default ``[]``

.. attribute:: Face3.materialIndex

    Material index (points to :attr:`Geometry.materials` array)

    default ``0``

.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    var face = new THREE.Face3( 0, 1, 2, new THREE.Vector3( 0, 1, 0 ), new THREE.Color( 0xffaa00 ), 0 );