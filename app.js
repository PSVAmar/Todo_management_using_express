/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyparser = require("body-parser");
//const { json } = require("sequelize");
app.use(bodyparser.json());
const request = require('request');
// app.get("/",(request,response)=>{
//     //console.log("Hello World");
//     response.send("Hii");
// })
// eslint-disable-next-line no-unused-vars
app.set("view engine" , "ejs");
app.use(bodyparser.json())
var todoArr = [];
app.get("/",(req,res)=>{
     // console.log(JSON.parse(body).length)
      // for(var i=0;i<JSON.parse(body).length;i++){
          
      //     todoArr.push(JSON.parse(body)[i].title);
         
      // }
      console.log(todoArr)
      res.render("header.ejs",{userData4 : todoArr},)
})

app.get("/todos", async (request, response) => {
  console.log("Todo List");
  var arr=[];
  try{
    const todo = await Todo.findAll();
    return response.json(todo);
  } catch (error) { 
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async (request, response) => {
  console.log("Creating a todo", request.body);
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false,
    });
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

//put http://mytodoapp.com/todos/123/markAsCompleted
app.put("/todos/:id/markAsCompleted", async (request, response) => {
  console.log("WE have created a todo with ID: ", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async (request, response) => {
  console.log("Delete a todo by Id:", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    await todo.deleteTodo();
    // status true indicates that our todo with id is deleted
    return response.json({ status: true });
  } catch (error) {
    // console.log(error);
    // return response.status(422).json(error);
    return response.json({response:"The requested ID is not found try again with another ID"});
  }
});

module.exports = app;