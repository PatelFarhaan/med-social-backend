# Gives us Node, Yarn, Linux
FROM column/base

ENV NODE_ENV production

# Install app dependencies
COPY package.json /api/package.json
COPY yarn.lock /api/yarn.lock
COPY . /api
# Set work directory to /api
WORKDIR /api

RUN cd /api
RUN yarn add bcrypt
RUN yarn install --build-from-resource

RUN cd /api; npm rebuild bcrypt --build-from-source

RUN ["chmod", "+x", "./entrypoint.sh"]
# set your port
ENV PORT 3005

# expose the port to outside world
EXPOSE 3005

# start command as per package.json
CMD ["./entrypoint.sh"]
