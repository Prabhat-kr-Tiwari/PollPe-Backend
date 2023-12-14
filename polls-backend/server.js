const express =require('express')
const connection=require('./config/database');
const routes=require('./routes/routes')
const app=express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.use(routes)

const PORT= process.env.PORT||5000 
app.listen(PORT,()=>{
    console.log(`Listening on the ${PORT}`)



})