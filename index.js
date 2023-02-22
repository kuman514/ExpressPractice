const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');

// Instance
const app = express();

// Settings
const port = 3000;
const httpsPort = 3030;
const hostname = 'localhost';
const endpoint = '/todos';

// Data
let idForNewTodo = 1;
const data = JSON.parse(fs.readFileSync(__dirname + '/todos/index.json', 'utf8'));

// Certifications
const options = {
  ca: fs.readFileSync(__dirname + '/certifications/ca.pem'),
  key: fs.readFileSync(__dirname + '/certifications/key.pem'),
  cert: fs.readFileSync(__dirname + '/certifications/cert.pem'),
};

// Configs
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: 'localhost:*',
}));

// CRUD methods
app.get(endpoint, (req, res) => {
  console.log(`[${new Date()}]: Reading todo data`);
  res.send({ data: data.todos });
});
app.post(endpoint, (req, res) => {
  console.log(`[${new Date()}]: Posting a todo`);
  if (!req.body || !req.body.title || req.body.title === '') {
    console.error(`[${new Date()}]: Can't post a todo due to no title`);
    res.status(406).send();
    return;
  }

  const newTodo = {
    id: idForNewTodo,
    when: new Date(),
    title: req.body.title,
  };

  data.todos.push(newTodo);
  idForNewTodo++;

  res.send({ data: newTodo });
});
app.patch(endpoint, (req, res) => {
  console.log(`[${new Date()}]: Patching a todo`);
  if (!req.body || !req.body.title || req.body.title === '') {
    console.error(`[${new Date()}]: Can't patch a todo due to no title`);
    res.status(406).send();
    return;
  }

  const patchId = parseInt(req.body.id);
  const patchIndex = data.todos.findIndex((todo) => patchId === todo.id);
  if (patchIndex === -1) {
    console.error(`[${new Date()}]: Can't find todo id ${patchId}`);
    res.status(404).send();
    return;
  }

  data.todos[patchIndex] = {
    ...data.todos[patchIndex],
    title: req.body.title,
  };

  res.send({ data: data.todos[patchIndex] });
});
app.delete(endpoint, (req, res) => {
  console.log(`[${new Date()}]: Deleting a todo`);
  if (!req.body) {
    console.error(`[${new Date()}]: Can't delete a todo due to no title`);
    res.status(406).send();
    return;
  }

  const deleteId = parseInt(req.body.id);
  const deleteIndex = data.todos.findIndex((todo) => deleteId === todo.id);
  if (deleteIndex === -1) {
    console.error(`[${new Date()}]: Can't find todo id ${deleteId}`);
    res.status(404).send();
    return;
  }

  data.todos.splice(deleteIndex, 1);
  res.send();
});

// Start listening
console.log('init data', data);
console.log('Starting a server');
http.createServer(app).listen(port, hostname);
https.createServer(options, app).listen(httpsPort, hostname);
