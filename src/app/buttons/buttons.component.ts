import { Component, EventEmitter, Input, OnDestroy, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UiDataConfigService, Button, MenuConfig, ButtonConfig, Collection } from '../service/ui-data-config.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, filter, flatMap } from 'rxjs/operators';
import { ConfirmationService } from 'primeng/api';
import { ApiService } from '../service/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.css']
})
export class ButtonsComponent implements OnChanges, OnDestroy {

  @Input() activeItem: MenuConfig;
  @Input() activeCollection: any;
  @Input() type: string;
  @Input() uuid: string;

  @Output() reloadList = new EventEmitter<string>();

  collectionConfig: Collection;
  collectionId: string;
  collectionLabel: string;

  buttonConfig: ButtonConfig;
  buttons: Button[];
  displayForm: boolean;

  private subscriptions = new Subscription();
  private onDestroy$ = new Subject();

  constructor(
    private uiConfigService: UiDataConfigService,
    private confirmationService: ConfirmationService,
    private apiService: ApiService,
    private messageService: MessageService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.activeItem && changes.activeItem.currentValue) || (changes.activeCollection && changes.activeCollection.currentValue)) {
      this.loadButtons();
    }
  }

  clickRadioButton(type: string, details: any) {
    if (type === 'collections') {
      this.collectionId = details.collectionId;
    }
    this.buttons = [];
    this.loadButtons(true);
  }

  loadButtons(buttonClicked?: boolean) {
    if (this.type) {
      this.buttons = [];
      this.collectionLabel = this.activeCollection ? this.activeCollection.label : undefined;
      this.subscriptions.add(
        this.uiConfigService.getButtonsConfig(this.activeItem.label, this.type, this.collectionLabel)
        .pipe(filter((button: Button) => {
          if (['list', 'collections'].includes(this.type)) {
            return !buttonClicked && button.displayOnSelect ? false : true;
          } else {
            return true;
          }
        }),
          takeUntil(this.onDestroy$))
          .subscribe(buttons => {
            this.buttons.push(buttons);
          })
      );
      this.loadCollectionConfig();
    }
  }

  loadCollectionConfig() {
      if (this.activeCollection) {
        this.uiConfigService.getCollectionConfig(this.activeItem.label)
          .pipe(flatMap((array: any) => array),
            filter((rec: Collection) => rec.name === this.collectionLabel))
            .subscribe(coll => {
              this.collectionConfig = coll;
            });
      }
  }

  clickButton(button: Button) {
    this.subscriptions.add(
      this.uiConfigService.getGlobalButtonConfig(button.label)
      .pipe(takeUntil(this.onDestroy$))
        .subscribe(config => {
          this.buttonConfig = config;
          if (config.confirmMessage) {
            this.confirm(config);
          } else {
            this.displayForm = true;
          }
        })
      );
  }

  confirm(config: ButtonConfig) {
    this.confirmationService.confirm({
      message: config.confirmMessage,
      accept: () => {
        this.subscriptions.add(
          this.apiService.request(this.activeItem, config.action, this.uuid, this.collectionConfig, this.collectionId).subscribe()
        );
        this.reloadList.emit(config.action);
      }
    });
  }

  onHide() {
    this.displayForm = false;
  }

  sendMessage(message) {
    console.log('Displaying message..');
    this.displayForm = false;
    this.messageService.add({key: 'message', severity: 'success', summary: 'Successful', detail: message});
    this.reloadList.emit();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.subscriptions.unsubscribe();
  }

}
