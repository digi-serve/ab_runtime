#!/bin/bash

# Import ENV variables
set -o allexport
source ../../../.env
set +o allexport

k6 run testBudgets.js
