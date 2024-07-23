# A quick test idea, I'd like to see if we can run ONI in a docker container, would make automating the save collector easier.
# Could always do VMs if its a hard no.
FROM dorowu/ubuntu-desktop-lxde-vnc:bionic

USER root

# Install steamCMD
RUN echo steam steam/question select "I AGREE" | debconf-set-selections && \
    echo steam steam/license note '' | debconf-set-selections && \
    dpkg --add-architecture i386 && \
    apt-get -q -y update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -q -y --no-install-recommends \
      lib32gcc1 steamcmd ca-certificates gosu && \
    ln -sf /usr/games/steamcmd /usr/bin/steamcmd && \
    DEBIAN_FRONTEND=noninteractive apt-get autoremove -q -y
    
# Install nvidia drivers and mesa, might need tweaking based on GPU 
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    libgl1-mesa-glx \
    libgl1-mesa-dri \
    libglu1-mesa 
    # libnvidia-gl-510 \
    # libnvidia-gl-510:i386 \
    # libnvidia-gl-510-dev

# RUN sudo apt-get install -y freeglut3-dev mesa-common-dev

# Install VirtualGL
RUN wget https://sourceforge.net/projects/virtualgl/files/2.6.5/virtualgl_2.6.5_amd64.deb && \
    dpkg -i virtualgl_2.6.5_amd64.deb && \
    rm virtualgl_2.6.5_amd64.deb

# Install TurboVNC
RUN wget https://sourceforge.net/projects/turbovnc/files/2.2.6/turbovnc_2.2.6_amd64.deb && \
    dpkg -i turbovnc_2.2.6_amd64.deb && \
    rm turbovnc_2.2.6_amd64.deb

# RUN mkdir /oni
WORKDIR /oni

COPY docker.sh /docker.sh

ENTRYPOINT [ "/docker.sh" ]

# docker run --rm -it --gpus all -p 6080:80 -p 5900:5900 -e STEAM_USERNAME=anonymous -e STEAM_PASSWORD= . -v "./oni:/root/.config/unity3d/Klei/Oxygen Not Included" -v "./steam:/root/.steam" oni /bin/bash 