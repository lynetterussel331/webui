import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormService } from './form.service';
import { DynamicFormService, DynamicFormModel } from '@ng-dynamic-forms/core';
import { MenuConfig, ButtonConfig, UiDataConfigService, Collection } from '../service/ui-data-config.service';
import { ApiService } from '../service/api.service';
import * as moment from 'moment';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit, OnChanges, OnDestroy {

  @Input() activeItem: MenuConfig;
  @Input() activeCollection: any;
  @Input() buttonConfig: ButtonConfig;
  @Input() uuid: string;
  @Input() collectionId: string;
  @Input() collectionConfig: Collection;
  @Input() type: string;

  @Output() sendMessage = new EventEmitter<any>();

  formData: any;
  formModel: DynamicFormModel;
  formGroup: FormGroup = new FormGroup({});
  formHeader: string;
  collectionLabel: string;

  private subscriptions = new Subscription();
  private onDestroy$ = new Subject();

  constructor(
    private formService: FormService,
    private dynamicFormService: DynamicFormService,
    private apiService: ApiService,
    private uiConfigService: UiDataConfigService) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.buttonConfig && changes.buttonConfig.currentValue) {
      this.collectionLabel = this.activeCollection ? this.activeCollection.label : undefined;
      this.loadFormGroup(changes);
      this.loadLabel(changes);
    }
  }

  loadLabel(changes: SimpleChanges) {
    const formSettings = changes.buttonConfig.currentValue.formSettings;
    if (formSettings) {
      this.uiConfigService.getItemLabel(this.activeItem.label).subscribe( data => {
        const itemName = data.single;
        this.formHeader = formSettings.caption + ' ' + itemName + ' ' + (this.collectionLabel || '');
      });
    }
  }

  loadFormGroup(changes: SimpleChanges) {
    this.subscriptions.add(
      this.apiService.getForm(this.activeItem, this.collectionConfig)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(formModelJSON => {
          this.formModel = this.dynamicFormService.fromJSON(formModelJSON);
          this.formGroup = this.dynamicFormService.createFormGroup(this.formModel);
        })
    );
    this.loadFormData(changes);
  }

  loadFormData(changes: SimpleChanges) {
    const action = changes.buttonConfig.currentValue.action;
    if (action === 'update') {
      this.subscriptions.add(
        this.apiService.request(this.activeItem, 'list', this.uuid, this.collectionConfig, this.collectionId)
          .subscribe(data => {
            this.formData = data;
          }, (err) => console.log(err),
          () => {
            Object.keys(this.formGroup.value).forEach(field => {
              let value = this.formData[field];
              if (typeof value !== 'boolean' && moment(value, 'YYYY-MM-DD', true).isValid()) {
                value = new Date(value);
              }
              this.formGroup.controls[field].setValue(value);
            });
          })
      );
    } else if (this.formGroup) {
      console.log('Resetting form group...');
      this.formGroup.reset();
    }
  }

  onSubmit() {
    const formGroupRawValue = this.formGroup.getRawValue();
    console.log('formGroupRawValue', formGroupRawValue);
    this.apiService.requestWithBody(this.activeItem, this.buttonConfig, formGroupRawValue, this.uuid, this.collectionConfig,
      this.collectionId).pipe(takeUntil(this.onDestroy$)).subscribe();
    let successMessage;
    if (this.buttonConfig.action === 'update') {
      successMessage = 'Item updated successfully!';
    } else if (this.buttonConfig.action === 'create') {
      successMessage = 'Item created successfully!';
    }
    this.sendMessage.emit(successMessage);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.subscriptions.unsubscribe();
  }

}
