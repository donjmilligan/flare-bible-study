[![Donate](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/hispattern)

# Flare Bible Study #

<h2>An App Intended for Presentations and Fit for Scriptural Research</h2>

Here you will find an app that can map cross references and subjects at the same time, in a couple of ways. This relies on user created scriptural cross reference data.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or above recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Git (to clone the repository)
- PostgreSQL (to set up the database)

> ✅ **Nx is used locally**, so you do **not** need to install it globally.

---

## 📦 Clone the Project

```
git clone https://github.com/donaldmilligan/flare-bible-study.git
cd flare-bible-study
```

## PostgreSQL Database Setup

## 🗃️ PostgreSQL Database Setup

### Step 1: Create the Database
Create a PostgreSQL database called `bible_db` or your own database_name.

You can use `psql` or a GUI like pgAdmin.

#### Using psql (CLI):

-- Log into PostgreSQL
psql -U postgres

-- Create user
CREATE USER bible_user WITH PASSWORD 'your_password';

-- Create database
CREATE DATABASE bible_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE bible_db TO bible_user;

### Step 2: Import SQL Data
You’ll find the SQL file in:
```
databases/bible_db.sql
```
To import:
Assuming you are in the root of the cloned project (flare-bible-study), run:
```
psql -U bible_user -d bible_db -f databases/bible_db.sql
```

### 🖥️ Option 2: Using pgAdmin
Open pgAdmin and log in.

Create Database:

Right-click on Databases → Create → Database

Name: bible_db

Create User:

Right-click on Login/Group Roles → Create → Login/Group Role

Role Name: bible_user

Under Definition: Set a password.

Under Privileges: Grant all privileges (select Yes for all).

Open the Query Tool:

Right-click the bible_db database → Query Tool

Click the folder icon and open the SQL file:
👉 Navigate to:
flare-bible-study/databases/bible_db.sql
(Use your computer’s full path if needed, like C:/Users/YourName/...)

Click the ▶️ Execute button to import the database schema and data.


## 🛠️ Environment Setup

Create a .env file inside the apps/backend folder:

```
cd apps/backend
```

and set up
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your database name 
DB_USER=postgres-> this one is defualt if you create for example bible_user change to bible_user
DB_PASSWORD=your password
PORT=3001
```
## 📥 Install Dependencies
after that make sure at the right folder path and then install depeendencies

```
# At the root
npm install

# Backend
cd apps/backend
npm install

# Frontend
cd ../frontend
npm install
```
## 🛠️ Build the Project
at root run this command to build for production
```
npm run build:frontend
npm run build:backend
```
## 🚀 Run the Project
After building, you can run both frontend and backend:
```
npm run start:frontend
npm run start:backend
```


