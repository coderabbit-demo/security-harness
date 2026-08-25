import { createApp } from "./app";

const port = process.env.PORT ?? 3000;
const app = createApp();

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
