const express = require("express");
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');
// All Authors Route
router.get("/", async function(req, res){
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ""){
        searchOptions.name = new RegExp(req.query.name, "i")
    };
    try{
        const authors = await Author.find(searchOptions);
        res.render("authors/index", {authors: authors, searchOptions: req.query})
    } catch {
        res.redirect("/");
    }
    /*
    Author.find(function(err, authors){
       
        
        if(err){
            console.log("error getting authors");
        } else {
            res.render("authors/index", {authors: authors});
        }
        
    })
    */
    
});

// New Author Route
router.get("/new", function(req, res){
    res.render("authors/new", {author: new Author()});
});

// Create Author Route
router.post("/", async function(req, res){
    const author = new Author({
        name: req.body.name
    })
    try{
        const newAuthor = await author.save();
        res.redirect(`authors/${newAuthor.id}`);
    } catch {
         
        res.render("authors/new", {
            author: author,
            errorMessage: "Error creating author"
        })
    }

   
    /*
    author.save(function(err, newAuth){
        if(err){
            
            res.render("authors/new", {
                author: author,
                errorMessage: "Error creating author"
            })
            
            console.log("something went wrong", err);
        } else {
            //res.redirect(authors/${newAuth.id});
            res.redirect("authors");
        }
    })
    */
});

router.get('/:id', async function(req, res){
    try{
        const author = await Author.findById(req.params.id);
        const books = await Book.find({author: author.id}).limit(6).exec();
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        });
    } catch(e) {
        console.error(e);
        res.redirect('/');
    }
   
});

router.get('/:id/edit', async function(req, res){
    try{
        const author = await Author.findById(req.params.id);
        res.render("authors/edit", {author: author});
       
    } catch{
        res.redirect('/authors');
    }
    
});

router.put('/:id', async function(req, res){
    let author
    try{
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        
        res.redirect(`/authors/${author.id}`);
    } catch(e) {
        console.error(e);
        if(author == null){
            res.redirect('/');
        } else {
            res.render("authors/edit ", {
                author: author,
                errorMessage: "Error updating author"
            })
        }
       
    }
});

router.delete('/:id', async function(req, res){
    let author
    try{
        author = await Author.findById(req.params.id);
        
        await author.remove();
        
        res.redirect(`/authors`);
    } catch(e) {
        console.error(e);
        if(author == null){
            res.redirect('/');
        } else {
            res.redirect(`/authors/${author.id}`)
        }
       
    }
});
module.exports = router;