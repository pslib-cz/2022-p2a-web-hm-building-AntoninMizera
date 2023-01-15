#!/bin/bash
SCRIPT_DIR="$(dirname "$(realpath "$(echo $BASH_SOURCE)")")"

deno run --allow-read=$SCRIPT_DIR/.. --allow-net=validator.w3.org $SCRIPT_DIR/validate.ts