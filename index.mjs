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



imapSimple.connect(config).then(function (connection) {
    return connection.openBox('INBOX').then(function () {
        var searchCriteria = ['UNSEEN'];
        var fetchOptions = {
            bodies: ['HEADER', ''], //  ['HEADER', 'TEXT', ''] - если нужен текст. (но тогда сбщ без текста вызывают падение, лол)
        };
        return connection.search(searchCriteria, fetchOptions).then(function (messages) {
            messages.forEach(function (item) {
                var all = _.find(item.parts, { "which": "" })
                var id = item.attributes.uid;
                var idHeader = "Imap-Id: "+id+"\r\n";
                simpleParser(idHeader+all.body, (err, mail) => {
                    // access to the whole mail object
                    console.log(`\n=================================================\n`)
                    // console.log(mail)
                    console.log('mail.from.value.address: ', mail.from.value[0].address)
                    console.log('mail.subject: ', mail.subject)
                    console.log('mail.messageId: ', mail.messageId)
                    // console.log('mail.text: ', mail.text) // не включать. см коммент к fetchOptions -> bodies выше
                    console.log('id/attributes.uid : ', id)
                });
            });
        });
    });
});

