import {simpleParser} from 'mailparser';
import _ from 'lodash';
import { CONFIGDATA } from "./configData.mjs";
import * as imapSimple from 'imap-simple';

let config = {
    imap: {
        user: CONFIGDATA.user,
        password: CONFIGDATA.pass,
        host: CONFIGDATA.host,
        port: CONFIGDATA.port,
        tls: CONFIGDATA.secure,
        authTimeout: 3000
    }
};



const connection = await imapSimple.connect(config);
    await connection.openBox('INBOX');
    // See more https://www.php.net/manual/ru/function.imap-search.php about criteria parameter
    // See more how it IRL write and work https://stackoverflow.com/questions/57557330/how-to-fetch-email-thread-by-messageid-using-imap-in-nodejs
    const searchCriteria = ['UNSEEN']; // [['SUBJECT', 'test msg']];
    const fetchOptions = {
        //A string or Array of strings containing the body part section to fetch. See more https://github.com/mscdex/node-imap
        bodies: [''], //  The entire message (header + body)
    };
    const messages = await connection.search(searchCriteria, fetchOptions);
    //console.log("messages : ", messages) // can be empty arr
    //console.log("messages : ", messages[0].parts)

    messages.forEach(function (item) {
        const all = _.find(item.parts, { "which": "" });
        const id = item.attributes.uid;
        const idHeader = "Imap-Id: " + id + "\r\n";
        simpleParser(idHeader + all.body, (err, mail) => {
            // access to the whole mail object
            console.log(`\n=================================================\n`);
            //console.log(mail)
            console.log('mail.from.value.address: ', mail.from.value[0].address);
            console.log('mail.subject: ', mail.subject);
            console.log('mail.messageId: ', mail.messageId);
            console.log('mail.text: ', mail?.text) 
            console.log('id/attributes.uid : ', id);
        });
    });

    connection.end();

//source:
//https://github.com/chadxz/imap-simple
//https://github.com/mscdex/node-imap