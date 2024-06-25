import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect} from '@ngrx/effects';
import { map, switchMap, withLatestFrom} from 'rxjs';
import { Recipe } from '../recipe.model';
import * as RecipeActions from '../store/recipe.actions';
import * as fromApp from '../../store/app.reducer';
import { Store } from '@ngrx/store';

@Injectable()
export class RecipeEffects {
    fetchRecipes$ = createEffect(() => 
        this.actions$.pipe(
            ofType(RecipeActions.FETCH_RECIPES),
            switchMap(() => {
                
                return this.http
                    .get<Recipe[]>(
                            'https://ng-course-recipe-book-c1dd0-default-rtdb.firebaseio.com/recipes.json'
                    )
                    .pipe(
                        map(recipes => {
                            return recipes.map(recipe => {
                                return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []};
                            })
                        }),
                        map(recipes => {
                            return new RecipeActions.SetRecipes(recipes)
                        })
                    )
            })
        ),
        {
            dispatch: true,
        }
    )

    storeRecipes$ = createEffect(() => 
        this.actions$.pipe(
            ofType(RecipeActions.STORE_RECIPES),
            withLatestFrom(this.store.select('recipe')),
            switchMap(([actionData, recipeState]) => {
                return this.http.put(
                    'https://ng-course-recipe-book-c1dd0-default-rtdb.firebaseio.com/recipes.json',
                    recipeState.recipes
                );
            })
        ),
        {
            dispatch: false,
        }
    )

    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private store: Store<fromApp.AppState>
    ){}
}