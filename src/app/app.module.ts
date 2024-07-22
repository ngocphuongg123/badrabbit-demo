import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RouterModule, Routes, CanActivate } from '@angular/router'; // khai báo dùng cho routes
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { CategoryAddComponent } from './components/category-add/category-add.component';
import { CategoryEditComponent } from './components/category-edit/category-edit.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductAddComponent } from './components/product-add/product-add.component';
import { ProductEditComponent } from './components/product-edit/product-edit.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { ProductsComponent } from './components/products/products.component';
import { AuthGuard } from './auth/auth-guard';
import { AdminGuard } from './auth/admin-guard';

// Định nghĩa các roures trong dự án
const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'category-list', component: CategoryListComponent, canActivate: [AdminGuard] },
  { path: 'category-add', component: CategoryAddComponent, canActivate: [AdminGuard] },
  { path: 'category-edit/:id', component: CategoryEditComponent, canActivate: [AdminGuard] },
  { path: 'product-list', component: ProductListComponent, canActivate: [AdminGuard] },
  { path: 'product-add', component: ProductAddComponent, canActivate: [AdminGuard] },
  { path: 'product-edit/:id', component: ProductEditComponent, canActivate: [AdminGuard] },
  { path: 'product-detail/:id', component: ProductDetailComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'my-account', component: MyAccountComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    CategoryListComponent,
    CategoryAddComponent,
    CategoryEditComponent,
    ProductListComponent,
    ProductAddComponent,
    ProductEditComponent,
    ProductDetailComponent,
    MyAccountComponent,
    ProductsComponent



  ],
  imports: [
    BrowserModule,
    /*
    FormsModule thường được sử dụng để phát triển ứng dụng đơn trang (SPA),
    và RouterModule được sử dụng để thiết lập định tuyeern trong ứng dụng của bạn.
    Phương thức forRoot để nạp các thông tin của Routes.
    */
    FormsModule,
    ReactiveFormsModule,
    /*
    Angular thường được sử dụng để phát triển ứng dụng đơn trang (SPA),
    và RouterModule được sử dụng để thiết lập định tuyến trong ứng dụng của bạn.
    Phương thức forRoot để nạp các thông tin của Routes.
    */
    RouterModule.forRoot(routes),
    /*
    Module này là cần thiết để thực hiện các yêu cầu HTTP trong ứng dụng Angular của bạn bằng cách sử dụng dịch
    Nó cung cấp một cách thuận tiện để giao tiếp với máy chủ hoặc API bên ngoài.
    */
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
