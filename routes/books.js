const express = require("express");
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');


const imageMimeTypes = ['image/jpeg', "image/png", "images/gif"];

// All Books Route
router.get("/", async function(req, res){
    let query = Book.find()
    if(req.query.title != null && req.query.title != ""){
        query = query.regex('title', new RegExp(req.query.title, 'i'));
        
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ""){
        query = query.lte('publishDate', req.query.publishedBefore);
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ""){
        query = query.gte('publishDate', req.query.publishedAfter);
        
    }
    try{
        const books = await query.exec();
        
        res.render("books/index", {
            books: books,
            searchOptions: req.query
        })
    } catch(e) {
        console.error(e);
        res.redirect("/");
    }
   
});

// New Book Route
router.get("/new", async function(req, res){
   renderFormPage(res, new Book(), 'new');
    
});

// Create Book Route
router.post("/", async function(req, res){
   
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    });
    
    saveCover(book, req.body.cover)
    try{
        const newBook = await book.save();
        res.redirect(`books/${newBook.id}`)
        //res.redirect('books');
        
    } catch(e) {
        console.error(e);
        
        renderFormPage(res, book, 'new', true);
    }
});


// Show book route
router.get('/:id', async function(req, res){
    try{
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/show', {book: book})
    } catch(e){
        console.error(e);
        res.redirect('/')
    }
});

// Edit Book Route
router.get("/:id/edit", async function(req, res){
    try{
        const book = await Book.findById(req.params.id)
        renderFormPage(res, book, "edit");
    } catch(e){
        console.error(e);
        res.redirect('/');
    }
});

// Update Route
router.put("/:id", async function(req, res){
   
    let book 
    

    try{
        book = await Book.findById(req.params.id)
        
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        
        if (req.body.cover != null && req.body.cover !== ''){
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
        //res.redirect('books');
        
    } catch(e) {
        console.error(e);
        if(book != null){
            renderFormPage(res, book, 'edit', true);
        } else{
            res.redirect('/');
        }
        
    }
});


// Show book route
router.get('/:id', async function(req, res){
    try{
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/show', {book: book})
    } catch(e){
        console.error(e);
        res.redirect('/')
    }
});


// Delete Route
router.delete('/:id', async function(req, res){
    let book
    try{
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books');
    } catch (e){
        console.log(e);
        if(book != null){
            res.render('books/show',{
                book: book,
                errorMessage: "Could not remove book"
            });
        } else {
            res.redirect('/');
        }
    }
});


function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, "base64"),
        book.coverImageType = cover.type
    }
}

async function renderNewPage(res, book, hasError = false){
    try{
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) params.errorMessage = "there was an error creating book";
        res.render("books/new", params);
    } catch(e) {
        console.log(e);
        res.redirect('/books');
    }
}

async function renderEditPage(res, book, hasError = false){
    try{
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) params.errorMessage = "there was an error creating book";
        res.render("books/new", params);
    } catch(e) {
        console.log(e);
        res.redirect('/books');
    }
}

async function renderFormPage(res, book, form, hasError = false){
    try{
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        }
        if(hasError){
            if(form === "edit"){
                params.errorMessage = "there was an error updating book";
            } else {
                params.errorMessage = "there was an error creating book";
            }
        } 
        res.render(`books/${form}`, params);
    } catch(e) {
        console.log(e);
        res.redirect('/books');
    }
}
module.exports = router;