import { LanguageSite } from "../../interfaces/LanguageSite";
import { getLogger } from "../../services";
import { processURLForNavigationServer } from "../../services/urlServiceServer";
import { logPrefix } from "../../utils";

const log = getLogger("ata.headless.cms.heartcore.tools.processRawUrlsOnServer");

export async function processRawUrlsOnServer(object: any, languageSite: LanguageSite, fieldKey:string = 'url') {
  const promises = [];

  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      if (typeof object[key] === 'object' && object[key] !== null) {
        // if the value is another object, we recursively process it
        log.trace(`${logPrefix()}[processRawUrlsOnServer][0] > ${key}`);
        promises.push(processRawUrlsOnServer(object[key], languageSite, fieldKey));
      } else if (key === fieldKey) {
        const existingValue = object[key] as string;

        if(existingValue && existingValue.length > 0 && !existingValue.startsWith('https')){
          // If the key is 'url', we process it with findAliasMatch function
          log.trace(`${logPrefix()}[processRawUrlsOnServer][1] > ${existingValue.length}`);
          const promise = processURLForNavigationServer(existingValue, languageSite).then((friendlyUrl: any) => {
            log.trace(`${logPrefix()}[processRawUrlsOnServer][2] > ${friendlyUrl} ${key}`);
            object[key] = friendlyUrl;
          });

          promises.push(promise);
        }
      }
    }
  }

  // wait for all promises to resolve
  await Promise.all(promises);
}
