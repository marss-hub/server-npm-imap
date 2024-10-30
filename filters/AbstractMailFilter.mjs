import { ImapSimple } from "imap-simple";

/**
 * Abstract class for filters classes
 */
export class AbstractMailFilter {
  #connect;

  /**
   * Does not imply returning an instance of the class.
   * @param {ImapSimple} connect An instance of ImapSimple
   */
  constructor(connect) {
    if (!connect instanceof ImapSimple)
      throw new Error("ERROR: invalid connection object");
    this.#connect = connect;
  }

  /**
   * Main method of execution
   */
  async exec() {}

  /**
   * Return the instance of ImapSimple
   * @returns  {ImapSimple} An instance of ImapSimple
   */
  getConnect() {
    return this.#connect;
  }
}
