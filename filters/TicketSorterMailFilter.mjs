import { simpleParser } from "mailparser";
import { AbstractMailFilter } from "./AbstractMailFilter.mjs";

/**
 * Сlass filter sorting letters with the Ticket mark
 */
export class TicketSorterMailFilter extends AbstractMailFilter {
  /**
   * Extend main method of execution
   */
  async exec() {
    const connection = this.getConnect();
    await connection.openBox("INBOX");

    const messagesArr = await this.#getAllInboxMails(connection);
    const ticketUidsArr = await this.#getTicketsWithUids(messagesArr); // mb return empty arr
    await this.#moveTicketMails(connection, ticketUidsArr);

    await connection.closeBox();
  }

  /**
   * Move mails from ticketsArr to their folders
   * @param {ImapSimple} connection An instance of ImapSimple
   * @param {[{uid: number, ticket: string}]} ticketsArr array with uid and tickets from mails with tickets-mark
   */
  async #moveTicketMails(connection, ticketsArr) {
    if (ticketsArr.length === 0) return;
    const boxesSet = await this.#getBoxesListSet(connection);
    for (const item of ticketsArr) {
      if (boxesSet.has(item.ticket)) {
        await connection.moveMessage(item.uid, item.ticket);
        console.log("move : ", item.ticket);
      } else {
        await connection.addBox(item.ticket);
        await connection.moveMessage(item.uid, item.ticket);
        boxesSet.add(item.ticket);
        console.log("add & move : ", item.ticket);
      }
    }
  }

  /**
   * Return array of objects with uid and tickets from mails with tickets-mark or empty array
   * @param {[{attributes: {Object}, parts: {Array.<Object>}, seqNo: {number}}]} msgsArr  array of objects
   * @returns  {[{uid: number, ticket: string}] | []} array with uid and tickets from mails with tickets-mark or empty array
   */
  async #getTicketsWithUids(msgsArr) {
    const resultArr = [];
    for (const item of msgsArr) {
      //parse mail
      const all = item.parts.find((item) => item.which === "");
      const id = item.attributes.uid;
      const idHeader = "Imap-Id: " + id + "\r\n";
      const mail = await simpleParser(idHeader + all.body);

      //processing
      const mailIsTicket = mail.subject.match(/Ticket-\d+/i); //return null or ticketStr
      if (mailIsTicket !== null) {
        const ticketNormalize =
          String(mailIsTicket[0]).charAt(0).toUpperCase() +
          String(mailIsTicket[0]).slice(1).toLowerCase();
        resultArr.push({ uid: item.attributes.uid, ticket: ticketNormalize });
      }
    }
    return resultArr;
  }

  /**
   * Return all mails in Inbox box
   * @param  {ImapSimple} connection An instance of ImapSimple
   * @returns {[{attributes: {Object}, parts: {Array.<Object>}, seqNo: {number}}] | []} array of objects with 3 properties or empty array
   */
  async #getAllInboxMails(connection) {
    // See more https://www.php.net/manual/ru/function.imap-search.php about criteria parameter
    // See more how it IRL write and work https://stackoverflow.com/questions/57557330/how-to-fetch-email-thread-by-messageid-using-imap-in-nodejs
    const searchCriteria = ["ALL"]; // ['ALL'], ['FLAGGED'], [['SUBJECT', 'test msg']];
    const fetchOptions = {
      //A string or Array of strings containing the body part section to fetch. See more https://github.com/mscdex/node-imap
      bodies: [""], //  The entire message (header + body)
    };
    const messages = await connection.search(searchCriteria, fetchOptions);
    return messages;
  }

  /**
   * Return list of mailboxes as Set collection
   * @param  {ImapSimple} connection An instance of ImapSimple
   * @returns {Set} mailboxes name collection
   */
  async #getBoxesListSet(connection) {
    // Returns the full list of mailboxes (folders).
    const boxesList = await connection.getBoxes();
    const boxesSet = new Set();
    for (const box in boxesList) {
      boxesSet.add(String(box));
    }
    return boxesSet;
  }
}

/*
      // EXAMPLE PARSE DATA AND GET MAIN VALUE:
        for (const item of messagesArr) {
        const all = item.parts.find(item => item.which === "");

        const id = item.attributes.uid;
        const idHeader = "Imap-Id: " + id + "\r\n";
        const mail = await simpleParser(idHeader + all.body);
        // uid of mail:
        console.log('item.attributes.uid: ', item.attributes.uid);
        // access to the whole mail object:
        //console.log(mail)
        // example getting main values:
        console.log('mail.from.value.address: ', mail.from.value[0].address);
        console.log('mail.subject: ', mail.subject);
        //console.log('mail.text: ', mail?.text) // if body of mail is empty mail?.text not exist
    */
