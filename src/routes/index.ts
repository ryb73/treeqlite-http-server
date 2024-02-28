import express from "express";

const router = express.Router();

/* GET home page. */
router.get(`/`, (req, res) => {
  res.contentType(`text/plain`);
  res.send(`Hello World!`);
  res.end();
});

export default router;
