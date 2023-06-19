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
}

const runScript = (
    vars: TenantCreateVars,
    onData?: (data: any) => void,
    onError?: (error: any) => void,
    onClose?: (status: number) => void
) => {
    const runner = new ScriptRunner();
    runner.run(
        "cd", [
        'temp',
        '&&',
        'terraform',
        'init',
        '&&',
        'terraform',
        'apply',
        `-var "aws_access_key=${vars.awsAccessKey}"`,
        `-var "aws_secret_key=${vars.awsSecretKey}"`,
        `-var "aws_session_token=${vars.awsSessionToken}"`,
        `-var "aws_region=${vars.awsRegion}"`,
        `-var "key_pair_name=${vars.keyPairName}"`,
        `-var "mongo_db_name=${vars.dbName}"`,
        `-var "mongo_username=${vars.dbUserName}"`,
        `-var "mongo_password=${vars.dbPassword}"`,
        `-var "app_secret=${vars.appSecret}"`,
        `-var "rds_db_name=${vars.dbName}"`,
        `-var "rds_username=${vars.dbUserName}"`,
        `-var "rds_password=${vars.dbPassword}"`,
        '-auto-approve'
    ],
        ({}),
        onData, onError, onClose
    );
}

export { runScript };
