#!/bin/sh

echo "Enter MAC OS sudo password: "
read MAC_PASSWORD

echo $MAC_PASSWORD | sudo -S pip3 install mappy matplotlib h5py flask pandas upsetplot

exit