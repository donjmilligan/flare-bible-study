#!/bin/bash 
#bin
grep "name" flareExports.csv | cut -d, -f$ 1

while IFS=, read col1 col2
do
    echo "I got:$col1|$col2"
done < flareImports.csv