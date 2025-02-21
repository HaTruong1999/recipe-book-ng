import { Actions, ofType, createEffect } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import * as AuthActions from './auth.actions';
import { HttpClient } from "@angular/common/http";
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

export interface AuthResponseData {
    kind: string,
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered: boolean,
}

const handleAuthentication = (
    expiresIn: number,
    email: string,
    userId: string,
    token: string
) => {
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000); 
    const user = new User(email, userId, token, expirationDate);
    localStorage.setItem('userData', JSON.stringify(user));

    return new AuthActions.AuthenticateSuccess({
        email: email,
        userId: userId,
        token: token,
        expirationDate: expirationDate,
        redirect: true
    })
}

const handleError = (errorRes: any) => {
    let errorMessage = 'An unknow error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
        return of(new AuthActions.AuthenticateFail(errorMessage))
    }
    switch (errorRes.error.error.message){
        case 'EMAIL_EXISTS':
            errorMessage = 'This email exists already';
            break;
        case 'EMAIL_NOT_FOUND':
            errorMessage = 'This email does not exist';
            break;
        case 'INVALID_PASSWORD':
            errorMessage = 'This password is not correct';
            break;
    } 
    return of(new AuthActions.AuthenticateFail(errorMessage))
}

@Injectable()
export class AuthEffects {
    authSignup$ = createEffect(() => 
        this.actions$.pipe(
            ofType(AuthActions.SIGNUP_START),
            switchMap((signupAction: AuthActions.SignupStart) => {
                return this.http.post<AuthResponseData>
                ('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
                {
                    email: signupAction.payload.email,
                    password: signupAction.payload.password,
                    returnSecureToken: true
                }).pipe(
                    tap(resData => {
                        this.authService.setLogoutTimer(+resData.expiresIn * 1000)
                    }),
                    map(resData => {
                        return handleAuthentication(
                            +resData.expiresIn,
                            resData.email,
                            resData.localId,
                            resData.idToken
                        );
                    }),
                    catchError(errRes => {
                    return handleError(errRes);
                    })
                )
            })
        )
    )
    
    authLogin$ = createEffect(() => 
        this.actions$.pipe(
            ofType(AuthActions.LOGIN_START),
            switchMap((AuthData: AuthActions.LoginStart) => {
                return this.http.post<AuthResponseData>(
                    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
                    {
                        email: AuthData.payload.email,
                        password: AuthData.payload.password,
                        returnSecureToken: true
                    }
                ).pipe(
                    tap(resData => {
                        this.authService.setLogoutTimer(+resData.expiresIn * 1000)
                    }),
                    map(resData => {
                        return handleAuthentication(
                            +resData.expiresIn,
                            resData.email,
                            resData.localId,
                            resData.idToken
                        );
                    }),
                    catchError(errRes => {
                        return handleError(errRes);
                    })
                )
            })
        ),
        {
            dispatch: true,
        }
    )
    
    autoLogin$ = createEffect(() => 
        this.actions$.pipe(
            ofType(AuthActions.AUTO_LOGIN),
            map(() => {
                const userLocal = localStorage.getItem('userData');
                if(!userLocal) return { type : 'DUMMY'};

                const userData: {
                    email: string,
                    userId: string,
                    _token: string,
                    _tokenExpirationDate: string
                } = JSON.parse(userLocal);

                if (!userData) return { type : 'DUMMY'};
                const loadedUser = new User(userData.email, userData.userId, userData._token, new Date(userData._tokenExpirationDate)) 

                if (loadedUser._token) {
                    const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
                    this.authService.setLogoutTimer(expirationDuration);
                    return new AuthActions.AuthenticateSuccess({
                        email: loadedUser.email ?? '',
                        userId: loadedUser.userId ?? '', 
                        token: loadedUser._token,
                        expirationDate: new Date(userData._tokenExpirationDate),
                        redirect: false
                    })
                }

                return { type : 'DUMMY'};
            })
        ),
        {
            dispatch: true,
        }
    )
    
    authRedirect$ = createEffect(() => 
        this.actions$.pipe(
            ofType(
                AuthActions.AUTHENTICATE_SUCCESS
            ),
            tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
                if (authSuccessAction.payload.redirect) {
                    this.router.navigate(['/recipes']);
                }
            })
        ),
        {
            dispatch: false,
        }
    )
    
    authLogout$ = createEffect(() => 
        this.actions$.pipe(
            ofType(
                AuthActions.LOGOUT
            ),
            tap(() => {
                this.authService.clearLogoutTimer();
                localStorage.removeItem('userData');
                this.router.navigate(['/auth']);
            })
        ),
        {
            dispatch: false,
        }
    )

    constructor (
        private actions$: Actions,
        private http: HttpClient,
        private router: Router,
        private authService: AuthService
    ) {}
}