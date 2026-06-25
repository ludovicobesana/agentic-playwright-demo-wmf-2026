import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export default async function globalSetup() {
  const authDir = path.join(process.cwd(), '.auth');
  const storageStatePath = path.join(authDir, 'storage-state.json');

  await mkdir(authDir, { recursive: true });
  await writeFile(
    storageStatePath,
    JSON.stringify(
      {
        cookies: [],
        origins: [
          {
            origin: 'http://127.0.0.1:3000',
            localStorage: [
              {
                name: 'demo_auth_token',
                value: 'demo-token-adalovelace-2026'
              }
            ]
          }
        ]
      },
      null,
      2
    )
  );
}
