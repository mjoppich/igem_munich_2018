set /p WSL_PASSWORD="Enter WSL Password: "

bash -i -c "echo %WSL_PASSWORD% | sudo -S apt-get update"
bash -i -c "echo %WSL_PASSWORD% | sudo -S apt-get -y install git build-essential python3 python3-pip hdf5-tools libhdf5-serial-dev"
bash -i -c "echo %WSL_PASSWORD% | sudo -S pip3 install mmappy matplotlib h5py flask pandas upsetplot"

exit