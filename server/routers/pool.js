const {Pool} = require('../models/pool');
const express = require('express');

const router = express.Router();


router.post('/incremant', async (req,res) => {
  // res.send(await Pool.findOneAndUpdate({}, {$inc: {total: 1}}, {new: true}));
    

});



module.exports = router;