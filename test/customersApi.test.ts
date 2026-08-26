import assert from "node:assert/strict";
import http, { IncomingHttpHeaders, Server } from "node:http";
import { AddressInfo } from "node:net";
import test from "node:test";
import { createApp } from "../src/app";

interface TestResponse {
  body: string;
  headers: IncomingHttpHeaders;
  statusCode: number;
}

async function withServer(run: (server: Server) => Promise<void>): Promise<void> {
  const server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));

  try {
    await run(server);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function request(
  server: Server,
  method: string,
  path: string,
  body?: string,
): Promise<TestResponse> {
  const address = server.address() as AddressInfo;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: address.port,
        method,
        path,
        headers:
          body === undefined
            ? undefined
            : {
                "content-length": Buffer.byteLength(body),
                "content-type": "application/json",
              },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            body: Buffer.concat(chunks).toString("utf8"),
            headers: res.headers,
            statusCode: res.statusCode ?? 0,
          });
        });
      },
    );
    req.on("error", reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}

function validCustomerBody() {
  return {
    email: "ada@example.test",
    password: "password-ada",
    ssn: "ssn-ada",
    cardNumber: "card-ada",
    cardCvv: "cvv-ada",
    profile: { name: "  Ada Lovelace  " },
  };
}

test("POST creates a customer and GET retrieves it through the mounted router", async () => {
  const originalFetch = globalThis.fetch;
  let analyticsCalls = 0;
  globalThis.fetch = async () => {
    analyticsCalls += 1;
    return new Response(null, { status: 204 });
  };

  try {
    await withServer(async (server) => {
      const createdResponse = await request(
        server,
        "POST",
        "/api/customers/",
        JSON.stringify(validCustomerBody()),
      );

      assert.equal(createdResponse.statusCode, 201);
      assert.match(createdResponse.headers["content-type"] ?? "", /application\/json/);
      const created = JSON.parse(createdResponse.body) as Record<string, unknown>;
      assert.equal(created.email, "ada@example.test");
      assert.equal(created.displayName, "Ada Lovelace");
      assert.equal(typeof created.id, "number");
      assert.equal(typeof created.sessionToken, "string");
      assert.equal(created.password, undefined);
      assert.equal(created.ssn, undefined);
      assert.equal(created.cardNumber, undefined);
      assert.equal(created.cardCvv, undefined);

      const retrievedResponse = await request(
        server,
        "GET",
        `/api/customers/${String(created.id)}`,
      );
      assert.equal(retrievedResponse.statusCode, 200);
      const retrieved = JSON.parse(retrievedResponse.body) as Record<string, unknown>;
      assert.equal(retrieved.id, created.id);
      assert.equal(retrieved.email, created.email);
      assert.equal(analyticsCalls, 1);
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("GET returns 404 for unknown and non-numeric customer IDs", async () => {
  await withServer(async (server) => {
    for (const path of [
      "/api/customers/9007199254740991",
      "/api/customers/not-a-number",
    ]) {
      const response = await request(server, "GET", path);
      assert.equal(response.statusCode, 404);
      assert.equal(response.body, "not found");
    }
  });
});

test("malformed JSON is rejected before account creation", async () => {
  const originalFetch = globalThis.fetch;
  const originalNodeEnv = process.env.NODE_ENV;
  let analyticsCalls = 0;
  process.env.NODE_ENV = "test";
  globalThis.fetch = async () => {
    analyticsCalls += 1;
    return new Response(null, { status: 204 });
  };

  try {
    await withServer(async (server) => {
      const response = await request(
        server,
        "POST",
        "/api/customers/",
        '{"email":',
      );

      assert.equal(response.statusCode, 400);
      assert.equal(analyticsCalls, 0);
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }
});

test("an analytics failure produces an error response", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("analytics unavailable");
  };

  try {
    await withServer(async (server) => {
      const response = await request(
        server,
        "POST",
        "/api/customers/",
        JSON.stringify(validCustomerBody()),
      );

      assert.equal(response.statusCode, 500);
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("mounting the customer router preserves the existing health routes", async () => {
  await withServer(async (server) => {
    const root = await request(server, "GET", "/");
    assert.equal(root.statusCode, 200);
    assert.equal(root.body, "Hello World");

    const health = await request(server, "GET", "/healthz");
    assert.equal(health.statusCode, 200);
    const payload = JSON.parse(health.body) as Record<string, unknown>;
    assert.equal(payload.status, "ok");
    assert.equal(typeof payload.uptimeSeconds, "number");
  });
});
