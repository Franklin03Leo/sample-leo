var express = require("express");
const logger = require("./logger"); //Adding loggers
var router = express.Router();
var verifyToken = require("../commonjs/Verify_JWT"); //  To Verify Token
const { default: axios } = require("axios");

router.post("/", verifyToken, function (req, res, next) {
  try {
    axios.get(req.body.url).then(function (response) {
        res.send(response.data);
      }).catch(function (error) {
        res.send("0");
      });
  } catch (err) {
    logger.log("error", `${err}`);
  }
});
module.exports = router;
