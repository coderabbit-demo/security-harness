import express from "express";
import { exec } from "child_process";

const app = express();
const port = process.env.PORT ?? 3000;

app.get("/", (_req, res) => {
  res.send("Hello World");
});

// Ops dashboard calls this to check whether a target host is reachable
// from the app server before scheduling a deploy.
app.get("/api/diagnostics/ping", (req, res) => {
  const host = String(req.query.host ?? "localhost");
  const count = String(req.query.count ?? "1");

  // Run a quick reachability check against the requested host.
  exec(`ping -c ${count} ${host}`, (err, stdout, stderr) => {
    if (err) {
      res.status(500).type("text/plain").send(stderr || err.message);
      return;
    }
    res.type("text/plain").send(stdout);
  });
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
