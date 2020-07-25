import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutes } from './app.routes';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { SidebarModule } from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabViewModule } from 'primeng/tabview';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ListComponent } from './list/list.component';
import { DetailsComponent } from './details/details.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { CollectionsComponent } from './collections/collections.component';
import { DynamicFormsPrimeNGUIModule } from '@ng-dynamic-forms/ui-primeng';

import { EncrDecrService } from './service/encr-decr.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormComponent } from './form/form.component';

@NgModule({
  declarations: [
    AppComponent,
    ButtonsComponent,
    CollectionsComponent,
    DashboardComponent,
    DetailsComponent,
    LoginComponent,
    HomeComponent,
    ListComponent,
    FormComponent
  ],
  imports: [
    AppRoutes,
    BreadcrumbModule,
    BrowserModule,
    BrowserAnimationsModule,
    ButtonModule,
    ConfirmDialogModule,
    DropdownModule,
    DynamicFormsPrimeNGUIModule,
    FormsModule,
    HttpClientModule,
    MessageModule,
    MessagesModule,
    MultiSelectModule,
    PanelModule,
    RadioButtonModule,
    ReactiveFormsModule,
    SidebarModule,
    TableModule,
    TabMenuModule,
    TabViewModule,
    ToastModule
  ],
  providers: [ ConfirmationService, EncrDecrService, MessageService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
