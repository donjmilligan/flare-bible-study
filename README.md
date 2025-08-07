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

> ✅ **Nx is used locally**, so you do **not** need to install it globally. We'll use `npx` to run commands.

---

## 📦 Clone the Project

```
git clone https://github.com/donaldmilligan/flare-bible-study.git
cd flare-bible-study
```

## PostgreSQL Database Setup

## 🗃️ PostgreSQL Database Setup

### Step 1: Create the Database
Create a PostgreSQL database called `bible_db` or your own database.

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

