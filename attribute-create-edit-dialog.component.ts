import { Component, Inject, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete, ThemePalette } from '@angular/material';
import { Observable } from 'rxjs';
import { PrintingApi } from 'app/printing/_services/printingApi';
import { Template } from 'app/printing/_models/template';
import { Attribute } from 'app/printing/_models/attributte';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { startWith, map } from 'rxjs/operators';

export interface ChipColor {
  name: string;
  color: string;
}

@Component({
  selector: 'app-attribute-create-edit-dialog',
  templateUrl: './attribute-create-edit-dialog.component.html',
  styleUrls: ['../attributes.component.scss']
})
export class AttributeCreateEditDialogComponent {
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl();
  filteredFruits: Observable<ChipColor[]>;
  fruits: ChipColor[] = [];
  allFruits: ChipColor[] = [
    { name: 'Att:', color: 'blue-chip' },
    { name: 'Date:', color: 'blue-chip' },
    { name: 'Details:', color: 'blue-chip' },
    { name: 'Frame:', color: 'blue-chip' },
    { name: 'Text:', color: 'blue-chip' },
    { name: 'Split:', color: 'yellow-chip' },
    { name: 'SubStr:', color: 'yellow-chip' },
    { name: 'Up:', color: 'yellow-chip' },
    { name: 'Replace:', color: 'yellow-chip' },
    { name: '&', color: 'red-chip' }];

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;


  templates: Observable<Template[]>;

  attributeId: number | null;
  name: string;
  functionName: string;
  templateId: number;

  constructor(
    private printingApi: PrintingApi,
    @Inject(MAT_DIALOG_DATA) public data: Attribute,
    private dialogRef: MatDialogRef<AttributeCreateEditDialogComponent>
  ) {



    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: ChipColor | null) => fruit ? this._filter(fruit) : this.allFruits.slice()));



    this.templates = this.getTemplates();

    if (data != null) {
      this.attributeId = data.id;
      this.name = data.name;
      this.functionName = data.functionName;
      this.templateId = data.template.id;
    }
  }

  getTemplates(): Observable<Template[]> {
    return this.printingApi.getTemplates();
  }

  // zwraca wynik do miejsca gdzie zostalo otworzone
  submit() {
    const result = {
      functionName: this.functionName,
      name: this.name,
      templateId: this.templateId
    };
    this.dialogRef.close(result);
  }

  isFormValid() {
    return this.name != null && this.name !== '' && this.templateId != null && this.templateId > 0;
  }

  resolveColor(text:string):string{
    switch(text) {
      case "Att:":
      case "Date:":
      case "Details:":
      case "Frame:":
      case "Text:":
        return "blue-chip";
      case "SubStr:":
      case "Split:":
      case "Up:":
      case "Replace:":
        return "yellow-chip";
      case "&":
        return "red-chip"
      default:
        return "green-chip";
    }
  }

  add(event: MatChipInputEvent): void {
    // Add fruit only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      console.log(event);
      // Add our fruit
      if ((value || '').trim()) {
        this.fruits.push({name: value.trim(),color:this.resolveColor(value.trim())});
      }

      // Reset the input valuesds
      if (input) {
        input.value = '';
      }

      this.fruitCtrl.setValue(null);
      console.log(this.fruits);
    }
  }
  //*[@id="mat-chip-list-0"]/div/mat-chip[1]/text()

  remove(fruit: ChipColor): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fruits.push({name: event.option.viewValue,color:this.resolveColor(event.option.viewValue)});
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: any): ChipColor[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter(fruit => fruit.name.toLowerCase().indexOf(filterValue) === 0);
  }
}
