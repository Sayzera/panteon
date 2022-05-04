const { User } = require('../models/users');
const { Pool } = require('../models/pool');
const DailyEarning = require('../models/daliy_earning');
const express = require('express');
const { default: axios } = require('axios');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const redis = require('redis');
const { findByIdAndUpdate } = require('../models/daliy_earning');

const client = redis.createClient(
{
  url:'redis://:pc925be956953cd4e17a5f383aa5f828dac79c04db1bfefff8691d7d18866d5fc@ec2-54-163-171-22.compute-1.amazonaws.com:19539'
}
);

let value = '';

(async () => {
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
})();

router.post('/list-redis', async (req, res) => {
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

router.post('/list', async (req, res) => {
  res.send({ users: JSON.parse(await client.get('users')) });
});


router.post('/user-generator/:count?', async (req, res) => {
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
      age: element.dob.age,
    });
    user = await user.save();

    if (!user) {
      return res.send({ error: 'User not created' });
    }
  });

  res.status(200).send({ success: 1 });
});


router.post('/daily-earning',   async (req, res) => {
  let users = await User.find();
  let count = 0;
  let total_earnings = 0;

  users.forEach(async (element,item) => {

   
    let daily_earnings = 0;

    let rnd = Math.floor(Math.random() * (3 - 1)) + 1;

    if (rnd == 1) {
      daily_earnings = Math.floor(Math.random() * 100);
      total_earnings += daily_earnings;
    } else {
      daily_earnings = Math.floor(Math.random() * 100) * -1;
    }
  
    DailyEarningAdd(element._id, daily_earnings);

    let user = await User.findByIdAndUpdate(element._id, {
      $inc: { money: daily_earnings },
      daily_earnings: daily_earnings,
    });

    count++;
    if (count == users.length) {
     
      userListRedis();
      let pool_add = (total_earnings * 2) / 100;
      // günlük kazançların toplamının %2'ye bölümünden kalanını alıyoruz.
      BankAccount(pool_add,total_earnings);

      res.send({ success: 1 });
    }
  });




});

async function BankAccount(poolPrice,total) {
  let pool = await  Pool.findOneAndUpdate(
  {},
  {
    $inc : {
      subTotal: poolPrice,
      total: total,
    }
  },
  {new: true}
  )

  await pool.save();

}


async function DailyEarningAdd(userId, money) {
  let dailyEarning = new DailyEarning({
    user: userId,
    amount: money,
    date: new Date(),
  });

  await dailyEarning.save();
}


router.post('/user-detail/:id', async (req, res) => {
  try {
    let user = await User.findById({ _id: req.params.id });
    if (!user) {
      return res.send({ error: 'User not found', success: 0 });
    }

    // son 5 günlük gelir
    let userDailyDetails = await userDailyAmount(user._id);

    return res.send({
      user: user,
      success: 1,
      userDailyDetails: userDailyDetails,
    });
  } catch (error) {
    return res.send({ error: 'User not found', success: 0 });
  }
});




async function userDailyAmount(userId) {
  let detail = await DailyEarning.find({ user: userId })
    .sort({ date: -1 })
    .limit(5)
    .select('amount date');

  if (!detail) {
    return null;
  }
  return detail;
}

async function getRandomUserApi(count) {
  let response = await axios.get('https://randomuser.me/api/?results=' + count);
  let users = await response.data;

  return users;
}

// login
router.post('/login', async (req, res) => {
  let { username, password } = req.body;
  let user = await User.findOne({ username }); // -hashPassword cevap içinde getirme

  // username ile eşleşen bir user yoksa
  if (!user) {
    return res.send({ message: 'User not found', success: 0 });
  }

  // password doğru değilse
  if (user && !bcrypt.compareSync(password, user.hashPassword)) {
    return res.send({ message: 'Password incorrect', success: 0 });
  }
  // login başarılı ise token oluşturup gönder
  const token = jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d', // 1 gün geçerli
    }
  );

  return res.send({ token, success: 1, user: user });
});

module.exports = router;
