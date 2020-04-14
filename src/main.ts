import Axios, { AxiosError, AxiosResponse } from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import { createTransport, SendMailOptions, SentMessageInfo } from 'nodemailer';
import { EMPTY, forkJoin, from, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, concatMap, delay, finalize, map, mergeMap } from 'rxjs/operators';
import { promisify } from 'util';

import knownBreaches from '../breached-accounts.json';

import defaultConfig from './config/config.json';
import { Breach, Config } from './interfaces';

const { ENDPOINT, API_KEY, APP_NAME , EMAIL }: Config = require('./config/config');
const RATE_LIMIT_DELAY: number = 1750;
const ACCOUNTS: string[] = defaultConfig.accounts;

const writeFile = promisify(fs.writeFile);
const subscriptions: Subscription = new Subscription();

// set needed headers for each request
Axios.defaults.headers.common['User-Agent'] = APP_NAME;
Axios.defaults.headers.common['hibp-api-key'] = API_KEY;

const breachedAccounts: Breach[][] = [];
const transporter = createTransport({
  host: EMAIL.host,
  port: EMAIL.port,
  secure: false,
  requireTLS: true,
  auth: {
    user: EMAIL.user,
    pass: EMAIL.password,
  },
});
const mailOptions: SendMailOptions = {
  from: `"email-pwnd" <${EMAIL.address || EMAIL.user}>`,
  to: EMAIL.user,
  subject: 'New breached emails',
  text: 'One of your emails was breached. Please see the attachment for more information.',
  attachments: [{
    filename: 'breached-accounts.json',
    content: '',
  }],
};

subscriptions.add(
  forkJoin([
    from(ACCOUNTS)
    .pipe(
      // the API has a rate limit of 1500ms between each request
      // https://haveibeenpwned.com/API/v3#RateLimiting
      concatMap((account) => checkForBreaches$(account).pipe(delay(RATE_LIMIT_DELAY))),
    ),
  ])
  .pipe(
    mergeMap((arrayOfBreachedAccounts: [Breach[]]) => {
      let [pwnedAccounts] = arrayOfBreachedAccounts;
      let newBreaches: Breach[] = [];

      pwnedAccounts = pwnedAccounts.filter((account) => !!account);

      if (pwnedAccounts?.length && knownBreaches?.totalBreaches) {
        newBreaches = pwnedAccounts.filter(
          (pwnedAccount) => !knownBreaches?.breaches.find((breach: Breach) => pwnedAccount.Id === breach.Id),
        );
      } else {
        newBreaches = pwnedAccounts;
      }

      if (!newBreaches.length) {
        console.log('No new breaches found');

        return EMPTY;
      }

      return updateJsonFile$(newBreaches);
    }),
    mergeMap(() => sendMail$()),
    finalize(() => subscriptions.unsubscribe()),
  )
  .subscribe({
    next: () => console.log(`An email containing all the information was sent to ${EMAIL.user}, please check your inbox.`),
    error: (error: AxiosError) => console.error(error.message || error),
  }),
);

function checkForBreaches$(account: string): Observable<Breach[]> {
    return from(Axios.get(`${ENDPOINT}/${account}?truncateResponse=false`))
    .pipe(
      catchError((error: AxiosError) => {
        // the API is returning 404 if your account could not be found
        // and has therefore not been pwned
        if (error.response.status === 404) {
          return of([]);
        }

        return throwError(error);
      }),
      map((response: AxiosResponse) => {
        if (response.status !== 200 && !response.data) {
          return [];
        }

        const breaches: Breach[] = response.data;

        console.log(`That sucks! ${account} has been breached ${breaches.length} time(s)`);

        for (const breach of breaches) {
          if (breach && Object.keys(breach).length) {
            breach.Account = account;
            breach.Id = generateId(breach);
          }
        }

        return breaches;
      }),
      map((breaches) => {
        breachedAccounts.push(breaches);

        return [].concat(...breachedAccounts);
      }),
    );
}

function generateId(breachedAccount: Breach): string {
  let id: string = `${breachedAccount.Account}.${breachedAccount.Domain}.${breachedAccount.AddedDate}`;

  id = crypto.createHash('md5').update(id).digest('hex');

  return id;
}

function updateJsonFile$(newBreaches: Breach[]): Observable<void> {
  knownBreaches.version += 1;
  knownBreaches.created = Date.now();
  (knownBreaches.breaches as Breach[]) = [...knownBreaches.breaches, ...newBreaches];

  knownBreaches.totalBreaches = knownBreaches.breaches.length;

  const latestJson: string = JSON.stringify(knownBreaches, null, 2);

  return from(writeFile('breached-accounts.json', latestJson));
}

function sendMail$(): Observable<SentMessageInfo> {
  if (!EMAIL.user || !EMAIL.password) {
    return throwError('Could not send email, please take a look at your email settings.');
  }

  mailOptions.attachments[0].content = JSON.stringify(knownBreaches);

  return from(transporter.sendMail(mailOptions));
}
