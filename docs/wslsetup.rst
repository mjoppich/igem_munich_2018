.. _wslsetupguide:


********************
How to setup Windows Subsystem for Linux
********************

Depending on your Windows version you need to activate Developer Mode first.
How this is done is explained at the end of this page, since this is only required for old versions of Windows 10.

For all recent versions of Windows 10 you can start with step 1.

.. warning:: Some antivirus software (e.g. Kaspersky) disable internet access for unknown/new programs. Make sure you have internet access!

Step 1: Activate WSL feature
-----------------------------

First WSL has to be enabled from Windows features.
Therefore, simply search for the *Turn Windows features on or off* option in the control panel.

.. image:: ./images/wsl/turn_feature_on.PNG
   :scale: 40

Once found, look for the *Windows Subsystem for Linux (Beta)* row and make sure to check the corresponding box.

.. image:: ./images/wsl/select_wsl_feature.PNG
   :scale: 50

This will download and install the desired WSL feature.
Finally apply the change and make sure to reboot your computer

.. image:: ./images/wsl/restart_after_sel.PNG
   :scale: 40

Step 2: Install Linux
---------------------

After having enabled the WSL feature, we can visit the Microsoft Windows Store to download Linux.

In order to do so, we open the Windows Store app, and search for *Linux*. We select the *Run Linux on Windows* menu entry.

.. image:: ./images/wsl/select_from_store.png
   :scale: 40


There are many different flavors (comparable to strains in biology) of linux and some are already offered on the Windows store.
Best compatibility for *sequ-into* has Ubuntu.

*Important*: You should consider using the latest Ubuntu version available. This is Ubuntu 18.04 at the time of writing. You specifically have to search for *Ubuntu 18.04* in the store !

.. image:: ./images/wsl/select_from_store_ubuntu.png
   :scale: 40

Now let the Windows store install your Linux app and once that is done, open your newly installed Linux:

.. image:: ./images/wsl/start_ubuntu.png
   :scale: 50

The black screen will guide you through the install process.
It will first unpack itself and then ask you to create a linux user account.

It is recommended to choose a username and password you can easily remember.
Remembering the password is essential here, as it will be needed for any installation to be performed on *WSL*!

.. image:: ./images/wsl/powershell_setup_user.PNG
   :scale: 30


Step 3: Prepare WSL
-------------------

Before you can use *sequ-into* on *WSL*/Ubuntu please make sure to follow the :ref:`wslpackinstall` instructions.


Step 0: Activate Developer Mode

Since WSL/Bash on Ubuntu on Windows is a developer feature, first the developer mode has to be actived.
Therefore we go into the Settings app and select *Update & Security*.

.. image:: ./images/wsl/dev_mode_1.PNG
   :scale: 30

We further navigate into the *For developers* tab on the left.

.. image:: ./images/wsl/dev_mode_2.PNG
   :scale: 50

In the *For developers* options we switch from *Windows Store apps* to *Developer mode*.

.. image:: ./images/wsl/dev_mode_3.PNG
   :scale: 50


.. warning:: This setup guide is taken from `bioGUI documentation <https://github.com/mjoppich/bioGUI/>`_ from the original author for reasons.
