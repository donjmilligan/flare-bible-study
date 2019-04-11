[![Donate](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/hispattern)

# Flare Bible Study #

<h2>An App Intended for Presentations and Fit for Scriptural Research</h2>

Here you will find an app that can map cross references and subjects at the same time, in a couple of ways. This relies on user created scriptural cross reference data, and you'll need to create your own additional JSON files, or extend the ones in this project.

## Table of contents

- [Translations](#translations)
- [Development Guide](#development-guide)
- [Roadmap](#roadmap)
- [Integrates](#integrates)
- [Contributors](#contributors)
- [Contributing](#contributing)
- [License](#license)
- [Supported By BrowserStack](#supported-by-browserstack)

## Translations

Currently flare uses only public domain bible translations: 
- American Standard-ASV1901 (ASV)
- Bible in Basic English (BBE)
- Darby English Bible (DARBY)
- King James Version (KJV)
- Webster's Bible (WBT)
- World English Bible (WEB)
- Young's Literal Translation (YLT)


**Contributing cross references:**
At a bare minimum, you will need to know some basic JSON programming to create new content. 
Feel free to use the additional JSON files at http://flare.hispattern.com for a launching point.


**Contributing Code:**
*JavaScript, jQuery, JSON* are the primary technologies used, with  *HTML* and *CSS* for layout and styling. However *AJAX, PHP,* and *MySQL* are also involved.





## Development Guide



### To Get Started
1. You'll need a [WAMP](http://www.wampserver.com/en/), [LAMP](https://www.digitalocean.com/community/tutorials/how-to-install-linux-apache-mysql-php-lamp-stack-ubuntu-18-04), or other web server (I'm running Apache2 with a localhost setup in Linux for development)
2. ≥[MySQL 5.7](https://dev.mysql.com/downloads/mysql/) installed
3. ≥[PHP 7.2](https://www.php.net/downloads.php) installed
4. mysqli/mysqlnd enabled. [Ubuntu how-to](https://stackoverflow.com/questions/35424982/how-to-enable-mysqli-extension-in-php-7)
5. Complete the Bible Database Setup 
6. Clone the repo: `git clone https://github.com/donaldmilligan/flare-bible-study.git`, or download `wget https://github.com/donaldmilligan/flare-bible-study/archive/master.zip` and unzip to your localhost path.


### Bible Database Setup

**Use [phpMyAdmin](#using-phpmyadmin "View phpMyAdmin method") or [MySQL statements](#using-mysql "See MySQL method")** to accomplish these tasks.

**Note:** the default database name in bible_to_sql_service.php is *bible_db*

##### Task 1
Create a database, localhost db user, password, and set user rights for the DB

##### Task 2

import the bible_database sql files



#### Using phpMyAdmin
An easy way to do this is use phpMyAdmin. 

1. Login to phpMyAdmin
2. Create a *database* named ***bible_db*** 
3. Create a *user* named ***bible*** (or name them whatever you want for that matter. Just modify the Servant class construct function accordingly (bible_to_sql_service.php). 
4. Edit privileges for your *user* using the *database* option, and grant all **data** and **structure** privileges for the appropriate *database name*. 
5. Select the proper database, then use the Import tab to import the sql files into the *database*.
6. Go modify the Servant class construct function (bible_to_sql_service.php) to match your host, user, password, and database configuration.
7. You're done. 
Not displaying scriptures? Use the [Troubleshooting Errors](#troubleshooting-errors) if you know what you're doing.  

#### Using MySQL
In this method, you'll create accomplish the tasks using the command line

1. First login with your root account. 
`mysql -u root -p`
2. Create a localhost user: for example, with the name *bible* (replace *YOURPASSWORDHERE* with your own, but keep the hyphens):

`CREATE USER 'bible'@'localhost' IDENTIFIED BY 'YOURPASSWORDHERE';`

3. Create a database named bible_db:

`CREATE DATABASE bible_db;`

4. Grant just enough privileges for the user *bible* to manage the database: 

`GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, CREATE TEMPORARY TABLES, CREATE VIEW, EVENT, TRIGGER, SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, EXECUTE ON `bible_db`.* TO 'bible'@'localhost';`

5. Import the SQL files into the database. **For example,** using a shell / bash command line from within the sql file containing folder: this uses the mysql root user to import the king james version sql file into a database named *bible_db*

`mysql -u root -p bible_db < t_kjv.sql`

6. Make sure you modify the Servant class construct function (bible_to_sql_service.php) to match your host, user, password, and database. 

7. You're done. 
Not displaying scriptures? Use the [Troubleshooting Errors](#troubleshooting-errors) if you know what you're doing.  

#### Troubleshooting Errors
This will enable php to return error messages that show what is happening,
Un-comment the logging statements in ajax.php, so the top of the file looks like this: 
`<?php
ini_set('display_errors', 1);/// prints ERROR LOGGING to the page
error_reporting(E_ALL);/// prints ERROR LOGGING to the page`

Reload your page and use the error messages displayed by AJAX to correct them, or to reference when asking for help. *The error messages will be displayed where the scriptures should be on each page.*

-------------------







## Roadmap
You can find the Stisla road map here: [Stisla Roadmap](https://trello.com/b/M8TMnehE/stisla-roadmap)


## Integrates
- [Rails](https://github.com/SunDi3yansyah/stisla-rails)
- [CodeIgniter](https://github.com/KhidirDotID/stisla-codeigniter)
- Laravel (let's contribute)
- Django (let's contribute)
- and more...


## Contributors
Stisla is better because of the [contributors](https://github.com/stisla/stisla/graphs/contributors). Thank them too.


## Contributing
Want to help Stisla get better? Let's contribute and follow our [contribution guide](https://github.com/stisla/stisla/blob/master/CONTRIBUTING.md).
-------------------
-------------------




-------------------


## Todo's: ##

By the 3rd Quarter of 2019:
- Create similar editing interface to create JSON files with the visual aid. *they are currently programmed one line at a time*.
- Get out of the demo stage for JSON data - I've created the cross referencing in para.json and flare-OldTestamentJesus1.json on my own.

In the 4th Quarter of 2019:
- Convert the project using Vue Native for mobile
  - Convert to using JSON or SQLite bible databases for use in Android
    
-------------------


## Technical Summary: ##

- **/ (HTML)**
  - *index.html* is the latest chart being developed, the data is only demo data and not fully fledged out.
  - *Jesus-in-the-old-testament.html* (HTML) this uses the hierarchical edge bundling chart (hierarchical many to many relationships) which is great for subject mapping and for presentations. A copy of this page can host different chart data by modifying the JSON file name near the end of the document.
- **/assets/css/ (CSS)**
    - *flare.css* contains:
      - Flare specific CSS for both HTML pages
      - Dashboard style mods (near the end of the document)
    - *style.css* contains dashboard specific CSS.
    - *components.css* contains dashboard specific CSS
- **/assets/js/ (JavaScript)**
  - *flare.js* contains:
    - D3.js v4 *[Arc Chart](https://observablehq.com/@d3/arc-diagram "Original Source")* functionality, extended from <a href='https://github.com/danielgtaylor/bibviz/blob/master/web/contents/scripts/main.js'>bibviz</a> **interesting history: [bible viz](#sources "See bibleviz history")**.
  - *flare-biblestudy.js* contains: 
    - D3.js v3 *<a href="#sources">Hierarchical Edge Bundling Chart</a>* functionality
    - *<a href="#sources">REGEX</a>* functions for identifying bible verses on the page
    - *AJAX* for returning HTML on ajax.php upon making an HTTP GET request. 
   - *functions.js* contains primarily dashboard functionality, but the end of the file also has document ready javascript used by both HTML pages.
- **/assets/json/ (JSON)**
  - *para.json* contains demo data used for cross references in index.html. This is the one you can modify for your own cross reference threads. 
  - *flare-OldTestamentJesus1.json* contains demo data for cross references and subject mapping in . They are called from their respective pages.
  - *kjv.json* contains bible stats based on data from the King James translation.
- **/assets/database/ (PHP/MySQL)**
  - *ajax.php* uses HTTP GET parameters to wrap specified scriptures in HTML. Creates a Librarian object, prepares statements, and specifies the translation to query. *un-comment the error checking statements (don't move them) to troubleshoot* 
  - *bible_to_sql_service.php* Librarian extends Servant. Only upon successful preparation of a statement can Librarian query the database. ***use the construct function in Servant to specify host, user, password, and database**. \*\*Both classes contain extra functions for testing* 

-------------------
-------------------






 Sources: 
 -------------------
Flare is based on features from these projects:
- (**Scriptures**) PHP and MySQL from <a href='https://github.com/donaldmilligan/bible_databases'>my PHP7 complient fork</a> of scrollmapper/bible_databases 
- (**SQL Databases**) The SQL bible databases, also available in <a href='https://github.com/donaldmilligan/bible_databases'>my PHP7 complient fork</a> of  <a href='https://github.com/scrollmapper/bible_databases'>scrollmapper/bible_databases</a>
- (**Charts**) D3.js Data Visualization library  https://github.com/d3/d3
  - A D3.js v4 **Arc Chart**. **Bible Viz History:** the bible chapter lengths were first visualized in a colaboration between Carnegie Mellon professor <a href='http://www.chrisharrison.net/index.php/Visualizations/BibleViz'>Chris Harrison</a> and Lutheren pastor <a href='http://scimaps.org/mapdetail/visualizing_bible_cr_125'>Christoph Römhild</a>. 
    - The Flare arc chart (flare.js) used in index.html is based on  https://github.com/danielgtaylor/bibviz/blob/master/web/contents/scripts/main.js
    - Other resources: https://observablehq.com/@d3/arc-diagram and https://www.d3-graph-gallery.com/arc
  - A D3.js v3 **Hierarchical Edge Bundling chart** (JavaScript) from https://observablehq.com/@d3/hierarchical-edge-bundling 
- (**REGEX**) <a href='https://github.com/nathankitchen/jquery.biblify'>jQuery Biblify</a> a very robust way to find verses on a page, and originally built to replace the text with links to pages with the scritpures using AJAX. 
- (**Dashboard Styles and Functionality**) Flare uses a modified version of the <a href='https://github.com/stisla/stisla'>Stisla dashboard theme</a> 

-------------------


## LICENSE: ##

Flare is under the [MIT License](LICENSE)
