import { simpleParser } from "mailparser";
import { AbstractMailFilter } from "./AbstractMailFilter.mjs";

export class TicketSorterMailFilter extends AbstractMailFilter {
 async exec() {
    const connection = this.getConnect();

    await connection.openBox('INBOX');

    const messagesArr = await this.#getAllInboxMails(connection);

    const ticketUidsArr = await this.#getTicketsWithUids(messagesArr); // mb empty arr
    await this.#moveTicketMails(connection, ticketUidsArr);

   // closebox !!!

  }

  async #moveTicketMails(connection, ticketsArr) {
    if (ticketsArr.length === 0) return;
    const boxesSet = await this.#getBoxesListSet(connection); 
    for (const item of ticketsArr) {
      if (boxesSet.has(item.ticket)) {
       await connection.moveMessage(item.uid, item.ticket);
       console.log('move : ', item.ticket)
      } else {
        await connection.addBox(item.ticket)
        await connection.moveMessage(item.uid, item.ticket);
        console.log('add & move : ', item.ticket)
      }
    }


  }

  async #getTicketsWithUids(msgsArr) {
   const resultArr = [];
    for (const item of msgsArr) {
      //parse mail
      const all = item.parts.find(item => item.which === "");
      const id = item.attributes.uid;
      const idHeader = "Imap-Id: " + id + "\r\n";
      const mail = await simpleParser(idHeader + all.body);


      // console.log('item.attributes: ', item.attributes);      
      // console.log('item.attributes.uid: ', item.attributes.uid);
      // console.log('mail.subject: ', mail.subject);
      // console.log('mail.messageId: ', mail.messageId);
      // console.log('=================================================');


      //processing
      const mailIsTicket = mail.subject.match(/Ticket-\d+/i); //null or ticketStr

      if (mailIsTicket !== null) {
        const ticketNormalize = String(mailIsTicket[0]).charAt(0).toUpperCase() + String(mailIsTicket[0]).slice(1).toLowerCase();
        resultArr.push({uid: item.attributes.uid, ticket: ticketNormalize});
      }
    };
    return resultArr;
  }

  async #getAllInboxMails(connection) {
    // See more https://www.php.net/manual/ru/function.imap-search.php about criteria parameter
    // See more how it IRL write and work https://stackoverflow.com/questions/57557330/how-to-fetch-email-thread-by-messageid-using-imap-in-nodejs
    const searchCriteria = ['ALL']; // ['ALL'], ['FLAGGED'], [['SUBJECT', 'test msg']];
    const fetchOptions = {
        //A string or Array of strings containing the body part section to fetch. See more https://github.com/mscdex/node-imap
        bodies: [''], //  The entire message (header + body)
    };
    // array of objects with 3 properties (attributes {Object}, parts {Array.<Object>}, seqNo {number}). can be empty arr here!
    const messages = await connection.search(searchCriteria, fetchOptions);
    return messages
  }


  async #getBoxesListSet(connection) {
    // Returns the full list of mailboxes (folders).
    const boxesList = await connection.getBoxes()
    const boxesSet = new Set();
    for (const box in boxesList) {
        boxesSet.add(String(box))   
     }
    return boxesSet
  }

}


    // Returns the full list of mailboxes (folders).
    // const boxesList = await connection.getBoxes()
    // console.log('boxesList', boxesList);


    /*
    messagesArr.forEach(async function (item) {
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
    */
