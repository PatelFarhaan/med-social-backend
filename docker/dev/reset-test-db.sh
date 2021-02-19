#!/bin/bash
echo "Initialize and seed the test database"
echo "DROP DATABASE IF EXISTS COLUMN_TEST; CREATE DATABASE COLUMN_TEST;" | psql --host=db --port=5432 --username=postgres
export PGDATABASE=column_test
/go/bin/rambler --debug --configuration /container/config/rambler.json --environment dockertest apply --all
cd /container && NODE_ENV=test node src/db/seeders/index.js
