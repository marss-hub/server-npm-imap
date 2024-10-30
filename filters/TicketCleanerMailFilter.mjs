import { AbstractMailFilter } from "./AbstractMailFilter.mjs";

/**
 * Class filter find and delete empty ticket-boxes (folders)
 */
export class TicketCleanerMailFilter extends AbstractMailFilter {

 /**
 * Extend main method of execution
 */
 async exec() {
    const connection = this.getConnect();
    const allBoxesSet = await this.#getBoxesListSet(connection);
    const ticketBoxesListSet = this.#getTicketBoxesListSet(allBoxesSet) // return set or empty set
    const emptyTicketBoxesListSet = await this.#getEmptyTicketBoxesListSet(connection, ticketBoxesListSet) // return set or empty set
    await this.#deleteBoxes(connection, emptyTicketBoxesListSet);
 }

   /**
   * Return list of mailboxes as Set collection
   * @param  {ImapSimple} connection An instance of ImapSimple
   * @returns {Set} mailboxes name collection
   */
   async #getBoxesListSet(connection) {
    // Returns the full list of mailboxes (folders).
    const boxesList = await connection.getBoxes()
    const boxesSet = new Set();
    for (const box in boxesList) {
        boxesSet.add(String(box))   
     }
    return boxesSet
  }

  /**
   * Return Set structure contain list of folders name with tickets-mark or empty Set
   * @param {Set.<string>} boxesSet set of boxes names
   * @returns {Set.<string>} return list of folders name with tickets-mark or empty Set
   */
  #getTicketBoxesListSet(boxesSet) {
    const ticketsBoxesSet = new Set();
    for (const box of boxesSet) {
        const boxIsTicket = box.match(/Ticket-\d+/i); //return null or ticketsBoxStr
        if (boxIsTicket !== null) {
          ticketsBoxesSet.add(String(box))   
        }
    }
    return ticketsBoxesSet;
  }


async #getEmptyTicketBoxesListSet(connection, ticketBoxesSet) {
  const emptyTicketsBoxesSet = new Set();
    for (const box of ticketBoxesSet) {
      const isEmpty = await this.#boxIsEmpty(connection, box);
      if (isEmpty) emptyTicketsBoxesSet.add(String(box)) 
    }
  return emptyTicketsBoxesSet;
  
}

async #boxIsEmpty(connection, box) {
  await connection.openBox(box);
    // See more https://www.php.net/manual/ru/function.imap-search.php about criteria parameter
    // See more how it IRL write and work https://stackoverflow.com/questions/57557330/how-to-fetch-email-thread-by-messageid-using-imap-in-nodejs
    const searchCriteria = ['ALL']; // ['ALL'], ['FLAGGED'], [['SUBJECT', 'test msg']];
    const fetchOptions = {
        //A string or Array of strings containing the body part section to fetch. See more https://github.com/mscdex/node-imap
        bodies: [''], //  The entire message (header + body)
    };
    // array of objects or return empty array
    const messages = await connection.search(searchCriteria, fetchOptions);
  await connection.closeBox();
  return messages.length === 0;
}

async #deleteBoxes(connection, boxesSet) {
  for (const box of boxesSet) {
    console.log("delete box : ", box)
    await connection.delBox(box)
  }
}

}