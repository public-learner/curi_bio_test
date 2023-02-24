const loginValidation = [
    check('email', 'Not email form').isEmail(),
    check('password').isLength({min: 8}).withMessage('Password Must be at Least 8 Characters'),
];