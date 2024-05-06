/** ====== */
import { parse }  from '@babel/parser';
import traverse from '@babel/traverse';

/**
 * When browser requests a js file, if it needs to be transformed to a server action invocation, this function will do it. If not, return the original content.
 * @param {*} fileContent javascript file content
 * @param {*} fileName javascript file name
 */
export function actionTransform(fileContent, fileName) {


  const ast = parse(fileContent, {
    sourceType: 'module',
    plugins: ['asyncGenerators', 'jsx'],
  });

  /**
   * So what is actually an "action" in React ? an "action" is a stub of a server-side function. This kind of server-side function is marked by a special directive 'use server'. It is required to be implemented as a fetch call and exposed as a function import on client-side. This client-side javascript file needs to be downloaded by browser. So here what we do is get this javascript file (the stub) prepared for the moment when it is "esmodulely" imported. The code below does not deal with many edge cases. But it shows the essential.
   */
  let functionsExposedAsServerAction = [];
  traverse.default(ast, {
    // Traverse through FunctionDeclaration, FunctionExpression and ArrowFunctionExpression
    'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(path) {
      const hasUseServerDirective = path.node.body.directives && path.node.body.directives.some(
        (directive) => directive.value.value === 'use server'
      );

      if (hasUseServerDirective) {
        functionsExposedAsServerAction.push(path.node.id?.name);
        // console.info(`Function ${path.node.id?.name || 'anonymous'} contains 'use server' directive.`);
      } else {
        void 0;
        // console.info(`Function ${path.node.id?.name || 'anonymous'} does NOT contain 'use server' directive.`);
      }
    }
  });

  if (functionsExposedAsServerAction.length === 0) {
    return fileContent;
  }

  // Replace the function call with server action invocation
  const facadeCode = functionsExposedAsServerAction.map((fnName) => {
    return `export async function ${fnName}(params) {
      const response = await fetch('/__action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          moduleName: '${fileName}',
          functionName: '${fnName}',
          params: JSON.stringify(params),
        }),
      });
      if (response.ok) {
        const textRes = await response.text();
        if (textRes) {
          return JSON.parse(textRes);
        }
      }
      return null;
    }`;
  }
  ).join('\n');

  return facadeCode;
}