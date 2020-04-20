#
# Build: docker build -t apt-cacher .
# Run: docker run -d -p 3142:3142 --name apt-cacher-run apt-cacher
#
# and then you can run containers with:
#   docker run -t -i --rm -e http_proxy http://dockerhost:3142/ debian bash
#
# Here, `dockerhost` is the IP address or FQDN of a host running the Docker daemon
# which acts as an APT proxy server.
FROM ubuntu

RUN apt-get update && \
        apt-get install -y libasound2 libx11-xcb1 libgtk-3-0 libnss3 git curl gnupg build-essential python3 python3-pip hdf5-tools libhdf5-serial-dev && \
        apt-get clean

RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
RUN apt-get -y install nodejs

RUN pip3 install mappy matplotlib h5py flask pandas upsetplot

RUN groupadd --gid 1000 user && \
        useradd --uid 1000 --gid 1000 --create-home user

WORKDIR /App
RUN /bin/bash -c "chmod -R 775 /App"
RUN git clone https://github.com/mjoppich/sequ-into /App
RUN npm install && npm run package-linux

RUN /bin/bash -c "chmod -R 775 /App/release"

CMD /bin/bash -c "/App/release/sequ-into-1.3.0.AppImage --appimage-extract-and-run"
#./sequ-into-1.3.0.AppImage --appimage-extract-and-run