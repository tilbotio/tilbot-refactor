FROM node:latest

RUN npm install --global yarn

ENV YARN_VERSION=4.13.0
RUN yarn policies set-version $YARN_VERSION

USER root
WORKDIR /home/node

CMD ["bash"]
