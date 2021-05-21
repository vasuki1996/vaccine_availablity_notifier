const fetch = require('node-fetch');
const { IncomingWebhook } = require('@slack/webhook');

module.exports.handler = (payload, context, callback) => {
    console.log(payload);
    context.callbackWaitsForEmptyEventLoop = false;
    getDataFromCowin().then(boolean => {
        console.log(boolean);
        callback(null, boolean);
    }).catch(error => {
        console.log(error);
        callback(error.stack ? error.stack : error, false);
    })
}

const getDataFromCowin = async () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const pre_parse = await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${process.env.DISTRICT_ID}&date=${day}-${month}-${year}`,{
        headers: {
            origin: "https://www.cowin.gov.in",
            referer: "https://www.cowin.gov.in/",
            "User-Agent": "PostmanRuntime/7.26.10",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Cache-Control": "no-cache"
        },
        method: "GET"
    });
    if(pre_parse.status === 200){
        const response = await pre_parse.json();
        const centers = response.centers;
        const Unavailable_Array = new Array();
        for (let index = 0; index < centers.length; index++) {
            const center = centers[index];
            for (let j = 0; j < center.sessions.length; j++) {
                const session = center.sessions[j];
                if(session.min_age_limit === 18 && session.available_capacity > 0 && session.available_capacity_dose1 > 0){
                    await postToSlack("@channel \n ```"+JSON.stringify(center, null, 2)+"```");
                } else {
                    if(session.min_age_limit === 18){
                        Unavailable_Array.push({
                            center_name: center.name,
                            center_pincode: center.pincode,
                            session_first_dose: session.available_capacity_dose1,
                            session_second_dose: session.available_capacity_dose2
                        });
                    }
                }
            }
        }
        console.table(Unavailable_Array);
        return { data: true };
    } else {
        const status = pre_parse.status;
        const response = await pre_parse.text();
        return {
            data: {
                status,
                response
            }
        }

    }
}

const postToSlack = (data) => {
    const url = `${process.env.SLACK_HOOK_URL}`;

    const webhook = new IncomingWebhook(url);

    const response_string = `${data}`;

    return webhook.send({
        text: response_string
    });
}

// TESTING CODE
// const secrets = require('./secrets.json');
// const keys = Object.keys(secrets);
// for (let index = 0; index < keys.length; index++) {
//     const key = keys[index];
//     process.env[`${key}`] = secrets[`${key}`]
// }
// getDataFromCowin().then(boolean => {
//     console.log(boolean);
// }).catch(error => {
//     console.log(error);
// });
