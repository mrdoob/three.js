Math - Math utility functions
-----------------------------
    
**function**::THREE.Math.clamp(*x*, *a*, *b*)

Clamps the *x* to be between *a* and *b*

+-----------+-------+----------------------+
| Parameter | Type  | Description          |
+===========+=======+======================+
| *x*       | float | value to be clamped  |
+-----------+-------+----------------------+
| *a*       | float | minimum value        |
+-----------+-------+----------------------+
| *b*       | float | maximum value        |
+-----------+-------+----------------------+
| returns   | float | value after clamping |
+-----------+-------+----------------------+

**function**::THREE.Math.clampBottom(*x*, *a*)

Clamps the *x* to be larger than *a*

+-----------+-------+----------------------+
| Parameter | Type  | Description          |
+===========+=======+======================+
| *x*       | float | value to be clamped  |
+-----------+-------+----------------------+
| *a*       | float | minimum value        |
+-----------+-------+----------------------+
| returns   | float | value after clamping |
+-----------+-------+----------------------+

**function**::THREE.Math.mapLinear(*x*, *a1*, *a2*, *b1*, *b2*)

//todo
 
**function**::THREE.Math.random16() 

+-----------+-------+-----------------------------------------------------+
| Parameter | Type  | Description                                         |
+===========+=======+=====================================================+
| returns   | float | Random float from <0, 1> with 16 bits of randomness |
+-----------+-------+-----------------------------------------------------+
(standard Math.random() creates repetitive patterns when applied over larger space)

**function**::THREE.Math.randInt(*low*, *high*)

+-----------+---------+----------------------------------------------+
| Parameter | Type    | Description                                  |
+===========+=========+==============================================+
| returns   | integer | Random integer from *low* to *high* interval |
+-----------+---------+----------------------------------------------+

**function**::THREE.Math.randFloat(*low*, *high*)

+-----------+-------+--------------------------------------------+
| Parameter | Type  | Description                                |
+===========+=======+============================================+
| returns   | float | Random float from *low* to *high* interval |
+-----------+-------+--------------------------------------------+

**function**::THREE.Math.randFloatSpread(*range*)

+-----------+-------+---------------------------------------------------+
| Parameter | Type  | Description                                       |
+===========+=======+===================================================+
| returns   | float | Random float from -*range*/2 to *range*/2 interval|
+-----------+-------+---------------------------------------------------+
