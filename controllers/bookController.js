const Book = require('../models/book.js');
const Review = require('../models/review.js');
const Publisher = require('../models/publisher.js');
const Author = require('../models/author.js');
const Category = require('../models/category.js');
const User = require('../models/user.js');
const Seller = require('../models/seller.js');

// get all books
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find({}).populate('publisher').populate('authors').populate('categories');
        // send books to books.ejs
        res.render('books', { title: 'Books', books: books });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

// get book by id
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('publisher').populate('authors').populate('categories').populate('seller');
        // send book to bookInstance.ejs with its reviews
        // get reviews with book id = req.params.id and store each user's username in reviews
        const reviews = await Review.find({book: req.params.id}).populate('user', 'username');
        res.render('bookInstance', { title: 'Book Instance', book: book, reviews});
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

// get book by title
exports.getBookByTitle = async (req, res) => {
    try {
        const book = await Book.findOne({title: req.params.title});
        res.status(200).json(book);
    } catch (err) {
        res.status(500).json(err);
    }
}

// get book by author
exports.getBookByAuthor = async (req, res) => {
    try {
        const book = await Book.findOne({author: req.params.author});
        res.status(200).json(book);
    } catch (err) {
        res.status(500).json(err);
    }
}

// get book by publisher
exports.getBookByPublisher = async (req, res) => {
    res.send('get book by publisher');
}

// get book by category
exports.getBookByCategory = async (req, res) => {
    res.send('get book by category');
}

// create book
exports.createBook_get = async (req, res) => {
    // Check if user is logged in
    if (!req.user) {
        req.flash('error', 'You must be logged in to create a book');
        return res.redirect('/users/login');
    }
    else {
        // check if logged in user is a seller
        const seller = await Seller.findOne({user: req.user._id});
        if (!seller) {
            req.flash('error', 'You must be a seller to create a book');
            return res.redirect('/books');
        }
    }

    try {
        const authors = await Author.find({});
        const publishers = await Publisher.find({});
        const categories = await Category.find({});
        res.render('createBook', { authors, publishers, categories });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}
exports.createBook_post = async (req, res) => {
    try {
        const { title, isbn, description, authors, publisher, price, cover, categories, quantity } = req.body;
        const seller = await Seller.findOne({user: req.user._id});

        const newBook = new Book({
            title,
            isbn,
            description,
            authors,
            publisher,
            price,
            cover,
            categories,
            quantity,
            seller,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await newBook.save();

        req.flash('success', 'Book created successfully');
        res.redirect(`/books/${newBook._id}`);
    } catch (err) {
        console.log(err);
        req.flash('error', 'Error creating book');
        res.redirect('/books/create');
    }
}

// update book by id
exports.updateBook_get = async (req, res) => {
    res.send('update book get');
}
exports.updateBook_post = async (req, res) => {
    res.send('update book post');
}

// delete book by id
exports.deleteBook_get = async (req, res) => {
    res.send('delete book get');
}
exports.deleteBook_post = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('seller');

        if (!req.user) {
            req.flash('error', 'You are not authorized to delete this book');
            return res.redirect('/books');
        }

        if (req.user._id.toString() === book.seller.user._id.toString()) {
            // delete reviews of this book
            await Review.deleteMany({book: req.params.id});

            await Book.findByIdAndDelete(req.params.id);

            req.flash('success', 'Book deleted successfully');
            return res.redirect('/books');
        } else {
            req.flash('error', 'You are not authorized to delete this book');
            return res.redirect('/books');
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}