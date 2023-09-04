import { ValidationAcceptor, ValidationChecks } from "langium";
import { KmlAstType, Model } from "./generated/ast";
import type { KmlServices } from "./kml-module";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: KmlServices) {
  const registry = services.validation.ValidationRegistry;
  const validator = services.validation.KmlValidator;
  const checks: ValidationChecks<KmlAstType> = {
    //Model: validator.checkUniqueDefs,
    //Def:   validator.checkUniqueParams
  };
  registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class KmlValidator {
  checkUniqueDefs(model: Model, accept: ValidationAcceptor): void {
    // create a set of visited functions
    // and report an error when we see one we've already seen
    //const reported = new Set();
    /*
        model.defs.forEach(d => {
            if (reported.has(d.name)) {
                accept('error',  `Def has non-unique name '${d.name}'.`,  {node: d, property: 'name'});
            }
            reported.add(d.name);
        });
      
      */
  }

}
