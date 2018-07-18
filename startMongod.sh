#!/bin/bash

if [ $1 == "repair" ]; then
    mongod --bind_ip=$IP --dbpath=data --nojournal --rest "$@" --repair
else
    mongod --bind_ip=$IP --dbpath=data --nojournal --rest "$@"
    if [ $? != 0 ]; then
        mongod --bind_ip=$IP --dbpath=data --nojournal --rest "$@" --repair
        mongod --bind_ip=$IP --dbpath=data --nojournal --rest "$@"
    fi
fi