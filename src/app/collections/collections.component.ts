import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UiDataConfigService, MenuConfig, Collection } from '../service/ui-data-config.service';
import { ApiService } from '../service/api.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilsService } from '../service/utils.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css']
})
export class CollectionsComponent implements OnInit, OnDestroy {

  @ViewChild('tabContainer') tabContainer;

  @Input() activeItem: MenuConfig;

  type: string;
  rows: number;
  list: any;
  columns: any;
  selectedRow: any;
  index: number;

  collections: any;
  collectionsData = new Map();
  collectionItems: any[] = [];
  activeCollection: any;

  subscriptions = new Subscription();
  onDestroy$ = new Subject();

  constructor(
    public route: ActivatedRoute,
    private uiConfigService: UiDataConfigService,
    private apiService: ApiService,
    private utilsService: UtilsService
  ) {
    this.rows = 5;
  }

  ngOnInit() {
    this.subscriptions.add(
      this.uiConfigService.getCollectionConfig(this.activeItem.label)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((collections: any) => {
          this.collections = collections;
          this.type = 'collections';
          this.collections.forEach((collection: Collection) => {
            this.collectionItems.push({ label: collection.name, path: collection.path });
          });
          this.activeCollection = this.collectionItems[0];
          this.updateListContents();
        })
    );
  }

  updateListContents() {
    const collection = this.collections.filter(coll => coll.name === this.activeCollection.label)[0];
    const url = this.utilsService.getUrlDetails(this.route);
    this.subscriptions.add(
      this.apiService.getDetails(collection.path, url.uuid)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(list => this.collectionsData.set(collection.name, { columns: collection.fields, list }),
        (err) => console.log(err),
        () => this.setListData(collection.name))
    );
  }

  updateActiveCollection() {
    this.activeCollection = this.tabContainer.activeItem;
    this.updateListContents();
  }

  setListData(collectionName: string) {
    const data = this.collectionsData.get(collectionName);
    this.list = data.list;
    this.columns = data.columns;
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.subscriptions.unsubscribe();
  }

}
