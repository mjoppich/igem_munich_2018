.. _userguide:

********************
User Guide
********************

How to get sequ-into?
====
You can use *sequ-into* on a Mac OS, Linux as well as on a Windows System. Please follow the respective instructions in our installation guide.
:ref:`installguide`



Get started
====


Step 1: Read files
-------
FastQ as well as Fast5 are suitable formats for evaluating your sequencing data with *sequ-into*.

In the first step you can choose which files you would like to seek into. Each chosen file or folder will be handled separately. This is also true if you upload them twice. 

If you wish to examine certain reads together, e.g. because they stem from the same experiment, make sure to save them in a folder and upload that folder via *Choose Directory*. In order to analyze a single file, upload it via *Choose File*.

As soon as you have chosen your files an output directory will be generated. You will find a temp folder where your read files reside. You can change that output directory and folder name at the bottom of the page if you click on the textfield.

After that, click *Next* to proceed.

.. image:: ./images/1.png
   :scale: 20



Step 2: Reference files
-------
To check what your sequencing files truly consist of you need a reference against which the reads will be mapped. 

That reference might be a possible contamination, such as E. Coli, or a targeted known genome of what you intended to sequence. Of course you can also use shorter sequences instead of a whole genome as a reference. For details on possible technical limitations, please see https://github.com/isovic/graphmap and https://www.nature.com/articles/ncomms11307.

Mapping is possible against RNA as well as against DNA sequences, as long as they are in the FastA Format. You can find sequences for example on NCBI https://www.ncbi.nlm.nih.gov/genome/?term=.

Click on *Choose Reference* to choose your reference files. You can selected as many files as you wish. These files will still be present after you used *Reset*, but are deleted when you close the application.

If you work with certain references repeatedly they can also be saved in the app so that they are available every time even after you closed *sequ-into*. For this, choose the reference via *Save Contaminants*. Your own references can always be deleted from *sequ-into* later on, just click the trash can to do so.

**Keep in mind that calculation time increases with file size and file quantity!** Consider using the switches behind each reference to turn them off if you don't need them for your current run. They will still be available after you used *Reset*.

After that, click *Start* to run the calculations.

.. image:: ./images/2.png
   :scale: 20



Step 3: Results
-------



The Results consist of two parts:a statistical overview on how your reads mapped to the reference(s) and the
possibility to extract and save only those filtered reads you need for your downstream analysis.
saved ->


**Statistical Overview**
.. image:: ./images/3.png
   :scale: 40



**Saving of filtered files**
.. image:: ./images/4.png
    :scale: 40
