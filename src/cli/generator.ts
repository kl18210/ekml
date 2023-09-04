import fs from "fs";
import { CompositeGeneratorNode, NL, toString } from "langium";
import path from "path";
import {
  Model,
  Stmt,
  isPen,
  isMove,
  isMacro,
  isFor,
  isColor,
  Lit,
  Expr,
  isRef,
  isBinExpr,
  isNegExpr,
  Def,
  isGroup,
} from "../language/generated/ast";
import { extractDestinationAndName } from "./cli-util";

export function generateJavaScript(
  model: Model,
  filePath: string,
  destination: string | undefined
): string {
  const data = extractDestinationAndName(filePath, destination);
  const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

  const fileNode = new CompositeGeneratorNode();
  fileNode.append('"use strict";', NL, NL);
  //model.greetings.forEach(greeting => fileNode.append(`console.log('Hello, ${greeting.person.ref?.name}!');`, NL));

  if (!fs.existsSync(data.destination)) {
    fs.mkdirSync(data.destination, { recursive: true });
  }
  fs.writeFileSync(generatedFilePath, toString(fileNode));
  return generatedFilePath;
}

export function generateCommands(
  model: Model,
  filePath: string,
  destination: string | undefined
): string {
  const data = extractDestinationAndName(filePath, destination);
  const generatedFilePath = `${path.join(data.destination, data.name)}.json`;

  if (!fs.existsSync(data.destination)) {
    fs.mkdirSync(data.destination, { recursive: true });
  }

  const result = generateStatements(model.stmts);

  fs.writeFileSync(generatedFilePath, JSON.stringify(result, undefined, 2));
  return generatedFilePath;
}
// map of names to values
type MiniLogoGenEnv = Map<string, number>;

function generateStatements(stmts: Stmt[]): Object[] {
  // minilogo evaluation env
  let env: MiniLogoGenEnv = new Map<string, number>();

  // generate mini logo cmds off of statements
  return stmts
    .flatMap((s) => evalStmt(s, env))
    .filter((e) => e !== undefined) as Object[];
}

function evalStmt(stmt: Stmt, env: MiniLogoGenEnv): (Object | undefined)[] {
  if (isPen(stmt)) {
    return [
      {
        cmd: stmt.mode === "up" ? "penUp" : "penDown",
      },
    ];
  }

  if (isMove(stmt)) {
    return [
      {
        cmd: "move",
        x: evalExprWithEnv(stmt.ex, env),
        y: evalExprWithEnv(stmt.ey, env),
      },
    ];
  }

  if (isMacro(stmt)) {
    // get the cross ref
    const macro: Def = stmt.def.ref as Def;

    // copied env
    let macroEnv = new Map(env);

    // produce pairs of string & exprs, using a tmp env
    // this is important to avoid mixing of params that are only present in the tmp env w/ our actual env
    let tmpEnv = new Map<string, number>();

    // evalute args independently, staying out of the environment
    macro.params.map((elm, idx) =>
      tmpEnv.set(elm.name, evalExprWithEnv(stmt.args[idx], macroEnv))
    );
    // add new params into our copied env
    tmpEnv.forEach((v, k) => macroEnv.set(k, v));

    // evaluate all statements under this macro
    return macro.body.flatMap((s) => evalStmt(s, macroEnv));
  }

  if (isFor(stmt)) {
    // compute for loop bounds
    // start
    let vi = evalExprWithEnv(stmt.e1, env);
    // end
    let ve = evalExprWithEnv(stmt.e2, env);

    let results: (Object | undefined)[] = [];

    // perform loop
    const loopEnv = new Map(env);
    while (vi < ve) {
      loopEnv.set(stmt.var.name, vi++);
      stmt.body.forEach((s) => {
        results = results.concat(evalStmt(s, new Map(loopEnv)));
      });
    }

    return results;
  }

  if (isColor(stmt)) {
    if (stmt.color) {
      // literal color text or hex
      return [{ cmd: "color", color: stmt.color }];
    } else {
      // color as rgb
      const r = evalExprWithEnv(stmt.r!, env);
      const g = evalExprWithEnv(stmt.g!, env);
      const b = evalExprWithEnv(stmt.b!, env);
      return [{ cmd: "color", r, g, b }];
    }
  }
  return [];
}

// evalutes exprs in the context of an env
function evalExprWithEnv(e: Expr, env: MiniLogoGenEnv): number {
  if (isRef(e)) {
    const v = env.get(e.val.ref?.name ?? "");
    if (v !== undefined) {
      return v;
    }
    // handle the error case...
  } else if (isBinExpr(e)) {
    let opval = e.op;
    let v1 = evalExprWithEnv(e.e1, env);
    let v2 = evalExprWithEnv(e.e2, env);

    switch (opval) {
      case "+":
        return v1 + v2;
      case "-":
        return v1 - v2;
      case "*":
        return v1 * v2;
      case "/":
        return v1 / v2;
      default:
        throw new Error(`Unrecognized bin op passed: ${opval}`);
    }
  } else if (isNegExpr(e)) {
    return -1 * evalExprWithEnv(e.ne, env);
  } else if (isGroup(e)) {
    return evalExprWithEnv(e.ge, env);
  }
  //if (isLit(e))
  //else {
    return (e as Lit).val;
  //}
}
