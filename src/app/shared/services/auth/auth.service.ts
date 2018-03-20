import { Injectable } from "@angular/core";
import { ConfigService } from ".././config/config.service";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from "@angular/common/http";

@Injectable()
export class AuthService {
  authHeaders: HttpHeaders;

  constructor(private config: ConfigService, private http: HttpClient) {}

  login(username: string, password: string): any {
    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders();
      headers.set("Content-Type", "application/json");

      let data = {
        username: username,
        password: password
      };

      this.http
        .post(this.config.ROUTES.BASE + this.config.ROUTES.LOGIN, data, {
          headers: headers
        })
        .subscribe(
          response => {
            localStorage.setItem("token", response["token"]["access_token"]);
            localStorage.setItem("username", username);
            this.setAuthHeaders();
            resolve();
          },
          (error: HttpErrorResponse) => {
            // reject(error.error.error.message);
            reject("*Your password or your user/email are wrong.");
          }
        );
    });
  }

  userData(uuid: string): any {
    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders();
      headers.set("Content-Type", "application/json");

      this.http
        .get(this.config.ROUTES.BASE + this.config.ROUTES.REGISTER + uuid, {
          headers: headers
        })
        .subscribe(
          response => {
            localStorage.setItem("username", response["username"]);
            localStorage.setItem("email", response["email"]);
            localStorage.setItem("user_type", response["user_type"]);
            resolve();
          },
          (error: HttpErrorResponse) => {
            reject(error.error.error.message);
          }
        );
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      let headers = this.getAuthHeaders();

      this.http.delete(this.config.ROUTES.BASE + this.config.ROUTES.LOGIN, {
          headers: headers
        })
        .subscribe(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          resolve();
        }, (error: HttpErrorResponse) => {
            reject(error);
          }
        );
      });
  }

  signup(username: string, password: string, email: string, userType: string): any {
    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders();
      headers.set("Content-Type", "application/json");

      let data = {
        username: username,
        password: password,
        email: email,
        user_type: userType.toLocaleLowerCase()
      };
      this.http
        .post(this.config.ROUTES.BASE + this.config.ROUTES.REGISTER, data, {
          headers: headers
        })
        .subscribe(
          response => {
            resolve();
          },
          (error: HttpErrorResponse) => {
            // reject(error.error.error.message);
            reject("Username or email already in use.");
          }
        );
    });
  }

  private setAuthHeaders() {
    this.authHeaders = new HttpHeaders().set(
      "Authorization",
      "Bearer " + localStorage.getItem("token")
    );
  }

  getAuthHeaders() {
    return this.authHeaders;
  }

  isAuthenticated(): boolean {
    if (localStorage.getItem("token")) {
      this.setAuthHeaders();
      return true;
    }
    return false;
  }
}
