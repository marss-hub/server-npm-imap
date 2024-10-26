import * as imapSimple from 'imap-simple';
import { AbstractMailFilter } from './filters/AbstractMailFilter.mjs';

/**
 * Main processor class
 */
export class MailProcessor {
  #config;
  #connection = null;

  /**
   * Return instance of class
   * @param {Object} config object with config data 
   */
  constructor(config) {
    this.#config = config;
  }

  /**
   * Connect to an Imap server and get instance of ImapSimple 
   */
  async connect() {
    this.#connection = await imapSimple.connect(this.#config);
  }

  /**
   * Disconnect to an Imap server and remove instance of ImapSimple 
   */
  async disconnect() {
    await this.#connection.end();
    this.#connection = null;
  }
  
  /**
   * Checks existence сonnect to an Imap server and instance of ImapSimple
   * @returns {boolean} 
   */
  isConnect() {
    return this.#connection !== null;
  }

  /**
   * Main run method
   * @param {Array.<Class>} filtersArr Array of Classes extends AbstractMailFilter (ClassNames) 
   */
  async run(filtersArr) { 
    if (!this.isConnect()) throw new Error("ERROR")
    
     for (const classFilter of filtersArr) {
        const filter = new classFilter(this.#connection) 
        if (!filter instanceof AbstractMailFilter) throw new Error("ERROR: invalid filter class");
        await filter.exec()
    };
  }
}
