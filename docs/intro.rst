
.. _intro:

********************
sequ-into - A straightforward desktop app for third generation sequencing
read analysis
********************

====
sequ-into
====

A straightforward desktop app for third generation sequencing read analysis
====

Third generation sequencing techniques rapidly evolved as a common practice in molecular biology. Great advances have been made in terms of feasibility, cost, throughput, and read-length. However, sample contamination still poses a big issue: it complicates correct, high-quality downstream analysis of sequencing data and usage in medical applications. 

To address these issues we developed a cross-platform desktop application: *sequ-into*. Reads originating from unwanted sources are detected and summarized by a comprehensive statistical overview, but can also be filtered and exported in standardized FASTQ-format to facilitate custom evaluation of experimental findings. 
Additionally, it might be unclear whether a sequencing experiment produced reads of the intended target. The filtering we implemented also allows for a positive selection of those reads who do.

*sequ-into* creates a straightforward user experience by fusing an intuitive graphical-user-interface with state-of-the-art long-read alignment software.

The app was implemented in the context of our *iGEM project Phactory*, where several DNA purification protocols were evaluated with *sequ-into* and thus allowed iterative engineering cycles leading to a so far unreached DNA purification of up to 96% (bases sequenced) in our probes. To learn more about Phactory, please follow this link: http://2018.igem.org/Team:Munich


Why is sequ-into an notable addition to your third generation sequencing routine?
====
*“… our run times aren’t fixed, unlike the other systems. Some people even have what they are looking for after a few minutes in real time, with success criteria not being based on total yield and an en-run analysis.”* **- Clive G. Brown, CTO of Oxford Nanopore**

This raises a simple question: How do you check if you have what we are looking for in a quick and easy manner?

The question could also be rephrased to: Is our sequencing run contaminated?
In contrast to Illumina sequencing, in long read third generation sequencing (e.g PacBio or minION), there is always the possibility to abort a sequencing procedure, redo the library preparation and continue using the same chip. Especially when sequencing prokaryotic(-like) material, huge contaminations of the sample are possible. These could either be human DNA/RNA from the library prep, ribosomal RNA due to rRNA depletion not working, or even contamination from other organisms (host organism for phages, etc.). 

Thus the earlier such contaminations are detected, the better the sequencing chip can be conserved for future use. Therfore we implemented *sequ-into*.

Especially since the library preparation and the sequencing are often in the hands of trained life scientists, while the down-stream analysis on the other hand is performed by trained computer scientists, there is often a gap in the workflow. *sequ-into* aims to close that gap as a convenient cross-platform tool, fusing an intuitive graphical-user-interface with state-of-the-art long-read alignment software.



What can sequ-into help you with and what not?
====
*sequ-into* is not an application for a thorough interpretive analysis of your sequencing data.

It can, however, be a very helpful addition to your sequencing lab routine. As it is easy to install and to use without much prior knowledge necessary, it is ideal for the very first assessment of your sequencing files.

In particular it allows you to quickly tell whether your sequenced reads represent your intended target or if your reads in fact stem from an unwanted source. Thus allowing for a fast reaction during long sequencing experiments and early alterations in your protocol in the laboratory prior to sequencing.

Later on, you might want to further investigate your sequencing data. Here, the extraction function of *sequ-into* offers the possibility to save reads of a wanted source or unwanted sources separately. Even the filtering by many possible contaminations at once is possible. *GraphMap*, the tool we employed for aligning reads to references, is highly sensitive and specialized for the utilization with third generation sequencing techniques.
