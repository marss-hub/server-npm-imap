import { ImapSimple } from "imap-simple";

/**
 * abstract class for filters classes
 */
export class AbstractMailFilter {
  #connect;

  constructor(connect) {
    if (!connect instanceof ImapSimple) throw new Error("ERROR: invalid connection object");
    this.#connect = connect;
  }
  async exec() {}

  getConnect() {
    return this.#connect;
  }
}
