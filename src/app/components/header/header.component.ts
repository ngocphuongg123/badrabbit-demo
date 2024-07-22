import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from 'src/app/models/category';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLogin: any;
  isADM: any;
  keyword!: string;
  categories!: Category[]

  constructor(private auth: AuthService, private router: Router, private categoryService: CategoryService) {
    this.isLogin = this.auth.checkLogin();
    this.isADM = this.auth.checkAdmin();

    this.categoryService.getAll().subscribe(data=>{
      this.categories = data as Category[]; // Trường hợp dữ liệu không khớp
      console.log(this.categories);
    });
   }

  ngOnInit() {
  }

  onLogout() {
    localStorage.clear();
    location.assign('/');
  }

  onSearch() {
    this.router.navigate(
      ['/products'],
      {queryParams: { keyword: this.keyword }}
    )
  }
}
