import { spawn } from 'node:child_process';
const args=process.argv.slice(2);const portIndex=args.indexOf('--port');const hostIndex=args.indexOf('--host');
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname',hostIndex>=0?args[hostIndex+1]:'0.0.0.0',...(portIndex>=0?['--port',args[portIndex+1]]:[])],{stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??0));
