import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UiDataConfigService, MenuConfig } from '../service/ui-data-config.service';
import { ApiService } from '../service/api.service';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilsService } from '../service/utils.service';

export interface ItemDetails {
  name: string;
  caption: string;
  value?: string;
  hasBadge?: boolean;
}

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DetailsComponent implements OnInit, OnDestroy {

  activeItem: MenuConfig;
  type: string;
  uuid: string;
  path: string;
  details: ItemDetails[] = [];

  subscriptions = new Subscription();
  onDestroy$ = new Subject();

  constructor(
    public route: ActivatedRoute,
    private uiConfigService: UiDataConfigService,
    private apiService: ApiService,
    private utilsService: UtilsService,
    private router: Router
  ) {
    this.type = 'details';
    const url = this.utilsService.getUrlDetails(this.route);
    this.uuid = url.uuid;
    this.path = url.path;
  }

  ngOnInit() {
    this.subscriptions.add(this.uiConfigService.getMenuConfigDetails(this.path)
      .pipe(takeUntil(this.onDestroy$))
        .subscribe(config => {
          this.activeItem = config;
          this.loadDetails(config.label);
        })
    );
  }

  loadDetails(label: string) {
    this.subscriptions.add(this.uiConfigService.getDetailsConfig(label)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(details => {
        this.subscriptions.add(this.apiService.getDetails(this.path, this.uuid)
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(data => {
            this.details = [];
            details.forEach(field => {
              if (field.caption) {
                this.details.push({ name: field.name, caption: field.caption, value: data[field.name], hasBadge: field.hasBadge });
              }
            });
          })
        );
      })
    );
  }

  reloadList(action?: string) {
    console.log('Reload details...', action);
    if (action === 'delete') {
      this.router.navigate([this.activeItem.path]);
    } else {
      this.loadDetails(this.activeItem.label);
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.subscriptions.unsubscribe();
  }

}
