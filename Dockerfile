FROM node:26.7.0-slim

RUN npm install --global yarn

ENV YARN_VERSION=4.18.0
RUN yarn policies set-version $YARN_VERSION

USER root
WORKDIR /home/node

CMD ["bash"]
