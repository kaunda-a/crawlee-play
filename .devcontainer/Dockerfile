FROM mcr.microsoft.com/playwright:v1.41.0-focal

# Install noVNC for modern WebSocket support
RUN apt-get update && apt-get install -y \
    x11vnc \
    xvfb \
    fluxbox \
    novnc

# Set up display and VNC
ENV DISPLAY=:99

# Configure x11vnc with modern WebSocket support
RUN echo "x11vnc -display :99 -forever -shared -rfbport 5900 -ws 6080" > /start-vnc.sh && \
    chmod +x /start-vnc.sh

WORKDIR /workspaces/crawlee-play
