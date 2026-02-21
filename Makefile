.PHONY: install run test clean docker-build docker-run lint

install:
	yarn install

run:
	yarn dev

test:
	yarn test

lint:
	yarn lint

clean:
	rm -rf node_modules coverage dist logs

docker-build:
	docker build -t column/base -f Dockerfile.base . && \
	docker-compose build

docker-run:
	docker-compose up
