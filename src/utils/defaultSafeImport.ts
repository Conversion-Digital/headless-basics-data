import { getLogger } from "../services/logging/LogConfig";
import { logPrefix } from "./logPrefix";


const log = getLogger("services.components.themes.componentThemeScaffold");

export async function safeImportOfModule(modulePath: string, source: string = "") {
    try {
      return await import(modulePath);
    } catch (error) {
      log.trace(`${logPrefix()}[${source}]⚠️ Warning: Failed to import module at path: ${modulePath}`);
      return null; // Avoid crashing if module doesn't exist
    }
  }