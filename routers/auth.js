const express = require('express');
const router = express.Router();


router.post('/check',function(req,res) {
    res.send({success:1});
});


module.exports = router;