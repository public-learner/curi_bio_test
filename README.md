# Curi Bio Assignment

### Execution

1. Git clone <https://github.com/public-learner/curi_bio_test.git>
2. run ```npm install```
3. run ```nodemon app.js``` server's running on port 3004
4. server's running on port 3004

### A typical top-level directory layout
    .
    ├── db                      # db manager file connects the sqlite db file and create some sample rows
    ├── router                  # router file contains APIs
    ├── validation              # form validation for API request data
    ├── middleware.js           # jwt authentication middleware
    ├── app.js                  # Entry point of application
    └── README.md

### How to do API test
Test case is included in test file
Run the default test cases or make your own case