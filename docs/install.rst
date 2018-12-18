.. _installguide:

**********************
Installation
**********************

All pre-built binary releases can be found at `GitHub <https://github.com/mjoppich/igem_munich_2018/releases>`_ .

====
Mac OS
====

To be able to install sequ-into on your Mac OS system, first make sure you have all support packages. **It is important to add them in this order.**

Support Package Installation:
====

1. **Anaconda**

* Download the installation package here: https://repo.angaconda.com/archive/Anaconda3-5.3.0-MacOSX-x86_64.pkg
* Open your terminal window (for example by typing "terminal" in the spotlight search field)
and enter the following:
::
    bash ~/Downloads/Anaconda3-5.3.0-MacOSX-x86_64.sh

* The installer prompts “In order to continue the installation process, please review the license agreement.” Click ``Enter`` to view license terms.
* Scroll to the bottom of the license terms and enter ``yes`` to agree to them.
* The installer prompts you to press ``Enter`` to confirm the location. It may take a few minutes to complete.  We recommend you accept the default install location and press ``Enter``.
* The installer prompts “Do you wish the installer to prepend the Anaconda install location to PATH in your /home/<user>/.bash_profile ?” We recommend ``yes``.
* The installer finishes and displays “Thank you for installing Anaconda!”
* The installer describes Microsoft VS Code and asks if you would like to install VS Code. Enter ``yes`` or ``no``. You don't need Microsoft VS Code to use sequ-into!

If you have any trubles installing Anaconda you can review this site for more details and a visual installer: http://docs.anaconda.com/anaconda/install/mac-os/#macos-graphical-install

2. **Bioconda**

Enter this in your terminal: 
::
    conda config --add channels defaults
    conda config --add channels bioconda
    conda config --add channels conda-forge

3. **Minimap2** 

For aligning the reads to the reference:
::
     conda install -c bioconda mappy 

4. **h5py**

For reading FAST5 files (they are essentially HDF5-format):
::
    conda install -c anaconda h5py


5. **matplotlib**
For plotting purposes.
To install this package with conda run **one** of the following:
::
    conda install -c conda-forge matplotlib
    conda install -c conda-forge/label/broken matplotlib
    conda install -c conda-forge/label/testing matplotlib
    conda install -c conda-forge/label/rc matplotlib

Install sequ-into
====

In order to install sequ-into, go to the `sequ-into repository <https://github.com/mjoppich/igem_munich_2018>`_  and download the Mac OS release.

A DMG image will be downloaded. Open the image and drag the sequ-into app into your applications folder.

.. image:: ./images/mac/dmg_drag.png
   :scale: 40

You are now ready to use sequ-into.


====
Windows
====

Since Microsoft Windows is the only not POSIX based operating system supported by sequ-into, a little more action must be taken.

If you have not yet installed Windows Subsystem for Linux (also known as WSL/Bash on Ubuntu/Ubuntu/...) please do so.
We have prepared a guide on how to do so in the chapter  :ref:`wslsetupguide` .

Installing Packages into WSL 
====

After you have installed WSL, we must install some dependencies that are needed by our application.
Please note, the following guide is aimed at having an Ubuntu installed. However, if you have installed a different distribution, we are sure you know what you are doing and hence, you don't need detailed help ;) .


.. _wslpackinstall:

Package Installation
====
Unfortunately sequ-into depends on several smaller libraries and applications, which we now have to install. You may do so manually (below) or use a `script <https://gist.github.com/mjoppich/d1f5caf69bdb940f90f79b1a97f024b9>`_ we prepared for this task.
:: 
    sudo apt-get update
    sudo apt-get install git build-essential python3 python3-pip libhdf5-serial-dev
    sudo pip3 install pysam HTseq matplotlib h5py mappy

You will be asked to enter your *WSL* password when you submit your first *sudo* command. However, since *sudo* will give you administrator right in *WSL*, it might also be that it asks for your password everytime.

We have also created a *cmd* script which you can simply execute by double-clicking on the downloaded file `after downloading it <https://gist.github.com/mjoppich/d1f5caf69bdb940f90f79b1a97f024b9>`_. This script asks you for your *WSL* password and will execute the above steps automatically.

The following will explain the packages and software going to be installed. Since you provided your *sudo*-password, you should get to know what we are doing ;) If you are not interested: congratulations, you're done!

First a basic developer package has to be installed, which is done by installing *git* for version control/access to repositories, *build-essential* to get C/C++ compilers (to build other software) and python3 for generating reads from fast5 files and making the statistics.
*python3-pip* is the python package manager which we need to install some python packages, and finally libhdf5 is needed to access fast5 files. For alignment of the reads we rely on `mappy/minimap2 <https://pypi.org/project/mappy/>`_ .

After you have completed these steps, you are ready to use sequ-into!


Executable
====

We have built sequ-into as a portable app. You thus only need to place the downloaded executable at any location and can start using it!

====
Linux/Source
====

We are not providing a binary download for Linux, since we assume that you are familiar with the command line, if your computer runs Linux.
In explanation on why a software is needed can be found above at :ref:`_wslpackinstall` .

First you must clone the `sequ-into repository <https://github.com/mjoppich/igem_munich_2018>`_ , install with npm and finally build our tool.
::
    git clone https://github.com/mjoppich/igem_munich_2018.git
    cd igem_munich_2018
    npm install

    npm run build
    npm package-linux

You will find the sequ-into application in igem_munich_2018/release/ .

In order to have all python scripts running, please install the following dependencies. You may leave *python3-pip* out if you are using your own pip or anaconda.
::
    sudo apt-get update
    sudo apt-get install git build-essential python3 python3-pip libhdf5-serial-dev
    sudo pip3 install pysam HTseq matplotlib h5py mappy
