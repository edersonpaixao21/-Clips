import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  showAlert = false;
  alertMsg = 'Entrando, por favor aguarde...';
  alertColor = 'blue';

  inSubmission = false;

  credentials = {
    email: '',
    password: '',
  };
  constructor(private auth: AngularFireAuth) {}

  ngOnInit(): void {}

  async login() {
    this.showAlert = true;
    this.alertMsg = 'Entrando, por favor aguarde...';
    this.alertColor = 'blue';
    this.inSubmission = true;
    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      );
    } catch (err) {
      console.log(err);
      this.alertMsg = 'Um erro inesperado ocorreu. Por favor, tente novamente mais tarde';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }
    this.alertMsg = 'Login com sucesso';
    this.alertColor = 'blue';
    this.inSubmission = false;
  }
}
