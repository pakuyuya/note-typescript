/**
 * Created by yu on 2017/03/11.
 */

type Resolve = <T> (result: T) => void;
type Reject = <T> (reason: T) => void;
type Catch = <T> (reason: T) => void;
type Callback = (resolve?: Resolve, reject?: Reject) => void;

type Listener = <T,U> (result?: T) => U

export interface IES5Promise {
    then(success: Listener, error?: Listener) : IES5Promise;
    catch(oncatch: Listener) : IES5Promise;
}

export class ES5Promise implements IES5Promise {
     private chain : ES5PromiseChain = new ES5PromiseChain(null, null, null);

     public constructor(private callback:Callback) {
         let suddessResult = null;
         let errorResult = null;
         let success = (result: any) => {
            if (this.chain) {
                this.chain.resolve(result);
            }
         }
         let error = (reason: any) => {
             if (this.chain) {
                 this.chain.reject(reason)
             }
         }

         setTimeout( () => {
             try {
                 callback(success, error);
             } catch (reason) {
                 this.chain.catch(reason);
             }
         });
     }

     public then(success:Listener, error?:Listener) : IES5Promise {
          return new ES5ThenPromise(this.chain);
     }
     public catch(fnCatch:Listener) : IES5Promise {
          return new ES5ThenPromise(new ES5PromiseChain(this.chain._resolve, this.chain._reject, fnCatch));
     }
}

class ES5ThenPromise implements IES5Promise {
    public constructor(private chain: ES5PromiseChain) {
    }
    public then(success:Listener, error?:Listener) : IES5Promise {
        return new ES5ThenPromise(new ES5PromiseChain(success, error, this.chain._catch));
    }
    public catch(fnCatch:Listener) : IES5Promise {
        return new ES5ThenPromise(new ES5PromiseChain(this.chain._resolve, this.chain._reject, fnCatch));
    }
}

class ES5PromiseChain {
    public _resolve: Resolve;
    public _reject: Reject;
    public _catch: Catch;

    public constructor(resolve: Resolve, reject: Reject, fncatch: Catch) {
        this._resolve = resolve;
        this._reject = reject;
        this._catch = fncatch;
    }

    public setResolve(resolve:Resolve)
    {
        this._resolve = resolve;
    }
    public setReject(reject:Resolve)
    {
        this._reject = reject;
    }
    public setCatch(fnCatch:Catch) {
        this._catch = fnCatch;
    }

    public resolve(result: any)  {
        if (this._resolve) {
            this._resolve(result);
        }
    }
    public reject(reason: any)  {
        if (this._reject) {
            this._reject(reason);
        }
    }
    public catch(reason: any)  {
        if (this._catch) {
            this._catch(reason);
        }
    }
}