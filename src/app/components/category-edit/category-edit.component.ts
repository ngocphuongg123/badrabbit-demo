import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from 'src/app/models/category';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.css']
})
export class CategoryEditComponent implements OnInit {
  categoryForm: FormGroup
  category!: Category;
  id: string;

  constructor(private route: ActivatedRoute, private categoryService: CategoryService, private router: Router) {
    this.id=route.snapshot.params['id'];
    console.log(`id is ${this.id}`);
    this.categoryForm = new FormGroup ({
      '_id': new FormControl(null, Validators.required),
      'name':new FormControl('', [Validators.required, Validators.minLength(6)]),
      'image':new FormControl('', [Validators.required]),
      });
  }

  ngOnInit() {
    this.categoryService.get(this.id).subscribe(data=>{
      this.category = data as Category;
    });
  }

  onSubmit(){
    if(this.categoryForm.invalid) {
      alert('Vui lòng nhập hợp lệ');
    return console.log('Không hợp lệ');
    } else {
      this.categoryService.update(this.id, this.category).subscribe(data=>{
        console.log(data);
        this.router.navigate(['/category-list']);
      });
    }
  }
}
