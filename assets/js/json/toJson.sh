#!/bin/bash 
#bin
flarraytitle < $(cut -d, -f 2 flareExports.csv);
readarray $flarraytitle;
printf '%s\n' "${flarraytitle[0]}";

