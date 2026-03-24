import 'dotenv/config';
import { createApp } from './app';
import { env } from './config/env';

const port = env.port;
const app = createApp();

app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});
