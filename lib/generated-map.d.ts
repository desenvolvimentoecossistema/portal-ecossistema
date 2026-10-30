declare const app:{fetch(request:Request,env:Record<string,unknown>,user:{userId:string,email:string,displayName:string}):Promise<Response>};
export default app;
