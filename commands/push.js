const fs = require('fs');
const ora = require('ora');
const get = require('lodash.get');
const zip = require('../lib/zip');
const unzip = require('../lib/unzip');
const write = require('../lib/write');
const mkdir = require('../lib/mkdir');
const del = require('../lib/delete');
const log = require('../lib/log');

module.exports = async ({cartridge = 'cartridges', codeVersion}) => {
  try {
    fs.accessSync(cartridge);
  } catch (err) {
    log.error(`${cartridge} is not a valid folder`);
    process.exit(1);
  }

  log.info(`Deploying ${cartridge} to ${codeVersion}`);
  const spinner = ora().start();

  try {
    spinner.text = `Zipping ${cartridge}`;
    const file = await zip({
      src: cartridge,
      dest: get(process, 'env.TMPDIR', '.'),
      isSpecificCartridge: cartridge !== 'cartridges'
    });
    spinner.succeed();

    spinner.start();
    spinner.text = 'Creating remote folder';
    await mkdir({dir: `/${codeVersion}`});
    spinner.succeed();

    spinner.start();
    spinner.text = `Uploading to ${codeVersion}`;
    const dest = await write({src: file, dest: `/${codeVersion}`});
    spinner.succeed();

    spinner.start();
    spinner.text = 'Unzipping';
    await unzip({filePath: dest});

    spinner.start();
    spinner.text = `Removing ${dest}`;
    await del(dest);
    spinner.succeed();

    log.success('Success');
  } catch (err) {
    spinner.fail();
    log.error(err);
  }
};
