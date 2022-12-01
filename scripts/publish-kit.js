/* eslint-disable */

// import '@johnlindquist/kit';

console.log(`🕵️‍♀️ process.env.KENV_PKG_DIR:`, process.env.KENV_PKG_DIR);
console.log(`kenvPkgPath:`, kenvPath(process.env.KENV_PKG_DIR || ''));

let tar = await npm('tar');

let version = await arg('Enter the version number');
let tag_name = `v${version}`;

console.log(`⭐️ Starting Kit release for ${tag_name}`);

let octokit = github.getOctokit(await env('GITHUB_TOKEN'));

let releaseResponse = await octokit.rest.repos.createRelease({
  ...github.context.repo,
  tag_name,
  name: tag_name,
  draft: true,
  prerelease: true,
});

let kitFiles = await readdir(kitPath());
let name = 'kit.tar.gz';
let kitTarPath = home(name);
console.log({ kitFiles });

await $`cd ${kitPath()} && npm i`;

let kitModules = await readdir(kitPath('node_modules'));
console.log({ kitModules });

await console.log(`Tar ${kitPath()} to ${kitTarPath}`);

await tar.c(
  {
    cwd: kitPath(),
    gzip: true,
    file: kitTarPath,
    follow: true,
    filter: (item) => {
      // if (item.match(/^.{0,2}node/)) {
      //   console.log(`SKIPPING`, item);
      //   return false;
      // }
      if (item.includes('kit.sock')) return false;

      return true;
    },
  },
  ['.']
);

console.log(`Uploading ${name} to releases...`);

let uploadResponse = await octokit.rest.repos.uploadReleaseAsset({
  ...github.context.repo,
  release_id: releaseResponse.data.id,
  name,
  data: await readFile(kitTarPath),
});

console.log(`url: ${uploadResponse.data.browser_download_url}`);

export {};
