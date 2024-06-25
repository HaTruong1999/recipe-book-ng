import { HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { exhaustMap, map, take } from "rxjs/operators";
import * as fromApp from "../store/app.reducer";

@Injectable()
export class AuthInterceptorSerivice implements HttpInterceptor{
    constructor (
        private store: Store<fromApp.AppState>
    ){}

    intercept(req: HttpRequest<any>, next: HttpHandler){
        return this.store.select('auth')
            .pipe(
                take(1), 
                exhaustMap((authState: any) => {
                    if(!authState.user) {
                        return next.handle(req);
                    }
                    
                    const modifiedReq = req.clone({params: new HttpParams().set('auth', authState.user.token ?? '')})
                    return next.handle(modifiedReq);
            }));
    }
}