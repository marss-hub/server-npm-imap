import { CONFIGDATA } from "./configData.mjs";
import { MailProcessor } from "./MailProcessor.mjs";
import { TicketSorterMailFilter } from "./filters/TicketSorterMailFilter.mjs";

const config = {
  imap: {
    user: CONFIGDATA.user,
    password: CONFIGDATA.pass,
    host: CONFIGDATA.host,
    port: CONFIGDATA.port,
    tls: CONFIGDATA.secure,
    authTimeout: 3000,
  },
};
 
 //filter Classes in order of execution
const filtersArrs = [TicketSorterMailFilter];

const processor = new MailProcessor(config);
try {
  await processor.connect();
  if (!processor.isConnect()) throw new Error("ERROR: Соединение не удалось");

  await processor.run(filtersArrs);
} finally {
  await processor.disconnect();
}

//source:
//https://github.com/chadxz/imap-simple
//https://github.com/mscdex/node-imap
