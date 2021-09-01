const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.listen(3030);

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  user = users.find( cliente => cliente.username === username );

  if (!user) {
      return response.status(404).json({"error":"User not found"});
  }

  request.user = user

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const userAlreadyExists = users.find( user => user.username === username );

  if (userAlreadyExists) {
    return response.status(400).json({error:'Username already exists'});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    toDos:[]
  }
  
  users.push(user);

  return response.status(201).json(users)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  
  return response.json(user.toDos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  
  user.toDos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;
  const {id} = request.params;

  const verifyId = user.toDos.find( todo => todo.id == id );
  if (!verifyId) {
    return response.status(404).json({"error":"This task doesn't exists"});
  };

  const todo = verifyId
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json({"message":"Changes done"});
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {id} = request.params;

  const verifyId = user.toDos.find( todo => todo.id == id );
  if (!verifyId) {
    return response.status(404).json({"error":"This task doesn't exists"});
  };

  const todo = verifyId;
  todo.done = true;

  return response.status(200).json({"message":"Task complete"});
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const{id} = request.params;

  const verifyId = user.toDos.find( todo => todo.id == id );
  if (!verifyId) {
    return response.status(404).json({"error":"This task doesn't exists"});
  };

  const todo = verifyId;

  user.toDos.splice(todo,1);

  return response.status(204).json();
});

module.exports = app;
