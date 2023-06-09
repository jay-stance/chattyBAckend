import mongoose from 'mongoose';

import { config } from './config';

const logger = config.createLogger('database-Connection');

export default () => {
  const connect = () => {
    // db connect
    mongoose
      .connect(config.MONGODB_URL)
      .then(() => logger.info('connected to ddb'))
      .catch((error) => {
        logger.error('error connecting with db', error);
        return process.exit();
      });
  };

  connect();

  mongoose.connection.on('disconnected', connect);
};
