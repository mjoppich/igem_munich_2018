set /p WSL_PASSWORD="Enter WSL Password: "

bash -i -c "echo %WSL_PASSWORD% | sudo -S apt-get update"
bash -i -c "echo %WSL_PASSWORD% | sudo -S apt-get install git build-essential python3 python3-pip libhdf5-serial-dev"
bash -i -c "echo %WSL_PASSWORD% | sudo -S pip3 install mappy matplotlib h5py"

exit