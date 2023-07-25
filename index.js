const express = require('express');
const {body, validationResult, matchedData} = require('express-validator');
const session = require('express-session')
const flash = require('express-flash')
let ejs = require('ejs'); 


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
        (req, res, next)=>{
            const validation = validationResult(req)
            console.log(validation);
            if( !validation.isEmpty() ) {
                req.flash('errors', validation.errors)
                res.redirect('/')
            } else {
                res.send(matchedData(req))
            }
        }
)


app.get('/', (req, res)=>{
    ejs.renderFile(__dirname+'/public/page.ejs', {errors: req.flash('errors')}, (err, result)=>{
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
        res.end(result)
    })
}) 

app.listen(3000)