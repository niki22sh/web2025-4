const { Command } = require('commander');
const fs = require('fs');
const http = require('http');
const path = require('path');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-i, --input <path>', 'input file path');

program.parse(process.argv);
const options = program.opts();

const inputFilePath = path.resolve(options.input);

if (!fs.existsSync(inputFilePath)) {
  console.error("Cannot find input file");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server working!\n');
});

server.listen(options.port, options.host, () => {
  console.log(`Server working on http://${options.host}:${options.port}`);
});
