const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/user-routes');

const app = express();
const port = 5000;

// tell the application what type of exchange formats would
// be used for post requests

app.use(express.json());
app.use('/users', userRouter);

mongoose.connect(
  "mongodb+srv://admin:yNOQ7GAkC0X0u007@users.ana4s8b.mongodb.net/?retryWrites=true&w=majority"
).then(
    () => app.listen(
        port,
        () => console.log(`Connected and listening on port ${port}`)
    )
).catch((err) => console.log(err));