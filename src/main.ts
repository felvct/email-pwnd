import axios, { AxiosPromise, AxiosResponse } from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import { promisify } from 'util';
import breachedAccounts from '../breached-accounts.json';
import CONFIG from '../config/dummy.json';
import { IBreachInformation, IEmailSettings } from './interfaces/index';
import { createTransport, SendMailOptions } from 'nodemailer';

const BREACH_URL: string = 'https://haveibeenpwned.com/api/v2/breachedaccount';
const EMAIL_SETTINGS: IEmailSettings = CONFIG.emailSettings;
const writeFile = promisify(fs.writeFile);

// set default user-agent for each request
axios.defaults.headers.common['User-Agent'] = 'email-pwnd';

let accounts: string[] | string = CONFIG.accounts;

const transporter = createTransport({
  host: EMAIL_SETTINGS.host,
  port: EMAIL_SETTINGS.port,
  secure: false,
  requireTLS: true,
  auth: {
    user: EMAIL_SETTINGS.user,
    pass: EMAIL_SETTINGS.password,
  },
});

const mailOptions: SendMailOptions = {
  from: `"email-pwnd" <${EMAIL_SETTINGS.address || EMAIL_SETTINGS.user}>`,
  to: EMAIL_SETTINGS.user,
  subject: 'New breached emails',
  text: 'One of your emails was breached. Please see the attachment for more information.',
  attachments: [{
    filename: 'breached-accounts.json',
    content: '',
  }],
};

function sendEmail(): void {
  if (!EMAIL_SETTINGS.user || !EMAIL_SETTINGS.password) {
    console.error('Could not send email, please take a look at your email settings.');
    return;
  }

  // parse latest breached-accounts.json state
  mailOptions.attachments[0].content = JSON.stringify(breachedAccounts);

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error(`An error occured while sending your email ${error.message}`);
      return;
    }
    console.log('Your email was send, please check your inbox.');
  });
}

async function getAccountBreaches(account: string): Promise<any> {
  try {
    const response: AxiosResponse = await axios.get(`${BREACH_URL}/${account}`);
    if (response.status === 200 && response.data) {
      const breachInfo: IBreachInformation[] = response.data;

      console.log(`That sucks! ${account} has been breached ${breachInfo.length} time(s):`);

      (breachInfo as IBreachInformation[]).forEach((breach: IBreachInformation) => {
        if (breach && Object.keys(breach).length) {
          console.log(`- from: ${breach.Name}`);
          console.log(`- domain: ${breach.Domain}`);
          console.log(`- at: ${breach.AddedDate}`);
          console.log(`- compromised data: ${breach.DataClasses}`);
          console.log(`- ${breach.Description}`);
          console.log('------');
          breach.Account = account;
          breach.Id = generateId(breach);
        }
      });

      return breachInfo;
    }
    return [];
  } catch (error) {
    // the API is returning 404 if your account could not be found
    // and has therefore not been pwned
    if (error.response.status === 404) {
      console.log(`Congrats! ${account} was not (yet) breached`);
      console.log('------');
      return;
    }
    console.error(`Error while checking if ${account} has been pwned:`, error);
    throw error;
  }
}

function generateId(breachedAccount: IBreachInformation): string {
  let id: string = `${breachedAccount.Account}.${breachedAccount.Domain}.${breachedAccount.AddedDate}`;
  id = crypto.createHash('md5').update(id).digest('hex');
  return id;
}

async function updateJsonFile(newBreachedAccounts: IBreachInformation[]): Promise<boolean> {
  try {
    breachedAccounts.version += 1;
    breachedAccounts.created = Date.now();
    (breachedAccounts.breaches as IBreachInformation[]) = [...breachedAccounts.breaches, ...newBreachedAccounts];
    breachedAccounts.totalBreaches = breachedAccounts.breaches.length;

    const updatedJson: string = JSON.stringify(breachedAccounts, null, 2);
    await writeFile('breached-accounts.json', updatedJson);
    return true;
  } catch (error) {
    throw error;
  }
}

if (!Array.isArray(accounts)) {
  accounts = [accounts];
}

const checkedAccounts: AxiosPromise[] = [];
accounts.forEach((account) => checkedAccounts.push(getAccountBreaches(account)));

// resolve all promises even if we ran into a catch block during our requests
// we are using this since non breached accounts are referred as 404 from the API
Promise.all(checkedAccounts.map((promise) => Promise.resolve(promise).catch((_) => _)))
.then((pwnedAccounts: IBreachInformation[]) => {
  let newBreachedAccounts: IBreachInformation[] = [];

  pwnedAccounts = pwnedAccounts.filter((account) => account);
  // Flatten two-dimensional array
  pwnedAccounts = [].concat(...pwnedAccounts);

  if (pwnedAccounts && pwnedAccounts.length && breachedAccounts.breaches && breachedAccounts.breaches.length) {
    newBreachedAccounts = pwnedAccounts.filter((pwned) => !breachedAccounts.breaches.find((breach) => pwned.Id === breach.Id));
  } else {
    newBreachedAccounts = pwnedAccounts;
  }

  if (!newBreachedAccounts.length) {
    console.log('No new breached accounts');
    return false;
  }

  return updateJsonFile(newBreachedAccounts);
})
.then((newBreaches: boolean) => {
  if (newBreaches) {
    sendEmail();
  }
})
.catch((error) => console.error('Something went wrong while writing the JSON file:', error));
