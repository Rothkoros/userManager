const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { query } = require("express");
const dbConnectionString = "mongodb://localhost/user-manager";
let app = express();

//user database connection
mongoose.connect(dbConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const udb = mongoose.connection;
udb.on("error", console.error.bind(console, "connection error:"));
udb.once("open", function () {
  console.log("db connected");
});

const userSchema = new mongoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  email: String,
  age: Number
  
});
userSchema.index({firstName: "text", lastName: "text"});

const Users = mongoose.model('Users', userSchema);


app.use(express.urlencoded({ extended: false }));
app.use(express.static("./views"));

app.set("views", "./views");
app.set("view engine", "pug");


app.get("/", (request, response) => {
  response.render("newuser");
});

app.get("/userlisting", (request, response) => {
  let userName = request.params.firstName;

 Users.find({},null, {limit:10}, (err, data) => {
    if (err) return console.log(`Seems like we ran into an error:s ${err}`)
   
    else{
   
    response.render('userlisting', {
        user: data
    })
  }
  });
});
app.get("/edituser", (request, response) => {

  const paramId = request.query.userid;
  
  Users.findOne({id: paramId}, (err, data) => {
    console.log(data)
    if (err) return console.log(`Seems like we ran into an error:s ${err}`)
  
    else{
    
    response.render('edituser', {
        data: data
    })
  }
  });
});

app.post("/create", (request, response) => {
  let users = new Users
  users.id = uuidv4();
  users.firstName = request.body.firstName;
  users.lastName = request.body.lastName;
  users.email = request.body.email;
  users.age = request.body.age;
  if (!users.firstName || !users.lastName || !users.email || !users.age) {
    response.redirect("/");
  }
  if (!!users.firstName) {
    users.save(users);
    response.redirect("userlisting");
  }
});
app.post("/updateUser", (request, response) => {

  const userId = request.query.userid;
  const requestBody = request.body;
  Users.findOneAndUpdate({ id: userId}, {$set: {

  firstName: requestBody.firstName,
  lastName: requestBody.lastName,
  email: requestBody.email,
  age: requestBody.age,
  },},
  {new: true},
   (err)=>{
    if (err) console.error(err);
  });
  response.redirect("userlisting");
});
app.post("/deleteUser", (req, res) => {

  const userId = req.headers.userid;
  Users.findOneAndDelete({ id: userId}, (err, data)=>{
    if (err) console.error(err);
    res.status(200).send("success")
  });
});

app.get("/searchName", (request, response)=>{
  console.log(request.query.search);
  Users.find({$text: {$search: request.query.search}}, null, (err, data)=>{
    if (err) console.log(err); 
    response.render("userlisting", {user: data})
  })

})
app.get("/sortNameAsc", (request, response)=>{
  Users.find({},null, {lean: true})
    .sort({firstName:1})
    .exec((err,data)=>{
      if (err) console.log(err);
      response.render("userlisting", {user:data})
    })

})
app.get("/sortNameDes", (request, response)=>{
  Users.find({},null, {lean: true})
    .sort({firstName:-1})
    .exec((err,data)=>{
      if (err) console.log(err);
      response.render("userlisting", {user:data})
    })

})


app.listen(3000, () => {
  console.log("listening on port 3000");
});
