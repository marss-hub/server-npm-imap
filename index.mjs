import {simpleParser} from 'mailparser';
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

    // Returns the full list of mailboxes (folders).
    // const boxesList = await connection.getBoxes()
    // console.log('boxesList', boxesList);


    await connection.openBox('INBOX');
    // See more https://www.php.net/manual/ru/function.imap-search.php about criteria parameter
    // See more how it IRL write and work https://stackoverflow.com/questions/57557330/how-to-fetch-email-thread-by-messageid-using-imap-in-nodejs
    const searchCriteria = ['UNSEEN']; // ['ALL'] , [['SUBJECT', 'test msg']];
    const fetchOptions = {
        //A string or Array of strings containing the body part section to fetch. See more https://github.com/mscdex/node-imap
        bodies: [''], //  The entire message (header + body)
    };
    const messages = await connection.search(searchCriteria, fetchOptions);
    //console.log("messages : ", messages) // can be empty arr
    //console.log("messages : ", messages[0].parts)

    let messageId = null // id for move only
    messages.forEach(async function (item) {
        messageId = item.seqNo;
        const all = item.parts.find(item => item.which === "");

        const id = item.attributes.uid;
        const idHeader = "Imap-Id: " + id + "\r\n";
        const mail = await simpleParser(idHeader + all.body);
        // access to the whole mail object
        console.log(`\n=================================================\n`);
        //console.log(mail)
        console.log('mail.from.value.address: ', mail.from.value[0].address);
        console.log('mail.subject: ', mail.subject);
        console.log('mail.messageId: ', mail.messageId);
        //console.log('mail.text: ', mail?.text) 
        console.log('id/attributes.uid : ', id);
    });
    
   // await connection.moveMessage(messageId, 'Рабочие');

    connection.end();

//source:
//https://github.com/chadxz/imap-simple
//https://github.com/mscdex/node-imap
