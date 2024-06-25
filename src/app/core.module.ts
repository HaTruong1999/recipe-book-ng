import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { AuthInterceptorSerivice } from "./auth/auth-interceptor.service";

@NgModule({
    providers: [
        {
          provide: HTTP_INTERCEPTORS, 
          useClass: AuthInterceptorSerivice,
          multi: true
        }
    ],
})
export class CoreModule {}