/**
 * @fileoverview Disallows invalid custom element names
 * @author Michael Stramel <https://github.com/stramel>
 */

import {Rule} from 'eslint';
import * as ESTree from 'estree';
import isValidElementName = require('is-valid-element-name');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const isBestPracticeElementName = (name: string): boolean =>
  !name.startsWith('xml') &&
  !name.startsWith('polymer-') &&
  !name.startsWith('ng-') &&
  !name.startsWith('x-') &&
  !name.endsWith('-') &&
  !name.includes('--') &&
  !name.includes('.');

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Disallows invalid custom element names',
      url: 'https://github.com/43081j/eslint-plugin-wc/blob/master/docs/rules/no-invalid-element-name.md'
    },
    messages: {
      invalidElementName:
        "Element name is invalid and should follow the HTML standard's recommendations" +
        '(https://html.spec.whatwg.org/multipage/custom-elements.html#prod-potentialcustomelementname).'
    },
    schema: [
      {
        type: 'object',
        properties: {
          loose: {type: 'boolean'}
        },
        additionalProperties: false
      }
    ]
  },

  create(context): Rule.RuleListener {
    // variables should be defined here

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      CallExpression: (node: ESTree.CallExpression): void => {
        if (
          node.callee.type === 'MemberExpression' &&
          ((node.callee.object.type === 'MemberExpression' &&
            node.callee.object.object.type === 'Identifier' &&
            node.callee.object.object.name === 'window' &&
            node.callee.object.property.type === 'Identifier' &&
            node.callee.object.property.name === 'customElements') ||
            (node.callee.object.type === 'Identifier' &&
              node.callee.object.name === 'customElements')) &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'define'
        ) {
          const firstArg = node.arguments[0];
          if (
            firstArg &&
            firstArg.type === 'Literal' &&
            typeof firstArg.value === 'string'
          ) {
            const validationResult = isValidElementName(firstArg.value);
            const options = context.options[0];
            const isWarning =
              !(options && options.loose) &&
              !isBestPracticeElementName(firstArg.value);

            if (!validationResult || isWarning) {
              context.report({
                messageId: 'invalidElementName',
                node: firstArg
              });
            }
          }
        }
      }
    };
  }
};

export default rule;
