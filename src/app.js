require('dotenv').config()
const express = require("express");
var cookieParser = require('cookie-parser')
const path = require("path");

const bcrypt = require('bcrypt');
const hbs = require("hbs");
const auth = require("./middleware/auth");
const registerUser = require("./model/register");
require("./db/connection")


const app = express();
const port = process.env.PORT || 3000;


const views_path = path.join(__dirname, "../template/views")
const public_path = path.join(__dirname, "../public")
const partial_path = path.join(__dirname, "../template/partials")

app.use(express.static(public_path))
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'hbs');
app.set("views", views_path)
hbs.registerPartials(partial_path)

app.get("/", (req, res) => {
    res.render("index");
});


app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/logout",auth ,async(req, res) => {
    try {
        res.clearCookie("jwt");
        console.log("logout successfully");

        // logout from a single device
        // req.user.tokens = req.user.tokens.filter((currentElem)=>{
        //     return currentElem.token !== req.token;
        // })

        // logout from all devices
        req.user.tokens = [];

       await req.user.save();
        res.render("login")
        
    } catch (error) {
        res.status(500).send(error);
    }
});
app.get("/secret", auth,(req, res) => {
    // console.log(`our cookie is ${req.cookies.jwt}`);
    res.render("secret",{
        name:req.user.firstName
    });
});
app.post("/login", async (req, res) => {

    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await registerUser.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, userData.password);

        const token = await userData.generateAuthToken();
        // console.log("login token ", token);

        res.cookie("jwt",token,{
            expires:new Date(Date.now()+600000),
            httpOnly:true
        });

        // console.log(cookie);

        if (isMatch) {
            
            res.status(201).render("index");
        }
        else {
            res.status(400).send("password is not matching");
        }
    } catch (error) {
        res.status(400).send("email is not registered")
    }



});

app.get("/register", (req, res) => {
    res.render("register");
});
app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;
        if (password === cpassword) {

            const insdata = new registerUser({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phone: req.body.phone,
                email: req.body.email,
                password: password,
                cpassword: cpassword
            });


            const token = await insdata.generateAuthToken();
            // console.log("reginger token ", token);

            res.cookie("jwt",token,{
                expires:new Date(Date.now()+30000),
                httpOnly:true
            });

            // console.log("register cookie ",cookie);

            const dt = await insdata.save();
            // console.log(dt);
            res.status(201).render("index");
        }
        else {
            res.status(400).send("passwords are not matching")
        }

    } catch (error) {
        res.status(400).send(error);
    }
});

app.listen(port, () => {
    console.log("app is listening at " + port);
});