import chalk from "chalk";
import { Command } from "commander";
import { Model } from "../language/generated/ast";
import { MiniLogoLanguageMetaData } from "../language/generated/module";
import { createKmlServices } from "../language/kml-module";
import { extractAstNode, extractDocument } from "./cli-util";
import { generateCommands } from "./generator";
import { NodeFileSystem } from "langium/node";

export default function (): void {
  const program = new Command();

  program
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require("../../package.json").version);

  const fileExtensions = MiniLogoLanguageMetaData.fileExtensions.join(", ");
  const generateCommand = program.command("generate");
  const parseAndValidateCommand = program.command("parseAndValidate");

  generateCommand
  .argument(
    "<file>",
    `source file (possible file extensions: ${fileExtensions})`
  )
  .option("-d, --destination <dir>", "destination directory of generating")
  // new description
  .description(
    "generates MiniLogo commands that can be used as simple drawing instructions"
  )
  .action(generateAction);

 
  parseAndValidateCommand
    .argument(
      "<file>",
      `Source file to parse & validate (ending in ${fileExtensions})`
    )
    .description(
      "Indicates where a program parses & validates successfully, but produces no output code"
    )
    .action(parseAndValidate) // we'll need to implement this function
    ;

  program.parse(process.argv);
}

/**
 * Parse and validate a program written in our language.
 * Verifies that no lexer or parser errors occur.
 * Implicitly also checks for validation errors while extracting the document
 *
 * @param fileName Program to validate
 */
export const parseAndValidate = async (fileName: string): Promise<void> => {
  // retrieve the services for our language
  const services = createKmlServices(NodeFileSystem).Kml;
  // extract a document for our program
  const document = await extractDocument(fileName, services);
  // extract the parse result details
  const parseResult = document.parseResult;
  // verify no lexer, parser, or general diagnostic errors show up
  if (
    parseResult.lexerErrors.length === 0 &&
    parseResult.parserErrors.length === 0
  ) {
    console.log(chalk.green(`Parsed and validated ${fileName} successfully!`));
  } else {
    console.log(chalk.red(`Failed to parse and validate ${fileName}!`));
  }
};

export const generateAction = async (
    fileName: string,
    opts: GenerateOptions
  ): Promise<void> => {
    const services = createKmlServices(NodeFileSystem).Kml;
    const model = await extractAstNode<Model>(fileName, services);
    const generatedFilePath = generateCommands(model, fileName, opts.destination);
    console.log(
      chalk.green(
        `MiniLogo commands generated successfully: ${generatedFilePath}`
      )
    );
  };
  
  export type GenerateOptions = {
    destination?: string;
  };