// Pro úspěšné spuštění tohoto skriptu je nutné běhové prostředí Deno: https://deno.land

import * as colors from "https://deno.land/std@0.172.0/fmt/colors.ts";
import { normalize, fromFileUrl } from "https://deno.land/std@0.172.0/path/mod.ts";

const VALIDATOR_URL = "https://validator.w3.org/nu";

async function walk(dir = fromFileUrl(new URL("..", import.meta.url))) {
    for await (const entry of Deno.readDir(dir)) {
        if (entry.isDirectory) {
            await walk(`${dir}/${entry.name}`);
        } else if (entry.isFile && entry.name.endsWith(".html")) {
            const resp = await fetch(`${VALIDATOR_URL}/?out=json`, {
                method: "POST",
                headers: {
                    "Content-Type": "text/html; charset=utf-8"
                },
            
                body: await Deno.readTextFile(`${dir}/${entry.name}`),
            
            });
            
            if (!resp.ok) {
                console.error(`Response from W3C validator API not HTTP 200 OK`);
            } else {
                const jsonData = await resp.json().catch(() => {
                    console.error(`Invalid response data from W3C validator API`);
                    Deno.exit(1);
                });

                console.log(colors.bold(colors.blue(`Validator results for ${normalize(`${dir}/${entry.name}`)}:`)))

                if (Array.isArray(jsonData.messages) && jsonData.messages.length === 0) {
                    console.log(`${colors.gray("0:0")} ${colors.green(`The document is valid.`)}`);
                    continue;
                }

                for (const message of jsonData.messages) {
                    const lineStart = message.firstLine ?? message.lastLine;
                    const colStart = message.firstColumn ?? message.lastColumn;

                    if (message.type === "non-document-error") {
                        console.error(`${colors.gray(`${lineStart}:${colStart}`)} ${colors.bold(colors.red(`The document couldn't be parsed: ${message.message}`))}`);
                    } else if (message.type === "error") {
                        if (message.subType === "fatal") {
                            console.error(`${colors.gray(`${lineStart}:${colStart}`)} ${colors.bold(colors.red(`Fatal error: ${message.message}`))}`);
                        } else {
                            console.error(`${colors.gray(`${lineStart}:${colStart}`)} ${colors.red(`Error: ${message.message}`)}`);
                        }
                    } else if (message.type === "info") {
                        if (message.subType === "warning") {
                            console.warn(`${colors.gray(`${lineStart}:${colStart}`)} ${colors.yellow(`Warning: ${message.message}`)}`);
                        } else {
                            console.info(`${colors.gray(`${lineStart}:${colStart}`)} ${colors.blue(`Info: ${message.message}`)}`);
                        }
                    } else {
                        console.log(`${colors.gray(`${lineStart}:${colStart}`)} ${message.type}(${message.subType}): ${message.message}`);
                    }
                }
            }
        }
    }
}

await walk();
