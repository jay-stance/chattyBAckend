import dotenv from 'dotenv';
import bunyan from 'bunyan';

dotenv.config({});

class Config {
  public MONGODB_URL: string;
  public JWT_TOKEN: string;
  public NODE_ENV: string;
  public SECRECT_KEY_ONE: string;
  public SECRECT_KEY_TWO: string;
  public CLIENT_URL: string;
  public REDIS_HOST: string;

  constructor() {
    this.MONGODB_URL = process.env.MONGODB_URL || '';
    this.JWT_TOKEN = process.env.JWT_TOKEN || '';
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.SECRECT_KEY_ONE = process.env.SECRECT_KEY_ONE || '';
    this.SECRECT_KEY_TWO = process.env.SECRECT_KEY_TWO || '';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.REDIS_HOST = process.env.REDIS_HOST || '';
  }

  public createLogger(name: string): bunyan {
    const logger = bunyan.createLogger({ name, level: 'debug' });
    return logger;
  }

  public validateConfig() {
    for (const [key, values] of Object.entries(this)) {
      if (values === '') {
        throw new Error(`Configuration ${key} is undefined`);
      }
    }
  }
}

export const config: Config = new Config();
