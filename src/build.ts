import log from 'electron-log';
import { debounce } from 'lodash';
import { Script } from '@johnlindquist/kit';
import { kitPath } from '@johnlindquist/kit/cjs/utils';
import { runScript } from './kit';

export const buildScriptChanged = debounce(async ({ filePath }: Script) => {
  if (filePath.endsWith('.ts')) {
    log.info(`🏗️ Build ${filePath}`);
    await runScript(kitPath('cli/build-ts-script.js'), filePath);
  }

  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    log.info(`🏗️ Build ${filePath}`);
    await runScript(kitPath('cli/build-widget.js'), filePath);
  }
}, 250);
