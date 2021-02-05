const express = require("express");
let app = express();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid')
let allUsers;
let user = {};

app.use(express.urlencoded({ extended: false}));
app.use(express.static("./views"));

app.set("views", "./views");
app.set("view engine", "pug");

app.get("/", (request, response) =>{
    response.render("newuser")
})

app.get('/userlisting', (request, response) => {
    readJson().then(() => {
        response.render('userlisting',{
            data: allUsers
        })
    })
})
app.get('/edituser', (request, response) =>{
    readJson().then(() =>{
        response.render('edituser',{
            data: allUsers[request.query.userid]
        })
    })
})

app.post("/create", (request, response)=>{
    user.id = uuidv4();
    user.firstName = request.body.firstName;
    user.lastName = request.body.lastName;
    user.email = request.body.email;
    user.age = request.body.age;
    if (!user.firstName || !user.lastName || !user.email || !user.age){
        response.redirect('/')
    }
    if (!!user.firstName) {
        readJson().then((data) => {
            data[user.id] = user
            writeJson(data).then(() => {
                response.redirect("userlisting")
            })
        })
    } else {
        writeJson(user).then(() => {
            response.redirect('userlisting')
        })
    }
   
   
});
app.post("/updateUser", (request, response) =>{
    const currentUser = allUsers[request.query.userid]
    currentUser.firstName = request.body.firstName
    currentUser.lastName = request.body.lastName
    currentUser.email = request.body.email
    currentUser.age = request.body.age

    writeJson(allUsers).then(() =>{
        response.redirect('userlisting')
    });
})
app.post("/deleteUser", (req, res) => {
    readJson().then(() => {
        delete allUsers[req.headers.userid];
        writeJson(allUsers).then(() => {
            res.status(200).send("success");
        });
    });
});

app.listen(3000, () =>{
    console.log("listening on port 3000")
})


function readJson(){
    return new Promise((resolve, reject) => {
        fs.readFile('data.json', (err, data) => {
            if (err) reject(err)
            allUsers = JSON.parse(data)
            resolve(allUsers)
        });
    })
}

function writeJson(data){
    return new Promise((resolve, reject) => {
        fs.writeFileSync('data.json', JSON.stringify(data));
        resolve();
    })
}
