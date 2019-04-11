[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=W8RKPHPUF398G)

Flare: mysql, sqlite, xml, csv, json.
===============

Here you will find an app created for presentations or for personal bible study.

Currently it uses only public domain translations: 
- American Standard-ASV1901 (ASV)
- Bible in Basic English (BBE)
- Darby English Bible (DARBY)
- King James Version (KJV)
- Webster's Bible (WBT)
- World English Bible (WEB)
- Young's Literal Translation (YLT)

Flare is developed with: **JavaScript, jQuery, JSON, AJAX, HTML5, CSS3, PHP,** and **MySQL**.
- 

You Will Need:
-------------------

1. Web Server (I'm runing Apache2 with a localhost setup in Linux for production, and at http://flare.hispattern.com for official changes)
2. MySQL (I'm running mysqlnd 5.0.12-dev)
3. PHP7 (I'm running PHP 7.2)

**bible_database sql files**
you will need to import the **t_\*** sql files from https://github.com/scrollmapper/bible_databases/tree/master/sql into the database you create for the project. Please let me know if you feel these sql files should be located in the project. 




Technical Summary:
-------------------

- **index.html** (HTML) is the latest chart being developed, the data is only demo data and not fully fledged out.
- **Jesus-in-the-old-testament.html** (HTML) this uses the hierarchical edge bundling chart (hierarchical many to many relationships) which is great for subject mapping and for presentations.
- **/assets/css/** (CSS) 
- - Flare specific and Stisla dashboard css modifications can be found in flare.css
- - The bootstrap dashboard css layout is from the <a href="https://github.com/stisla/stisla">Stisla</a> project. . 
- **/assets/js/** (JAVASCRIPT)
- - **flare.js** contains a vastly modified D3 v4 chart originally used in the <a href="https://github.com/stisla/stisla">Bibviz</a> repository 
**flare-biblestudy.js** are for different d3.js charts and function differently. They are called from their respective pages. 
- - **functions.js** contains:
- - - Functions modified from https://github.com/stisla/stisla/blob/master/assets/js/scripts.js. 
- - - At the bottom of the page there is DOM ready (on load) code etc that the html pages share. 
- **/assets/json/** (JSON)
- - **kjv.json** contains bible stats based on data from the King James translation.
- - **para.json** contains *demo data* used for cross references in index.html. This is the one you can modify for your own cross reference threads. 
- - **flare-OldTestamentJesus1.json** contains demo data for cross references and subject mapping in . They are called from their respective pages. 
- - **functions.js** contains:
- - - Functions modified from https://github.com/stisla/stisla/blob/master/assets/js/scripts.js. 
- - - At the bottom of the page there is DOM ready (on load) code etc that the html pages share. 


Major Todo's:
-------------------
- Create a JSON editing and creation page
- - Possibly this one can be switched on, on the fly. 
- Convert the project using Vue Native for mobile
- Get out of the demo stage for JSON data - I've created the datat in para.json and flare-OldTestamentJesus1.json on my own.

Sources:
-------------------
Flare is based features from these projects:
- (Charts) D3.js version 3 and 4 https://github.com/d3/d3
- - A D3.js v3 Hierarchical Edge Bundling chart (JavaScript) from https://observablehq.com/@d3/hierarchical-edge-bundling 
- - A D3.js v4 Arc chart at https://github.com/danielgtaylor/bibviz/blob/master/web/contents/scripts/main.js 
- - - Other resources: https://observablehq.com/@d3/arc-diagram and https://www.d3-graph-gallery.com/arc
- (REGEX) jQuery Biblify a very robust way to find verses on a page, plus AJAX for their modification  https://github.com/nathankitchen/jquery.biblify
- (Scriptures) PHP and MySQL from my fork of scrollmapper/bible_databases https://github.com/donaldmilligan/bible_databases
- (SQL Databases) The original SQL bible databases, also available in my fork of scrollmapper/bible_databases https://github.com/donaldmilligan/bible_databases/tree/master/sql
- (Dashboard Styles) The Stisla dashboard theme at https://github.com/stisla/stisla


LICENSE:
-------------------
Flare is under the [MIT License](LICENSE)
