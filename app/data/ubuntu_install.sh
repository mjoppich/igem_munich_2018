echo "Enter WSL Password: "
read WSL_PASSWORD

echo $WSL_PASSWORD | sudo -S apt-get update
echo $WSL_PASSWORD | sudo -S apt-get -y install git build-essential python3 python3-pip hdf5-tools libhdf5-serial-dev
echo $WSL_PASSWORD | sudo -S pip3 install mappy matplotlib h5py

exit