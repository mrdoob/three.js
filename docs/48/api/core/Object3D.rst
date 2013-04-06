Object3D - Base class for scene graph objects
---------------------------------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: Object3D()

    Base class for scene graph objects

.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: Object3D.id

    Unique number of this object instance

.. attribute:: Object3D.name

    Optional name of the object (doesn't have to be unique)

.. ...............................................................................
.. rubric:: Scene graph attributes
.. ...............................................................................

.. attribute:: Object3D.parent

    Object's parent in scene graph

.. attribute:: Object3D.children

    Array with object's children

.. ...............................................................................
.. rubric:: Transform attributes
.. ...............................................................................

.. attribute:: Object3D.position

    Object's local position

    :class:`Vector3` - default  ``( 0, 0, 0 )``

.. attribute:: Object3D.rotation

    Object's local rotation (Euler angles)

    :class:`Vector3` - default  ``( 0, 0, 0 )``

.. attribute:: Object3D.eulerOrder

    Order of axis for Euler angles

    ``string`` - default ``XYZ``

.. attribute:: Object3D.scale

    Object's local scale

    :class:`Vector3` - default  ``( 1, 1, 1 )``

.. attribute:: Object3D.up

    Up direction

    :class:`Vector3` - default  ``( 0, 1, 0 )``

.. attribute:: Object3D.matrix

    Local transform

    :class:`Matrix4`

.. attribute:: Object3D.matrixWorld

    Global transform

    :class:`Matrix4`

.. attribute:: Object3D.matrixRotationWorld

    Global rotation

    :class:`Matrix4`

.. attribute:: Object3D.quaternion

    Rotation quaternion

    :class:`Quaternion`

.. attribute:: Object3D.useQuaternion

    Use quaternion instead of Euler angles for specifying local rotation

    boolean - default ``false``

.. attribute:: Object3D.boundRadius

    ``float`` - default ``0.0``

.. attribute:: Object3D.boundRadiusScale

    Maximum scale from X, Y, Z scale components

    ``float`` - default ``1.0``

.. attribute:: Object3D.renderDepth

    Override depth-sorting order if non ``null``

    ``float`` - default ``null``

.. ...............................................................................
.. rubric:: Appearance flags
.. ...............................................................................

.. attribute:: Object3D.visible

    Object gets rendered if ``true``

    ``boolean`` - default ``true``

.. attribute:: Object3D.doubleSided

    Both sides of faces visible if ``true``

    default ``false``

.. attribute:: Object3D.flipSided

    Backside of face visible

    default ``false``

.. attribute:: Object3D.castShadow

    Gets rendered into shadow map

    ``boolean`` - default ``false``

.. attribute:: Object3D.receiveShadow

    Material gets baked in shadow receiving

    ``boolean`` - default ``false``


.. ...............................................................................
.. rubric:: Scene graph flags
.. ...............................................................................

.. attribute:: Object3D.frustumCulled

    ``boolean`` - default ``true``

.. attribute:: Object3D.matrixAutoUpdate

    ``boolean`` - default ``true``

.. attribute:: Object3D.matrixWorldNeedsUpdate

    ``boolean`` - default ``true``

.. attribute:: Object3D.rotationAutoUpdate

    ``boolean`` - default ``true``


.. ...............................................................................
.. rubric:: Methods
.. ...............................................................................

.. function:: Object3D.translate ( distance, axis )

    Translates object along arbitrary axis by distance

    :param float distance: distance
    :param Vector3 axis: translation direction

.. function:: Object3D.translateX ( distance )

    Translates object along X-axis by distance

    :param float distance: distance

.. function:: Object3D.translateY ( distance )

    Translates object along Y-axis by distance

    :param float distance: distance

.. function:: Object3D.translateZ ( distance )

    Translates object along Z-axis by distance

    :param float distance: distance

.. function:: Object3D.lookAt ( vector )

    Rotates object to face point in space

    :param Vector3 vector: vector

.. function:: Object3D.add ( object )

    Adds child object to this object

    :param Object3D object: child

.. function:: Object3D.remove ( object )

    Removes child object from this object

    :param Object3D object: child

.. function:: Object3D.getChildByName ( name, doRecurse )

    Gets first child with name matching the argument (searches whole subgraph recursively if flag is set).

    :param string name: child name
    :param boolean doRecurse: recurse flag
    :returns: child with matching name or ``undefined``
    :rtype: :class:`Object3D`

.. function:: Object3D.updateMatrix ( )

    Updates local transform

.. function:: Object3D.updateMatrixWorld ( force )

    Updates global transform of the object and its children


.. ...............................................................................
.. rubric:: Example
.. ...............................................................................
