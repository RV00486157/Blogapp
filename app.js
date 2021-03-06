const express = require("express"),
	  app = express(),
	  mongoose = require("mongoose"),
	  bodyParser = require("body-parser"),
	  methodOverride=require("method-override"),
	  expressSanitizer=require("express-sanitizer"),
	  dotenv = require('dotenv');


dotenv.config();	
//App Config	
//mongoose.connect("mongodb://localhost/blog_app", {useNewUrlParser: true});
const password=process.env.PASSWORD;
mongoose.connect("mongodb+srv://user_rev:"+password+"@cluster0-crjfc.mongodb.net/test?retryWrites=true&w=majority",{
	useNewUrlParser: true,
	useCreateIndex:true
}).then(()=>{
	console.log("Connected to DB");
}).catch(err=>{
	console.log(err.message);
});


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
//should go after bodyParser
app.use(expressSanitizer());
mongoose.set('useFindAndModify', false);

//MONGOOSE Config
var blogSchema = new mongoose.Schema({
	title : String,
	image : String,
	body : String,
	created : {type: Date, default: Date.now}
});

var Blog = mongoose.model("blog", blogSchema);


//Routes
app.get("/",(req,res)=>{
	res.redirect("/blogs");
});

app.get("/blogs",(req,res)=>{
	Blog.find({}, (err,blogs)=>{
		if(err){
			console.log(err);
		}else{
			res.render("index", {blogs: blogs});
		}
	});
	
});

app.get("/blogs/new",(req,res)=>{
	res.render("new");
});

app.post("/blogs",(req,res)=>{
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog,(err,newBlog)=>{
		if(err){
			res.render("new");
		}else{
			res.redirect("/blogs");
		}
	});
});

app.get("/blogs/:id", (req,res)=>{
	Blog.findById(req.params.id, (err,foundBlog)=>{
		if(err)			  {
			res.redirect("/blogs");
		}else{
			res.render("show", {blog : foundBlog});
		}
	});
});

app.get("/blogs/:id/edit", (req,res)=>{
	Blog.findById(req.params.id, (err,foundBlog)=>{
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit", {blog : foundBlog});
		}
	});
});

app.put("/blogs/:id", (req,res)=>{
	req.body.blog.body = req.sanitize(req.body.blog.body);
	 Blog.findByIdAndUpdate(req.params.id,req.body.blog,(err, updatedBlog)=>{
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/" + req.params.id);
		}					   
	});
});

app.delete("/blogs/:id", (req,res)=>{
	Blog.findByIdAndRemove(req.params.id,(err)=>{
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");	
		}
	});
});


// app.listen(process.env.PORT || 3000,()=>{
// 	console.log("Server running");
// });

var server_port = process.env.PORT || 3000;
var server_host = '0.0.0.0';
app.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
});
