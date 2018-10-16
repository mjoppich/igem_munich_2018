.. _installguide:

**********************
Installation
**********************

====
Mac OS
====

To be able to install sequ-into on your Mac OS system, first make sure you have all support packages.

====
Support Package Installation:
====

1. **Anaconda**

* Download the installation package here: https://repo.anaconda.com/archive/Anaconda3-5.3.0-MacOSX-x86_64.pkg
* Open your terminal window (for example by typing "terminal" in the spotlight search field) and enter the following: ``bash ~/Downloads/Anaconda3-5.3.0-MacOSX-x86_64.sh``
* The installer prompts “In order to continue the installation process, please review the license agreement.” Click ``Enter`` to view license terms.
* Scroll to the bottom of the license terms and enter ``yes`` to agree to them.
* The installer prompts you to press ``Enter`` to confirm the location. It may take a few minutes to complete.  We recommend you accept the default install location and press ``Enter``.
* The installer prompts “Do you wish the installer to prepend the Anaconda install location to PATH in your /home/<user>/.bash_profile ?” We recommend ``yes``.
* The installer finishes and displays “Thank you for installing Anaconda!”
* The installer describes Microsoft VS Code and asks if you would like to install VS Code. Enter ``yes`` or ``no``. You don't need Microsoft VS Code to use sequ-into!

If you have any trubles installing Anaconda you can review this site for more details and a visual installer here: http://docs.anaconda.com/anaconda/install/mac-os/#macos-graphical-install

2. **Bioconda**

Enter this in your terminal: 

* ``conda config --add channels defaults``
* ``conda config --add channels bioconda``
* ``conda config --add channels conda-forge``

3. **GraphMap**

Enter this in your terminal: 

* ``conda install graphmap``

4. **h5py**

Enter this in your terminal: 

* ``conda install -c anaconda h5py``

5. **pysam**

Enter this in your terminal: 

* ``conda config --add channels r``
* ``conda install pysam``

6. **HTseq**

Enter this in your terminal: 

* ``conda install htseq``

7. **matplotlib**

To install this package with conda run one of the following:

* ``conda install -c conda-forge matplotlib``
* ``conda install -c conda-forge/label/broken matplotlib``
* ``conda install -c conda-forge/label/testing matplotlib``
* ``conda install -c conda-forge/label/rc matplotlib``

====
Sequ-into Package Installation:
====

...
Goto UG


====
Linux
====
...
Goto UG



====
Windows
====

wsl 
====
...

Package Installation
====
idk



here is a test link :ref:`wslsetupguide`

