const express = require('express');
const app=express();
const mongoose = require('mongoose');
const dotenv=require("dotenv");
dotenv.config();

const dbLink = `mongodb+srv://${process.env.DB_USERNAME}
:${process.env.DB_PASSWORD}@cluster0.jtyx5j9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
mongoose.connect(dbLink)
    .then(function (connection) {
        console.log("connected to db")
}).catch(err => console.log(err))

app.listen(3000, function(){
    console.log('Server is running on port 3000');
})