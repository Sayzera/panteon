const { Pool } = require('../models/pool');
const { User } = require('../models/users');
const express = require('express');

const router = express.Router();

const redis = require('redis');

/**
 * Amazon Redis client
 */
const client = redis.createClient(
  {
    url:'redis://:pc925be956953cd4e17a5f383aa5f828dac79c04db1bfefff8691d7d18866d5fc@ec2-54-163-171-22.compute-1.amazonaws.com:19539'
  }
);

(async () => {
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
})();

/**
 * 
 * havuzda biriken paranın hesaplanması ve kullanıcılara dağıtılması 
 */
router.post('/give-rewar', async function (req, res) {
  let pool = await Pool.findOne({});
  
  if (!pool) {
    return res.send({ error: 'Pool not found', success: 0 });
  }

  let totalRewar = pool.subTotal;
  let firstUser  = (pool.subTotal * 20) / 100;
  let secondUser = (pool.subTotal * 15) / 100;
  let thirdUser  = (pool.subTotal * 10) / 100;

  let anotherUser = totalRewar - (firstUser + secondUser + thirdUser);

  anotherRewal = anotherUser / 97;

  let redisUsers = await client.get('users')
  JSON.parse(redisUsers).slice(0,100).forEach(async (item, index) => {
    if (index == 0) {
      await User.findByIdAndUpdate(item.id, {
        $inc: {
          money: firstUser,
        },
      });
    } else if (index == 1) {
      await User.findByIdAndUpdate(item.id, {
        $inc: {
          money: secondUser,
        },
      });
    } else if (index == 2) {
      await User.findByIdAndUpdate(item.id, {
        $inc: {
          money: thirdUser,
        },
      });
    } else {
      await User.findByIdAndUpdate(item.id, {
        $inc: {
          money: anotherRewal,
        },
      });

      console.log(index, redisUsers.length)
      if(100 == index + 1) {
        // işlem bittikten sonra ödül parasını havuzdan temizleme
        await cleanPool();
        // ödülü dağıttıktan sonra redisi güncelleme
        await setUserRedis();
        res.send({
          success: 1,
          message: 'Rewar given successfully',
        })
      }
    }
  });

});


async function cleanPool() {
   await Pool.findOneAndUpdate({},
    {
      $set: {
        subTotal: 0,
      }
    });
} 


async function setUserRedis() {
  let users = await User.find({}).sort({ money: -1 });
  await  client.set('users', JSON.stringify(users));
}
module.exports = router;
