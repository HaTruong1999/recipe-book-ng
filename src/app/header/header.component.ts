import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as fromApp from "../store/app.reducer";
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipeActions from '../recipes/store/recipe.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy{
  isAuthenticated: boolean = false;
  private userSub: Subscription | undefined;

  constructor(
    private store: Store<fromApp.AppState>
  ){}

  ngOnInit() {
    this.userSub = this.store
    .select('auth')
    .subscribe((authState: any) => {
      this.isAuthenticated = !!authState.user;
    });
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  onSaveData(){
    this.store.dispatch(new RecipeActions.StoreRecipes());
  }

  onFetchData(){
    this.store.dispatch(new RecipeActions.FetchRecipes())
  }

  onLogout(){
    this.store.dispatch(new AuthActions.Logout());
  }
}
