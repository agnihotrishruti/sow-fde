import './loadProjectEnv.mjs';
import { createApp } from './app.mjs';

const PORT = Number(process.env.PORT) || 3847;
const app = createApp();

app.listen(PORT, '127.0.0.1', () => {
  console.log(`SOW-for-FDE API listening on http://127.0.0.1:${PORT}`);
});
