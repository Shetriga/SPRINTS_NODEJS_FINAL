const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const axios = require("axios");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const Auth = require("./Auth");

const auth = new Auth();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post(
  "/login",
  [check("email").isEmail(), check("password").isLength({ min: 8 })],
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(402).json({
        message: "Invalid Data",
      });
    }
    const { email, password } = req.body;

    const token = generateToken();
    auth.login();
    res.status(200).json({
      email,
      password,
      token,
    });
  }
);

app.post(
  "/registration",
  [check("email").isEmail(), check("password").isLength({ min: 8 })],
  (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    const result = validationResult(req);
    if (!result.isEmpty() || password !== confirmPassword) {
      return res.status(402).json({
        message: "Something is wrong with data",
      });
    }

    const token = generateToken();
    auth.login();
    res.status(200).json({
      success: true,
    });
  }
);

const generateToken = () => {
  return jwt.sign("Mahmoud", "This_is_a_secret");
};

app.get("/category", async (req, res, next) => {
  const response = await fetch("https://api.escuelajs.co/api/v1/products");
  let categories = await response.json();
  categories = filterCategories(categories);
  categories = categories.filter(
    (item, index) => categories.indexOf(item) === index
  );
  res.json({
    Categories: categories,
  });
});

app.get("/category/:id", async (req, res, next) => {
  const response = await fetch("https://api.escuelajs.co/api/v1/products");
  let ids = await response.json();
  ids = filterIds(ids);
  ids = ids.filter((item, index) => ids.indexOf(item) === index);
  res.json({
    IDs: ids,
  });
});

app.post(
  "/category",
  [check("name").isString().isLength({ min: 3 })],
  async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(402).json({
        message: "Something is wrong with data",
      });
    }

    if (auth.getLoginStatus() === false) {
      return res.status(402).json({
        message: "You are not logged in",
      });
    }

    const response = await fetch("https://api.escuelajs.co/api/v1/products");
    let data = await response.json();
    res.json({
      data: data,
    });
  }
);

const yesExists = async (cat_id) => {
  const response = await fetch("https://api.escuelajs.co/api/v1/products");
  const data = await response.json();
  let exists = false;
  data.map((e) => {
    if (e.category.id === cat_id) {
      exists = true;
    }
  });

  return exists;
};

app.post(
  "/products",
  [
    check("name").isString().isLength({ min: 3 }),
    check("price").not().isString(),
  ],
  async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(402).json({
        message: "Something is wrong with data",
      });
    }

    const { name, price, cat_id } = req.body;

    const categoryExists = await yesExists(cat_id);
    console.log(categoryExists);
    if (!categoryExists) {
      return res.status(402).json({
        message: "Category Does not exist",
      });
    }

    return res.status(402).json({
      message: "Requested is processed successfully!",
    });
  }
);

const filterCategories = (arr) => {
  let arr1 = arr.map((e) => e.category.name);
  return arr1;
};

const filterIds = (arr) => {
  let arr1 = arr.map((e) => e.category.id);
  return arr1;
};

app.get("/category", (req, res, next) => {});

app.listen(3000, () => {
  console.log(`Server is up and running on port 3000`);
});
