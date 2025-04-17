const { Command } = require('commander');
const fs = require('fs/promises');
const http = require('http');
const path = require('path');
const xml2js = require('xml2js');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-i, --input <path>', 'input file path');

program.parse(process.argv);
const options = program.opts();

const inputFilePath = path.resolve(options.input);
const builder = new xml2js.Builder();

async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function startServer() {
  if (!(await fileExists(inputFilePath))) {
    console.error("Cannot find input file");
    process.exit(1);
  }

  const server = http.createServer(async (req, res) => {
    try {
      const jsonData = await fs.readFile(inputFilePath, 'utf-8');
      const reserves = JSON.parse(jsonData);

      const minReserve = reserves.reduce((min, current) =>
        parseFloat(current.value) < parseFloat(min.value) ? current : min
      );

      const xmlObj = {
        Reserve: {
          Name: minReserve.txten,
          Value: minReserve.value
        }
      };

      const xml = builder.buildObject(xmlObj);

      res.writeHead(200, { 'Content-Type': 'application/xml' });
      res.end(xml);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Server Error: ${err.message}`);
    }
  });

  server.listen(options.port, options.host, () => {
    console.log(`Server working on http://${options.host}:${options.port}`);
  });
}

startServer();
