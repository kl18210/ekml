import type { AstNode } from 'langium';
import { AbstractFormatter, Formatting } from 'langium';
import * as ast from './generated/ast.js';

export class DomainModelFormatter extends AbstractFormatter {

    protected format(node: AstNode): void {
        if (ast.isEntity(node)) {
            const formatter = this.getNodeFormatter(node);
            const bracesOpen = formatter.keyword('{');
            const bracesClose = formatter.keyword('}');
            formatter.interior(bracesOpen, bracesClose).prepend(Formatting.indent());
            bracesClose.prepend(Formatting.newLine());
        } else if (ast.isEntity(node)) {
            const formatter = this.getNodeFormatter(node);
            const bracesOpen = formatter.keyword('{');
            const bracesClose = formatter.keyword('}');
            formatter.interior(bracesOpen, bracesClose).prepend(Formatting.indent());
            bracesClose.prepend(Formatting.newLine());
        } else if (ast.isModel(node)) {
            const formatter = this.getNodeFormatter(node);
            const nodes = formatter.nodes(...node.Entities,...node.Associations);
            nodes.prepend(Formatting.noIndent());
        }
    }

}