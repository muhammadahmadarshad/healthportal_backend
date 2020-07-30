const nodemailer=require('nodemailer')
const sendgrid_transport=require('nodemailer-sendgrid-transport')

exports.transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:"ranaahmad200358@gmail.com",
        pass:"7896578965"

    }
})

