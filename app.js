const mongoose = require("mongoose");
const express = require("express");
const overRide = require("method-override");
const path = require("path");
const ejsMate=require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
// const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const passport = require("passport");
const passportLocal = require("passport-local");

const multer = require("multer");
const {storage} = require("./cloudConfig");
const upload = multer({storage});
if(process.env.NODE_ENV != 'production'){
    require("dotenv").config();
}
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_API;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });
const dataBaseURL = process.env.DataBaseUrl;
////////////////////////////////////////////////////
const ExpressError = require("./ExpressError");
const model = require("./models/model");
const reviewModel = require("./models/reviewsModel");
const user = require("./models/userModel");
const {listingSchema,reviewSchema} = require("./joiSchema");

//////////////////////// CREATING APP ( WEB APPLICATION ) ////////////////////////////

const app=express();

app.listen(8000,()=>{
    console.log("connected to port 8000");  
})

////////////////////////// CONNECTING MONGO DB TO WEB ///////////////////////////////

async function hell(){
    await mongoose.connect(dataBaseURL);
}
hell().then(()=>{
    console.log("connection established successfully with airbnb");
});

/////////////////////////////////////////////////////////////////////////////////////

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(overRide('_method'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.engine('ejs',ejsMate);

///////////////////////////////// SESSION CREATION /////////////////////////////

const store = MongoStore.create({
    mongoUrl: dataBaseURL,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*60*60,
});
store.on("error",()=>{
    console.log("Error in mongo session store", err);
});
app.use(session({
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}));

/////////////////////////////////////////////////////////////////////////////////////
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

//////////////////////////// THINGS THAT WILL EXECUTE ON EVERY REDIRECT OR NEW PAGE VISIT //////////////////

app.use("/",(req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.reqUser = req.user;// used to display signup login / logout && listingOwner
    next();
});
app.use("/",(req,res,next)=>{
    if(req.originalUrl === "/allLists"){
        res.locals.isRouteAllLists = true ;
    }
    else{
        res.locals.isRouteAllLists = false ;   
    }
    return next();
});

///////////////////////// ERROR HANDLING ASYNCWRAP FUNCTION //////////////////////////

function asyncWrap(func){
    return function(req,res,next){
        func(req,res,next).catch((err)=>{
            next(err);
        });
    };
}

//////////////////////////// ALL MIDDLEWARE FUNCTIONS /////////////////////////////////

function isLoggedIn(req,res,next){
    if(!req.isAuthenticated()){
        if(req.method !== "GET"){
            let {listId} = req.params;
            req.session.originalUrl = `/listInfo/${listId}`;
        }
        else{
            req.session.originalUrl = req.originalUrl;
        }
        req.flash("error","Login first to do any changes in listings");
        res.redirect("/login");     
    }
    else{
       return next();
    }   
}
function sessionToLocalsTransfer(req,res,next){
    // console.log(req.session.originalUrl);
    res.locals.originalUrl = req.session.originalUrl || "/allLists";
    return next();
}
async function isOwner(req,res,next){
    let {listId}=req.params;
    let listingInformation = await model.findById(listId);
    if(!req.user._id.equals(listingInformation.owner._id)){
        req.flash("error","You are not the owner of the list");
        return res.redirect(`/listInfo/${listId}`);
    }
    return next();
}
async function isReviewOwner(req,res,next){
    let {id,listId}= req.params;
    let reviewInformation = await reviewModel.findById(id);
    if(!(req.user._id.equals(reviewInformation.user))){
        req.flash("error","You did not created this review");
        return res.redirect(`/listInfo/${listId}`);
    }
    return next();
}
 
////////////////////////////// ROOT ROUTE //////////////////////////////////

// app.get("/",(req,res)=>{
//     res.send("welcome to root");
// });

//////////////////////// LIST DETAILS ROUTES /////////////////////////

app.get("",(req,res)=>{
    res.redirect("/allLists");
});

app.get("/allLists",asyncWrap(async (req,res)=>{
    let result= await model.find();
    res.render("listings/allLists.ejs",{lists: result});
})
);
app.get("/listInfo/:id",asyncWrap(async(req,res)=>{
    let {id}=req.params;
    let result= await model.findById(id).populate({path:"reviews", populate:{path:"user"}}).populate("owner").catch((err)=>{
    }); 
    if(result == null){
        // throw new ExpressError(401," 401 Page Not Found");
        req.flash("error","The listing you are searching for is not found!!");
        res.redirect("/allLists");
    }
    res.render("listings/listInfo.ejs",{individualList:result});
}));

///////////////////////// NEW LIST CREATION ROUTES /////////////////////

app.get("/newList",isLoggedIn,(req,res)=>{
    res.render("listings/newListForm.ejs");
});

app.post("/newList",upload.single("listing[image]"),asyncWrap(async(req,res,next)=>{
    // let validateResult = listingSchema.validate(req.body);
    // if(validateResult.error){
    //     throw new ExpressError(402,validateResult .error);
    // }
    let response = await geoCodingClient.forwardGeocode({
        query: `${req.body.listing.location},${req.body.listing.country}`,
        limit: 1
      })
        .send()

    let{path:url,filename}= req.file;
    let newOne = new model(req.body.listing);
    newOne.owner = req.user._id;
    newOne.image = {url,filename};
    newOne.geometry = response.body.features[0].geometry;

   let respond= await newOne.save();
    req.flash("success","Listing successfully added!");
    res.redirect("/allLists");
}));

////////////////////// EDIT LIST ROUTES ///////////////////////

app.get("/editList/:listId",isLoggedIn,isOwner,asyncWrap(async(req,res)=>{
    let {listId} = req.params;
    let result = await model.findById(listId).catch((err)=>{
    });
    if(!result){
        req.flash("error","The listing you wanted to edit is not found!!");
        return res.redirect("/allLists");
    }
    res.render("listings/editPage.ejs",{result}); 
})
);
app.patch("/editList/:listId",isLoggedIn,isOwner,upload.single("listing[image]"),asyncWrap(async(req,res)=>{
    // let validateResult = listingSchema.validate(req.body);
    // if(validateResult.error){
    //     throw new ExpressError(402,validateResult.error);
    // }
    console.log("hello");
    let {listId}=req.params;
    let editedOne=req.body.listing;
    let editedList = await model.findByIdAndUpdate(listId,editedOne,{runValidators:true});
    if(typeof req.file !== "undefined"){
    let{path:url,filename}= req.file;
    editedList.image = {url,filename};
    await editedList.save();
    }
    req.flash("success","Listing successfully updated!");
    res.redirect("/allLists");
}));

//////////////// LIST DELETE ROUTE /////////////////////////

app.delete("/listing/:listId",isLoggedIn,isOwner,asyncWrap(async(req,res)=>{
    let {listId}=req.params;
    await model.findByIdAndDelete(listId);
    req.flash("error","Listing successfully deleted !!");
    res.redirect("/allLists");
}));

///////////////// REVIEW ROUTES ////////////////////////

app.post("/listing/:listId/review",isLoggedIn,asyncWrap(async(req,res)=>{
    let {listId} = req.params;
    let foundList = await model.findById(listId);
    let validateResult = reviewSchema.validate(req.body);
    if(validateResult.error){
        throw new ExpressError(402, validateResult.error);
    }
    let addReview = new reviewModel(req.body.review); 
    addReview.user = req.user._id;
    foundList.reviews.push(addReview);

    await foundList.save();
    await addReview.save();
    req.flash("success","review successfully added!");
    res.redirect(`/listInfo/${listId}`);
})
);
app.delete("/review/:id/:listId",isLoggedIn,isReviewOwner,asyncWrap(async(req,res)=>{
    let {id,listId} = req.params;
    let response = await reviewModel.findByIdAndDelete(id);
    await model.findByIdAndUpdate(listId,{$pull:{reviews:id}});
    req.flash("error","review deleted !!");
    res.redirect(`/listInfo/${listId}`);
}));

////////////////////// SIGN UP ROUTES ////////////////

app.get("/signup",(req,res)=>{
    res.render("users/signUp.ejs");
});
app.post("/signup",asyncWrap(async(req,res,next)=>{
    let {signupUser} = req.body;
    let kothaUser = new user({
        email : signupUser["email"],
        username : signupUser["username"],
    });
    await user.register(kothaUser,signupUser["password"]).catch((error)=>{
        req.flash("error",error.message);
        res.redirect("/signup");
    });
    req.login(kothaUser,(err)=>{
        if(err)
            next(err);
        else{
            req.flash("success","Welcome to Wanderlust");
            res.redirect("/allLists");
        }  
    })
}));

/////////////////// LOGIN ROUTES ///////////////////

app.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});
app.post("/login",sessionToLocalsTransfer,passport.authenticate("local",{failureRedirect:"/login",  failureFlash:true}),async (req,res)=>{
    req.flash("success","welcome back to wanderlust");
    res.redirect(res.locals.originalUrl);
});

///////////////// LOGOUT ROUTE ////////////////////

app.get("/logout",(req,res)=>{
    req.logout((err)=>{
    if(err){
        return next(err);
    }else{
        req.flash("success","Logged out successfully");
        res.redirect("/allLists");
    }
   });
});

/////////////////  ERROR HANDLING ROUTES //////////////////

app.all("*",(req,res)=>{
    throw new ExpressError(401,"401 Page Not Found");
});
app.use((err,req,res,next)=>{
    // let {status = 500, message="something went wrong"}= err; 
    res.render("listings/errorPage.ejs",{err});
});
