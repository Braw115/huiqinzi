#!/bin/sh

PG_DIR=data/postgres/data
if [ ! -d $PG_DIR ]; then
    echo "missing $PG_DIR"
    exit 1
fi

