const  { BrevoClient }  = require("@getbrevo/brevo");
const {getOtpEmail , getForgotPasswordEmail} = require("./otp_Template");
require('dotenv').config();

brevo = new BrevoClient({
  apiKey: process.env.BREVO_KEY
});

exports.shareOtp = async (email,otp,username) => {
  try {
   await brevo.transactionalEmails.sendTransacEmail({
      subject: "OTP EMAIL",
      htmlContent:  getOtpEmail(otp,username),
      sender: { name: "Culez", email: process.env.BREVO_SENDER },
      to: [{ email: email }],
    });
  } catch(error) {
    console.log("error  : ",error);
  }
};

exports.forgetPasswordOtp = async(email,url,username)=>{
    try{
        await brevo.transactionalEmails.sendTransacEmail({
            subject : "FORGET PASSWORD",
            htmlContent : getForgotPasswordEmail(url,username),
            sender : {name : "Culez", email : process.env.BREVO_SENDER },
            to : [{email : email}]
        })
    }catch(err){
        console.log("error : ",err.message);
    }
}
