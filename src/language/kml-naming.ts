import type { Entity } from './generated/ast.js';
import { isEntity } from './generated/ast.js';

export function toQualifiedName(entity: Entity, childName: string): string {
    return (isEntity(entity.$container) ? toQualifiedName(entity.$container, entity.name) : entity.name) + '.' + childName;
}

export class QualifiedNameProvider {

    /**
     * @param qualifier if the qualifier is a `string`, simple string concatenation is done: `qualifier.name`.
     *      if the qualifier is a `PackageDeclaration` fully qualified name is created: `package1.package2.name`.
     * @param name simple name
     * @returns qualified name separated by `.`
     */
    getQualifiedName(qualifier: Entity | string, name: string): string {
        let prefix = qualifier;
        if (isEntity(prefix)) {
            prefix = (isEntity(prefix.$container)
                ? this.getQualifiedName(prefix.$container, prefix.name) : prefix.name);
        }
        return prefix ? prefix + '.' + name : name;
    }

}