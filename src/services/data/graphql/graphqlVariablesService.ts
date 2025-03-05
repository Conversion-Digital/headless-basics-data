import { PageAndSingleComponentDetails } from "../../../interfaces/PageDefinition";
import { variablesMultiSiteByIdentifier, variablesMultiSiteSlug } from "../../../multisite/multiSiteSlugTools";
import { logPrefix } from "../../../utils";
import { getLogger } from "../../logging/LogConfig";

const log = getLogger("headless.standard.variables");

export function standardVariables(IndividualComponentProps: PageAndSingleComponentDetails) {
    
    log.trace(`${logPrefix()}[${IndividualComponentProps.component.identifier}] standardVariables called .... `);

    let variables = {};
    if (typeof IndividualComponentProps.page.pageIdentifier === 'undefined') {
        throw new Error(`${logPrefix()}[model][variables] IndividualComponentProps.pageIdentifier is undefined`);
    }

    const thisBackendSlug = IndividualComponentProps?.page?.pageIdentifier?.backEndSlug;
    log.trace(`${logPrefix()}[${IndividualComponentProps.component.identifier}] standardVariables called .... thisBackendSlug ::: ${thisBackendSlug}`);

    if (typeof thisBackendSlug === 'undefined') {
        throw new Error(`${logPrefix()}[${IndividualComponentProps.component.identifier}][variables] IndividualComponentProps?.pageIdentifier?.backEndSlug is undefined`);
    }

    if (typeof thisBackendSlug === "string") {
        variables = variablesMultiSiteSlug(thisBackendSlug, IndividualComponentProps?.page?.languageSite)
    } else {
        variables = variablesMultiSiteByIdentifier(thisBackendSlug, IndividualComponentProps?.page?.languageSite)
    }

    log.trace(`${logPrefix()}[${IndividualComponentProps.component.identifier}] standardVariables returning .... `, JSON.stringify(variables));

    return variables
}
