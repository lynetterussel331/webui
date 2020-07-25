import { Component, DoCheck, ViewChild } from '@angular/core';
import { MenuConfig, UiDataConfigService, List } from '../service/ui-data-config.service';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../service/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilsService } from '../service/utils.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements DoCheck {

  @ViewChild('tabContainer') tabContainer;

  items: any = [];
  activeItem: MenuConfig;
  type: string;
  subscriptions = new Subscription();
  onDestroy$ = new Subject();

  columns: List[];
  list: any;

  executed: boolean;
  path: string;
  HOME = 'Home';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private uiConfigService: UiDataConfigService,
    private apiService: ApiService,
    private utilsService: UtilsService
  ) {
    this.type = 'list';
    this.subscriptions.add(
      this.uiConfigService.getMenuConfig().subscribe((data: MenuConfig[]) => {
        data.forEach(item => {
          this.items.push({ label: item.label, icon: item.icon, path: item.path });
        });
        this.activeItem = this.items[0];
      })
    );
  }

  ngDoCheck() {
    this.path = this.utilsService.getUrlDetails(this.route).path;
    this.activeItem = this.items.filter(item => item.path === this.path)[0];
    if (!this.executed && this.activeItem && this.activeItem.label !== this.HOME) {
      this.updateListContents();
      this.executed = true;
    }
  }

  updateActiveItem() {
    this.activeItem = this.tabContainer.activeItem;
    this.router.navigateByUrl(this.activeItem.path);
  }

  updateListContents() {
    console.log('Updating list contents...');
    if (this.activeItem && this.activeItem.label) {
      this.subscriptions.add(
        this.uiConfigService.getListConfig(this.activeItem.label)
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(columns => this.columns = columns)
      );
      if (this.path) {
        this.subscriptions.add(
          this.apiService.getList(this.path)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(list => this.list = list)
        );
      }
    }
  }
}
