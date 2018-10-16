set /p WSL_PASSWORD="Enter WSL Password: "

bash -i -c "echo %WSL_PASSWORD% | sudo -S apt-get update"
bash -i -c "echo %WSL_PASSWORD% | sudo -S apt-get install git build-essential python3 python3-pip libhdf5-serial-dev"
bash -i -c "echo %WSL_PASSWORD% | sudo -S pip3 install pysam HTseq matplotlib h5py"

bash -i -c "mkdir --parents ~/progs/ && cd ~/progs/ && git clone https://github.com/isovic/graphmap.git"
bash -i -c "cd ~/progs/graphmap/ && make modules && make"
bash -i -c "echo '\export PATH=~/progs/graphmap/bin/Linux-x64/graphmap:\$PATH' >> ~/.bashrc'"

exit