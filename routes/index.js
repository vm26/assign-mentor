var express = require('express');
var router = express.Router();
var {mongodb,dbUrl,MongoClient} =require('../dbConfig');

//create mentor
router.post('/creatementor',async(req,res)=>{
var client=await MongoClient.connect(dbUrl);
try{
var db=await client.db('mentorstudent');
var mentor=await db.collection('mentors').findOne({email:req.body.email});
if(mentor){
  res.send({
    statusCode:404,
    message:"Mentor with same email already exists....use a different email"
  })
}else{
  let add=await db.collection('mentors').insertOne(req.body);
  res.send({
    statusCode:200,
    message:"Mentor added"
  })
}
}
catch(error){
  res.send({
    statusCode:500,
    message:"Internal server error"
  })
}
finally{
  client.close();
}
})

//create student
router.post('/createstudent',async(req,res)=>{
  var client=await MongoClient.connect(dbUrl);
  try{
  var db=await client.db('mentorstudent');
  var mentor=await db.collection('students').findOne({email:req.body.email});
  if(mentor){
    res.send({
      statusCode:404,
      message:"Student with same email already exists....use a different email"
    })
  }else{
    let add=await db.collection('students').insertOne(req.body);
    res.send({
      statusCode:200,
      message:"Student added"
    })
  }
  }
  catch(error){
    res.send({
      statusCode:500,
      message:"Internal server error"
    })
  }
  finally{
    client.close();
  }
  })

  //assign mentor to particular student
router.put('/assignmentortostudent/:id',async(req,res)=>{
  let id=req.params.id;
  var client=await MongoClient.connect(dbUrl);
  try{
  var db=await client.db('mentorstudent');
  var mentor=await db.collection('students').findOneAndReplace({_id:mongodb.ObjectId(id)},req.body);  
    res.send({
      statusCode:200,
      message:"Mentor assigned/Changed to a student successfully"
    })  
  }
  catch(error){
    res.send({
      statusCode:500,
      message:"Internal server error"
    })
  }
  finally{
    client.close();
  }
  })

  //show students of a particular mentor
router.get('/showstudents/:name',async(req,res)=>{
  let name=req.params.name;
  let correctname=name.charAt(0).toUpperCase()+name.slice(1);
  var client=await MongoClient.connect(dbUrl);
  try{
  var db=await client.db('mentorstudent');
  var data1=await db.collection('students').find({mentor:correctname}).toArray();  
  if(data1.length){
    res.send({
      statusCode:200,
      message:"Students for that mentor fetched successfully",
      data:data1
      
    })  
  }else{
    res.send({
      statusCode:404,
      message:"No Students are assigned with that mentor till now"    
      
    }) 
  }
}
  catch(error){
    res.send({
      statusCode:500,
      message:"Internal server error"
    })
  }
  finally{
    client.close();
  }
  })

   //assign students to mentor
  router.put('/assignstudentstomentor/:name',async(req,res)=>{  
    let name1=req.params.name;  
    var client=await MongoClient.connect(dbUrl);
    try{
    var db=await client.db('mentorstudent');
    var data1=await db.collection('students').find({mentor:undefined}).toArray();   
    let x=await db.collection('mentors').find({name:name1}).toArray();  
    if(data1.length){      
      if(data1.length>1)  
       {       
    await db.collection('mentors').updateOne({name:name1},{$set:{studentsassigned:`${x[0].studentsassigned},${data1[0].name},${data1[1].name}`}})
    await db.collection('students').updateOne({name:data1[0].name},{$set:{mentor:name1}})
     await db.collection('students').updateOne({name:data1[1].name},{$set:{mentor:name1}})
      }else{ 
        await db.collection('mentors').updateOne({name:name1},{$set:{studentsassigned:`${x[0].studentsassigned},${data1[0].name}`}})
        await db.collection('students').updateOne({name:data1[0].name},{$set:{mentor:name1}})
      }
      res.send({
        statusCode:201,
        message:"Students added to a mentor successfully",
        data:x
      })  
    }else{
      res.send({
        statusCode:200,
        message:"All students are assigned with mentors",
        
      }) 
    }  
       
    }
    catch(error){
      res.send({
        statusCode:500,
        message:"Internal server error"
      })
    }
    finally{
      client.close();
    }
    })


module.exports = router;
