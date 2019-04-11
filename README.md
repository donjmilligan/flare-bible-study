[![Donate](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/hispattern)

Flare Bible Subject Mapping -
===============
<h2>An App for Presentation and Personal Bible Study</h2>

Here you will find an app that can map cross references and subjects at the same time, in a couple of ways. You will need to create your own additional data maps using the respective JSON files.

Currently flare uses only public domain bible translations: 
- American Standard-ASV1901 (ASV)
- Bible in Basic English (BBE)
- Darby English Bible (DARBY)
- King James Version (KJV)
- Webster's Bible (WBT)
- World English Bible (WEB)
- Young's Literal Translation (YLT)

Todo's:
-------------------
- Create a JSON editing and creation page
- - Possibly this one can be switched on, on the fly. 
- Get out of the demo stage for JSON data - I've created the datat in para.json and flare-OldTestamentJesus1.json on my own.
- Convert the project using Vue Native for mobile
- - Convert to using JSON or SQLite databases for use in Android



You Will Need
-------------------
**JavaScript, jQuery, JSON, AJAX, HTML5, CSS3, PHP,** and **MySQL** programming skills for modification.
1. WAMP or LAMP (I'm runing Apache2 with a localhost setup in Linux for development)
2. MySQL (I'm running mysqlnd 5.0.12-dev)
3. PHP7 (I'm running PHP 7.2)
4. All of the sql files (for import) beginning with **t_** at https://github.com/scrollmapper/bible_databases/tree/master/sql

Technical Summary:
-------------------

- **index.html** (HTML) is the latest chart being developed, the data is only demo data and not fully fledged out.
- **Jesus-in-the-old-testament.html** (HTML) this uses the hierarchical edge bundling chart (hierarchical many to many relationships) which is great for subject mapping and for presentations. A copy of this page can host different chart data by modifying the JSON file name near the end of the document.
- **/assets/css/** (CSS) 
- - **flare.css** contains:
- - - Flare specific CSS for both HTML pages
- - - Dashboard style mods (near the end of the document)
- - **style.css** contains dashboard specific CSS.
- - **components.css** contains dashboard specific CSS
- **/assets/js/** (JavaScript)
- - **flare.js** contains a D3 v4 <a href="https://observablehq.com/@d3/arc-diagram">Arc Diagram</a>. 
- - **flare-biblestudy.js** contains: 
- - - *<a href="#project-sources">Hierarchical Edge Bundling Chart</a>* functionality for a D3 v3 
- - - *REGEX* functions for identifying bible verses on the page
- - - *AJAX* for returning HTML on ajax.php upon making an HTTP GET request. 
- - **functions.js** contains primarily dashboard functionality, but the end of the file also has document ready javascript used by both HTML pages.
- **/assets/json/** (JSON)
- - **para.json** contains demo data used for cross references in index.html. This is the one you can modify for your own cross reference threads. 
- - **flare-OldTestamentJesus1.json** contains demo data for cross references and subject mapping in . They are called from their respective pages.
- - **kjv.json** contains bible stats based on data from the King James translation.
- **/assets/database/** (PHP/MySQL)
- - **ajax.php** uses HTTP GET parameters to wrap specified scriptures in HTML. Creates a Librarian object, prepares statents, and specifies the translation to query. *uncomment the error checking statments (don't move them) to troubleshoot* 
- - **bible_to_sql_service.php** Librarian extends Servant. Only upon successufl preperation of a statment can Librarian query the database. ***use the construct function in Servant to specify host, user, password, and database**. \*\*Both classes contain extra functions for testing* 


Bible Database Setup
-------------------

**bible_database sql files**

You will need to import the **t_\*** sql files from https://github.com/scrollmapper/bible_databases/tree/master/sql into the database you create for the project. 

phpMyAdmin
-
The easiest way to do this is use phpMyAdmin:

1. Create a *database* named ***bible_db*** 

2. Create a *user* named ***bible*** (or name them whatever you want for that matter. Just modify the Servant class construct function accordingly (bible_to_sql_service.php). 

3. Edit priviliges for your *user* using the database *bible_db*, and grant all **data** and **structure** priviliges. 

4. Import the sql files into the database (be sure to select the database first) using the import tab.

5. Make sure you modify the Servant class construct function (bible_to_sql_service.php) to match your host, user, password, and database.


MySQL Statements
-
First login with your root account. 

1. Create a localhost user: for example, with the name *bible* (replace *YOURPASSWORDHERE* with your own, but keep the hyphens):

`code`CREATE USER 'bible'@'localhost' IDENTIFIED BY 'YOURPASSWORDHERE';`code`

2. Create a database named bible_db:

`code`CREATE DATABASE bible_db;`code`

3. Grant just enough priviledges for the user *bible* to manage the database: 

`code`GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, CREATE TEMPORARY TABLES, CREATE VIEW, EVENT, TRIGGER, SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, EXECUTE ON `bible_db`.* TO 'bible'@'localhost';`code`

4. Import the SQL files into the database. For example: from a shell / bash command, use the mysql root user to import the king james version sql file into the database named *bible_db*

`code`mysql -u root -p bible_db < t_kjv.sql`code`

5. Make sure you modify the Servant class construct function (bible_to_sql_service.php) to match your host, user, password, and database. 

Troubleshooting PHP and MySQL
-
Uncommnet the logging statements in ajax.php, so the top of the file looks like this: 
`code`
<?php
ini_set('display_errors', 1);/// prints ERROR LOGGING to the page
error_reporting(E_ALL);/// prints ERROR LOGGING to the page
`code`

Reload your page and use the errors to correct or ask for help. 



Sources: {#project-sources}
-------------------
Flare is based features from these projects:
- (Charts) D3.js version 3 and 4 https://github.com/d3/d3
- - A D3.js v3 Hierarchical Edge Bundling chart (JavaScript) from https://observablehq.com/@d3/hierarchical-edge-bundling 
- - A D3.js v4 Arc chart at https://github.com/danielgtaylor/bibviz/blob/master/web/contents/scripts/main.js 
- - - Other resources: https://observablehq.com/@d3/arc-diagram and https://www.d3-graph-gallery.com/arc
- (REGEX) jQuery Biblify a very robust way to find verses on a page, plus AJAX for their modification  https://github.com/nathankitchen/jquery.biblify
- (Scriptures) PHP and MySQL from my fork of scrollmapper/bible_databases https://github.com/donaldmilligan/bible_databases
- (SQL Databases) The original SQL bible databases, also available in my fork of scrollmapper/bible_databases https://github.com/donaldmilligan/bible_databases/tree/master/sql
- (Dashboard Styles and Functionality) Flare uses a modified version of the Stisla dashboard theme at https://github.com/stisla/stisla - This is temporary until the app goes mobile. 


LICENSE:
-------------------
Flare is under the [MIT License](LICENSE)
