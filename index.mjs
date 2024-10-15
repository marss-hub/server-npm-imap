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
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = {
        bodies: ['HEADER', ''], //  ['HEADER', 'TEXT', ''] - если нужен текст body. (но тогда сбщ без текста в body вызывают падение, лол)
    };
    const messages = await connection.search(searchCriteria, fetchOptions);
    messages.forEach(function (item) {
        const all = _.find(item.parts, { "which": "" });
        const id = item.attributes.uid;
        const idHeader = "Imap-Id: " + id + "\r\n";
        simpleParser(idHeader + all.body, (err, mail) => {
            // access to the whole mail object
            console.log(`\n=================================================\n`);
            // console.log(mail)
            console.log('mail.from.value.address: ', mail.from.value[0].address);
            console.log('mail.subject: ', mail.subject);
            console.log('mail.messageId: ', mail.messageId);
            // console.log('mail.text: ', mail.text) // не включать. см коммент к fetchOptions -> bodies выше
            console.log('id/attributes.uid : ', id);
        });
    });

//source:
//https://github.com/chadxz/imap-simple
//https://github.com/mscdex/node-imap