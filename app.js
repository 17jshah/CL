//require modules
const express = require("express");
const morgan = require("morgan");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const storyRoutes = require("./routes/storyRoutes");
const requestRoutes = require("./routes/requestRoutes");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const session = require("express-session");
const Request = require("./models/request");

//create app
const app = express();

//configure app
let port = 3000;
let host = "localhost";
app.set("view engine", "ejs");

//connect to database
mongoose
  .connect("mongodb://localhost:27017/CL", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, host, () => {
      console.log("Server is running on port", port);
    });
  })
  .catch((err) => console.log(err.message));

//mount middlware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "jiaru90aeur90ef93oioefe",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
    store: new MongoStore({
      mongoUrl: "mongodb://localhost:27017/CL",
    }),
  })
);

app.use(flash());

app.use((req, res, next) => {
  console.log(req.session);
  res.locals.successMessages = req.flash("success");
  res.locals.errorMessages = req.flash("error");
  next();
});

//set up routes
app.get("/", (req, res) => {
  res.render("index");
});

app.use("/requests", requestRoutes);

app.use("/stories", storyRoutes);

app.use((req, res, next) => {
  let err = new Error("The server cannot locate " + req.url);
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  if (!err.status) {
    err.status = 500;
    err.message = "Internal Server Error";
  }

  res.status(err.status);
  res.render("error", { error: err });
});

//start the server
