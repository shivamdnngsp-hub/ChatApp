import Redis from "ioredis";

let redis;

const connectRedis = async () => {
  try {
    redis = new Redis(process.env.REDIS_URL);
    console.log("redis connected");
  } catch (error) {
    console.log("error in connecting redis");
  }
};

export  { connectRedis, redis };
