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
const data = fs.readFileSync(__dirname + '/todos/index.json');

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
  res.send({ data: data.todos });
});
app.post(endpoint, (req, res) => {
  if (!req.body || !req.body.title) {
    res.setHeader(406);
    res.send();
    return;
  }

  const newTodo = {
    id: idForNewTodo,
    when: new Date(),
    title: req.body.title,
  };

  data.todos.push(newTodo);

  res.send(newTodo);
});
app.patch(endpoint, (req, res) => {
  if (!req.body || !req.body.title) {
    res.setHeader(406);
    res.send();
    return;
  }

  const patchIndex = data.todos.findIndex((todo) => req.body.id === todo.id);
  if (patchIndex === -1) {
    res.setHeader(404);
    res.send();
    return;
  }

  data.todos[patchIndex] = {
    ...data.todos[patchIndex],
    title: req.body.title,
  };

  res.send(data.todos[patchIndex]);
});
app.delete(endpoint, (req, res) => {
  if (!req.body) {
    res.setHeader(406);
    res.send();
    return;
  }

  const deleteIndex = data.todos.findIndex((todo) => req.body.id === todo.id);
  if (deleteIndex === -1) {
    res.setHeader(404);
    res.send();
    return;
  }

  res.send(data.todos.splice(deleteIndex, 1)[0]);
});

// Start listening
http.createServer(app).listen(port, hostname);
https.createServer(options, app).listen(httpsPort, hostname);
