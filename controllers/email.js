const nodemailer = require('nodemailer');
const {google} = require('googleapis');

const OAuth = google.auth.OAuth2;

const env = require('./config.gmail.env');

const oauth2Client= new OAuth(
    env.client_id,
    env.client_secret,
    env.redirect_url
)

oauth2Client.setCredentials(
    {
        refresh_token : env.refresh_token
    }
);

const accessToken= oauth2Client.getAccessToken();

async function sendTestEmail(to,subject,body) {
    console.log({to,subject,body});


    const transporter = nodemailer.createTransport(
        {
            service:"gmail",
            auth:{
                type:"OAuth2",
                user:env.emailid,
                clientId:env.client_id,
                clientSecret:env.client_secret,
                refreshToken:env.refresh_token,
                accessToken : accessToken
            },
            tls:{
                rejectUnauthorized:false
            }
        }
    );

    var mailOptions={
        from : env.emailid,
        to : to,
        subject: subject,
        text : body
        //attachment:attachment
    }

    transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log(error)
        }
        else{
            console.log(`email send :${info.response}`)
        }
    });
}

module.exports.sendTestEmail=sendTestEmail;