import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription} from 'rxjs';
import { map } from 'rxjs/operators';

import { Recipe } from '../recipe.model';
import * as fromApp from '../../store/app.reducer';
import * as RecipeActions from '../store/recipe.actions';
import * as ShoppingListActions from '../../shopping-list/store/shopping-list.actions';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
})
export class RecipeDetailComponent implements OnInit {
  subscription: Subscription | undefined;
  recipe!: Recipe;
  id: number | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>,
  ) { }

  ngOnInit(): void {

    this.route.params
      .subscribe((params: Params) => {
        this.id = +params['id'];
        this.subscription = this.store
          .select('recipe')
          .pipe(
            map(recipeState => {
              return recipeState.recipes.find((recipe, index) => {
                return index === this.id;
              })
            })
          )
          .subscribe((recipe: any) => {
            this.recipe = recipe;
          })
        }
      )
    
    // this.route.params
    //   .pipe(
    //     map(params => {
    //       return +params['id'];
    //     }),
    //     switchMap(id => {
    //       this.id = id;
    //       return this.store.select('recipe');
    //     }),
    //     map(recipeState => {
    //       return recipeState.recipes.find((recipe, index) => {
    //         return index === this.id;
    //       })
    //     })
    //   )
    //   .subscribe(recipe => {
    //     this.recipe = recipe;
    //   })
  }

  onAddToShoppingList(){
    this.store.dispatch(
      new ShoppingListActions.AddIngredients(this.recipe.ingredients)
    );
  }

  onEditRecipe(){
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  onDeleteRecipe(){
    this.store.dispatch(new RecipeActions.DeleteRecipe(this.id as number));
    this.router.navigate(['/recipes']);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
