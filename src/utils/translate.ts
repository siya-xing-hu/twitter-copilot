import { stringifyQueryParameter } from "./common";
import googleTranslatorAPI from "../config/translate-config";

export async function translate(
  text: string,
  locale: string,
): Promise<any> {
  let url = googleTranslatorAPI +
    stringifyQueryParameter({
      q: text,
      tl: "zh_CN",
      sl: locale,
      client: "dict-chrome-ex",
    });

  const response = await fetch(url, {
    method: "GET",
  });

  const resp = await response.json();
  if (resp.error_code) {
    return Promise.reject(new Error("translate result error!"));
  }

  return resp[0]
    .map((item: any) => item[0])
    .filter((item: any) => typeof item === "string")
    .join("");
}
