# email-pwnd

A script which will check if your email(s) have been compromised in a data breach using the haveibeenpwned [API](https://haveibeenpwned.com/API/v2).

You can either check a single email or a list of emails against the API.

All information regarding a possible breach of your accounts will be printed out in your CLI:
```bash
That sucks! example@test.com has been breached 2 time(s):
- from: Adobe
- domain: adobe.com
- at: 2013-12-04T00:00:00Z
- compromised data: Email addresses,Password hints,Passwords,Usernames
- In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, <em>encrypted</em> password and a password hint in plain text. The password cryptography was poorly done and <a href="http://stricture-group.com/files/adobe-top100.txt" target="_blank" rel="noopener">many were quickly resolved back to plain text</a>. The unencrypted hints also <a href="http://www.troyhunt.com/2013/11/adobe-credentials-and-serious.html" target="_blank" rel="noopener">disclosed much about the passwords</a> adding further to the risk that hundreds of millions of Adobe customers already faced.
------
- from: Apollo
- domain: apollo.io
- at: 2018-10-05T19:14:11Z
- compromised data: Email addresses,Employers,Geographic locations,Job titles,Names,Phone numbers,Salutations,Social media profiles
- In July 2018, the sales engagement startup <a href="https://www.wired.com/story/apollo-breach-linkedin-salesforce-data/" target="_blank" rel="noopener">Apollo left a database containing billions of data points publicly exposed without a password</a>. The data was discovered by security researcher <a href="http://www.vinnytroia.com/" target="_blank" rel="noopener">Vinny Troia</a> who subsequently sent a subset of the data containing 126 million unique email addresses to Have I Been Pwned. The data left exposed by Apollo was used in their &quot;revenue acceleration platform&quot; and included personal information such as names and email addresses as well as professional information including places of employment, the roles people hold and where they're located. Apollo stressed that the exposed data did not include sensitive information such as passwords, social security numbers or financial data. <a href="https://www.apollo.io/contact" target="_blank" rel="noopener">The Apollo website has a contact form</a> for those looking to get in touch with the organisation.
------
Could not send email, please take a look at your email settings.
```

If you setup your e-mail information, a tidy JSON will also be delivered per mail with all information to your pwned account(s):

```json
{
  "version": 1,
  "created": 1549139010848,
  "totalBreaches": 2,
  "breaches": [
    {
      "Name": "Adobe",
      "Title": "Adobe",
      "Domain": "adobe.com",
      "BreachDate": "2013-10-04",
      "AddedDate": "2013-12-04T00:00:00Z",
      "ModifiedDate": "2013-12-04T00:00:00Z",
      "PwnCount": 152445165,
      "Description": "In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, <em>encrypted</em> password and a password hint in plain text. The password cryptography was poorly done and <a href=\"http://stricture-group.com/files/adobe-top100.txt\" target=\"_blank\" rel=\"noopener\">many were quickly resolved back to plain text</a>. The unencrypted hints also <a href=\"http://www.troyhunt.com/2013/11/adobe-credentials-and-serious.html\" target=\"_blank\" rel=\"noopener\">disclosed much about the passwords</a> adding further to the risk that hundreds of millions of Adobe customers already faced.",
      "LogoPath": "https://haveibeenpwned.com/Content/Images/PwnedLogos/Adobe.png",
      "DataClasses": [
        "Email addresses",
        "Password hints",
        "Passwords",
        "Usernames"
      ],
      "IsVerified": true,
      "IsFabricated": false,
      "IsSensitive": false,
      "IsRetired": false,
      "IsSpamList": false,
      "Account": "example@test.com",
      "Id": "107edb7f7d92093e979fc7bdf77a8fd9"
    },
    {
      "Name": "Apollo",
      "Title": "Apollo",
      "Domain": "apollo.io",
      "BreachDate": "2018-07-23",
      "AddedDate": "2018-10-05T19:14:11Z",
      "ModifiedDate": "2018-10-23T04:01:48Z",
      "PwnCount": 125929660,
      "Description": "In July 2018, the sales engagement startup <a href=\"https://www.wired.com/story/apollo-breach-linkedin-salesforce-data/\" target=\"_blank\" rel=\"noopener\">Apollo left a database containing billions of data points publicly exposed without a password</a>. The data was discovered by security researcher <a href=\"http://www.vinnytroia.com/\" target=\"_blank\" rel=\"noopener\">Vinny Troia</a> who subsequently sent a subset of the data containing 126 million unique email addresses to Have I Been Pwned. The data left exposed by Apollo was used in their &quot;revenue acceleration platform&quot; and included personal information such as names and email addresses as well as professional information including places of employment, the roles people hold and where they're located. Apollo stressed that the exposed data did not include sensitive information such as passwords, social security numbers or financial data. <a href=\"https://www.apollo.io/contact\" target=\"_blank\" rel=\"noopener\">The Apollo website has a contact form</a> for those looking to get in touch with the organisation.",
      "LogoPath": "https://haveibeenpwned.com/Content/Images/PwnedLogos/Apollo.png",
      "DataClasses": [
        "Email addresses",
        "Employers",
        "Geographic locations",
        "Job titles",
        "Names",
        "Phone numbers",
        "Salutations",
        "Social media profiles"
      ],
      "IsVerified": true,
      "IsFabricated": false,
      "IsSensitive": false,
      "IsRetired": false,
      "IsSpamList": false,
      "Account": "example@test.com",
      "Id": "b5a7a616a11c9b3f02618a45fd31deee"
    }
  ]
}
```

## Getting Started

### Manually
```bash
$ git clone https://github.com/felvct/email-pwnd.git
$ cd email-pwnd
$ npm install
# launch the script with the provided config/dummy.json
$ npm run start
``` 

### Automation
```bash
$ git clone https://github.com/felvct/email-pwnd.git
$ cd email-pwnd
$ ./email-pwnd-runner.sh
```
### Cron Job
If you want to monitor your accounts, you could let the script regularly through a cron job.

List your existing cron jobs: `crontab -l`

Adding a new cron job to your list: `crontab -e`

```markdown
* * * * *     path/to/email-pwnd/email-pwnd-runner.sh
┬ ┬ ┬ ┬ ┬
│ │ │ │ │
│ │ │ │ └──── Day of week (0-7) (Note: sunday could be 0 or 7)
│ │ │ └────── Month (1-12)
│ │ └──────── Day of month (1-31)
│ └────────── Hour (0-23)
└──────────── Minute (0-59)
```

Useful times:

| Desription        | Cron command |
| ----------------- | ------------ |
| Every full hour   | 0 * * * *    |
| Daily (@midnight) | 0 0 * * *    |
| Weekly            | 0 0 * * 0    |
| Monthly           | 0 0 1 * *    |
| Yearly            | 0 0 1 1 *    |

## Configuration

### Accounts
In order to check if your **own** emails are compromised, please update the following JSON file: `config/dummy.json`.

In the `accounts` section you can either enter a single email:
```json
{
  "accounts": "john@doe.com"
}
```
Or provide a list of emails:
```json
{
  "accounts": [
    "john@doe.com",
    "test@example.com"
  ]
}
```
Either way, each email will be checked against the API.

### Email
You have the possibility to configure your email account in order to get a JSON file attached to an email if at least one of your accounts has been breached.

Emails are sent via [nodemailer](https://nodemailer.com/about/) and you will have to update the dummy JSON file: `config/dummy.json` if you want to use this feature.

Depending on which email [transport](https://nodemailer.com/smtp/) your account uses, you may have to do things differently and/or get your hands dirty and update a few lines of code.

Note: if your run the script several times (or you run it regularly via a cronjob in order to monitor your accounts), the email will only be sent if the JSON was updated by the script (i.e. if a new breach has been discovered since the last time the script ran).

You will have to update the `emailSettings` section of our `dummy.json`:
```json
{
  "emailSettings": {
    "host": "smtp.example.com",
    "port": 587,
    "user": "username",
    "password": "password"
  }
}
```
If your account allows an [OAuth2 authentication](https://nodemailer.com/smtp/oauth2/) you will have to update the nodemailer code in `main.ts` since I only support a login via credentials for the time being.

You will likely need to update the following snippet with your own logic for on OAuth2 authentication:
```JavaScript
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
```
