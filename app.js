const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const dbConnectionString = "mongodb://localhost/user-manager";
let app = express();
let allUsers;
let user = {};
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

  firstName: String,
  lastName: String,
  email: String,
  age: Number
  
});
const users = mongoose.model('users', userSchema)


app.use(express.urlencoded({ extended: false }));
app.use(express.static("./views"));

app.set("views", "./views");
app.set("view engine", "pug");


app.get("/", (request, response) => {
  response.render("newuser");
});

app.get("/userlisting", (request, response) => {
  // readJson().then(() => {
  //   response.render("userlisting", {
  //     data: allUsers,
  //   });
  users.find({},null, {limit:10, lean: true}, (err, data) => {
    if (err) return console.log(`Seems like we ran into an error:s ${err}`)
    // let result = JSON.stringify(data);
    // console.log(result);
    console.log(data);
    response.render('userlisting', {
        user: data
    })
  });
});
app.get("/edituser", (request, response) => {
  readJson().then(() => {
    response.render("edituser", {
      data: allUsers[request.query.userid],
    });
  });
});

app.post("/create", (request, response) => {
  user.id = uuidv4();
  user.firstName = request.body.firstName;
  user.lastName = request.body.lastName;
  user.email = request.body.email;
  user.age = request.body.age;
  if (!user.firstName || !user.lastName || !user.email || !user.age) {
    response.redirect("/");
  }
  if (!!user.firstName) {
    readJson().then((data) => {
      data[user.id] = user;
      writeJson(data).then(() => {
        response.redirect("userlisting");
      });
    });
  } else {
    writeJson(user).then(() => {
      response.redirect("userlisting");
    });
  }
});
app.post("/updateUser", (request, response) => {
  const currentUser = allUsers[request.query.userid];
  currentUser.firstName = request.body.firstName;
  currentUser.lastName = request.body.lastName;
  currentUser.email = request.body.email;
  currentUser.age = request.body.age;

  writeJson(allUsers).then(() => {
    response.redirect("userlisting");
  });
});
app.post("/deleteUser", (req, res) => {
  // readJson().then(() => {
  //   delete allUsers[req.headers.userid];
  //   writeJson(allUsers).then(() => {
  //     res.status(200).send("success");
  //   });
  const userId = req.headers.userid;
  user.findOneAndDelete({ id: userId}, (err, data)=>{
    if (err) console.error(err);
    res.status(200).send("success")
  });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});

function readJson() {
  return new Promise((resolve, reject) => {
    fs.readFile("data.json", (err, data) => {
      if (err) reject(err);
      allUsers = JSON.parse(data);
      resolve(allUsers);
    });
  });
}

function writeJson(data) {
  return new Promise((resolve, reject) => {
    fs.writeFileSync("data.json", JSON.stringify(data));
    resolve();
  });
}
