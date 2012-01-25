Face4 - Quad face
------------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: Face4( a, b, c, d, normal, color, materialIndex )

    Quad face

    (indices start from zero)

    :param integer a: vertex index
    :param integer b: vertex index
    :param integer c: vertex index
    :param integer d: vertex index
    :param varying normal: face normal or array of vertex normals
    :param varying color: face color or array of vertex colors
    :param integer materialIndex: material index


.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: Face4.a

    Vertex A index

.. attribute:: Face4.b

    Vertex B index

.. attribute:: Face4.c

    Vertex C index

.. attribute:: Face4.d

    Vertex D index

.. attribute:: Face4.normal

    Face normal

    :class:`Vector3` - default ``(0,0,0)``

.. attribute:: Face4.color

    Face color

    :class:`Color` - default ``white``

.. attribute:: Face4.centroid

    :class:`Vector3` - default ``(0,0,0)``

.. attribute:: Face4.vertexNormals

    Array of 4 vertex normals

    default ``[]``

.. attribute:: Face4.vertexColors

    Array of 4 vertex colors

    default ``[]``

.. attribute:: Face4.vertexTangents

    Array of 4 vertex tangents

    default ``[]``

.. attribute:: Face4.materialIndex

    Material index (points to :attr:`Geometry.materials` array)

    default ``0``


.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    var face = new THREE.Face4( 0, 1, 2, 3, new THREE.Vector3( 0, 1, 0 ), new THREE.Color( 0xffaa00 ), 0 );
