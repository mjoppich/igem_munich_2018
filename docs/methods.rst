.. _methods:

********************
How does Sequ-Into work?
********************

*sequ-into* has the aim of bringing the sequencing data analysis and the laboratory protocol optimization in close proximity. 

While highly specialized tools and pipelines for third generation sequencing data analysis are available, they often are not handy nor convenient to use as a first assessment right after or during the sequencing run.

As a possible solution we brought together a straightforward intuitive interface built with `Electron <https://electronjs.org>`_ and `React <https://reactjs.org>`_, that gives the user easy access to the state-of-the-art long read alignment tool `GraphMap <https://www.nature.com/articles/ncomms11307>`_ which itself is highly specialized for nanopore sequencing. 

To make this possible we run a python script in the background that relies on `HTSeq <https://htseq.readthedocs.io/en/release_0.10.0/>`_ as infrastructure for high-throughput data and `pysam <https://pysam.readthedocs.io/en/latest/>`_ to handle the genomic data sets.


====
What does sequ-into do?
====

In order to be able to draw conclusions of the sequencing quality in general and the composition of the data - in terms of contaminations versus the true sequencing traget - the reads are mapped to references. The reference being either a possible contamination, leaving your desired reads unaligned, or your target sequence, meaning your designated reads are the ones that did align.
The distribution of read length from the original files and the results of these alignments are then elucidated in a statistical overview and employed to separate those reads you aimed for from those that were sequenced involuntary.

.. image:: ./images/workflow_overview.png
   :scale: 30












====
How does sequ-into achieve this?
====


App Interaction
====
@Markus! :o ???
To allow for a python script to run in a typescript environment it was necessary to synchronize?

home.tsx -> 1143



Sequencing Files
====
Depending on your routine, the sequencing files already contain the sequence of the single reads (FastQ) or the base calling is still needed to be done (FastQ).
*sequ-into* can handle either one thanks to an script that handles the bascalling. 
@Markus


.py :

Dir vs file
-> 74

As soon as the sequences of the reads are obtained 
The sequencing files are examined in two ways. For a start we look at 
-> 89


Calling GraphMap
====
-> 114



Analyzing results of GraphMap
====
sam -> 128


Extract Files
====
-> 216


