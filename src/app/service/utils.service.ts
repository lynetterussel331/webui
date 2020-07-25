import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export interface URLDetails {
  path: string;
  uuid?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
  ) { }

  getUrlDetails(route: ActivatedRoute): URLDetails {
    const snapshot = route.snapshot;
    return { path: snapshot.routeConfig.path.split('/')[0], uuid: snapshot.params.uuid };
  }
}
