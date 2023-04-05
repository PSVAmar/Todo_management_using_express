/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
const express = require("express");
var csurf = require("tiny-csrf");

const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const app = express();

const { Todo,User } = require("./models");

const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
//const { json } = require("sequelize");
app.use(bodyparser.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser("shh! some string"));
app.use(csurf("12345678910111212121212121212122",['post','put','delete']));
// app.get("/",(request,response)=>{
//     //console.log("Hello World");
//     response.send("Hii");
// })
// eslint-disable-next-line no-unused-vars
app.use(session({
  secret: "my-super-secret-key-21728172615261561",
  cookie:{
    maxAge:24*60*60*1000 //24 hours
  }
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField :'email',
  passwordField :'password' 
},(username,password,done)=>{
  User.findOne({where:{email:username}})
  .then(async (user)=>{
    const result = await bcrypt.compare(password,user.password);
    if(result){
      return done(null,user);
    }
    else{
      return done("Invalid Password");
    }
  }).catch((error)=>{
    return done(error);
  })
}))

passport.serializeUser((user,done)=>{
  console.log("Serializing user in a session",user.id)
  done(null,user.id)
})

passport.deserializeUser((id,done)=>{
  User.findByPk(id)
  .then(user=>{
    done(null,user)
  })
  .catch(error=>{
    done(error,null)
  })
})
const path = require('path');
const { error } = require("console");
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(bodyparser.json())

// eslint-disable-next-line no-undef
app.use('/css',express.static(path.join(__dirname+'/public/css')));
app.set("view engine" , "ejs");

app.get("/",async (req,res)=>{
      res.render("index",{
        title : "Todo Application",
        csrfToken : req.csrfToken(),
    });  
})
app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (req,res)=>{
  console.log(req.user);
  const userId = req.user.id;
  const alltodos = await Todo.getAllTodos();
  const completed =await  alltodos.filter(todo=>todo.completed==true && todo.userId == userId);
// console.log(completed)
  const currentDate = new Date().toISOString().split('T')[0];
  const overdueTodos = alltodos.filter(todo => todo.dueDate < currentDate && todo.userId === userId );
  const dueTodayTodos =await alltodos.filter(todo => todo.dueDate === currentDate && todo.userId === userId);
  const dueLaterTodos =await alltodos.filter(todo => todo.dueDate > currentDate && todo.userId === userId);
  if(req.accepts('html')){
      res.render("todos",{
        overdueTodos:overdueTodos,
        dueTodayTodos:dueTodayTodos,
        dueLaterTodos:dueLaterTodos,
        completed:completed,
        csrfToken : req.csrfToken(),
    });  
  }
  else{
    res.json({
      overdueTodos,dueTodayTodos,dueLaterTodos,completed
      }
    )
  }
})
app.get("/todos", async (request, response) => {
  console.log("Todo List");
  try{
    const todo = await Todo.findAll();
    return response.json(todo);
  } catch (error) { 
    console.log(error);
    return response.status(422).json(error);
  }
});
app.get("/signup",(req,res)=>{
  res.render("signup",{title: "Signup",csrfToken:req.csrfToken})
})
app.post("/users",async (req,res)=>{
  //Have to create the user here 
  //console.log("Firstname ",req.body.firstName);
  //Hash password using decrypt
  const hashedPwd =await  bcrypt.hash(req.body.password,saltRounds)
  console.log(hashedPwd);
  try{
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPwd
    })
    req.login(user,(err)=>{
      if(err){
        console.log(err)
      }
      res.redirect("/todos");
    })
    
  }
  catch(error){
    console.log(error);
  }
})

app.get("/login",(req,res)=>{
  res.render("login",{title:"Login",csrfToken:req.csrfToken });
})

app.post("/session",passport.authenticate('local',{failureRedirect:"/login"}),(req,res)=>{
    console.log(req.user);
    res.redirect("/todos");
})

app.get("/signout",(req,res,next)=>{
  //Sign out 
  req.logout((err)=>{
    if(err){ return next(err);}
    res.redirect("/");
  })
})
app.post("/todos",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  console.log("Creating a todo", request.body);
  console.log(request.user);
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      // completed: false,
      userId:request.user.id
    });
    return response.redirect("/todos")
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

//put http://mytodoapp.com/todos/123/markAsCompleted
app.put("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  console.log("WE have created a todo with ID: ", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    
    const updatedTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  console.log("Delete a todo by Id:", request.params.id);
  // const todo = await Todo.findByPk(request.params.id);
  // try {
  //   await todo.deleteTodo();
  //   // status true indicates that our todo with id is deleted
  //   return response.json({ status: true });
  // } catch (error) {
  //   // console.log(error);
  //   // return response.status(422).json(error);
  //   return response.json({response:"The requested ID is not found try again with another ID"});
  // }
  try{
    await Todo.remove(request.params.id,request.user.id);
    return response.json({success:true});
  }
  catch(error ){
    return response.status(422).json(error);
  }
});

module.exports = app;