# sequ-into - A straightforward desktop app for third generation sequencing read contamination analysis

[![Build Status](https://travis-ci.org/mjoppich/igem_munich_2018.svg?branch=master)](https://travis-ci.org/mjoppich/igem_munich_2018)
[![Documentation Status](https://readthedocs.org/projects/sequ-into/badge/?version=latest)](https://sequ-into.readthedocs.io/en/latest/?badge=latest)
[![DOI](https://zenodo.org/badge/148335824.svg)](https://zenodo.org/badge/latestdoi/148335824)
![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/ffad1b8d8c74ed402a38/maintainability)](https://codeclimate.com/github/mjoppich/igem_munich_2018/maintainability)

## Download

Releases are available in the [Release](https://github.com/mjoppich/sequ-into/releases) section of this repository.

### Installation

After downloading the release from above, follow the [installation instruction](https://sequ-into.readthedocs.io/en/latest/install.html) for your operating system.


## sequ-into

### Description
Third generation sequencing techniques rapidly evolved as a common practice in molecular biology. Great advances have been made in terms of feasibility, cost, throughput, and read-length. However, sample contamination still poses a big issue: it complicates correct, high-quality downstream analysis of sequencing data and usage in medical applications. Furthermore, it might be unclear weather the sequenced reads represent the intended target. To address these issues we developed a cross-platform desktop application: Sequ-Into. Reads originating from unwanted sources are detected and summarized by a comprehensive statistical overview, but can also be filtered and exported in standardized FASTQ-format to facilitate custom evaluation of experimental findings. This holds also true for an evaluation weather the reads consist of the intended source, and allows for a positive selection of those reads who do. Sequ-Into creates a straightforward user experience by fusing an intuitive graphical-user-interface with state-of-the-art long-read alignment software.

The app was implemented in the context of our iGEM project, where several DNA purification protocols were evaluated with Sequ-Into and thus allowed iterative engineering cycles leading to a so far unreached purification of up to 96% (bases sequenced) in our probes. To read more about Phactory, please follow this link: http://2018.igem.org/Team:Munich



### Features
- investigate FASTQ or FAST5 format files
- start calculations for several experiments in parallel
- examine single files or many files at once
- map your read files to default E.Coli K12 genome
- map your read files to your own references and save them in the app for future use
- map your read files against DNA as well as against RNA references
- get an statistical overview on the results that is also visualized
- save only those extracted reads you need for your further analysis (reads that either aligned, or didn't align to the chosen reference)
- you may also use the `app/data/ContamTool.py` script from command-line

#### Employed Software and Modules
- [Mappy](https://pypi.org/project/mappy/) / [minimap2](https://github.com/lh3/minimap2)
- Electron
- Material-UI

### Acknowledgement
The app framework is based on:
irath96: Electron Biolerplate
https://github.com/irath96/electron-react-typescript-boilerplate

We would like to thank the iGEM Munich 2018 team and especially our supervisors for the hard work, support and the possibility to work with novel sequencing data.


## Maintainers

- [Rita](https://github.com/RitaOlenchuk)
- [Julia](https://github.com/wiesoauch)
- [Markus](https://github.com/mjoppich)



## License
MIT © [Rita, Julia, Markus](https://github.com/mjoppich/igem_munich_2018)
