FROM node:latest

USER root
WORKDIR /home/node
CMD ["bash"]

COPY altuid /altuid

# Start a session using the same uid as the owner of /home/node
# run command specified with "docker run" and fall back to bash.
ENTRYPOINT ["/altuid", "node"]
