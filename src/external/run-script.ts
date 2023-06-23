import { ChildProcess, ChildProcessWithoutNullStreams, SpawnOptionsWithoutStdio, spawn } from "child_process";
import { error } from "console";

export class ScriptRunner {
    process?: ChildProcessWithoutNullStreams;

    run(
        command: string,
        args?: ReadonlyArray<string>,
        options?: SpawnOptionsWithoutStdio,
        onData?: (data: any) => void,
        onError?: (error: any) => void,
        onClose?: (status: number) => void
    ) {
        this.process = spawn(command, args, options);

        if (onData) {
            this.process.stdout.on('data', onData);
        }

        if (onError) {
            this.process.stderr.on('data', onError);
        }

        if (onClose) {
            this.process.on('close', onClose)
        }

        return;
    }
}

type TenantCreateVars = {
    awsAccessKey: string;
    awsSecretKey: string;
    awsSessionToken: string;
    awsRegion: string;
    keyPairName: string;
    dbUserName: string;
    dbPassword: string;
    dbName: string;
    appSecret: string;
    tenantId: string;
}

type TenantDestroyVars = {
    awsAccessKey: string;
    awsSecretKey: string;
    awsSessionToken: string;
    tenantId: string;
}

const runScript = (
    vars: TenantCreateVars,
    onData?: (data: any) => void,
    onError?: (error: any) => void,
): Promise<number> => {
    const runner = new ScriptRunner();

    return new Promise((resolve, reject) => {
        runner.run(
            "sh", [
            "./src/external/initialize-tenant.sh",
            vars.awsAccessKey,
            vars.awsSecretKey,
            vars.awsSessionToken,
            vars.awsRegion,
            vars.keyPairName,
            vars.dbName,
            vars.dbUserName,
            vars.dbPassword,
            vars.appSecret,
            vars.dbName,
            vars.dbUserName,
            vars.dbPassword,
            vars.tenantId
        ],
            ({}),
            onData,
            onError,
            (status) => {
                if (status === 0) {
                    resolve(status);
                } else {
                    reject(status);
                }
            }
        );
    });
}

const runDestroyScript = (
    vars: TenantDestroyVars,
    onData?: (data: any) => void,
    onError?: (error: any) => void
) => {
    const runner = new ScriptRunner();

    return new Promise((resolve, reject) => {
        runner.run("sh", [
            "./src/external/destroy-tenant.sh",
            vars.awsAccessKey,
            vars.awsSecretKey,
            vars.awsSecretKey,
            vars.tenantId
        ],
            ({}),
            onData,
            onError,
            (status) => {
                if (status === 0) {
                    resolve(status);
                } else {
                    reject(status);
                }
            })
    });
}

export { runScript, runDestroyScript };
