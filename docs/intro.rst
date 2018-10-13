
.. _intro:

********************
sequ-into - A straightforward desktop app for third generation sequencing
read analysis
********************

====
sequ-into - A straightforward desktop app for third generation sequencing read analysis
====

Third generation sequencing techniques rapidly evolved as a common practice in
molecular biology. Great advances have been made in terms of feasibility, cost,
throughput, and read-length. However, sample contamination still poses a big
issue: it complicates correct, high-quality downstream analysis of sequencing
data and usage in medical applications. Furthermore, it might be unclear weather
the sequenced reads represent the intended target.

To address these issues we
developed a cross-platform desktop application: *sequ-into*. Reads originating
from unwanted sources are detected and summarized by a comprehensive statistical
overview, but can also be filtered and exported in standardized FASTQ-format to
facilitate custom evaluation of experimental findings. This holds also true for
an evaluation weather the reads consist of the intended source, and allows for
a positive selection of those reads who do.

*sequ-into* creates a straightforward
user experience by fusing an intuitive graphical-user-interface with
state-of-the-art long-read alignment software.

The app was implemented in the context of our iGEM project, where several DNA
purification protocols were evaluated with *sequ-into* and thus allowed iterative
engineering cycles leading to a so far unreached DNA purification of up to 96%
(bases sequenced) in our probes. To learn more about Phactory, please follow this
link: http://2018.igem.org/Team:Munich


What can sequ-into help you with and what not?
====
*sequ-into* is not an application for a thorough interpretive analysis of your
sequencing data.

It can, however, be a very helpful addition to your sequencing lab routine. As it is
easy to install and to use without much prior knowledge necessary, it is ideal for
the very first assessment of your sequencing files.

In particular it allows you to quickly tell weather your sequenced reads represent
what you aimed for to sequence or if and how many of your reads in fact
stem from an unwanted source.
Thus allowing for a fast reaction during long sequencing experiments and early
alterations in your protocol in the laboratory prior to sequencing.

Later on, you might want to further investigate your sequencing data. Here, the
extraction function of *sequ-into* offers the possibility to save reads of a wanted
source or unwanted sources separately. Even the filtering of many possible
contaminations at once is possible. All this while GrapMap, the tool we employed
for this in the background, is highly sensitive and specialized for the utilization
with third generation sequencing techniques.
