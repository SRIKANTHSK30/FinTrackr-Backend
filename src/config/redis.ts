import { createClient } from 'redis';
import { env } from './env';

const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('Connected to Redis');
});

// Connect to Redis
redisClient.connect().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

export default redisClient;
