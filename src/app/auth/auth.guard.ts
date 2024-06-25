import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { map, take, tap } from "rxjs/operators";
import { AuthService } from "./auth.service";
import * as fromApp from "../store/app.reducer";
import { Store } from "@ngrx/store";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private store: Store<fromApp.AppState>,
    ){}

    canActivate(
        route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot
    ): boolean | UrlTree | Promise<boolean | UrlTree>| Observable<boolean | UrlTree> {
        return this.store.select('auth')
            .pipe(
                take(1),
                map((authState: any) =>  {
                    const isAuth = !!authState.user;
                    if (isAuth) {
                        return true;
                    }

                    return this.router.createUrlTree(['/auth']);
                })
            )
        }
}