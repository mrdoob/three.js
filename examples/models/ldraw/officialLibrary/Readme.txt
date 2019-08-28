LDraw Readme File

Welcome to LDraw

This short readme file explains what files and subdirectories are present in 
your LDraw installation, described the LDraw library structure and and has links 
to some sites on the internet where you can find help and further information.

 * LDraw program directory contents
 * LDraw library structure
 * Where to find further information
 * Parts library updates

--------------------------------------------------------------------------------
* LDraw program directory contents:
 - Program executables:
   mklist.exe   -  This is a utility that creates a list of available
                   parts. This list (parts.lst) is used by LDraw tools
                   as the available parts list. You should re-run mklist 
                   after installing new parts updates.

 - Support Files:
   Parts.lst    -  This is your listing of all usable parts available.
                   This list is created by running mklist.exe and choosing
                   to create the list sorted Numerically or by Description.
                   Most people use Description sorting, but you can
                   change to whichever way you prefer at any time.
   mklist1_6.zip - Zip archive of the MKList source code.

 - Informational Files:
   Readme.txt   -  This file you are currently reading.
 
 - Subdirectories:
   \MODELS\     -  This directory is where your model .dat files are stored.
                   There are two sample model .dat files installed for you
                   to look at - Car.dat and Pyramid.dat.
   \P\          -  This directory is where parts primitives are located.
                   Parts primitives are tyically highly reusable components
                   used by the part files in the LDraw library.
   \P\48\       -  This directory is where high resolution parts primitives 
                   are located. These are typically used for large curved
                   parts where excessive scaling of the regular curved 
                   primitives would produce an undesriable result.
   \PARTS\      -  This directory holds all the actual parts that can be used
                   in creating or rendering your models.  A list of these
                   parts can be seen by viewing the parts.lst file.
   \PARTS\S\    -  This directory holds sub-parts that are used by the LDraw
                   parts to optimise file size and improve parts development
                   efficiancy. 

--------------------------------------------------------------------------------
* LDraw library structure:

  The official LDraw library is segmented into four categories:

 - OfficialCA       - The library of officially released parts for which the 
                      authors have agreed to the Contributor Agreement, allowing
                      their work to be re-distributed. Full details of this 
                      agreement can be found in the CAreadme.txt and 
                      CAlicense.txt files in the same diectory as this file.
                      This download is restricted to generic colour versions of 
                      each part and does not contain duplicate copies of part 
                      files where different numbers have been used for the same 
                      physical part. This library may be re-distributed, subject 
                      to the conditions laid out in CAreadme.txt.

 - OfficialCA_a     - The library of officially released part aliases. This 
                      includes generic colour versions of parts that are 
                      physically identical to parts in the OfficialCA library,
                      but have a different part number, either because of
                      production differences between opaque and transparent 
                      parts or due to evolution of the part numbering scheme.    

 - OfficialCA_p     - The library of officially released physical colour parts. 
                      This includes hard-coded colour versions of parts or 
                      composite parts.

 - OfficialNonCA    - The library of officially released parts for which the 
                      authors have not agreed to the Contributor Agreement, or
                      where we have been unable to contact the original author. 
                      This download is restricted to generic colour versions of 
                      each part and does not contain duplicate copies of part 
                      files where different numbers have been used for the same 
                      physical part.
                      This library MAY NOT be re-distributed, as detailed in the 
                      conditions laid out in NonCAreadme.txt file.   

--------------------------------------------------------------------------------
* Where to find further information

  For more information on LDraw, check out these internet resources:

 - LDraw.org  -  http://www.ldraw.org/
   Centralized LDraw Resources on the internet.
   Parts updates, Utility programs for using and enhancing LDraw, and more.

 - LUGNET  -  http://www.lugnet.com/
   The Lego Users Group NETwork (LUGNET) - A great place for fans of Lego.
   LUGNET has many topic-specific newsgroups that discuss LDraw and other forms
   of Lego-type CAD.
 
 - The LDraw Parts Tracker  -  http://www.ldraw.org/library/tracker/
   The web-based system for managing the development of new LDraw parts. Here
   you will find unofficial versions of new parts and updates to existing parts.
   As these are unofficial parts, they may be incomplete, or inaccurate, and it 
   is possible that when they are officially released they may be changed in 
   ways that could change any model in which you have used them.   

 - The LDraw Frequently Asked Questions (FAQ):
      http://www.ldraw.org/faq/

--------------------------------------------------------------------------------
* Parts library updates:

 - If you have not already done so, you should visit www.ldraw.org and
   download and install the current complete package of LDraw parts.

 - Periodically, new parts and part fixes are released in small updates,
   available from www.ldraw.org.  These updates should be downloaded and
   installed as they become available. Please remember that OLD updates
   should not be installed over NEW or NEWER updates.  Doing so might
   overwrite a fixed version of a part with an older version.

LDraw Update 2010-02
--end of file--   
