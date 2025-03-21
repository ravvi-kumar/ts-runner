import * as prettier from 'prettier';
import * as parser from 'prettier/parser-typescript';

export const formatCode = async (code: string): Promise<string> => {
  try {
    const formatted = await prettier.format(code, {
      parser: 'typescript',
      plugins: [parser],
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      tabWidth: 2,
      printWidth: 80,
    });
    return formatted;
  } catch (error) {
    console.error('Format error:', error);
    return code; // Return original code if formatting fails
  }
}; 