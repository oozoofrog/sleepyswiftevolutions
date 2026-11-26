import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { promisify } from "node:util";
import { google, type youtube_v3 } from "googleapis";
import { getConfig } from "../../config/env";

const execFileAsync = promisify(execFile);

const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

interface ClientSecretFile {
  installed?: {
    client_id: string;
    client_secret: string;
    redirect_uris?: string[];
  };
  web?: {
    client_id: string;
    client_secret: string;
    redirect_uris?: string[];
  };
}

async function readClientCredentials(clientSecretPath: string): Promise<{
  clientId: string;
  clientSecret: string;
}> {
  let raw: string;
  try {
    raw = await fs.readFile(clientSecretPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      throw new Error(
        `YouTube OAuth 클라이언트 시크릿 파일을 찾을 수 없습니다: ${clientSecretPath}\n\n` +
          `설정 방법:\n` +
          `1. Google Cloud Console(https://console.cloud.google.com)에서 프로젝트 생성 및 "YouTube Data API v3" 활성화\n` +
          `2. OAuth 동의 화면 설정 (테스트 사용자에 본인 Google 계정 추가)\n` +
          `3. 사용자 인증 정보 -> OAuth 2.0 클라이언트 ID -> "데스크톱 앱" 생성 후 JSON 다운로드\n` +
          `4. 다운로드한 JSON을 ${clientSecretPath} 경로에 저장\n` +
          `5. 'pnpm evo youtube auth' 명령 실행`,
      );
    }
    throw error;
  }

  const parsed = JSON.parse(raw) as ClientSecretFile;
  const creds = parsed.installed ?? parsed.web;
  if (!creds?.client_id || !creds?.client_secret) {
    throw new Error(`올바른 Google OAuth JSON 형식이 아닙니다: ${clientSecretPath}`);
  }
  return {
    clientId: creds.client_id,
    clientSecret: creds.client_secret,
  };
}

async function saveTokensSecurely(tokenPath: string, tokens: unknown): Promise<void> {
  await fs.mkdir(path.dirname(tokenPath), { recursive: true });
  await fs.writeFile(tokenPath, `${JSON.stringify(tokens, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  await fs.chmod(tokenPath, 0o600).catch(() => undefined);
}

/**
 * Interactive local loopback OAuth 2.0 flow saving refresh/access tokens to secrets/youtube-token.json.
 */
export async function runYouTubeAuthFlow(): Promise<{
  tokenPath: string;
  authUrl: string;
}> {
  const config = getConfig();
  const { clientId, clientSecret } = await readClientCredentials(config.youtube.clientSecretPath);
  const port = config.youtube.oauthPort;
  const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const state = randomBytes(32).toString("hex");
  const authUrl = oauth2Client.generateAuthUrl({
    state,
    access_type: "offline",
    prompt: "consent",
    scope: YOUTUBE_SCOPES,
  });

  const code = await new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.close();
      reject(new Error("OAuth 인증 대기 시간이 초과되었습니다 (15분). 다시 시도해 주세요."));
    }, 900_000);

    const server = http.createServer((req, res) => {
      const reqUrl = new URL(req.url || "/", `http://127.0.0.1:${port}`);
      if (reqUrl.pathname !== "/oauth2callback") {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      if (reqUrl.searchParams.get("state") !== state) {
        res.writeHead(400);
        res.end("Invalid OAuth state.");
        return;
      }

      const errorParam = reqUrl.searchParams.get("error");
      const authCode = reqUrl.searchParams.get("code");

      if (errorParam) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h2>YouTube 인증 요청이 거부되었습니다.</h2>");
        clearTimeout(timeout);
        server.close();
        reject(new Error(`YouTube OAuth 인증 거부/오류: ${errorParam}`));
        return;
      }

      if (!authCode) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Missing authorization code.");
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<h2>YouTube 인증이 완료되었습니다!</h2><p>이 창을 닫고 터미널로 돌아가셔도 됩니다.</p>",
      );
      clearTimeout(timeout);
      server.close();
      resolve(authCode);
    });

    server.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    server.listen(port, "127.0.0.1", async () => {
      console.log("\nYouTube OAuth 인증을 위해 아래 URL을 브라우저에서 열어 승인해 주세요:\n");
      console.log(`  ${authUrl}\n`);
      // Best-effort auto-open on macOS
      await execFileAsync("open", [authUrl]).catch(() => undefined);
    });
  });

  const { tokens } = await oauth2Client.getToken(code);
  await saveTokensSecurely(config.youtube.tokenPath, tokens);

  return {
    tokenPath: config.youtube.tokenPath,
    authUrl,
  };
}

/**
 * Returns an authorized YouTube Data API v3 client using saved tokens (auto-refreshing when needed).
 */
export async function getAuthorizedYouTubeClient(): Promise<youtube_v3.Youtube> {
  const config = getConfig();
  const { clientId, clientSecret } = await readClientCredentials(config.youtube.clientSecretPath);

  let tokenRaw: string;
  try {
    tokenRaw = await fs.readFile(config.youtube.tokenPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      throw new Error(
        `YouTube 인증 토큰을 찾을 수 없습니다 (${config.youtube.tokenPath}). 먼저 'pnpm evo youtube auth'를 실행하세요.`,
      );
    }
    throw error;
  }

  const tokens = JSON.parse(tokenRaw);
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials(tokens);

  oauth2Client.on("tokens", (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    void saveTokensSecurely(config.youtube.tokenPath, merged);
  });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  const expectedChannelId = "UCCtGyB0lbnsT0ES0Yuwhwjg";
  const response = await youtube.channels.list({ part: ["id"], mine: true });
  if (!response.data.items?.some(channel => channel.id === expectedChannelId)) {
    throw new Error("잠이오는 스위프트 진화의 역사 채널로 다시 인증해 주세요.");
  }
  return youtube;
}
