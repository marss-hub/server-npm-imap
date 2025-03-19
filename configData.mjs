export const CONFIGDATA = {
  host: process.env["IMAP_SORTER_HOST"], // server host
  port: process.env["IMAP_SORTER_PORT"] || 993, // port
  user: process.env["IMAP_SORTER_USER"], // username
  pass: process.env["IMAP_SORTER_PWD"], // password
  secure: true,
};
