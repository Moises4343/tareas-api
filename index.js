const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;


app.use(cors());
app.use(express.json()); 

let tasks = [];

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const { task } = req.body;
  if (task) {
    const newTask = { id: tasks.length + 1, task: task };
    tasks.push(newTask);
    res.status(201).json(newTask); 
  } else {
    res.status(400).json({ error: 'La tarea es requerida' });
  }
});

app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { task } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === parseInt(id));

  if (taskIndex >= 0) {
    tasks[taskIndex].task = task;
    res.json(tasks[taskIndex]);
  } else {
    res.status(404).json({ error: 'Tarea no encontrada' });
  }
});

app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;

  const taskIndex = tasks.findIndex(t => t.id === parseInt(id));

  if (taskIndex >= 0) {
    const deletedTask = tasks.splice(taskIndex, 1);
    res.json(deletedTask);
  } else {
    res.status(404).json({ error: 'Tarea no encontrada' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://127.0.0.1:${port}`);
});
