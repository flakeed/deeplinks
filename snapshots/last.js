const  { promisify } = require('util');
const { exec } = require('child_process');
const { promises: fs } = require('fs');
const execP = promisify(exec);
const path = require('path');
const _deeplinks = path.normalize(`${__dirname}/..`);

const last = async () => {
  const files = await fs.readdir('./snapshots');
  const snapshots = files.filter(file => /^-?[0-9]+$/.test(file));
  const last = snapshots[snapshots.length - 1];
  const { stdout, stderr } = await execP(`cd docker-prod/deep && (docker-compose -f docker-compose.yml stop hasura postgres || true ) && docker run -v ${_deeplinks}:/deeplinks -v deep-db-data:/data --rm --name links --entrypoint \"sh\" deepf/deeplinks:main -c \"cd / && tar xf deeplinks/snapshots/${last} --strip 1\" && (docker-compose -f docker-compose.yml start hasura postgres || true) && cd ../.. && cp snapshots/${last}.migrate .migrate`);
  console.log('stdout',stdout);
  console.log('stderr',stderr);
}

last();
