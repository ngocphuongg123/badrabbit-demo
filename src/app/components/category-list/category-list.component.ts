import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from 'src/app/models/category';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
Router

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  categories!: Category[];
  // category: any;
  constructor(private categoryService: CategoryService, private router: Router, private auth: AuthService) { }

  ngOnInit() {
    return this.categoryService.getAll().subscribe(data=>{
      this.categories = data as Category[]; // Trường hợp dữ liệu không khớp
    }, (error: any) => {
      console.log(this.categories);
      if (error && error.status === 403) {
        // Access Token hết hạn, lấy lại new access token từ refresh token
        try {
          const refreshToken = this.auth.getRefreshToken();
          console.log(refreshToken);
          if(!refreshToken){
            // Nếu refresh token không có thì redirect về trang login
            this.router.navigate(['/login']);
            return;
          }

          // Gọi API refresh token lấy để new access token
          this.auth.refreshToken({ 'refreshToken': refreshToken }).subscribe((res: any) => {
            console.log(res);

            // Cập nhật the access token và refresh token
            let jsonData = JSON.stringify(res);
            localStorage.setItem('login', jsonData);

            // Gọi là API lấy danh sách danh mục
            this.categoryService.getAll().subscribe(data => {
              this.categories = data as Category[]; // trong hợp dữ liệu không khớp
            });
          });

        } catch (refreshError) {
          console.log('Error refreshing token:', refreshError);
          // Nếu refresh token lỗi thì redirect về trang login
          this.router.navigate(['/login']);
        }
      } else {
        console.error('Error fetching data:', error);
        throw ErrorEvent;
      }
    });
  }

  deleteCategory( id: string ) {
    var result = confirm("Want to delete?");
    if ( result) {
      this.categoryService.delete(id).subscribe(data=>{
        console.log(data);
        this.router.navigate(['/category-list'])
        .then(() => {
          window.location.reload();
        })
      })
    }
  }
}
  // deleteCategory(id: string){
  //   var result = confirm('Want to delete?');
  //   if(result){
  //     this.categoryService.delete(id).subscribe(data=>{
  //       console.log(data);
  //       this.router.navigate(['/category-list'])
  //       .then(() => {
  //         window.location.reload();
  //       });
  //     })
  //   }
  // }

