import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from 'src/app/models/category';
import { Product } from 'src/app/models/product';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit {
  productForm: FormGroup
  product!: Product;
  categories!: Category[];
  id: string;

  constructor( private HttpClient: HttpClient,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private productService: ProductService,
    private router: Router) {
    this.id=route.snapshot.params['id'];
    console.log(`id is ${this.id}`);

    this.productForm = new FormGroup ({
      // '_id': new FormControl(null, Validators.required),
      'name': new FormControl('', [Validators.required, Validators.minLength(6)]),
      'image': new FormControl('', [Validators.required]),
      'price': new FormControl('', [Validators.required]),
      'desc': new FormControl('', [Validators.required]),
      'category': new FormControl('', [Validators.required])
    })
   }

  ngOnInit() {
    this.productService.get(this.id).subscribe(data=>{
      this.product = data as Product;
    });
    this.categoryService.getAll().subscribe(data=>{
      console.log(this.categories);
      this.categories = data as Category[];
    });

  }

  onSubmit(){
    if(this.productForm.invalid) {
      alert('Vui lòng nhập hợp lệ');
      return console.log('không hợp lệ');
    } else {
      this.productService.update(this.id, this.product).subscribe(data=>{
        console.log(data);
        this.router.navigate(['/product-list']);
      });
    }
  }
}
