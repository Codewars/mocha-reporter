#!/bin/bash
# ./gen-fixture.sh tests/fixtures/example.js
# ./gen-fixture.sh tests/fixtures/example.js expected
# ./gen-fixture.sh tests/fixtures/example.js sample

./node_modules/.bin/mocha --reporter lib/codewars-reporter $1 > "${1%.js}.${2:-expected}.txt"
