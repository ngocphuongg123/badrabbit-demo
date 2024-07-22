import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Category } from 'src/app/models/category';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-product-add',
  templateUrl: './product-add.component.html',
  styleUrls: ['./product-add.component.css']
})
export class ProductAddComponent implements OnInit {
  productForm: FormGroup;
  product: Product;
  categories!: Category[];

  constructor(private categoryService: CategoryService, private productService: ProductService, private router: Router) {
    this.product = new Product();
    this.product.image = ''
    this.productForm = new FormGroup({
      'name': new FormControl('null', [Validators.required, Validators.minLength(6)]),
      'image': new FormControl('null', Validators.required),
      'price': new FormControl('null', Validators.required),
      'category': new FormControl('null', Validators.required),
      'desc': new FormControl('null', Validators.required),
    })
  }

  ngOnInit() {
    this.categoryService.getAll().subscribe(data=>{
      console.log(this.categories);
      this.categories = data as Category[];
    });
   }
  onSubmit() {
    if (this.productForm.invalid) {
      alert('Vui lòng nhập hợp lệ');
      return console.log('Không hợp lệ');
    } else {
      this.productService.save(this.product).subscribe(data => {
        console.log(data);
        this.router.navigate(['/product-list']);
      });
    }
  }
}
