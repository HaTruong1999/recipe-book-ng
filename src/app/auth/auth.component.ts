import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { Store } from '@ngrx/store';

import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceholderDirective } from "../shared/placeholder/placeholder.directive";
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {
    isLoginMode: boolean = false;
    isLoading: boolean = false;
    error: string | null = null;
    @ViewChild(PlaceholderDirective) alertHost: PlaceholderDirective | undefined;

    private closeSub: Subscription | undefined;
    private storeSub: Subscription | undefined;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private store: Store<fromApp.AppState>
    ){}

    ngOnInit() {
        this.storeSub = this.store.select('auth').subscribe(authState => {
            this.isLoading = authState.loading;
            this.error = authState.authError;
            if(this.error) {
                this.showErrorAlert(this.error);
            }
        });
    }

    onSwitchMode(){
        this.isLoginMode = !this.isLoginMode;
    }

    onSubmit(form: NgForm) {
        if(!form.valid) return;

        const email = form.value.email;
        const password = form.value.password;

        if(this.isLoginMode){
            this.store.dispatch(new AuthActions.LoginStart({
                email: email,
                password: password
            }));
        }else {
            this.store.dispatch(new AuthActions.SignupStart({
                email: email,
                password: password
            }));
        }

        form.reset();
    }

    onHandleError() {
        this.store.dispatch(new AuthActions.ClearError());
    }

    ngOnDestroy() {
        this.closeSub?.unsubscribe();
        this.storeSub?.unsubscribe();
    }

    private showErrorAlert(message: string) {
        const alertCmpFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);

        const hostViewContainerRef = this.alertHost?.viewContainerRef;

        hostViewContainerRef?.clear();

        const componentRef = hostViewContainerRef?.createComponent(alertCmpFactory);

        componentRef!.instance!.message = message;
        this.closeSub = componentRef!.instance!.close.subscribe(() => {
            this.closeSub?.unsubscribe();
            hostViewContainerRef?.clear();
        });
    }
}