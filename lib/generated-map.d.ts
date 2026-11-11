declare const app:{fetch(request:Request,env:Record<string,unknown>,user:{userId:string,email:string,displayName:string,role:'admin'|'user'}):Promise<Response>};
export default app;
