import * as prettier from 'prettier';
import * as parser from 'prettier/parser-typescript';

export async function formatCode(code: string): Promise<string> {
  try {
    const formatted = await prettier.format(code, {
      parser: 'typescript',
      plugins: [parser],
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      tabWidth: 2,
    });
    return formatted;
  } catch (error) {
    console.error('Formatting error:', error);
    return code;
  }
}