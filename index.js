const express = require('express');
const {body, validationResult, matchedData} = require('express-validator');
const session = require('express-session')
const flash = require('express-flash')
const ejs = require('ejs'); 
const {MongoClient, ServerApiVersion} = require('mongodb')
const client = new MongoClient("mongodb://localhost:27017/", {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }

})

 

const app = express();
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}))
app.use(flash())
 

app.post('/',
        body('email')
            .notEmpty().withMessage('Az email kötelező!')
            .isEmail().withMessage('Invalid email cím!'),

        body('name')
            .notEmpty().withMessage('A név kötelező!')
            .isLength({min: 2, max: 30}).withMessage('A név minimum 2 maximum 30 karakter lehet!'),

        body('password')
            .notEmpty().withMessage('A jelszó kötelező!')
            .isStrongPassword().withMessage('A jelszó nem elég erős!')
            .custom((value, {req})=>{
                    if( value !== req.body.password_confirmation ) {
                        throw new Error('A két jelszó nem egyezik!')
                    }
                    else 
                    return true;
                }),
        async (req, res, next)=>{
            await client.connect();
            const validation = validationResult(req)
            console.log(validation);
            if( !validation.isEmpty() ) {
                req.flash('errors', validation.errors)
                res.redirect('/')
            } else {
                const connection = client.db("register_example")
                const usersDoc = connection.collection('users')
                await usersDoc.insertOne( matchedData(req) )
                req.flash('success', 'Sikeres regisztráció!');
                res.redirect('/')
            }
        }
)


app.get('/', (req, res)=>{
    ejs.renderFile(__dirname+'/public/page.ejs', {errors: req.flash('errors'), success: req.flash('success')}, (err, result)=>{
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
        res.end(result)
    })
}) 

app.listen(3000)