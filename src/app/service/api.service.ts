import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ButtonConfig, MenuConfig, Collection } from './ui-data-config.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  getList(path: string): Observable<any> {
    const url = `/api/${path}`;
    return this.http.get<any>(url);
  }

  getDetails(path: string, uuid: string): Observable<any> {
    const url = `/api/${path}/${uuid}`;
    return this.http.get<any>(url);
  }

  getDistinctValuesMap(path: string, column: string[]) {
    const url = `/api/${path}/distincts`;
    let params = new HttpParams();
    params = params.append('column', column.join(', '));
    return this.http.get<any>(url, { params });
  }

  request(activeItem: MenuConfig, action: string, uuid: string, collectionConfig?: Collection, collectionId?: string): Observable<any> {
    console.log('request', activeItem, action, uuid, collectionConfig, collectionId);
    let url;
    if (collectionConfig) {
      url = `/api/${collectionConfig.path}/${uuid}/${collectionId}`;
    } else {
      url = `/api/${activeItem.path}/${uuid}`;
    }

    if (action === 'delete') {
      return this.http.delete<any>(url);
    } else if (action === 'list') {
      return this.http.get<any>(url);
    }
  }

  requestWithBody(activeItem: MenuConfig, config: ButtonConfig, body: any, uuid?: string, collectionConfig?: Collection,
                  collectionId?: string): Observable<any> {
    console.log('requestWithBody', activeItem, config, body, uuid, collectionConfig, collectionId);
    let url;
    if (collectionConfig) {
      url = `/api/${collectionConfig.path}/${uuid || ''}`;
      if (collectionId) {
        url += `/${collectionId}`;
      }
    } else {
      url = `/api/${activeItem.path}/${uuid || ''}`;
    }

    if (config.action === 'create') {
      return this.http.post<any>(url, body);
    } else if (config.action === 'update') {
      return this.http.put<any>(url, body);
    }
  }

  getForm(activeItem: MenuConfig, collectionConfig?: Collection) {
    const url = '/api/' + (collectionConfig ? collectionConfig.path : activeItem.path) + '/form';
    return this.http.get<any>(url);
  }

}
