# Vaccine Availablity Notifier

This a simple lambda function that checks for vaccine availabilty by district for 7 days and upon getting availability it'll notify you over slack

Configurations

```json
{
    "NODE_ENV": "prod",
    "SLACK_HOOK_URL": "<your_slack_webhook_url_here>",
    "DISTRICT_ID": "000"
}
```

**NOTE => Goto cowin.gov.in without logging in just do a search by district and inspect the network tab for the district id**


* Deploy the service

```bash
npm run deploy
```

* You can also set a scheduled job on cloudwatch to check availabilty periodically
* Also make sure you deploy in **"ap-south-1"** Mumbai region as there is a geo restriction
