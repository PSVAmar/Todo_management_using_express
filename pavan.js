// let cardsource = [
//     "<a href = 'https://bom.to/Qd87vw'> Card 1</a>",
//     "<a href = 'https://bom.to/P21flg'>Card 2 </a>",
//     "<a href = 'https://bom.to/dFwwNw'>Card 3 </a>",
// ];
// for (var index = 0; index < cardsource.lengh; index++) {
//     console.log(cardsource[index]);
// }

var todoArr = [];
const express = require("express");
const app = express();
const request = require('request');

// app.set("view engine", "ejs");

app.get("/",(req,res)=>{
    request("http://localhost:3000/todos",function(error,response,body){
        console.log(JSON.parse(body).length)
        for(var i=0;i<JSON.parse(body).length;i++){
            
            todoArr.push(JSON.parse(body)[i].title);
           
        }
        console.log(todoArr)
        res.render("header.ejs",{userData4 : todoArr},)
    })
})
app.listen(3003,()=>{
    console.log("Running Successfully");
})

