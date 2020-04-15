import { EmailSettings } from './email-settings.interface';

export interface Config {
  ENDPOINT: string;
  API_KEY: string;
  APP_NAME: string;
  EMAIL: EmailSettings;
}
