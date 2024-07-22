import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  registerF: FormGroup;
  user: User;

  // , private router: Router
  constructor(private authService: AuthService) {
    // if (this.authService.logedIn) this.navigate(['/productlist']);
    this.user = new User();

    this.loginForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6),
      ]),
    });

    this.registerF = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(6)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      fullname: new FormControl('', [Validators.required, this.fullNameValidator]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      rePassword: new FormControl('', Validators.required),
      admin: new FormControl(false),
    });

    this.registerF.setValidators(this.passwordMatchValidator());
  }

  ngOnInit() { }

  fullNameValidator(control: any) {
    const forbiddenWords = ['ma túy', 'hàng trắng'];

    if (forbiddenWords.some(word => control.value.toLowerCase().includes(word))) {
      return { forbiddenWords: true };
    }

    return null;
  }

  passwordMatchValidator(): ValidatorFn {
    return (FormGroup: AbstractControl): ValidationErrors | null => {
      const password = FormGroup.get('password')?.value;
      const confirmPassword = FormGroup.get('rePassword')?.value;

      if (password !== confirmPassword) {
        return { mismatch: true };
      } else {
        return null;
      }
    };
  }



  onRegister(): void {
    if (this.registerF.invalid) {
      alert('Vui lòng nhập hợp lệ');
      return console.log('Không hợp lệ')
    }

    this.authService.register(this.registerF.value).subscribe(
      (res: any) => {
        console.log(res);
        alert('Đăng ký thành công')
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      alert('Vui lòng nhập hợp lệ');

      return console.log('Không hợp lệ')
    }

    this.authService.login(this.loginForm.value).subscribe(
      (res: any) => {
        console.log(res);
        alert('Đăng nhập thành công');
        let jsonData = JSON.stringify(res);
        localStorage.setItem('login', jsonData);
        location.assign('/');
      },
      (error: any) => {
        console.error(error);
        console.log('Sai tên đăng nhập hoặc mật khẩu');
        alert('Sai tên đăng nhập hoặc mật khẩu')
      }
    );
  }
}
