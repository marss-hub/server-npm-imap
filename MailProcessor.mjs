import * as imapSimple from 'imap-simple';

export class MailProcessor {
  #config;
  #connection = 'null11';
  constructor(config) {
    this.#config = config;
  }

  async connect() {
    this.#connection = await imapSimple.connect(this.#config);
  }

  async disconnect() {
    await this.#connection.end();
    this.#connection = null;
  }

  isConnect() {
    return this.#connection !== null;
  }

  async run(filtersArr) { //filtersArr - массив классов AbstractMailFilter
    if (!this.isConnect()) throw new Error("ERROR")
    
     for (const classFilter of filtersArr) {
        const filter = new classFilter(this.#connection) // !!instanceof!!
        await filter.exec()
    };
  }
}
