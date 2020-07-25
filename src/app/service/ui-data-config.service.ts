import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, filter, flatMap } from 'rxjs/operators';

export interface MenuConfig {
  label: string;
  icon: string;
  path?: string;
}

export interface ButtonConfig {
  label: string;
  action: string;
  confirmMessage?: string;
  formSettings: { caption: string };
}

export interface List {
  name: string;
  caption?: string;
  type?: string;
  parent?: Parent;
  hasBadge?: boolean;
  filter?: string;
  options?: any[];
}

export interface Parent {
  name: string;
  path: string;
}

export interface Button {
  label: string;
  displayOnSelect?: boolean;
}

export interface Details {
  name: string;
  caption: string;
  hasBadge?: boolean;
  forEach(arg0: (field: any) => void);
}

export interface Collection {
  name: string;
  path: string;
  fields: List[];
}

export interface ItemLabel {
  label: string;
  single: string;
}

@Injectable({
  providedIn: 'root'
})
export class UiDataConfigService {

  menuConfig: Observable<MenuConfig[]>;
  public menuItem: MenuConfig;

  constructor(
    private httpClient: HttpClient
  ) { }

  getMenuConfig(): Observable<MenuConfig[]> {
    return this.httpClient.get<any>(`data/menuConfig.json`, { responseType: 'json' })
      .pipe(map(config => config.items));
  }

  getMenuConfigList() {
    return this.getMenuConfig().pipe( flatMap(array => array) );
  }

  getMenuConfigDetails(path: string): Observable<MenuConfig> {
    return this.getMenuConfigList().pipe( filter(rec => rec.path === path) );
  }

  getListConfig(item: string): Observable<any> {
    return this.httpClient.get<any>(`data/${item}/config/list.json`, { responseType: 'json' })
      .pipe(map(config => config.list));
  }

  getButtonsConfig(item: string, type: string, collectionType?: string) {
    if (['list', 'details'].includes(type)) {
      return this.httpClient.get<any>(`data/${item}/config/buttons.json`, { responseType: 'json' })
        .pipe(map(config => config.buttons),
            flatMap(array => array));
    } else if (type === 'collections' && collectionType !== undefined) {
      return this.httpClient.get<any>(`data/${item}/config/buttons.json`, { responseType: 'json' })
        .pipe(map(config => config.collections),
            flatMap(array => array),
              filter((collection: any) => collection.name === collectionType),
                flatMap(array => array.buttons));
    }
  }

  getDetailsConfig(item: string): Observable<Details> {
    return this.httpClient.get<any>(`data/${item}/config/details.json`, { responseType: 'json' })
      .pipe(map(config => config.details));
  }

  getCollectionConfig(item: string): Observable<Collection> {
    return this.httpClient.get<any>(`data/${item}/config/collections/collections.json`, { responseType: 'json' })
      .pipe(map(config => config.collections));
  }

  getGlobalButtonConfig(buttonLabel: string): Observable<ButtonConfig> {
    return this.httpClient.get<any>(`data/buttonsConfig.json`, { responseType: 'json' })
    .pipe(map(config => config.buttons),
      flatMap(array => array),
        filter((config: ButtonConfig) => config.label === buttonLabel));
  }

  getItemLabel(item: string): Observable<ItemLabel> {
    return this.httpClient.get<any>(`data/itemLabels.json`, { responseType: 'json' })
    .pipe(map(config => config.items),
      flatMap(array => array),
        filter((rec: ItemLabel) => rec.label === item));
  }

}
