import { TaskMockRunner } from "vsts-task-lib/mock-run";
import * as path from "path";
import registerMockWebpack from "./shared/mockWebpackRegister";

const taskPath = path.join(__dirname, "..", "..", "index.js");
const taskMockRunner = new TaskMockRunner(taskPath);

const webpackJsLocation = "node_modules/webpack/bin/webpack.js";
const workingFolder = path.join(__dirname);
const webpackArguments = "--config webpack.dist.config.js";

taskMockRunner.setInput("webpackJsLocation", webpackJsLocation);
taskMockRunner.setInput("arguments", webpackArguments);
taskMockRunner.setInput("workingFolder", workingFolder);
taskMockRunner.setInput("treatErrorsAs", "errors");
taskMockRunner.setInput("treatWarningsAs", "warnings");

taskMockRunner.setAnswers({
    exist: {
        "": false
    }
});

taskMockRunner.registerMockExport("getVariable", (variableName: string) => {
    if (variableName === "task.displayname") {
        return "webpack test";
    }

    return "";
});

registerMockWebpack(taskMockRunner, workingFolder, webpackJsLocation);

taskMockRunner.registerMock("child_process", {
    execSync: (webpackCommand: string) => {
        const expectedWebpackCommand = `node "${path.resolve(workingFolder, webpackJsLocation)}" --json ${webpackArguments}`;

        if (webpackCommand === expectedWebpackCommand) {
            return JSON.stringify({
                hash: "hash",
                version: "1.0.0",
                time: "1",
                errors: ["error"],
                warnings: ["warning"],
                assets: [],
                chunks: [
                    {
                        modules: [
                            {
                            }
                        ]
                    }
                ]
            });
        }
    }
});

taskMockRunner.run();
