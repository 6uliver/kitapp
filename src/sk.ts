/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/prefer-default-export */
import net from 'net';
import fs from 'fs';
import log from 'electron-log';
import { kitPath, resolveToScriptPath } from 'kit-bridge/cjs/util';
import { runPromptProcess } from './kit';

export const startSK = () => {
  const server = net.createServer((stream) => {
    stream.on('data', async (data) => {
      const value = data.toString();
      const json = value.match(new RegExp(`^{.*}$`, 'gm'))?.[0] || '';
      const object = JSON.parse(json);
      log.info(object);
      const { script, args } = object;

      const scriptPath = resolveToScriptPath(script);
      log.info(`🇦🇷 ${scriptPath} ${args}`);
      if (scriptPath) {
        await runPromptProcess(
          scriptPath,
          args.map((s: string) => s.replaceAll('$newline$', '\n'))
        );
        const message = `🕹 sk ${script} ${args}`;
        log.info(message);
        stream.write(message);
      } else {
        const message = `🕹 sk needs a script!`;
        log.info(message);
        stream.write(message);
      }
      stream.end();
    });
  });

  const socketPath = kitPath('kit.sock');
  if (fs.existsSync(socketPath)) fs.unlinkSync(socketPath);
  server.listen(socketPath);
};
