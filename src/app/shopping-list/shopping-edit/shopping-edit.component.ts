import { Component,OnInit, ViewChild} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Ingredient } from 'src/app/shared/ingredient.model';
import * as ShoppingListActions from '../store/shopping-list.actions';
import * as fromApp from '../../store/app.reducer';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css'],
})
export class ShoppingEditComponent implements OnInit {
  @ViewChild('f') slForm: NgForm | undefined;
  subscription: Subscription | undefined;
  editMode: boolean = false;
  editedItem!: Ingredient | null;

  constructor(
    private store: Store<fromApp.AppState>
  ) { }

  ngOnInit(): void {
    this.subscription = this.store.select('shoppingList').subscribe(
      stateData => {
        if (stateData.editedIngredientIndex > -1){
          this.editMode = true;
          this.editedItem = stateData.editedIngredient;
          this.slForm?.setValue({
            name: this.editedItem?.name,
            amount: this.editedItem?.amount
          })
        } else {
          this.editMode = false;
        }
      }
    )
  }

  onSubmit(form: NgForm){
    const value = form.value;
    const newIngredient = new Ingredient(value.name, value.amount);
    if(this.editMode){
      this.store.dispatch( new ShoppingListActions.UpdateIngredient(newIngredient))
    }else{
      this.store.dispatch( new ShoppingListActions.AddIngredient(newIngredient))
    }

    this.editMode = false;
    form.reset();
  }

  onClear(){
    this.slForm?.reset();
    this.editMode = false;
    this.store.dispatch( new ShoppingListActions.StopEdit());
  }

  onDelete(){
    this.store.dispatch( new ShoppingListActions.DeleteIngredient())
    this.onClear();
  }

  ngOnDestroy(){
    this.subscription?.unsubscribe();
    this.store.dispatch( new ShoppingListActions.StopEdit());
  }
}
