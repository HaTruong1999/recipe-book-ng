import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { animate, group, keyframes, state, style, transition, trigger } from '@angular/animations';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import * as fromApp from '../../store/app.reducer';
import * as RecipeActions from '../store/recipe.actions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css'],
  animations: [
    trigger('list', [
      state('void', style({
        opacity: 1,
        transform: 'translateX(0)',
      })),
      transition('void => *', [
        animate(300, keyframes([
          style({
            transform: 'translateX(-50px)',
            opacity: 0,
            offset: 0,
          }),
          style({
            transform: 'translateX(-25px)',
            opacity: 0.5,
            offset: 0.5,
          }),
          style({
            transform: 'translateX(0)',
            opacity: 1,
            offset: 1,
          })
        ])),
        transition('* => void', [
          group([
            animate(300, style({
              color: 'red'
            })),
            animate(800, style({
              transform: 'translateX(100px)',
              opacity: 0
            }))
          ])
        ])
      ])
    ]),
  ]
})
export class RecipeEditComponent implements OnInit {
  state = 'in';
  id: number | undefined;
  editMode = false;
  recipeForm!: FormGroup;

  private storeSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>,
  ) { }

  get controls() {
    return (<FormArray>this.recipeForm.get('ingredients')).controls;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.editMode = params['id'] != null;
      this.initForm();
    });
  }

  onSubmit(){
    const newRecipe = this.recipeForm.value;

    if(this.editMode){
      this.store.dispatch(new RecipeActions.UpdateRecipe({
        index: this.id as number,
        newRecipe: newRecipe
      }));
    }else{
      this.store.dispatch(new RecipeActions.AddRecipe(newRecipe));
    }
    this.onCancel();
  }

  onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        'name': new FormControl(null, Validators.required),
        'amount': new FormControl(null, [
          Validators.required, 
          Validators.pattern(/^[1-9]+[0-9]*$/)
        ])
      })
    )
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }

  onCancel() {
    this.router.navigate(['../'],{ relativeTo: this.route });
  }

  private initForm(){
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    let recipeIngredients = new FormArray<any>([]);

    if(this.editMode){
      this.storeSub = this.store.select('recipe')
        .pipe(
          map(recipeState => recipeState.recipes.find(
            (recipe, index) => index === this.id)
          )
        )
        .subscribe(
          recipe => {
            if(!recipe) return;
            recipeName = recipe.name;
            recipeImagePath = recipe.imagePath;
            recipeDescription = recipe.description;
            if (recipe['ingredients']) {
              for (let ingredient of recipe.ingredients) {
                if(recipeIngredients != null){
                  recipeIngredients.push(
                    new FormGroup({
                      'name': new FormControl(ingredient.name, Validators.required),
                      'amount': new FormControl(ingredient.amount, [
                        Validators.required, 
                        Validators.pattern(/^[1-9]+[0-9]*$/)
                      ]),
                    })
                  )
                }
              }
            }
          }
        )
    }

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imagePath': new FormControl(recipeImagePath, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'ingredients': recipeIngredients
    });
  }

  ngOnDestroy(){
    this.storeSub?.unsubscribe();
  }
}
