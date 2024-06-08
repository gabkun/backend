const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require('bcrypt'); // Ensure bcrypt is imported

const app = express();
const prisma = new PrismaClient();

// Use bodyParser middleware
app.use(bodyParser.json());

// Enable CORS using the cors middleware
app.use(cors());


app.post('/signup', async (req, res) => {
  const { lname, fname, username, email, password } = req.body;
  try {
    const user = await prisma.user.create({
      data: { lname, fname, username, email, password },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.put('/user/:id', async (req, res) => {
  const { id } = req.params;
  const { lname, fname, username, email, password } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: id },
      data: { lname, fname, username, email, password },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      console.log('User not found:', username);
      return res.status(404).json({ message: 'User not found.' });
    }


    const isPasswordValid = await prisma.user.findFirst({where: { password }});
    if (!isPasswordValid) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ message: 'Invalid password.' });
    }

    console.log('Login successful for user:', username);

    res.status(200).json({ id: user.id, username: user.username, email: user.email });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});




// Route for handling requests from the Angular client
app.get('/api/message', (req, res) => { 
  res.json({ message: 'Hello GEEKS FOR GEEKS Folks from the Express server!' }); 
}); 

app.post('/todo', async (req, res) => {
  const { itemName, added } = req.body;


  try {
    const newItem = await prisma.toDoItem.create({
      data: {
        itemName: itemName,
        added: added,
      }
    });
    return res.json(newItem);
  } catch (error) {
    console.error("Error creating todo item:", error);
    return res.status(500).json({ error: "An error occurred while creating todo item." });
  }
});

app.get('/todo', async (req, res) => {
  try {
    const todoItems = await prisma.toDoItem.findMany();

    return res.json(todoItems);
  } catch (error) {
    console.error("Error fetching todo items:", error);
    return res.status(500).json({ error: "An error occurred while fetching todo items." });
  }
});


app.get('/todo/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Query the database to fetch user data by user ID
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    // Return user data
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/todos/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const todos = await prisma.toDoItem.findMany({
      where: { added: username },
    });

    if (todos.length === 0) {
      return res.status(404).json({ error: 'No todo items found for this user' });
    }

    res.json(todos);
  } catch (error) {
    console.error('Error fetching todo items:', error);
    return res.status(500).json({ error: 'An error occurred while fetching todo items' });
  }
});


app.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { itemName } = req.body;

  try {
    const updatedItem = await prisma.toDoItem.update({
      where: {
        id: id,
      },
      data: {
        itemName: itemName,
      },
    });
    return res.json(updatedItem);
  } catch (error) {
    console.error("Error updating todo item:", error);
    return res.status(500).json({ error: "An error occurred while updating todo item." });
  }
});

// Delete a todo item
app.delete("/todo/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.toDoItem.delete({
      where: {
        id: id, // Expecting id to be a string
      },
    });
    return res.status(200).json({ message: "Todo item deleted successfully." });
  } catch (error) {
    console.error("Error deleting todo item:", error);
    return res.status(500).json({ error: "An error occurred while deleting todo item." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => { 
  console.log(`Server listening on port ${port}`); 
});