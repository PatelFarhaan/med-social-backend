# Gives us Node, Yarn, Linux
FROM column/base

ENV NODE_ENV development

# Install app dependencies
# Only copy in files needed by `yarn install` so that changes in other sources
# (the more common case) do not invalidate the docker cache. The `yarn install`
# is the slowest part of building the image.
RUN addgroup -S container && adduser -S -G container container
USER root
RUN mkdir /container && chown container /container/
COPY --chown=container package.json /container/
COPY --chown=container yarn.lock /container/
WORKDIR /container
# RUN yarn add bcrypt
RUN yarn install --build-from-resource

# Set work directory to /container
USER container
WORKDIR /container

# Copy in remaining files
COPY --chown=container . /container/

USER root
WORKDIR /container
# RUN npm rebuild bcrypt --build-from-source
# RUN chown -R container:container /container/

#
# Run the app
#

USER container

# set your port
ENV PORT 3005

# Scripts for Postgres setup
RUN chmod +x /container/docker/wait-for-postgres.sh
RUN chmod +x /container/docker/dev/entrypoint.sh

ENTRYPOINT ["/bin/bash", "-x", "/container/docker/wait-for-postgres.sh", "postgres", "db", "5432", "/container/docker/dev/entrypoint.sh"]
