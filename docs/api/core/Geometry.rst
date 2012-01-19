Geometry - Base class for geometry types
----------------------------------------

.. rubric:: Constructor

.. class:: Geometry()

    Base class for geometry types

.. rubric:: Attributes

.. attribute:: Geometry.id

    Unique number of the geometry

.. attribute:: Geometry.vertices

    Array of vertices

.. attribute:: Geometry.colors;

 
   Array of one-to-one vertex colors, used in ParticleSystem, Line and Ribbon

.. attribute:: Geometry.materials

    //todo:description

.. attribute:: Geometry.faces

    //todo:description

.. attribute:: Geometry.faceUvs

    //todo:description

.. attribute:: Geometry.faceVertexUvs

    //todo:description

.. attribute:: Geometry.morphTargets

    //todo:description

.. attribute:: Geometry.morphColors

    //todo:description

.. attribute:: Geometry.skinWeights

    //todo:description

.. attribute:: Geometry.skinIndices

    //todo:description

.. attribute:: Geometry.boundingBox

    //todo:description

.. attribute:: Geometry.boundingSphere

    //todo:description

.. attribute:: Geometry.hasTangents

    //todo:description

.. attribute:: Geometry.dynamic

    //todo:description
    
    Unless set to true the *Arrays* will be deleted once sent to a buffer.
    
.. rubric:: Methods

.. function:: Geometry.applyMatrix(matrix)

    //todo:description
    
    :param Matrix4 matrix: //todo

.. function:: Geometry.computeCentroids()

    //todo:description

.. function:: Geometry.computeFaceNormals()

    //todo:description

.. function:: Geometry.computeVertexNormals()

    //todo:description

.. function:: Geometry.computeTangents()

    //todo:description

.. function:: Geometry.computeBoundingBox()

    //todo:description

.. function:: Geometry.computeBoundingSphere()

    //todo:description

.. function:: Geometry.mergeVertices()

    //todo:description

.. rubric:: Example(s)

::

//todo::example