const { User } = require('../models/users');
const DailyEarning = require('../models/daliy_earning');
const express = require('express');
const { default: axios } = require('axios');
const router = express.Router();
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

const redis = require('redis');
const client = redis.createCglient({
  url:'redis://:p682f993883cac7947f0e98fc24bf69d4a884207596b5571b721dfc88a25b9ea9@ec2-34-192-109-79.compute-1.amazonaws.com:31279'
});

let value = '';

(async () => {
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
})();

router.get('/list-redis', async (req, res) => {
 
  userListRedis();

  res.status(200).send({ success: 1 });
});

async function userListRedis() {
  let users = [];
  for await (const doc of User.find().sort({ money: -1 }).limit(5000)) {
    users.push({
      username: doc.username,
      money: doc.money,
      level: doc.level,
      exp: doc.exp,
      id: doc.id,
      email: doc.email,
      picture: doc.picture,
      country: doc.country,
      daily_earnings: doc.daily_earnings,
    });
  }

  await client.set('users', JSON.stringify(users));
}

router.get('/list', async (req, res) => {
  res.send({ users: JSON.parse(await client.get('users')) });
});

router.get('/user-generator/:count?', async (req, res) => {
  let users = await getRandomUserApi(req.params.count ?? 100);

  users.results.forEach(async (element) => {
    let money = Math.floor(Math.random() * (10000 - 1) + 1);
    let level = Math.floor(Math.random() * (100 - 1) + 1);
    let exp = Math.floor(Math.random() * (100 - 1) + 1);
    let score = Math.floor(Math.random() * (1000 - 1) + 1);

    let rnd = Math.floor(Math.random() * (10000 - 1) + 1);

    let user = new User({
      username: rnd + element.login.username,
      password: element.login.password,
      hashPassword: bcrypt.hashSync(element.login.password, 10),
      email: rnd + element.email,
      createdAt: element.dob.date,
      money,
      level,
      exp,
      picture: element.picture.large,
      country: element.location.country,
      state: element.location.state,
      city: element.location.city,
      score,
      gender: element.gender,
      age: element.dob.age
    });
    user = await user.save();

    if (!user) {
      return res.send({ error: 'User not created' });
    }
  });

  res.status(200).send({ success: 1 });
});

router.post('/daily-earning', async (req, res) => {
  let users = await User.find();
  let count = 0;

  users.forEach(async (element) => {
    let rnd = Math.floor(Math.random() * (3-1)) +1;
    let  daily_earnings = 0;
    let total_earnings = 0;
    if(rnd == 1) {
      daily_earnings = Math.floor(Math.random() * 100 );
      total_earnings += daily_earnings;

    } else {
      daily_earnings = Math.floor(Math.random() * 100 ) * -1;
    }

    await DailyEarningAdd(element._id, daily_earnings);

    let user = await User.findByIdAndUpdate(element._id, {
      $inc: { money: daily_earnings  },
      daily_earnings: daily_earnings,
    });

    count++;
    if (count == users.length) { 
      userListRedis();
      res.send({ success: 1 });
    }

  });

  // let pool_add = (total_earnings * 2) % 100;

});

async function DailyEarningAdd(userId,money) { 
  let dailyEarning = new DailyEarning({
    user: userId,
    amount: money,
    date : new Date()
  });

   await dailyEarning.save();

 
}


router.get('/user-detail/:id',async (req,res) => {

  try {
    let user = await User.findById({'_id':req.params.id});
    if(!user) {
      return res.send({ error: 'User not found',success:0 });
    }

    let userDailyDetails = await userDailyAmount(user._id);


     return  res.send({user: user, success: 1, userDailyDetails: userDailyDetails});
  } catch (error) {
      return res.send({ error: 'User not found', success: 0});
  }
})




async function userDailyAmount(userId) {
    let detail = await DailyEarning.find({'user':userId})
    .sort({'date':-1})
    .limit(5)
    .select('amount date')
  
    if(!detail) {
        return null
    } 
    return detail;
}



async function getRandomUserApi(count) {
  let response = await axios.get('https://randomuser.me/api/?results=' + count);
  let users = await response.data;

  return users;
}

module.exports = router;
