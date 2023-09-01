
require('dotenv').config();

const express =require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const app=express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set("view engine","ejs");
const val=process.env.MONGO_URI;
var nodemailer = require('nodemailer');
const mapboxgl = require('mapbox-gl');
app.use(cors({origin:"*"}));

console.log(val);
mongoose.connect(val,{
  useNewUrlParser:true,
  useUnifiedTopology:true
});
const busroutes = mongoose.model('Busroutes', {
    _id:Number,
    Route_No: String , 
    Starting_Point:String,
    Boarding_Points:Array,
    maplink:String
});
const busrou = mongoose.model('Busrou', {
  _id:Number,
  Route_No: String , 
  Starting_Point:String,
  Boarding_Points:Array,
  maplink:String
});

const admin = mongoose.model('admin', {
  _id:Number,
  password:String,
  routes:Array
});

/* 
  const kitty = new admin({ 
    _id:1,
    password:"stjoseph@123"
  });
    kitty.save().then(() => console.log(ele._id));*/


let authientication;
let totaldatas;

/*
data.forEach((ele)=>{
  const kitty = new busrou({ 
    _id:ele._id,
    Route_No: ele. Route_No , 
    Starting_Point:ele.Starting_Point,
    Boarding_Points:ele.Boarding_Points });
    kitty.save().then(() => console.log(ele._id));

})
*/




app.get('/',function(req,res){
  authientication=false;

 
  busroutes.find().then (function(data){
    /*data=JSON.stringify(data)
    //data=JSON.parse(data);
    console.log(data);
    res.send(data);
    */

    res.render("routes",{
      arrayOfDatas:data
    })});

  })



  app.get("/login",(req,res)=>{
    authientication=false;
    res.render("login");
  })





  app.post("/login",(req,res)=>
  {

    admin.findById({_id:1}).then((data)=>{
      const word=data.password;

      if( req.body.password==word){
        authientication=true;
      }
      else{
        authientication=false;
      }
      if(authientication==true){
      res.redirect("/admin");
      }
      else{
        res.render("error",{
          image: "xE5CD",
          mainTitle:"Sorry !",
          info:"Your  password is incorrect.",
          buttons:"Retry",
          home:"Home"
         });
      }

    })
  })


  app.get("/admin",(req,res)=>{
    if(authientication==true){
     
  busroutes.find().then (function(data){
    totaldatas=data.length;
    console.log(totaldatas);
    res.render("admin",{
      arrayOfDatas:data
    })});
      }
      else{
       
       res.render("error",{
        image: "xE5CD",
        mainTitle:"wrong",
        info:"You are not admin. please login.",
        buttons:"Login",
        home:"Home"
       });
      }

  });


app.post("/admin",(req,res)=>
{
  
  let operation1=req.body.but_opt;
  let operation2=req.body.deleting;
 
  if(operation1=="newroute"){
    totaldatas+=1;
    res.redirect("/newroute");
  }
  else if(operation1=="Remove") 
  {
    let a=Array.isArray(operation2);
    if(a==false){
      busroutes.findByIdAndRemove(operation2)
      .then(()=>{
        res.render("readmin",{
          image: "10004",
          mainTitle:"Success",
          info:"Selected datas removed successfully",
          buttons:"Admin",
          home:"Home"
         });
      })
    }else
    {
     async function deletion() 
     { 
       for (let ids of operation2) {
        await busroutes.findByIdAndRemove(ids);
      }
    }
    deletion()
    .then(()=>{
      res.render("readmin",{
        image: "10004",
        mainTitle:"Success",
        info:"Selected datas removed successfully",
        buttons:"Admin",
        home:"Home"
       });
    })

    }
  }
  else if(operation1=="reset")
  {
    async function reseting()
    {
     await busroutes.deleteMany({});
     let duplicateDatas=await busrou.find();
       duplicateDatas.forEach(element => 
        { 
          busroutes.insertMany(element);
        });
     
    }
    reseting()
    .then(()=>
    {
      res.render("readmin",{
        image: "10004",
        mainTitle:"Success",
        info:"Datas are resetted successfully",
        buttons:"Admin",
        home:"Home"
       });
    }
    )
  }
  else{
    let editingroute=req.body.editbutton;
    busroutes.findById(editingroute)
    .then((data)=>{
      res.render("editroutes",{
        id:data._id,
        title:data.Starting_Point
      })
    })
  }
})

app.get("/passwords",(req,res)=>{
  res.render("passwords",{
    image: "xf075",
    mainTitle:"Verify",
    info:"Password for admin login will be sent to bus@stjosephs.ac.in",
    buttons:"Send",
    home:"Login"
   });
})

app.post("/passwords",(req,res)=>
{
  admin.findById({_id:1}).then((data)=>{
    var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.user,
        pass: process.env.pass
      }
    });
  
      var mailOptions = {
        from: 'bus@stjosephs.ac.in',
        to: 'bus@stjosephs.ac.in',
        subject: 'Request for password',
        text:`admins password for bus routes is : ${data.password}.`
      }
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

  }).then(()=>{
    res.redirect("/");
  })


})

app.post("/map", (req, res) => {
  let clickedmap = req.body.mapbutton;
 // console.log(clickedmap);
  busroutes.findById(clickedmap).then((data) => {
    const apiUrl = data.maplink;
   // console.log(apiUrl);
    res.render('maps',
    { maplink: apiUrl,
      arrayOfDatas:data
     });
  });
});



app.get("/newroute",(req,res)=>{
  if(authientication==true){
    res.render("newroute");
  }
  
})
app.post("/newroute",(req,res)=>{
  let routeno=req.body.routeno;
  let startingpoint=req.body.startingpoint;
  let boardingpoints=req.body.boardingpoints;
  let maplinks=req.body.maplink;
  let boardingpointsarray=boardingpoints.split(",");
     const kitty = new busroutes({ 
      _id:totaldatas,
      Route_No:routeno, 
      Starting_Point:startingpoint,
      Boarding_Points:boardingpointsarray,
      maplink:maplinks
      });
      kitty.save()
    
          .then(()=>{
            res.render("readmin",{
            image: "10004",
            mainTitle:"Success",
            info:"New route added successfully",
            buttons:"Admin",
            home:"Home"
          });
    
    })     
});

app.post("/editroute",(req,res)=>
{
     let id=req.body._id;
     let routeno=req.body.routeno;
     let startingpoint=req.body.startingpoint;
     let boardingpoints=req.body.boardingpoints;
     boardingpointsarray=boardingpoints.split(",");
    
    boardingpointsarray=boardingpoints.split(",");
     
     busroutes.findByIdAndUpdate(id,
      { Route_No:routeno, 
        Starting_Point:startingpoint,
        Boarding_Points:boardingpointsarray
      })
        .then(()=>
         {
            res.render("readmin",
            {
              image: "10004",
              mainTitle:"Success",
              info:"Old route has been edited successfully",
              buttons:"Admin",
              home:"Home"
            });
          })
});


app.get("/developedby",(req,res)=>{
  res.render("dev");
})

app.get('/dev/:id',(req,res)=>{
  res.render(req.params.id);
})



    app.listen(3001, ()=> {
      console.log(`Server started on port  `);
    });

