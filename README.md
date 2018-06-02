# Generosity Market Backend

## Tech Stack

### Api
- Node
- Express
- PostgreSQL

### Dependencies
- express
- passport
- passport-http
- path
- morgan
- pg
- sequelize
- body-parser
- node-fetch

## Team members
- [Bernie Strong](https://github.com/bstrong71) - React/Node
- [Sean McPherson](https://github.com/SeanMcP) - React/Node
- [Joseph Gordy](https://github.com/JGordy) - React/Node

## Setup
To use this code:
- Clone this repository (`git clone https://github.com/Generosity-Market/back_end_POC.git`) to a local directory.
- `cd` into the directory.
- Use `npm install` in the terminal to install all dependencies from the `package.json` file.
- To create the database on your local machine type `createdb generosity-test`.
- Next type `psql` to enter the Sequelize CLI.
- Then `\c generosity-test` to connect to the database.
- `\q` to exit the Sequelize CLI.
- `sequelize db:migrate` to migrate all of the models and tables.
- In the `config.json` file change the username field to your local PC or Mac's username.
- Then `node server.js` or `nodemon server.js` to start up the project. It will run on `localhost:3000`.
